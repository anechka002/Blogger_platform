import {Router} from "express";
import {
  idValidationMiddleware
} from "../../core/middlewares/validation/params-id.validation-middleware";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  commentInputDtoValidation
} from "../validation/comment.input-dto.validation-middlewares";
import {accessToken, container} from "../../composition-root";
import {CommentsController} from "./controller/comments-controller";

const commentsController = container.get(CommentsController)

export const commentsRouter = Router({});

commentsRouter
  .get('/:id', idValidationMiddleware(), inputValidationResultMiddleware, commentsController.getComment.bind(commentsController))

  .put('/:commentId', accessToken, idValidationMiddleware('commentId'), commentInputDtoValidation, inputValidationResultMiddleware,  commentsController.updateComment.bind(commentsController))

  .delete('/:commentId', accessToken, idValidationMiddleware('commentId'), inputValidationResultMiddleware, commentsController.deleteComment.bind(commentsController));