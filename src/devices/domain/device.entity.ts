import {ISessionDB} from "../types/session.db.type";
import mongoose, {HydratedDocument, model, Model} from "mongoose";

type DeviceModel = Model<ISessionDB>

export type DeviceDocument = HydratedDocument<ISessionDB>

const deviceSessionSchema = new mongoose.Schema<ISessionDB>({
  user_id: { type: String, required: true },
  device_id: { type: String, required: true },
  iat: { type: Date, required: true },
  device_name: { type: String, required: true },
  ip: { type: String, required: true },
  exp: { type: Date, required: true, expires: 0 },
})

export const DeviceModel = model<ISessionDB, DeviceModel>('deviceSessions', deviceSessionSchema)