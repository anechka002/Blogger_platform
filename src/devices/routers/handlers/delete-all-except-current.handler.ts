import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {deviceService} from "../../application/device.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const deleteAllExceptCurrentHandler = async (req: Request, res: Response) => {
  // Данные текущей device session, полученные после успешной проверки refreshToken.
  const userId = req.user?.userId
  const deviceId = req.user?.deviceId

  // Если каких-то данных не хватает, удалить sessions невозможно.
   if (!userId || !deviceId) {
     return res.sendStatus(HttpStatus.Unauthorized_401)
   }

  // Вызывает service для удаления всех session кроме текущей
   const result = await deviceService.deleteAllExceptCurrent({userId, deviceId})

  // Если service вернул ошибку, мапим ResultStatus в HTTP status
  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.status)
  }

   return res.sendStatus(HttpStatus.NoContent_204)
}