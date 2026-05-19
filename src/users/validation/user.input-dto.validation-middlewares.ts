import { body } from 'express-validator';

const loginValidation = body('login')
  .isString()
  .trim()
  .isLength({ min: 3, max: 10})
  .withMessage('Incorrect username and password')
  .withMessage('Login length is incorrect')
  .matches(/^[a-zA-Z0-9_-]*$/)
  .withMessage('Login has invalid characters')

const emailValidation = body('email')
  .isString()
  .withMessage('Email must be a string')
  .trim()
  .isEmail()
  .withMessage('Email is invalid')

const passwordValidation = body('password')
  .isString()
  .withMessage('Password must be a string')
  .trim()
  .isLength({ min: 6, max: 20 })
  .withMessage('Password length must be from 6 to 20 characters')


export const userInputDtoValidation = [
  loginValidation,
  emailValidation,
  passwordValidation,
]