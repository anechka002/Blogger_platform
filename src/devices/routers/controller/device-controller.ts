import {
  RequestWithParams,
  RequestWithUserId
} from "../../../core/types/request-types";
import {Request, Response} from "express";
import {IDeviceView} from "../../types/device.view.type";
import {HttpStatus} from "../../../core/types/http-statuses";
import {
  DevicesQueryRepository
} from "../../repositories/devices.query.repositories";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";
import {DeviceService} from "../../application/device.service";
import {URIParamsDeviceIdDto} from "../../types/uri-params-device-id.dto";
import {inject, injectable} from "inversify";

@injectable()
export class DeviceController {
  protected devicesQueryRepository: DevicesQueryRepository;
  protected deviceService: DeviceService;
  constructor(
    @inject(DevicesQueryRepository) devicesQueryRepository: DevicesQueryRepository,
    @inject(DeviceService) deviceService: DeviceService
  ) {
    this.devicesQueryRepository = devicesQueryRepository;
    this.deviceService = deviceService;
  }
  async getAllDevices(req: RequestWithUserId, res: Response<IDeviceView[]>) {
    // userId положил refreshTokenGuardMiddleware после успешной проверки refreshToken и session.
    const userId = req.user?.userId

    // Если userId отсутствует — пользователь не авторизован.
    if (!userId) {
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    // Получаем список всех активных устройств текущего пользователя.
    const devices = await this.devicesQueryRepository.findAllDevices(userId);

    // Возвращаем массив устройств.
    return res.status(HttpStatus.Ok_200).send(devices)
  }

  async deleteAllExceptCurrent(req: Request, res: Response){
    // Данные текущей device session, полученные после успешной проверки refreshToken.
    const userId = req.user?.userId
    const deviceId = req.user?.deviceId

    // Если каких-то данных не хватает, удалить sessions невозможно.
    if (!userId || !deviceId) {
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    // Вызывает service для удаления всех session кроме текущей
    const result = await this.deviceService.deleteAllExceptCurrent({userId, deviceId})

    // Если service вернул ошибку, мапим ResultStatus в HTTP status
    if(result.status !== ResultStatus.Success) {
      return res.status(resultCodeToHttpException(result.status)).send(result.status)
    }

    return res.sendStatus(HttpStatus.NoContent_204)
  }

  async deleteDeviceSession(req: RequestWithParams<URIParamsDeviceIdDto>, res: Response) {
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
    const result = await this.deviceService.deleteOneByUserIdAndDeviceId({deviceId, userId})

    // Если service вернул ошибку, преобразуем ResultStatus в HTTP status.
    if(result.status !== ResultStatus.Success) {
      return res.sendStatus(resultCodeToHttpException(result.status))
    }

    // Если session успешно удалена — возвращаем 204
    return res.sendStatus(HttpStatus.NoContent_204)
  }
}