import {body} from "express-validator";

export const newPasswordValidation = body('newPassword')
  .isString()
  .withMessage('Password must be a string')
  .trim()
  .isLength({ min: 6, max: 20 })
  .withMessage('Password length must be from 6 to 20 characters')