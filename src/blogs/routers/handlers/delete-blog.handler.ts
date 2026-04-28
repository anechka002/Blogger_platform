import {Response} from "express";
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";

export const deleteBlogHandler = async (req: RequestWithParams<URIParamsBlogIdDto>, res: Response)=> {
  try {
    const id = req.params.id
    const blog = await blogsRepository.findById(id)

    if (!blog) {
      res.sendStatus(HttpStatus.NotFound_404)
      return
    }

    await blogsRepository.delete(id)

    res.sendStatus(HttpStatus.NoContent_204)
  } catch (error) {
      res.sendStatus(HttpStatus.InternalServerError_500);
  }
}