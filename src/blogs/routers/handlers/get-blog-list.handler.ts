import { Request, Response } from 'express';
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogViewDto} from "../../dto/blogViewDto";

export const getBlogListHandler = (req: Request, res: Response<BlogViewDto[]>)=> {
  const blogs = blogsRepository.findAll();
  res.status(HttpStatus.Ok_200).send(blogs);
}