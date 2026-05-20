import {body} from "express-validator";

export const loginInputValidation = [
  body('loginOrEmail')
    .isString()
    .withMessage('loginOrEmail must be a string')
    .trim()
    .notEmpty()
    .withMessage('loginOrEmail is required'),

  body('password')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('password is required'),
]