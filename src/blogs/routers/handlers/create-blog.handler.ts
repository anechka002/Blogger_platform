import {Response} from "express";
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {CreateBlogDto} from "../../dto/createBlogDto";
import {RequestWithBody} from "../../../types";
import {BlogViewDto} from "../../dto/blogViewDto";
import {Blog} from "../../types/blog";
import {db} from "../../../db/in-memory.db";

export const createBlogHandler = (req: RequestWithBody<CreateBlogDto>, res: Response<BlogViewDto>)=> {

  const newId = db.blogs.length
    ? Number(db.blogs[db.blogs.length - 1].id) + 1
    : 1

  const newBlog: Blog = {
    id: String(newId),
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl
  }

  blogsRepository.create(newBlog)
  res.status(HttpStatus.Created_201).send(newBlog)
}