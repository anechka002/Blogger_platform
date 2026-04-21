import {Response} from "express";
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParams} from "../../../types";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";

export const deleteBlogHandler = (req: RequestWithParams<URIParamsBlogIdDto>, res: Response)=> {
  const id = req.params.id
  const blog = blogsRepository.findById(id)

  if (!blog) {
    res.sendStatus(HttpStatus.NotFound_404)
    return
  }

  blogsRepository.delete(id)
  res.sendStatus(HttpStatus.NoContent_204)
}