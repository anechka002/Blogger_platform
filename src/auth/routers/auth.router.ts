import {Router} from "express";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  loginOrEmailValidation
} from "../../users/middleware/login.or.email.validation";
import {passwordValidation} from "../../users/middleware/password.validation";
import {
  confirmationCodeValidation
} from "../../users/middleware/code.validation";
import {
  emailOnlyValidation
} from "../../users/middleware/email-only.validation";
import {
  accessToken,
  authController, email, login,
  rateLimit,
  refreshToken
} from "../../composition-root";

export const authRouter = Router({});

authRouter
  .post('/login', rateLimit, loginOrEmailValidation, passwordValidation, inputValidationResultMiddleware, authController.login.bind(authController))

  .get('/me', accessToken, inputValidationResultMiddleware, authController.me.bind(authController))

  .post('/registration', rateLimit, login, passwordValidation, email, inputValidationResultMiddleware, authController.registration.bind(authController))

  .post('/registration-confirmation', rateLimit, confirmationCodeValidation, inputValidationResultMiddleware, authController.registrationConfirmation.bind(authController))

  .post('/registration-email-resending', rateLimit, emailOnlyValidation, inputValidationResultMiddleware, authController.registrationEmailResending.bind(authController))

  .post('/refresh-token', refreshToken, inputValidationResultMiddleware, authController.refreshToken.bind(authController))

  .post('/logout', refreshToken, inputValidationResultMiddleware, authController.logout.bind(authController))
