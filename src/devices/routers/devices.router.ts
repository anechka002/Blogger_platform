import {Router} from "express";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  refreshTokenGuardMiddleware
} from "../../auth/middlewares/refresh.token.guard-middleware";
import {deviceIdValidation} from "../middleware/devaice-id.validation";
import {deviceController, refreshToken} from "../../composition-root";

export const devicesRouter = Router({});

devicesRouter

  .get('/', refreshToken, inputValidationResultMiddleware, deviceController.getAllDevices.bind(deviceController))

  .delete('/', refreshToken, inputValidationResultMiddleware, deviceController.deleteAllExceptCurrent.bind(deviceController))

  .delete('/:deviceId', refreshToken, deviceIdValidation, inputValidationResultMiddleware, deviceController.deleteDeviceSession.bind(deviceController))




