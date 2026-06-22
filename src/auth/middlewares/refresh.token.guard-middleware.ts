import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {jwtService} from "../adapters/jwt.service";
import {
  deviceSessionsRepository
} from "../repositories/device-sessions.repository";

export const refreshTokenGuardMiddleware = async(req: Request, res: Response, next: NextFunction) => {
  // Достаём refreshToken из cookie.
  // Браузер присылает эту cookie автоматически, если совпадают domain/path/sameSite/secure правила.
  const refreshToken = req.cookies.refreshToken
  // Если refreshToken нет — пользователь не авторизован
  if(!refreshToken) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  // Проверяем refreshToken:
  // - не подделан ли он
  // - не истёк ли срок его жизни
  // - подписан ли он нашим REFRESH_TOKEN_SECRET
  const payload = await jwtService.verifyRefreshToken(refreshToken);
  // Если токен невалидный или в payload нет нужных данных — не пропускаем запрос дальше.
  // userId — кто делает запрос
  // deviceId — с какой session/device делает запрос
  // iat — когда был выпущен именно этот refreshToken
  if(!payload || !payload.userId || !payload.deviceId || !payload.iat) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  // JWT хранит iat в секундах, а Mongo Date хранится как дата/миллисекунды.
  // Поэтому переводим iat в Date.
  const issuedAt = new Date(payload.iat * 1000);

  // Ищем активную session в БД.
  // Нам важно проверить не только сам токен, но и то, что session ещё существует.
  // Если пользователь сделал logout или завершил устройство, session будет удалена, и такой refreshToken больше нельзя использовать.
  const session = await deviceSessionsRepository.findBy({device_id: payload.deviceId, iat: issuedAt})
  // Если session не найдена — значит refreshToken больше не должен работать
  if(!session) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  // Кладём данные в req.user, чтобы следующий handler/service понимал:
  // - какой пользователь делает запрос
  // - с какого устройства/сессии
  // какая версия refreshToken/session
  req.user = {
    userId: payload.userId,
    deviceId: payload.deviceId,
    iat: issuedAt,
  }

  // Всё хорошо — пропускаем запрос дальше
  next()
}