import { Response } from 'express';
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsDeviceIdDto} from "../../types/uri-params-device-id.dto";
import {HttpStatus} from "../../../core/types/http-statuses";
import {deviceService} from "../../application/device.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const deleteDeviceSessionHandler = async (req: RequestWithParams<URIParamsDeviceIdDto>, res: Response) => {
  // deviceId берём из params
  const deviceId = req.params.deviceId;

  // userId положил refreshTokenGuardMiddleware после успешной проверки refreshToken.
  const userId = req.user?.userId

  // Если userId нет — пользователь не авторизован.
  if (!userId) {
    return res.sendStatus(HttpStatus.Unauthorized_401);
  }

  // Если deviceId нет — невозможно понять, какую device session нужно удалить.
  if(!deviceId){
    return res.sendStatus(HttpStatus.NotFound_404)
  }

  // Просим service удалить session только если она принадлежит текущему userId.
  const result = await deviceService.deleteOneByUserIdAndDeviceId({deviceId, userId})

  // Если service вернул ошибку, преобразуем ResultStatus в HTTP status.
  if(result.status !== ResultStatus.Success) {
    return res.sendStatus(resultCodeToHttpException(result.status))
  }

  // Если session успешно удалена — возвращаем 204
  return res.sendStatus(HttpStatus.NoContent_204)
}