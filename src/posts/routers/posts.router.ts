import { Router } from "express";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  superAdminGuardMiddleware
} from "../../auth/middlewares/super-admin.guard-middleware";
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

export const postsRouter = Router({});

// blogsRouter.use(superAdminGuardMiddleware); // для всех роутеров

postsRouter
  .get('/', paginationAndSortingValidation(PostSortField), inputValidationResultMiddleware, getPostListHandler)

  .post('/', superAdminGuardMiddleware, postInputDtoValidation, inputValidationResultMiddleware, createPostHandler)

  .get('/:id', idValidationMiddleware(), inputValidationResultMiddleware, getPostHandler)

  .put('/:id', superAdminGuardMiddleware, idValidationMiddleware(), postInputDtoValidation, inputValidationResultMiddleware, updatePostHandler)

  .delete('/:id', superAdminGuardMiddleware, idValidationMiddleware(), inputValidationResultMiddleware, deletePostHandler)