import { body } from 'express-validator';
import {LikeStatus} from "../../core/enum/like-status.enum";

const likesStatusValidation = body('likeStatus')
  .exists()
  .withMessage('likeStatus is required')
  .isString()
  .withMessage('likeStatus must be a string')
  .trim()
  .isIn(Object.values(LikeStatus))
  .withMessage('likeStatus must be None, Like or Dislike');

export const likesStatusInputDtoValidation = [
  likesStatusValidation
]