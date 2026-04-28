import {Response} from "express";
import {postsRepository} from "../../repositories/posts.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";

export const deletePostHandler = async (req: RequestWithParams<URIParamsPostIdDto>, res: Response)=> {
  try {
    const id = req.params.id
    const post = await postsRepository.findById(id)

    if (!post) {
      res.sendStatus(HttpStatus.NotFound_404)
      return
    }

    await postsRepository.delete(id)
    res.sendStatus(HttpStatus.NoContent_204)
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError_500)
  }
}