import { Request, Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogViewDto} from "../../dto/blogViewDto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {blogsQueryService} from "../../application/blogs-query.service";

export const getBlogListHandler = async (_req: Request, res: Response<BlogViewDto[]>)=> {
  try {
    const blogs = await blogsQueryService.findMany();
    res.status(HttpStatus.Ok_200).send(blogs);
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}