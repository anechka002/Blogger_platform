import {Router} from "express";
import {loginHandler} from "./handlers/login.handler";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {meHandler} from "./handlers/me.handler";
import {
  accessTokenGuardMiddleware
} from "../middlewares/access.token.guard-middleware";
import {
  loginOrEmailValidation
} from "../../users/middleware/login.or.email.validation";
import {passwordValidation} from "../../users/middleware/password.validation";

export const authRouter = Router({});

authRouter
  .post('/login', loginOrEmailValidation, passwordValidation, inputValidationResultMiddleware, loginHandler)

  .get('/me', accessTokenGuardMiddleware, inputValidationResultMiddleware, meHandler)
