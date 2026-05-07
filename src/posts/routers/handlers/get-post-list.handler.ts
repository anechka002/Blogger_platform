import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {PostViewDto} from "../../dto/postViewDto";
import {
  postsQueryService,
} from "../../application/posts-query.service";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {matchedData} from "express-validator";
import {PostQueryInput} from "../input/post-query.input";

export const getPostListHandler = async (req: Request, res: Response<PaginationOutput<PostViewDto>>)=> {
  try {
    const queryInput = matchedData<PostQueryInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    const posts = await postsQueryService.findMany(queryInput)

    res.status(HttpStatus.Ok_200).send(posts);
  } catch (error: unknown) {
    errorsHandler(error, res);
  }
}