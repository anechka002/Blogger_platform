import { Router } from "express";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  baseAuthGuardMiddleware
} from "../../auth/middlewares/base.auth.guard-middleware";
import {
  idValidationMiddleware
} from "../../core/middlewares/validation/params-id.validation-middleware";
import {
  paginationAndSortingValidation
} from "../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import {PostSortField} from "./input/post-sort-field";
import {
  commentInputDtoValidation
} from "../../comments/validation/comment.input-dto.validation-middlewares";
import {
  CommentSortField
} from "../../comments/routers/input/comment-sort-field";
import {
  accessToken,
  container, postInputValidation,
} from "../../composition-root";
import {PostsController} from "./controller/posts-controller";
import {
  CommentsController
} from "../../comments/routers/controller/comments-controller";
import {
  optionalAccessTokenMiddleware
} from "../../comments/middlewares/optional-access.token.guard-middleware";
import {JwtService} from "../../auth/adapters/jwt.service";


const postsController = container.get(PostsController)
const commentsController = container.get(CommentsController)
const jwtService = container.get(JwtService)

export const postsRouter = Router({});

// blogsRouter.use(superAdminGuardMiddleware); // для всех роутеров

postsRouter
  .get('/', paginationAndSortingValidation(PostSortField), inputValidationResultMiddleware, postsController.getPostList.bind(postsController))

  .post('/', baseAuthGuardMiddleware, postInputValidation, inputValidationResultMiddleware, postsController.createPost.bind(postsController))

  .get('/:id', idValidationMiddleware(), inputValidationResultMiddleware, postsController.getPost.bind(postsController))

  .put('/:id', baseAuthGuardMiddleware, idValidationMiddleware(), postInputValidation, inputValidationResultMiddleware, postsController.updatePost.bind(postsController))

  .delete('/:id', baseAuthGuardMiddleware, idValidationMiddleware(), inputValidationResultMiddleware, postsController.deletePost.bind(postsController))

  .post('/:postId/comments', accessToken, idValidationMiddleware('postId'), commentInputDtoValidation, inputValidationResultMiddleware, commentsController.createComment.bind(commentsController))

  .get('/:postId/comments', optionalAccessTokenMiddleware(jwtService), idValidationMiddleware('postId'), paginationAndSortingValidation(CommentSortField), inputValidationResultMiddleware, commentsController.getCommentList.bind(commentsController))
