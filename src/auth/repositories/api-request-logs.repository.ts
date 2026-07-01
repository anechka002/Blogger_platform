import {db} from "../../db/mongo.db";
import {ApiRequestLogDb} from "../types/api-request-log.db.type";

export class ApiRequestLogsRepository {
  // Считает количество запросов с одного IP на один URL за период от tenSecondsAgo до текущего момента.
  async countRecentRequests({originalUrl, ip, tenSecondsAgo}:{originalUrl: string, ip: string, tenSecondsAgo: Date}): Promise<number>{
    const result = await db
      .getCollections()
      .apiRequestLogsCollection
      .countDocuments({
        IP: ip,
        URL: originalUrl,
        date: { $gt: tenSecondsAgo }
      })
    return result
  }

  // Сохраняет информацию о текущем запросе в коллекцию apiRequestLogs.
  async create(requestLog: ApiRequestLogDb): Promise<boolean> {
    const result = await db
      .getCollections()
      .apiRequestLogsCollection.insertOne(requestLog)
    return !!result
  }
}