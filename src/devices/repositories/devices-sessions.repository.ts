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

  // Обновляет текущую device session при refresh-token.
  // Находит старую session по userId + deviceId + oldIat и заменяет iat/exp на новые значения из нового refreshToken.
  async updateSessionByDeviceIdAndIat({deviceId, oldIat, userId, newExp, newIat}: {deviceId: string, userId: string, oldIat: Date, newExp: Date, newIat: Date}): Promise<boolean> {
    const result = await DeviceModel.updateOne(
        // Ищем старую session
        {user_id: userId, device_id: deviceId, iat: oldIat},
        // Обновляем её новыми датами из нового refreshToken
        {$set: {
                  iat: newIat,
                  exp: newExp,
          }}
      )

    // нашли session
    return result.matchedCount === 1
  }

  // Удаляет текущую device session при logout.
  // Ищет session по userId + deviceId + oldIat, чтобы завершить именно тот refreshToken, с которым пришёл logout.
  async deleteSession({deviceId, userId, oldIat}:{deviceId: string, userId: string, oldIat: Date}): Promise<boolean> {
    const result = await DeviceModel.deleteOne({
          // Удаляем session только этого пользователя
          device_id: deviceId,
          // Только с этого устройства/браузера
          iat: oldIat,
          // Только конкретную версию refreshToken/session
          user_id: userId
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