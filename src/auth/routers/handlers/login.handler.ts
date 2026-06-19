import {Response} from "express";
import {RequestWithBody} from "../../../core/types/request-types";
import {LoginDto} from "../../types/login.dto";
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const loginHandler = async (req: RequestWithBody<LoginDto>, res: Response) => {
  // Достаём login/email и password из body запроса
  const { loginOrEmail, password } = req.body;

  // Достаём название устройства/браузера из заголовка User-Agent.
  // Если заголовка нет, сохраняем "unknown".
  const deviceName = req.headers['user-agent'] ?? 'unknown';

  // x-forwarded-for может быть нужен, если приложение стоит за proxy/nginx/render/vercel.
  // Там может прийти строка с несколькими IP через запятую.
  const forwardedFor = req.headers["x-forwarded-for"];

  // Берём первый IP из x-forwarded-for, если он есть.
  // Если его нет, берём IP из socket.
  const ip = typeof forwardedFor === "string"
    ? forwardedFor.split(',')[0].trim()
    : req.socket.remoteAddress

  // Если IP не смогли определить, возвращаем 400
  if(!ip) {
    return res.sendStatus(HttpStatus.BadRequest_400)
  }

  // Передаём в service данные для логина + данные текущего устройства
  const result = await authService.loginUser({loginOrEmail, password, ip, deviceName})

  // Если service вернул ошибку, мапим ResultStatus в HTTP status
  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.status)
  }

  // Кладём refreshToken в httpOnly cookie.
  res.cookie('refreshToken', result.data?.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 2 * 60 * 1000 }) // 2 min

  // accessToken отдаём в body ответа
  return res.status(HttpStatus.Ok_200).send({accessToken: result.data?.accessToken});
}