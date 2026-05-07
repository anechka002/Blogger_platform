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
import {paginationAndSortingValidation} from "../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import {PostSortField} from "../../posts/routers/input/post-sort-field";
import {getBlogPostsHandler} from "./handlers/get-blog-posts.handler";
import {BlogSortField} from "./input/blog-sort-field";
import {
  createPostForBlogHandler
} from "./handlers/create-post-for-blog.handler";
import {
  blogPostInputDtoValidation
} from "../../posts/validation/post.input-dto.validation-middlewares";

export const blogsRouter = Router({});

// blogsRouter.use(superAdminGuardMiddleware); // для всех роутеров

blogsRouter
  .get('/', paginationAndSortingValidation(BlogSortField), inputValidationResultMiddleware, getBlogListHandler)

  .post('/', superAdminGuardMiddleware, blogInputDtoValidation, inputValidationResultMiddleware, createBlogHandler)

  .get('/:id', idValidationMiddleware(), inputValidationResultMiddleware, getBlogHandler)

  .put('/:id', superAdminGuardMiddleware, idValidationMiddleware(), blogInputDtoValidation, inputValidationResultMiddleware, updateBlogHandler)

  .delete('/:id', superAdminGuardMiddleware, idValidationMiddleware(), inputValidationResultMiddleware, deleteBlogHandler)

  .get('/:blogId/posts', idValidationMiddleware('blogId'), paginationAndSortingValidation(PostSortField), inputValidationResultMiddleware, getBlogPostsHandler)

  .post('/:blogId/posts', superAdminGuardMiddleware, idValidationMiddleware('blogId'), blogPostInputDtoValidation, inputValidationResultMiddleware, createPostForBlogHandler)