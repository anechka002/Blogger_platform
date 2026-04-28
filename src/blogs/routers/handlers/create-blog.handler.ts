import {Response} from "express";
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {CreateBlogDto} from "../../dto/createBlogDto";
import {RequestWithBody} from "../../../core/types/request-types";
import {BlogViewDto} from "../../dto/blogViewDto";
import {Blog} from "../../types/blog";
import {mapToBlogViewModel} from "../mappers/map-to-blog-view-model.utils";

export const createBlogHandler = async (req: RequestWithBody<CreateBlogDto>, res: Response<BlogViewDto>)=> {

  try {
    const newBlog: Blog = {
      name: req.body.name,
      description: req.body.description,
      websiteUrl: req.body.websiteUrl,
      createdAt: new Date(),
      isMembership: false
    }

    const createdBlog = await blogsRepository.create(newBlog)

    if (!createdBlog) {
      res.sendStatus(HttpStatus.InternalServerError_500)
      return
    }

    const blogViewModel = mapToBlogViewModel(createdBlog)
    res.status(HttpStatus.Created_201).send(blogViewModel)
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError_500)
  }
}