import {Response} from "express";
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogViewDto} from "../../dto/blogViewDto";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";

export const getBlogHandler = (req: RequestWithParams<URIParamsBlogIdDto>, res: Response<BlogViewDto>)=> {
  const id = req.params.id;
  const blog = blogsRepository.findById(id)
  if (!blog) {
    res.sendStatus(HttpStatus.NotFound_404);
    return
  }
  res.status(HttpStatus.Ok_200).send(blog);
}