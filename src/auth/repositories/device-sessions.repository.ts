import {db} from "../../db/mongo.db";
import {ISessionDB} from "../types/session.db.type";

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
}