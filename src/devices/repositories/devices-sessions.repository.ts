import {db} from "../../db/mongo.db";
import {ISessionDB} from "../types/session.db.type";
import {WithId} from "mongodb";
import {injectable} from "inversify";
import {DeviceDocument, DeviceModel} from "../domain/device.entity";

@injectable()
export class DevicesSessionsRepository {
  // Создаёт новую активную device session после успешного login.
  // Одна запись = один вход пользователя с конкретного браузера/устройства.
  async addSession(session: DeviceDocument): Promise<void> {
    await session.save()
  }

  // Сохраняет изменения в уже существующей device session.
  // Например, после refresh-token мы меняем у session новые iat и exp, а затем вызываем save(), чтобы записать эти изменения в MongoDB.
  async save(session: DeviceDocument): Promise<void> {
    await session.save()
  }

  // Удаляем session, которая уже найдена и проверена на принадлежность пользователю.
  async delete(session: DeviceDocument): Promise<void> {
    await session.deleteOne()
  }

  // Ищет активную session по deviceId и iat.
  // Используется в refreshTokenGuardMiddleware, чтобы проверить, что refreshToken принадлежит существующей и не протухшей session.
  async findBy({device_id, iat}:{device_id: string, iat: Date}): Promise<DeviceDocument | null> {
    return DeviceModel.findOne({
          // device_id должен совпадать с deviceId из refreshToken
          device_id: device_id,
          // iat должен совпадать с датой создания refreshToken
          // Это нужно, чтобы проверить именно эту версию refreshToken
          iat: iat,
          // exp должен быть больше текущей даты
          // То есть session ещё не должна быть протухшей
          // Покажи только те сессии, у которых срок жизни больше new Date()
          exp: {$gt: new Date()}
      })
  }

  // Ищет активную device session по userId, deviceId и старому iat из refreshToken.
  // Нужен для refresh-token flow: проверяем, что session существует, принадлежит текущему пользователю и соответствует именно тому refreshToken, с которым пришёл запрос.
  async findByDeviceIdAndIat({deviceId, oldIat, userId}:{deviceId: string, userId: string, oldIat: Date,}): Promise<DeviceDocument | null> {
    return DeviceModel.findOne({
      device_id: deviceId,
      user_id: userId,
      iat: oldIat,
      // exp должен быть больше текущей даты
      // То есть session ещё не должна быть протухшей
      // Покажи только те сессии, у которых срок жизни больше new Date()
      exp: {$gt: new Date()}
    })
  }

  // Удаляет текущую device session при logout.
  // Ищет session по userId + deviceId + oldIat, чтобы завершить именно тот refreshToken, с которым пришёл logout.
  async deleteSession({deviceId, userId, oldIat}:{deviceId: string, userId: string, oldIat: Date}): Promise<boolean> {
    const result = await DeviceModel.deleteOne({
          device_id: deviceId, // session этого пользователя
          iat: oldIat, // session этого устройства/браузера
          user_id: userId  // конкретная версия refreshToken
      })

    // true, если Mongo реально удалила одну запись
    return result.deletedCount === 1
  }

  // Удаляет все device sessions текущего пользователя, кроме текущего устройства.
  // Используется для endpoint-а: DELETE /security/devices
  async deleteAllExceptCurrent({deviceId, userId}:{deviceId: string, userId: string}): Promise<boolean> {
    await DeviceModel.deleteMany({
          // Удаляет все device sessions текущего пользователя
          user_id: userId,
          // Но НЕ удаляем текущую session/device
          // device_id НЕ равен текущему deviceId
          device_id: { $ne: deviceId }
        })

    return true
  }

  // Ищет session только по deviceId.
  // Используется перед удалением конкретного устройства,
  // чтобы отличить:
  // - 404: session с таким deviceId не существует
  // - 403: session существует, но принадлежит другому пользователю
  async findByDeviceId(deviceId: string): Promise<DeviceDocument | null> {
    return DeviceModel.findOne({device_id: deviceId})
  }
}