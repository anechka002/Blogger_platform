import {db} from "../../db/mongo.db";
import {ISessionDB} from "../types/session.db.type";
import {WithId} from "mongodb";

export const devicesSessionsRepository = {
  // Создаёт новую активную device session после успешного login.
  // Одна запись = один вход пользователя с конкретного браузера/устройства.
  async addSession(session: ISessionDB): Promise<boolean> {
    const result = await db
      .getCollections()
      .deviceSessionsCollection.insertOne(session)

    // acknowledged показывает, что MongoDB подтвердила insert
    return result.acknowledged
  },

  // Ищет активную session по deviceId и iat.
  // Используется в refreshTokenGuardMiddleware, чтобы проверить, что refreshToken принадлежит существующей и не протухшей session.
  async findBy({device_id, iat}:{device_id: string, iat: Date}): Promise<WithId<ISessionDB> | null> {
    const result = await db
      .getCollections()
      .deviceSessionsCollection.findOne({
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

    // Возвращаем найденную session или null
    return result
  },

  // Обновляет текущую device session при refresh-token.
  // Находит старую session по userId + deviceId + oldIat и заменяет iat/exp на новые значения из нового refreshToken.
  async updateSessionByDeviceIdAndIat({deviceId, oldIat, userId, newExp, newIat}: {deviceId: string, userId: string, oldIat: Date, newExp: Date, newIat: Date}): Promise<boolean> {
    const result = await db
      .getCollections()
      .deviceSessionsCollection.updateOne(
        // Ищем старую session
        {user_id: userId, device_id: deviceId, iat: oldIat},
        // Обновляем её новыми датами из нового refreshToken
        {$set: {
                  iat: newIat,
                  exp: newExp,
          }}
      )

    return result.modifiedCount === 1
  },

  // Удаляет текущую device session при logout.
  // Ищет session по userId + deviceId + oldIat, чтобы завершить именно тот refreshToken, с которым пришёл logout.
  async deleteSession({deviceId, userId, oldIat}:{deviceId: string, userId: string, oldIat: Date}): Promise<boolean> {
    const result = await db
      .getCollections()
      .deviceSessionsCollection.deleteOne({
          // Удаляем session только этого пользователя
          device_id: deviceId,
          // Только с этого устройства/браузера
          iat: oldIat,
          // Только конкретную версию refreshToken/session
          user_id: userId
      })

    // true, если Mongo реально удалила одну запись
    return result.deletedCount === 1
  },

  // Удаляет все device sessions текущего пользователя, кроме текущего устройства.
  // Используется для endpoint-а: DELETE /security/devices
  async deleteAllExceptCurrent({deviceId, userId}:{deviceId: string, userId: string}): Promise<boolean> {
    const result = await db
      .getCollections()
      .deviceSessionsCollection.deleteMany({
          // Удаляет все device sessions текущего пользователя
          user_id: userId,
          // Но НЕ удаляем текущую session/device
          // device_id НЕ равен текущему deviceId
          device_id: { $ne: deviceId }
        })

    // acknowledged = MongoDB приняла и выполнила команду
    return result.acknowledged
  },

  // Удаляет одну конкретную device session по userId и deviceId.
  // Используется для endpoint-а: DELETE /security/devices/:deviceId после проверки, что session принадлежит текущему пользователю.
  async deleteOneByUserIdAndDeviceId({deviceId, userId}:{deviceId: string, userId: string}): Promise<boolean> {
    const result = await db
    .getCollections()
    .deviceSessionsCollection.deleteOne({
        // только указанное устройство из params
        device_id: deviceId,
        // Удаляем только session текущего пользователя
        user_id: userId
      })

    // true, если Mongo реально удалила одну session
    return result.deletedCount === 1
  },

  // Ищет session только по deviceId.
  // Используется перед удалением конкретного устройства,
  // чтобы отличить:
  // - 404: session с таким deviceId не существует
  // - 403: session существует, но принадлежит другому пользователю
  async findByDeviceId(deviceId: string): Promise<WithId<ISessionDB> | null> {
    return await db
      .getCollections()
      .deviceSessionsCollection.findOne({device_id: deviceId})
  }
}