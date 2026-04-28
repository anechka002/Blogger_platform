import {Response} from "express";
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithParamsAndBody} from "../../../core/types/request-types";
import {UpdateBlogDto} from "../../dto/updateBlogDto";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";

export const updateBlogHandler = async (req: RequestWithParamsAndBody<URIParamsBlogIdDto, UpdateBlogDto>, res: Response)=> {
  try {
    const id = req.params.id
    const blog = await blogsRepository.findById(id)

    if (!blog) {
      res.sendStatus(HttpStatus.NotFound_404)
      return
    }

    await blogsRepository.update(id, req.body)
    res.sendStatus(HttpStatus.NoContent_204)
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError_500)
  }
}