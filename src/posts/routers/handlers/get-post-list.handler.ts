import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {PostViewDto} from "../../dto/postViewDto";
import {
  postsQueryService,
} from "../../application/posts-query.service";
import {errorsHandler} from "../../../core/errors/errors.handler";

export const getPostListHandler = async (req: Request, res: Response<PostViewDto[]>)=> {
  try {
    const posts = await postsQueryService.findMany()
    res.status(HttpStatus.Ok_200).send(posts);
  } catch (error: unknown) {
    errorsHandler(error, res);
  }
}