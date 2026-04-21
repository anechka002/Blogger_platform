import {
  FieldValidationError,
  ValidationError,
  validationResult
} from "express-validator";
import {ValidationErrorType} from "../../types/validation-errors.ts";
import {Request, Response, NextFunction} from "express";
import {HttpStatus} from "../../types/http-statuses";

const formatErrors = (error: ValidationError): ValidationErrorType => {
  const expressError = error as unknown as FieldValidationError;

  return {
    field: expressError.path, // Поле с ошибкой
    message: expressError.msg, // Сообщение ошибки
  };
};

export const inputValidationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
    .formatWith(formatErrors)
    .array({ onlyFirstError: true });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest_400).json({ errorsMessages: errors });
    return;
  }

  next();
};