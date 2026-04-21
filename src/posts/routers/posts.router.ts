import { Router } from "express";
import {createPostHandler} from "./handlers/create-post.handler";
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
import {updatePostHandler} from "./handlers/update-post.handler";


export const postsRouter = Router({});

// blogsRouter.use(superAdminGuardMiddleware); // для всех роутеров

postsRouter
  .get('/', getPostListHandler)

  .post('/', superAdminGuardMiddleware, postInputDtoValidation, inputValidationResultMiddleware, createPostHandler)

  .get('/:id', idValidationMiddleware, inputValidationResultMiddleware, getPostHandler)

  .put('/:id', superAdminGuardMiddleware, idValidationMiddleware, postInputDtoValidation, inputValidationResultMiddleware, updatePostHandler)

  .delete('/:id', superAdminGuardMiddleware, idValidationMiddleware, inputValidationResultMiddleware, deletePostHandler)