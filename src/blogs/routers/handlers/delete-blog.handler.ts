import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";
import {blogsService} from "../../application/blogs.service";
import {errorsHandler} from "../../../core/errors/errors.handler";

export const deleteBlogHandler = async (req: RequestWithParams<URIParamsBlogIdDto>, res: Response)=> {
  try {
    const id = req.params.id

    await blogsService.delete(id)

    res.sendStatus(HttpStatus.NoContent_204)
  } catch (error: unknown) {
    console.log(error);
    errorsHandler(error, res)
  }
}