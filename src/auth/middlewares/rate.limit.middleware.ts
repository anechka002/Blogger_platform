import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {ApiRequestLogDb} from "../types/api-request-log.db.type";
import {
  ApiRequestLogsRepository
} from "../repositories/api-request-logs.repository";
import {ApiRequestLogModel} from "../domain/api-request-log.entity";

// Middleware для ограничения количества запросов.
// Разрешает не более 5 запросов с одного IP на один URL за последние 10 секунд.
export const rateLimitMiddleware = (apiRequestLogsRepository: ApiRequestLogsRepository) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Получает URL запроса.
    const originalUrl = req.originalUrl;

    // Получает IP клиента.
    // Если req.ip отсутствует, используем адрес сокета.
    const ip = req.ip ?? req.socket.remoteAddress;

    // console.log('originalUrl', originalUrl);
    // console.log('ip', ip);

    // Если IP определить не удалось, возвращаем ошибку.
    if(!ip) {
      return res.sendStatus(HttpStatus.BadRequest_400)
    }

    // Вычисляем дату 10 секунд назад от текущего момента.
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000)

    // Считаем количество запросов с данного IP на данный URL за последние 10 секунд.
    const requestsCount = await apiRequestLogsRepository.countRecentRequests({ip, tenSecondsAgo, originalUrl})

    // Если лимит запросов превышен, возвращаем ошибку Too Many Requests.
    if(requestsCount >= 5){
      return res.sendStatus(HttpStatus.ManyRequest_429 );
    }

    // Формируем объект для сохранения информации о текущем запросе.
    try {
      const requestLog = new ApiRequestLogModel(
        {
          URL: originalUrl,
          IP: ip,
          date: new Date()
        }
      )
      // Сохраняем информацию о запросе в БД.
      await apiRequestLogsRepository.create(requestLog)

      // Передаём управление следующему middleware или handler.
      next()
    } catch (err) {
      console.error('Error in rateLimitMiddleware:', err)

      // Если сохранить запись не удалось, возвращаем ошибку сервера.
      return res.sendStatus(HttpStatus.InternalServerError_500)
    }
  }
}