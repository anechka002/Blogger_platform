import { Response, Request } from 'express'
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const refreshTokenHandler = async (req: Request, res: Response) => {
  // Данные текущей device session, полученные после успешной проверки refreshToken.
  const userId = req.user?.userId
  const oldIat = req.user?.iat
  const deviceId = req.user?.deviceId

  // Если каких-то данных не хватает, обновить токены невозможно.
  if (!userId || !oldIat || !deviceId) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  // Вызывает service для создания новой пары токенов. Service обновляет текущую device session в БД.
  const result = await authService.refreshToken({userId, deviceId, oldIat})

  // Если service вернул ошибку, мапим ResultStatus в HTTP status
  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.status)
  }

  // Новый refreshToken сохраняется в cookie.
  res.cookie('refreshToken', result.data?.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 2 * 60 * 1000 }) // 2 min

  // Новый accessToken возвращается в body ответа.
  return res.status(HttpStatus.Ok_200).send({accessToken: result.data?.accessToken})
}