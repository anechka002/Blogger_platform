import {body} from "express-validator";

export const loginOrEmailValidation = body('loginOrEmail')
    .isString()
    .withMessage('loginOrEmail must be a string')
    .trim()
    .notEmpty()
    .withMessage('loginOrEmail is required')