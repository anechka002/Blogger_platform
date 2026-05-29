import {Router} from "express";
import {getCommentHandler} from "./handlers/get-comment.handler";
import {
  idValidationMiddleware
} from "../../core/middlewares/validation/params-id.validation-middleware";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {updateCommentHandler} from "./handlers/update-comment.handler";
import {
  accessTokenGuardMiddleware
} from "../../auth/middlewares/access.token.guard-middleware";
import {
  commentInputDtoValidation
} from "../validation/comment.input-dto.validation-middlewares";
import {deleteCommentHandler} from "./handlers/delete-comment.handler";

export const commentsRouter = Router({});

commentsRouter
  .get('/:id', idValidationMiddleware(), inputValidationResultMiddleware, getCommentHandler)

  .put('/:commentId', accessTokenGuardMiddleware, idValidationMiddleware('commentId'), commentInputDtoValidation, inputValidationResultMiddleware,  updateCommentHandler)

  .delete('/:commentId', accessTokenGuardMiddleware, idValidationMiddleware('commentId'), inputValidationResultMiddleware, deleteCommentHandler);