import { Request, Response } from 'express';
import {blogsRepository} from "../../repositories/blogs.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogViewDto} from "../../dto/blogViewDto";
import {mapToBlogViewModel} from "../mappers/map-to-blog-view-model.utils";

export const getBlogListHandler = async (_req: Request, res: Response<BlogViewDto[]>)=> {
  try {
    const blogs = await blogsRepository.findAll();
    const blogViewModels = blogs.map(mapToBlogViewModel)
    res.status(HttpStatus.Ok_200).send(blogViewModels);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError_500)
  }
}