import { Response } from 'express'
import {
  RequestWithParams
} from "../../../core/types/request-types";
import {HttpStatus} from "../../../core/types/http-statuses";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {PostViewDto} from "../../../posts/dto/postViewDto";
import {URIParamsBlogIdPostsDto} from "../../dto/URIParamsBlogIdPostsDto";
import {matchedData} from "express-validator";
import {BlogPostsQueryInput} from "../input/blog-posts-query.input";
import {blogsQueryRepository} from "../../repositories/blogs.query.repository";
import {
  postsQueryRepository
} from "../../../posts/repositories/posts.query.repository";

// получить посты блога
export const getBlogPostsHandler = async (req: RequestWithParams<URIParamsBlogIdPostsDto>, res: Response<PaginationOutput<PostViewDto>>) => {
  try {
    const blogId = req.params.blogId;

    const queryInput = matchedData<BlogPostsQueryInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    // console.log(queryInput);

    await blogsQueryRepository.findByIdOrFail(blogId)

    const result = await postsQueryRepository.findManyByBlogId(blogId, queryInput)

    res.status(HttpStatus.Ok_200).send(result)
  } catch(error: unknown) {
    errorsHandler(error, res)
  }
}