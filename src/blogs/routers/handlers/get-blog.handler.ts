import {Response} from "express";
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogViewDto} from "../../dto/blogViewDto";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsBlogIdDto} from "../../dto/URIParamsBlogIdDto";
import {mapToBlogViewModel} from "../mappers/map-to-blog-view-model.utils";

export const getBlogHandler = async (req: RequestWithParams<URIParamsBlogIdDto>, res: Response<BlogViewDto>)=> {
  try {
    const id = req.params.id;
    const blog = await blogsRepository.findById(id)
    if (!blog) {
      res.sendStatus(HttpStatus.NotFound_404);
      return
    }
    const blogViewModel = mapToBlogViewModel(blog)
    res.status(HttpStatus.Ok_200).send(blogViewModel);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError_500)
  }
}