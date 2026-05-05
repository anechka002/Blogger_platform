import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithBody} from "../../../core/types/request-types";
import {CreatePostDto} from "../../dto/createPostDto";
import {PostViewDto} from "../../dto/postViewDto";
import {postsService} from "../../application/posts.service";
import {postsQueryService} from "../../application/posts-query.service";
import {errorsHandler} from "../../../core/errors/errors.handler";

export const createPostHandler = async (req: RequestWithBody<CreatePostDto>, res: Response<PostViewDto>)=> {
  try {
    const createdPostId = await postsService.create(req.body)

    const postViewModel = await postsQueryService.findByIdOrFail(createdPostId)

    res.status(HttpStatus.Created_201).send(postViewModel)
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}