import {Router} from "express";
import {loginHandler} from "./handlers/login.handler";
import {
  loginInputValidation
} from "../validation/login.input-dto.validation-middlewares";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";

export const authRouter = Router({});

authRouter
  .post('/login', loginInputValidation, inputValidationResultMiddleware, loginHandler);