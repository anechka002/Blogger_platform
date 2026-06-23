import {db} from "../../db/mongo.db";
import {ISessionDB} from "../types/session.db.type";
import {WithId} from "mongodb";

export const deviceSessionsRepository = {
  // Сохраняет активную сессию устройства.
  // Одна запись = один успешный login пользователя с конкретного браузера/устройства.
  async addSession(session: ISessionDB): Promise<boolean> {
    const result = await db
      .getCollections()
      .deviceSessionsCollection.insertOne(session)

    // acknowledged показывает, что MongoDB подтвердила insert
    return result.acknowledged
  },

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
  }

}