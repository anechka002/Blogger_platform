import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithBody} from "../../../types";
import {Post} from "../../types/post";
import {CreatePostDto} from "../../dto/createPostDto";
import {PostViewDto} from "../../dto/postViewDto";
import {blogsRepository} from "../../../blogs/repositories/blogs.repository";
import {createValidationErrorResponse} from "../../../core/utils/error.utils";
import {ValidationErrorDto} from "../../../core/types/validation-errors.ts";
import {postsRepository} from "../../repositories/posts.repository";

export const createPostHandler = (req: RequestWithBody<CreatePostDto>, res: Response<PostViewDto | ValidationErrorDto>)=> {
  const blog = blogsRepository.findById(req.body.blogId)

  if (!blog) {
    res
      .status(HttpStatus.BadRequest_400)
      .json(createValidationErrorResponse([
        {
          field: 'blogId',
          message: 'blog not found',
        },
      ])
    );
    return;
  }

  const newPost: Post = {
    id: new Date().toISOString(),
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    content: req.body.content,
    blogId: req.body.blogId,
    blogName: blog.name
  }

  postsRepository.create(newPost)
  res.status(HttpStatus.Created_201).send(newPost)
}