import {Response} from "express";
import {postsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";
import {PostViewDto} from "../../dto/postViewDto";

export const getPostHandler = (req: RequestWithParams<URIParamsPostIdDto>, res: Response<PostViewDto>)=> {
  const id = req.params.id;
  const post = postsRepository.findById(id)
  if (!post) {
    res.sendStatus(HttpStatus.NotFound_404);
    return
  }
  res.status(HttpStatus.Ok_200).send(post);
}