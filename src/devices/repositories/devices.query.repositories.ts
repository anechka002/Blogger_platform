import {IDeviceView} from "../types/device.view.type";
import {db} from "../../db/mongo.db";
import {
  mapToDeviceViewModel
} from "../routers/mappers/map-to-device-view-model.utils";

export const devicesQueryRepository = {
  async findAllDevices(userId: string): Promise<IDeviceView[]> {
    const devices = await db
      .getCollections()
      .deviceSessionsCollection.find({
        user_id: userId,
        exp: {$gt: new Date() },
      }).toArray()


    return devices.map(mapToDeviceViewModel)
  }
}