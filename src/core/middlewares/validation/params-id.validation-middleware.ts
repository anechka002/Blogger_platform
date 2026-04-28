import {param} from "express-validator";

export const idValidationMiddleware = param('id')
  .notEmpty().withMessage("ID is required") // Проверка, что строка не пустая
  .isString().withMessage('ID must be a string') // Проверка, что это строка
  .isMongoId()
  .withMessage('Incorrect format of ObjectId'); // Проверка на формат ObjectId