import { Response, Request } from 'express'
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const logoutHandler = async (req: Request, res: Response) => {

  // Эти данные положил refreshTokenGuardMiddleware
  const userId = req.user?.userId
  const deviceId = req.user?.deviceId
  const oldIat = req.user?.iat

  // Если каких-то данных нет — значит guard не смог нормально авторизовать запрос
  if(!userId || !oldIat || !deviceId) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  // Передаём в service данные текущей session, которую нужно завершить
  const result = await authService.logoutUser({userId, oldIat, deviceId})

  // Если service вернул ошибку, мапим ResultStatus в HTTP status
  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.status)
  }

  // Зачищаем cookies
  res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict', path: '/' })

  return res.sendStatus(HttpStatus.NoContent_204)
}