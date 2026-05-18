import { Request, Response } from 'express'
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogViewDto} from "../../dto/blogViewDto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {BlogQueryInput} from "../input/blog-query.input";
import {matchedData} from "express-validator";
import {blogsQueryRepository} from "../../repositories/blogs.query.repository";

export const getBlogListHandler = async (req: Request, res: Response<PaginationOutput<BlogViewDto>>)=> {
  try {
    const queryInput = matchedData<BlogQueryInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    // console.log(queryInput)

    const blogs = await blogsQueryRepository.findMany(queryInput);

    res.status(HttpStatus.Ok_200).send(blogs);
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}