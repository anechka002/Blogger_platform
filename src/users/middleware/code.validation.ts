import { body } from 'express-validator'

export const confirmationCodeValidation = body('code')
  .isString()
  .withMessage('Code must be a string')
  .trim()
  .isUUID()
  .withMessage('Code is required')