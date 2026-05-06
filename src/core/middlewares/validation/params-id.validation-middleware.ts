import {param} from "express-validator";

export const idValidationMiddleware = (paramName: string = 'id') => {
  return param(paramName)
    .notEmpty().withMessage(`${paramName} is required`) // Проверка, что строка не пустая
    .isString().withMessage(`${paramName} must be a string`) // Проверка, что это строка
    .isMongoId()
    .withMessage('Incorrect format of ObjectId'); // Проверка на формат ObjectId
}
