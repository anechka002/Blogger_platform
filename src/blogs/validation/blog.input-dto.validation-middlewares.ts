import { body } from 'express-validator';

const websiteUrlPattern =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

const nameValidation = body('name')
  .isString()
  .withMessage('Name must be a string')
  .trim()
  .isLength({ min: 1, max: 15})
  .withMessage('Length of name is not correct');

const descriptionValidation = body('description')
  .isString()
  .withMessage('Description must be a string')
  .trim()
  .isLength({ min: 1, max: 500})
  .withMessage('Length of description is not correct');

const websiteUrlValidation = body('websiteUrl')
  .isString()
  .withMessage('WebsiteUrl must be a string')
  .trim()
  .isLength({ min: 1, max: 100})
  .withMessage('Length of websiteUrl is not correct')
  .matches(websiteUrlPattern)
  .withMessage('websiteUrl is not correct');

export const blogInputDtoValidation = [
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
];