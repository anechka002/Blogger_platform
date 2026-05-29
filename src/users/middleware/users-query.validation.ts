import {query} from "express-validator";

export const searchLoginTermValidation = query('searchLoginTerm')
  .optional()
  .isString()
  .trim()

export const searchEmailTermValidation = query('searchEmailTerm')
  .optional()
  .isString()
  .trim()
