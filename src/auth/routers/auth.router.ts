import {Router} from "express";
import {loginHandler} from "./handlers/login.handler";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {meHandler} from "./handlers/me.handler";
import {
  accessTokenGuardMiddleware
} from "../middlewares/access.token.guard-middleware";
import {registrationHandler} from "./handlers/registration.handler";
import {
  loginOrEmailValidation
} from "../../users/middleware/login.or.email.validation";
import {passwordValidation} from "../../users/middleware/password.validation";
import {loginValidation} from "../../users/middleware/login.validation";
import {emailValidation} from "../../users/middleware/email.validation";
import {
  registrationConfirmationHandler
} from "./handlers/registration-confirmation.handler";
import {
  confirmationCodeValidation
} from "../../users/middleware/code.validation";
import {
  registrationEmailResendingHandler
} from "./handlers/registration-email-resending.handler";
import {
  emailOnlyValidation
} from "../../users/middleware/email-only.validation";
import {refreshTokenHandler} from "./handlers/refresh-token.handler";
import {
  refreshTokenGuardMiddleware
} from "../middlewares/refresh.token.guard-middleware";
import {logoutHandler} from "./handlers/logout.handler";
import {rateLimitMiddleware} from "../middlewares/rate.limit.middleware";

export const authRouter = Router({});

authRouter
  .post('/login', rateLimitMiddleware, loginOrEmailValidation, passwordValidation, inputValidationResultMiddleware, loginHandler)

  .get('/me', accessTokenGuardMiddleware, inputValidationResultMiddleware, meHandler)

  .post('/registration', rateLimitMiddleware, loginValidation, passwordValidation, emailValidation, inputValidationResultMiddleware, registrationHandler)

  .post('/registration-confirmation', rateLimitMiddleware, confirmationCodeValidation, inputValidationResultMiddleware, registrationConfirmationHandler)

  .post('/registration-email-resending', rateLimitMiddleware, emailOnlyValidation, inputValidationResultMiddleware, registrationEmailResendingHandler)

  .post('/refresh-token', refreshTokenGuardMiddleware, inputValidationResultMiddleware, refreshTokenHandler)

  .post('/logout', refreshTokenGuardMiddleware, inputValidationResultMiddleware, logoutHandler)
