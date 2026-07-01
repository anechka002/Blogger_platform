import {body} from "express-validator";
import {UsersRepository} from "../repositories/users.repository";

export const emailValidation = (usersRepository: UsersRepository) => {
  return body('email')
    .isString()
    .withMessage('Email must be a string')
    .trim()
    .isEmail()
    .withMessage('Email is invalid')
    .custom(async email => {
      const user = await usersRepository.findByEmail(email)

      if (user) {
        throw new Error('email should be unique')
      }

      return true
    })
}
