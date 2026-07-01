import {Request, Response} from "express";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {PostViewDto} from "../../dto/postViewDto";
import {matchedData} from "express-validator";
import {PostQueryInput} from "../input/post-query.input";
import {HttpStatus} from "../../../core/types/http-statuses";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {
  PostsQueryRepository
} from "../../repositories/posts.query.repository";
import {
  RequestWithBody,
  RequestWithParams, RequestWithParamsAndBody
} from "../../../core/types/request-types";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";
import {CreatePostDto} from "../../dto/createPostDto";
import {PostsService} from "../../application/posts.service";
import {UpdatePostDto} from "../../dto/updatePostDto";

export class PostsController{
  protected postsQueryRepository: PostsQueryRepository
  protected postsService: PostsService
  constructor(postsQueryRepository: PostsQueryRepository, postsService: PostsService) {
    this.postsQueryRepository = postsQueryRepository
    this.postsService = postsService
  }
  async getPostList(req: Request, res: Response<PaginationOutput<PostViewDto>>) {
    try {
      const queryInput = matchedData<PostQueryInput>(req, {
        locations: ["query"],
        includeOptionals: true,
      });

      const posts = await this.postsQueryRepository.findMany(queryInput)

      res.status(HttpStatus.Ok_200).send(posts);
    } catch (error: unknown) {
      errorsHandler(error, res);
    }
  }

  async getPost(req: RequestWithParams<URIParamsPostIdDto>, res: Response<PostViewDto>) {
    try {
      const post = await this.postsQueryRepository.findByIdOrFail(req.params.id)

      res.status(HttpStatus.Ok_200).send(post);
    } catch (error: unknown) {
      errorsHandler(error, res)
    }
  }

  async createPost(req: RequestWithBody<CreatePostDto>, res: Response<PostViewDto>) {
    try {
      const createdPostId = await this.postsService.create(req.body)

      const postViewModel = await this.postsQueryRepository.findByIdOrFail(createdPostId)

      res.status(HttpStatus.Created_201).send(postViewModel)
    } catch (error: unknown) {
      errorsHandler(error, res)
    }
  }

  async deletePost(req: RequestWithParams<URIParamsPostIdDto>, res: Response) {
    try {
      await this.postsService.delete(req.params.id)

      res.sendStatus(HttpStatus.NoContent_204)
    } catch (error: unknown) {
      errorsHandler(error, res)
    }
  }

  async updatePost(req: RequestWithParamsAndBody<URIParamsPostIdDto, UpdatePostDto>, res: Response) {
    try {
      await this.postsService.update(req.params.id, req.body)

      res.sendStatus(HttpStatus.NoContent_204)
    } catch (error: unknown) {
      errorsHandler(error, res)
    }
  }
}