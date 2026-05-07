import { Response } from 'express';
import {HttpStatus} from "../../../core/types/http-statuses";
import {BlogViewDto} from "../../dto/blogViewDto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {blogsQueryService} from "../../application/blogs-query.service";
import {RequestWithQuery} from "../../../core/types/request-types";
import {
  getPaginationAndSortingFromQuery
} from "../../../core/utils/get-pagination-and-sorting-from-query";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {BlogQueryInput} from "../input/blog-query-input";
import {BlogSortField} from "../input/blog-sort-field";

export const getBlogListHandler = async (req: RequestWithQuery<BlogQueryInput>, res: Response<PaginationOutput<BlogViewDto>>)=> {
  try {
    const queryInput: BlogQueryInput = {
      ...getPaginationAndSortingFromQuery(req.query, BlogSortField.CreatedAt),
      searchNameTerm: req.query.searchNameTerm,
    }
    const blogs = await blogsQueryService.findMany(queryInput);
    res.status(HttpStatus.Ok_200).send(blogs);
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}