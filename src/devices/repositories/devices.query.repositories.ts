import {IDeviceView} from "../types/device.view.type";
import {
  mapToDeviceViewModel
} from "./mappers/map-to-device-view-model.utils";
import {injectable} from "inversify";
import {DeviceModel} from "../domain/device.entity";

@injectable()
export class DevicesQueryRepository {
  // Возвращает список всех активных устройств пользователя.
  async findAllDevices(userId: string): Promise<IDeviceView[]> {
    // Ищем все активные sessions пользователя.
    // exp > текущей даты означает, что session ещё не протухла.
    const devices = await DeviceModel.find({
        user_id: userId,
        exp: {$gt: new Date() },
      }).lean()

    // Преобразуем документы БД в View Model для ответа клиенту.
    return devices.map(mapToDeviceViewModel)
  }
}