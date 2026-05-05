import {ValidationErrorType} from "../types/validation-error";
import {ValidationErrorListOutput} from "../types/validation-error-output";

export const createErrorMessages = (errors: ValidationErrorType[]) : ValidationErrorListOutput =>  {
  return {
    errorsMessages: errors,
  };
}