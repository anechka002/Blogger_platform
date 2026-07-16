import {ApiRequestLogDb} from "../types/api-request-log.db.type";
import mongoose, {HydratedDocument, model, Model} from "mongoose";

type ApiRequestLogModel = Model<ApiRequestLogDb>

export type ApiRequestLogDocument = HydratedDocument<ApiRequestLogDb>

const apiRequestLogSchema = new mongoose.Schema<ApiRequestLogDb>({
  IP: {type: String, required: true},
  URL: {type: String, required: true},
  date: {type: Date, required: true, expires: 10},
})

export const ApiRequestLogModel = model<ApiRequestLogDb, ApiRequestLogModel>("ApiRequestLogs", apiRequestLogSchema);