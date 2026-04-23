import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithBody} from "../../../core/types/request-types";
import {Post} from "../../types/post";
import {CreatePostDto} from "../../dto/createPostDto";
import {PostViewDto} from "../../dto/postViewDto";
import {blogsRepository} from "../../../blogs/repositories/blogs.repository";
import {createValidationErrorResponse} from "../../../core/utils/error.utils";
import {ValidationErrorDto} from "../../../core/types/validation-errors.ts";
import {postsRepository} from "../../repositories/posts.repository";
import {db} from "../../../db/in-memory.db";

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

  const newId = db.posts.length
    ? Number(db.posts[db.posts.length - 1].id) + 1
    : 1

  const newPost: Post = {
    id: String(newId),
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    content: req.body.content,
    blogId: req.body.blogId,
    blogName: blog.name
  }

  postsRepository.create(newPost)
  res.status(HttpStatus.Created_201).send(newPost)
}