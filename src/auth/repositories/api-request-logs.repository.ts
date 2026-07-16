import {injectable} from "inversify";
import {
  ApiRequestLogDocument,
  ApiRequestLogModel
} from "../domain/api-request-log.entity";

@injectable()
export class ApiRequestLogsRepository {
  // Считает количество запросов с одного IP на один URL за период от tenSecondsAgo до текущего момента.
  async countRecentRequests({originalUrl, ip, tenSecondsAgo}:{originalUrl: string, ip: string, tenSecondsAgo: Date}): Promise<number>{
    return ApiRequestLogModel.countDocuments({
        IP: ip,
        URL: originalUrl,
        date: { $gt: tenSecondsAgo }
      })
  }

  // Сохраняет информацию о текущем запросе в коллекцию apiRequestLogs.
  async create(requestLog: ApiRequestLogDocument): Promise<boolean> {
    await requestLog.save()
    return true
  }
}