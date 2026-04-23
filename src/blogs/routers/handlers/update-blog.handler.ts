import {Response} from "express";
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParamsAndBody} from "../../../core/types/request-types";
import {UpdateBlogDto} from "../../dto/updateBlogDto";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";

export const updateBlogHandler = (req: RequestWithParamsAndBody<URIParamsBlogIdDto, UpdateBlogDto>, res: Response)=> {
  const id = req.params.id
  const blog = blogsRepository.findById(id)

  if (!blog) {
    res.sendStatus(HttpStatus.NotFound_404)
    return
  }

  blogsRepository.update(id, req.body)
  res.sendStatus(HttpStatus.NoContent_204)
}