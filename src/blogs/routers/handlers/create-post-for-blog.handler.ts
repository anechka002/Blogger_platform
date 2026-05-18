import {Response} from "express";
import {
  RequestWithParamsAndBody
} from "../../../core/types/request-types";
import {URIParamsBlogIdPostsDto} from "../../dto/URIParamsBlogIdPostsDto";
import {CreatePostForBlogDto} from "../../dto/createPostForBlogDto";
import {PostViewDto} from "../../../posts/dto/postViewDto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {blogsService} from "../../application/blogs.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {
  postsQueryRepository
} from "../../../posts/repositories/posts.query.repository";

export const createPostForBlogHandler = async(req: RequestWithParamsAndBody<URIParamsBlogIdPostsDto, CreatePostForBlogDto>, res: Response<PostViewDto>) => {
  try {
    const blogId = req.params.blogId

    const createdPostId = await blogsService.createPostForBlog(blogId, req.body)
    const postViewModel = await postsQueryRepository.findByIdOrFail(createdPostId)

    res.status(HttpStatus.Created_201).send(postViewModel)
  } catch(error: unknown) {
    errorsHandler(error, res);
  }
}