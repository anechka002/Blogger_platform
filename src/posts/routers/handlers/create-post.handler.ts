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
import {mapToPostViewModel} from "../mappers/map-to-post-view-model.utils";

export const createPostHandler = async (req: RequestWithBody<CreatePostDto>, res: Response<PostViewDto | ValidationErrorDto>)=> {
  try {
    const blog = await blogsRepository.findById(req.body.blogId)

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
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      blogId: req.body.blogId,
      blogName: blog.name,
      createdAt: new Date(),
    }

    const createdPost = await postsRepository.create(newPost)

    if (!createdPost) {
      res.sendStatus(HttpStatus.InternalServerError_500)
      return
    }

    const postViewModel = mapToPostViewModel(createdPost)

    res.status(HttpStatus.Created_201).send(postViewModel)
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError_500)
  }
}