import { param } from 'express-validator'

export const deviceIdValidation = param('deviceId')
  .notEmpty()
  .withMessage('deviceId is required') // Проверка, что строка не пустая
  .isUUID()
  .withMessage('deviceId must be UUID')