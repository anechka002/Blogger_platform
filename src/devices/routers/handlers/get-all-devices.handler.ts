import { Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {
  devicesQueryRepository
} from "../../repositories/devices.query.repositories";
import {RequestWithUserId} from "../../../core/types/request-types";
import {IDeviceView} from "../../types/device.view.type";

export const getAllDevicesHandler = async (req: RequestWithUserId, res: Response<IDeviceView[]>) => {
  const userId = req.user?.userId

  if (!userId) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  const devices = await devicesQueryRepository.findAllDevices(userId);

  return res.status(HttpStatus.Ok_200).send(devices)
}