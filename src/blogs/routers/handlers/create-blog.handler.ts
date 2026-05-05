import {Response} from "express";
import {HttpStatus} from "../../../core/types/http-statuses";
import {CreateBlogDto} from "../../dto/createBlogDto";
import {RequestWithBody} from "../../../core/types/request-types";
import {BlogViewDto} from "../../dto/blogViewDto";
import {mapToBlogViewModel} from "../mappers/map-to-blog-view-model.utils";
import {blogsService} from "../../application/blogs.service";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {blogsQueryService} from "../../application/blogs-query.service";

export const createBlogHandler = async (req: RequestWithBody<CreateBlogDto>, res: Response<BlogViewDto>)=> {
  try {
    const createdBlogId = await blogsService.create(req.body)

    const blogViewModel = await blogsQueryService.findByIdOrFail(createdBlogId);

    res.status(HttpStatus.Created_201).send(blogViewModel)
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}