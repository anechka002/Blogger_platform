import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";
import {PostViewDto} from "../../dto/postViewDto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {postsQueryRepository} from "../../repositories/posts.query.repository";

export const getPostHandler = async (req: RequestWithParams<URIParamsPostIdDto>, res: Response<PostViewDto>)=> {
  try {
    const post = await postsQueryRepository.findByIdOrFail(req.params.id)

    res.status(HttpStatus.Ok_200).send(post);
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}