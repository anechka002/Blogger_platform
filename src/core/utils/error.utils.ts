import {
  ValidationErrorDto,
  ValidationErrorType
} from "../types/validation-errors.ts";

export const createValidationErrorResponse = (
  errors: ValidationErrorType[],
): ValidationErrorDto => {
  return { errorsMessages: errors };
};