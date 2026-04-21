import {Response} from "express";
import {postsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParamsAndBody} from "../../../types";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";
import {UpdatePostDto} from "../../dto/updatePostDto";
import {blogsRepository} from "../../../blogs/repositories/blogs.repository";
import {createValidationErrorResponse} from "../../../core/utils/error.utils";

export const updatePostHandler = (req: RequestWithParamsAndBody<URIParamsPostIdDto, UpdatePostDto>, res: Response)=> {
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

  const id = req.params.id
  const post = postsRepository.findById(id)

  if (!post) {
    res.sendStatus(HttpStatus.NotFound_404)
    return
  }

  postsRepository.update(id, req.body, blog.name)
  res.sendStatus(HttpStatus.NoContent_204)
}