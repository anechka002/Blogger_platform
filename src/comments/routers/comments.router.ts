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
import {
  likesStatusInputDtoValidation
} from "../validation/like-status.input-dto.validation-middleware";
import {
  optionalAccessTokenMiddleware
} from "../middlewares/optional-access.token.guard-middleware";
import {JwtService} from "../../auth/adapters/jwt.service";

const commentsController = container.get(CommentsController)
const jwtService = container.get(JwtService)

export const commentsRouter = Router({});

commentsRouter
  .get('/:id', optionalAccessTokenMiddleware(jwtService), idValidationMiddleware(), inputValidationResultMiddleware, commentsController.getComment.bind(commentsController))

  .put('/:commentId', accessToken, idValidationMiddleware('commentId'), commentInputDtoValidation, inputValidationResultMiddleware,  commentsController.updateComment.bind(commentsController))

  .put('/:commentId/like-status', accessToken, idValidationMiddleware('commentId'), likesStatusInputDtoValidation, inputValidationResultMiddleware, commentsController.updateLikeStatus.bind(commentsController))

  .delete('/:commentId', accessToken, idValidationMiddleware('commentId'), inputValidationResultMiddleware, commentsController.deleteComment.bind(commentsController));