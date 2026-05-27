import { body } from 'express-validator';

const contentValidation = body('content')
  .isString()
  .trim()
  .isLength({ min: 20, max: 300})
  .withMessage('Content length is incorrect')


export const commentInputDtoValidation = [
  contentValidation
]