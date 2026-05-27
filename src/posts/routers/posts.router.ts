import { Router } from "express";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  baseAuthGuardMiddleware
} from "../../auth/middlewares/base.auth.guard-middleware";
import {
  postInputDtoValidation
} from "../validation/post.input-dto.validation-middlewares";
import {getPostListHandler} from "./handlers/get-post-list.handler";
import {getPostHandler} from "./handlers/get-post.handler";
import {
  idValidationMiddleware
} from "../../core/middlewares/validation/params-id.validation-middleware";
import {deletePostHandler} from "./handlers/delete-post.handler";
import {createPostHandler} from "./handlers/create-post.handler";
import {updatePostHandler} from "./handlers/update-post.handler";
import {
  paginationAndSortingValidation
} from "../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import {PostSortField} from "./input/post-sort-field";
import {
  createCommentHandler
} from "../../comments/routers/handlers/create-comment.handler";
import {
  commentInputDtoValidation
} from "../../comments/validation/comment.input-dto.validation-middlewares";
import {
  accessTokenGuardMiddleware
} from "../../auth/middlewares/access.token.guard-middleware";
import {
  getCommentListHandler
} from "../../comments/routers/handlers/get-comment-list.handler";
import {
  CommentSortField
} from "../../comments/routers/input/comment-sort-field";

export const postsRouter = Router({});

// blogsRouter.use(superAdminGuardMiddleware); // для всех роутеров

postsRouter
  .get('/', paginationAndSortingValidation(PostSortField), inputValidationResultMiddleware, getPostListHandler)

  .post('/', baseAuthGuardMiddleware, postInputDtoValidation, inputValidationResultMiddleware, createPostHandler)

  .get('/:id', idValidationMiddleware(), inputValidationResultMiddleware, getPostHandler)

  .put('/:id', baseAuthGuardMiddleware, idValidationMiddleware(), postInputDtoValidation, inputValidationResultMiddleware, updatePostHandler)

  .delete('/:id', baseAuthGuardMiddleware, idValidationMiddleware(), inputValidationResultMiddleware, deletePostHandler)

  .post('/:postId/comments', accessTokenGuardMiddleware, idValidationMiddleware('postId'), commentInputDtoValidation, inputValidationResultMiddleware, createCommentHandler)

  .get('/:postId/comments', idValidationMiddleware('postId'), paginationAndSortingValidation(CommentSortField), inputValidationResultMiddleware, getCommentListHandler)
