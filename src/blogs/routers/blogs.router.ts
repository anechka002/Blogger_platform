import { Router } from "express";
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
  baseAuthGuardMiddleware
} from "../../auth/middlewares/base.auth.guard-middleware";
import {paginationAndSortingValidation} from "../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import {PostSortField} from "../../posts/routers/input/post-sort-field";
import {BlogSortField} from "./input/blog-sort-field";
import {
  blogPostInputDtoValidation
} from "../../posts/validation/post.input-dto.validation-middlewares";
import {searchNameTermValidation} from "../validation/blogs-query.validation";
import {container} from "../../composition-root";
import {BlogsController} from "./controller/blogs-controller";

const blogsController = container.get(BlogsController)

export const blogsRouter = Router({});

// blogsRouter.use(superAdminGuardMiddleware); // для всех роутеров

blogsRouter
  .get('/', paginationAndSortingValidation(BlogSortField), searchNameTermValidation, inputValidationResultMiddleware, blogsController.getBlogList.bind(blogsController))

  .post('/', baseAuthGuardMiddleware, blogInputDtoValidation, inputValidationResultMiddleware, blogsController.createBlog.bind(blogsController))

  .get('/:id', idValidationMiddleware(), inputValidationResultMiddleware, blogsController.getBlog.bind(blogsController))

  .put('/:id', baseAuthGuardMiddleware, idValidationMiddleware(), blogInputDtoValidation, inputValidationResultMiddleware, blogsController.updateBlog.bind(blogsController))

  .delete('/:id', baseAuthGuardMiddleware, idValidationMiddleware(), inputValidationResultMiddleware, blogsController.deleteBlog.bind(blogsController))

  .get('/:blogId/posts', idValidationMiddleware('blogId'), paginationAndSortingValidation(PostSortField), inputValidationResultMiddleware, blogsController.getBlogPosts.bind(blogsController))

  .post('/:blogId/posts', baseAuthGuardMiddleware, idValidationMiddleware('blogId'), blogPostInputDtoValidation, inputValidationResultMiddleware, blogsController.createPostForBlog.bind(blogsController))