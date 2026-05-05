import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParamsAndBody} from "../../../core/types/request-types";
import {UpdateBlogDto} from "../../dto/updateBlogDto";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";
import {blogsService} from "../../application/blogs.service";
import {errorsHandler} from "../../../core/errors/errors.handler";

export const updateBlogHandler = async (req: RequestWithParamsAndBody<URIParamsBlogIdDto, UpdateBlogDto>, res: Response)=> {
  try {
    await blogsService.update(req.params.id, req.body);

    res.sendStatus(HttpStatus.NoContent_204)
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}