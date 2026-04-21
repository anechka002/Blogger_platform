import {param} from "express-validator";

export const idValidationMiddleware = param('id')
  .exists().withMessage('ID is required') // Проверка на наличие
  .isString().withMessage('ID must be a string') // Проверка, что это строка
  .isLength({ min: 1 }).withMessage('ID must not be empty') // Проверка, что строка не пустая
  .isNumeric().withMessage('ID must be a numeric string'); // Проверка, что состоит только из цифр