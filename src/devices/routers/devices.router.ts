import {Router} from "express";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {deviceIdValidation} from "../middleware/devaice-id.validation";
import {container, refreshToken} from "../../composition-root";
import {DeviceController} from "./controller/device-controller";

const deviceController = container.get(DeviceController)

export const devicesRouter = Router({});

devicesRouter

  .get('/', refreshToken, inputValidationResultMiddleware, deviceController.getAllDevices.bind(deviceController))

  .delete('/', refreshToken, inputValidationResultMiddleware, deviceController.deleteAllExceptCurrent.bind(deviceController))

  .delete('/:deviceId', refreshToken, deviceIdValidation, inputValidationResultMiddleware, deviceController.deleteDeviceSession.bind(deviceController))




