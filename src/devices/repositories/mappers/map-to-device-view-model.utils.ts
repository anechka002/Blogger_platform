import {IDeviceView} from "../../types/device.view.type";
import {WithId} from "mongodb";
import {ISessionDB} from "../../types/session.db.type";

export const mapToDeviceViewModel = (device: WithId<ISessionDB>): IDeviceView => {
  return {
    deviceId: device.device_id,
    title: device.device_name,
    lastActiveDate: device.iat.toISOString(),
    ip: device.ip
  }
}