import { Response } from 'express'
import {
  RequestWithParams
} from "../../../core/types/request-types";
import {HttpStatus} from "../../../core/types/http-statuses";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {blogsQueryService} from "../../application/blogs-query.service";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {PostViewDto} from "../../../posts/dto/postViewDto";
import {URIParamsBlogIdPostsDto} from "../../dto/URIParamsBlogIdPostsDto";
import {
  getPaginationAndSortingFromQuery
} from "../../../core/utils/get-pagination-and-sorting-from-query";
import {PostSortField} from "../../../posts/routers/input/post-sort-field";

export const getBlogPostsHandler = async (req: RequestWithParams<URIParamsBlogIdPostsDto>, res: Response<PaginationOutput<PostViewDto>>) => {
  try {
    const blogId = req.params.blogId;
    const queryInput = getPaginationAndSortingFromQuery(req.query, PostSortField.CreatedAt)

    const result = await blogsQueryService.findPostsByBlogId(blogId,queryInput)

    res.status(HttpStatus.Ok_200).send(result)
  } catch(error: unknown) {
    errorsHandler(error, res)
  }
}