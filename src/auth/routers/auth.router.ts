import {Router} from "express";
import {loginHandler} from "./handlers/login.handler";
import {
  loginInputValidation
} from "../validation/login.input-dto.validation-middlewares";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {meHandler} from "./handlers/me.handler";
import {
  accessTokenGuardMiddleware
} from "../middlewares/access.token.guard-middleware";

export const authRouter = Router({});

authRouter
  .post('/login', loginInputValidation, inputValidationResultMiddleware, loginHandler)

  .get('/me', accessTokenGuardMiddleware, meHandler)
