import {body} from "express-validator";

export const emailOnlyValidation = body('email')
  .isString()
  .trim()
  .isEmail()
  .withMessage('Email is invalid')