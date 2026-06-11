import { Response, Request } from 'express'
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const userId = req.user?.userId
  if (!userId) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  const oldRefreshToken =  req.cookies.refreshToken
  // console.log('cookies: ', refreshToken)

  const result = await authService.refreshToken(userId, oldRefreshToken)
  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.status)
  }

  res.cookie('refreshToken', result.data?.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 2 * 60 * 1000 })

  // console.log('new refreshToken:', result.data?.refreshToken)

  return res.status(HttpStatus.Ok_200).send({accessToken: result.data?.accessToken})
}