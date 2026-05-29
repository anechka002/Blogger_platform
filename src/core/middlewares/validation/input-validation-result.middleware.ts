import {
  FieldValidationError,
  ValidationError,
  validationResult
} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {HttpStatus} from "../../types/http-statuses";
import {ValidationErrorType} from "../../types/validation-error";
import {createErrorMessages} from "../../errors/create-error-message";

const formValidationError = (error: ValidationError): ValidationErrorType => {
  const expressError = error as unknown as FieldValidationError;

  return {
    field: expressError.path,
    message: expressError.msg, // Сообщение ошибки
  };
};

export const inputValidationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
    .formatWith(formValidationError)
    .array({ onlyFirstError: true });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest_400).json(createErrorMessages(errors));
    return;
  }

  next();
};