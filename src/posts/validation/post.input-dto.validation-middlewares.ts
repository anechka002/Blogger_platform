import { body } from 'express-validator';
import {
  BlogsRepository,
} from "../../blogs/repositories/blogs.repository";

const titleValidation = body('title')
  .isString()
  .withMessage('Title must be a string')
  .trim()
  .isLength({ min: 1, max: 30})
  .withMessage('Length of title is not correct');

const shortDescriptionValidation = body('shortDescription')
  .isString()
  .withMessage('Description must be a string')
  .trim()
  .isLength({ min: 1, max: 100})
  .withMessage('Length of description is not correct');

const contentValidation = body('content')
  .isString()
  .withMessage('Content must be a string')
  .trim()
  .isLength({ min: 1, max: 300})
  .withMessage('Length of content is not correct')

const blogIdValidation = (blogsRepository: BlogsRepository) => body('blogId')
  .isString()
  .withMessage('blogId must be a string')
  .trim()
  .isLength({ min: 1})
  .withMessage('blogId is required')
  .bail()
  .isMongoId()
  .withMessage('blogId must be valid Mongo id')
  .bail()
  .custom(async(blogId: string) => {
    const blog = await blogsRepository.findById(blogId);

    if(!blog) {
      throw new Error('blog not found');
    }

    return true
  })

export const postInputDtoValidation = (blogsRepository: BlogsRepository) => [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation(blogsRepository),
];

export const blogPostInputDtoValidation = [
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
]