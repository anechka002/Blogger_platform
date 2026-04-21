import {Response} from "express";
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {CreateBlogDto} from "../../dto/createBlogDto";
import {RequestWithBody} from "../../../types";
import {BlogViewDto} from "../../dto/blogViewDto";
import {Blog} from "../../types/blog";

export const createBlogHandler = (req: RequestWithBody<CreateBlogDto>, res: Response<BlogViewDto>)=> {
  const newBlog: Blog = {
    id: new Date().toISOString(),
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl
  }

  blogsRepository.create(newBlog)
  res.status(HttpStatus.Created_201).send(newBlog)
}