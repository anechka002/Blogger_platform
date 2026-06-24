import {Router} from "express";
import {getAllDevicesHandler} from "./handlers/get-all-devices.handler";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  refreshTokenGuardMiddleware
} from "../../auth/middlewares/refresh.token.guard-middleware";
import {
  deleteAllExceptCurrentHandler
} from "./handlers/delete-all-except-current.handler";
import {
  deleteDeviceSessionHandler
} from "./handlers/delete-device-session.handler";
import {deviceIdValidation} from "../middleware/devaice-id.validation";

export const devicesRouter = Router({});

devicesRouter

  .get('/', refreshTokenGuardMiddleware, inputValidationResultMiddleware, getAllDevicesHandler)

  .delete('/', refreshTokenGuardMiddleware, inputValidationResultMiddleware, deleteAllExceptCurrentHandler)

  .delete('/:deviceId', refreshTokenGuardMiddleware, deviceIdValidation, inputValidationResultMiddleware, deleteDeviceSessionHandler)




