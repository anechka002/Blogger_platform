import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogViewDto} from "../../dto/blogViewDto";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {blogsQueryRepository} from "../../repositories/blogs.query.repository";

export const getBlogHandler = async (req: RequestWithParams<URIParamsBlogIdDto>, res: Response<BlogViewDto>)=> {
  try {
    const blog = await blogsQueryRepository.findByIdOrFail(req.params.id)

    res.status(HttpStatus.Ok_200).send(blog);
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}