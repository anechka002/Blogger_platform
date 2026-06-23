import {Router} from "express";
import {getAllDevicesHandler} from "./handlers/get-all-devices.handler";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  refreshTokenGuardMiddleware
} from "../../auth/middlewares/refresh.token.guard-middleware";


export const devicesRouter = Router({});

devicesRouter

  .get('/devices', refreshTokenGuardMiddleware, inputValidationResultMiddleware, getAllDevicesHandler)





