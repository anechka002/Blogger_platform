import {Router} from "express";
import {getCommentHandler} from "./handlers/get-comment.handler";
import {
  idValidationMiddleware
} from "../../core/middlewares/validation/params-id.validation-middleware";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";

export const commentsRouter = Router({});

commentsRouter
  .get('/:id', idValidationMiddleware(), inputValidationResultMiddleware, getCommentHandler)
