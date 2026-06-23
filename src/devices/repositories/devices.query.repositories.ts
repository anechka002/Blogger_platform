import {IDeviceView} from "../types/device.view.type";
import {db} from "../../db/mongo.db";
import {
  mapToDeviceViewModel
} from "../routers/mappers/map-to-device-view-model.utils";

export const devicesQueryRepository = {
  // Возвращает список всех активных устройств пользователя.
  async findAllDevices(userId: string): Promise<IDeviceView[]> {
    // Ищем все активные sessions пользователя.
    // exp > текущей даты означает, что session ещё не протухла.
    const devices = await db
      .getCollections()
      .deviceSessionsCollection.find({
        user_id: userId,
        exp: {$gt: new Date() },
      }).toArray()

    // Преобразуем документы БД в View Model для ответа клиенту.
    return devices.map(mapToDeviceViewModel)
  }
}