import {body} from "express-validator";
import {usersRepository} from "../repositories/users.repository";

export const loginValidation = body('login')
  .isString()
  .withMessage('Login must be a string')
  .trim()
  .isLength({ min: 3, max: 10})
  .withMessage('Login length is incorrect')
  .matches(/^[a-zA-Z0-9_-]*$/)
  .withMessage('Login has invalid characters')
  .custom(async login => {
    const user = await usersRepository.findByLogin(login);
    if (user) {
      throw new Error('login should be unique');
    }
    return true
})
