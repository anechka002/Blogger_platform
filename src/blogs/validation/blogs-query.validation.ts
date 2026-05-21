import {query} from "express-validator";

export const searchNameTermValidation = query('searchNameTerm')
  .optional()
  .isString()
  .trim()
