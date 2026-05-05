import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";
import {postsService} from "../../application/posts.service";
import {errorsHandler} from "../../../core/errors/errors.handler";

export const deletePostHandler = async (req: RequestWithParams<URIParamsPostIdDto>, res: Response)=> {
  try {
    await postsService.delete(req.params.id)

    res.sendStatus(HttpStatus.NoContent_204)
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}