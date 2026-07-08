import {Result} from "../../core/result/result.type";
import {ResultStatus} from "../../core/result/resultCode";
import {
  DevicesSessionsRepository
} from "../repositories/devices-sessions.repository";
import {inject, injectable} from "inversify";

@injectable()
export class DeviceService {
  protected devicesSessionsRepository: DevicesSessionsRepository;
  constructor(@inject(DevicesSessionsRepository) devicesSessionsRepository: DevicesSessionsRepository) {
    this.devicesSessionsRepository = devicesSessionsRepository;
  }
  // Удаляет все device sessions текущего пользователя, кроме текущей session/device, с которой пришёл refreshToken.
  async deleteAllExceptCurrent({deviceId, userId}:{deviceId: string, userId: string}): Promise<Result<boolean | null>>  {
    // Просим repository удалить все sessions пользователя, где device_id НЕ равен текущему deviceId.
    const isDeleted = await this.devicesSessionsRepository.deleteAllExceptCurrent({userId, deviceId});

    // Если MongoDB не подтвердила удаление, возвращаем ошибочный Result.
    if(!isDeleted) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'NotFound',
        extensions: [],
      }
    }

    // Даже если удалено 0 sessions, значит у текущего пользователя не было других устройств.
    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    }
  }

  // Удаляет одну device session, принадлежащую указанному пользователю и устройству.
  async deleteOneByUserIdAndDeviceId({userId, deviceId}:{deviceId: string, userId: string}): Promise<Result<boolean | null>>  {
    // Найти session по deviceId
    const session = await this.devicesSessionsRepository.findByDeviceId(deviceId)

    // Если session нет → 404
    if(!session) {
      return {
        status: ResultStatus.NotFound,
        data: false,
        errorMessage: 'NotFound',
        extensions: [],
      };
    }

    // Если session.user_id !== userId → 403
    if(session.user_id !== userId) {
      return {
        status: ResultStatus.Forbidden,
        data: false,
        errorMessage: 'Forbidden',
        extensions: [],
      }
    }

    // Удаляем session, принадлежит текущему пользователю.
    await session.deleteOne()

    return {
      status: ResultStatus.Success,
      data: true,
      extensions: [],
    }
  }
}