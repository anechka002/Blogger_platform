import { body } from 'express-validator'

export const recoveryCodeValidation = body('recoveryCode')
  .isString()
  .withMessage('Code must be a string')
  .trim()
  .isUUID()
  .withMessage('Code is required')