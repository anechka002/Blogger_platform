import {Response} from "express";
import {postsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";

export const deletePostHandler = (req: RequestWithParams<URIParamsPostIdDto>, res: Response)=> {
  const id = req.params.id
  const post = postsRepository.findById(id)

  if (!post) {
    res.sendStatus(HttpStatus.NotFound_404)
    return
  }

  postsRepository.delete(id)
  res.sendStatus(HttpStatus.NoContent_204)
}