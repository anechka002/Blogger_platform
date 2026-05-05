import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParamsAndBody} from "../../../core/types/request-types";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";
import {UpdatePostDto} from "../../dto/updatePostDto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {postsService} from "../../application/posts.service";

export const updatePostHandler = async (req: RequestWithParamsAndBody<URIParamsPostIdDto, UpdatePostDto>, res: Response)=> {
  try {
    await postsService.update(req.params.id, req.body)

    res.sendStatus(HttpStatus.NoContent_204)
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}