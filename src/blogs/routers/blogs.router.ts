import { Router } from "express";
import {getBlogListHandler} from "./handlers/get-blog-list.handler";
import {getBlogHandler} from "./handlers/get-blog.handler";
import {createBlogHandler} from "./handlers/create-blog.handler";
import {updateBlogHandler} from "./handlers/update-blog.handler";
import {deleteBlogHandler} from "./handlers/delete-blog.handler";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  blogInputDtoValidation
} from "../validation/blog.input-dto.validation-middlewares";
import {
  idValidationMiddleware
} from "../../core/middlewares/validation/params-id.validation-middleware";
import {
  superAdminGuardMiddleware
} from "../../auth/middlewares/super-admin.guard-middleware";

export const blogsRouter = Router({});

// blogsRouter.use(superAdminGuardMiddleware); // для всех роутеров

blogsRouter
  .get('/', getBlogListHandler)

  .post('/', superAdminGuardMiddleware, blogInputDtoValidation, inputValidationResultMiddleware, createBlogHandler)

  .get('/:id', idValidationMiddleware, inputValidationResultMiddleware, getBlogHandler)

  .put('/:id', superAdminGuardMiddleware, idValidationMiddleware, blogInputDtoValidation, inputValidationResultMiddleware, updateBlogHandler)

  .delete('/:id', superAdminGuardMiddleware, idValidationMiddleware, inputValidationResultMiddleware, deleteBlogHandler)