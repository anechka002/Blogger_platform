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
import {CreatePostDto} from "../../dto/createPostDto";
import {PostsService} from "../../application/posts.service";
import {UpdatePostDto} from "../../dto/updatePostDto";
import {inject, injectable} from "inversify";
import {
  LikeStatusInputDto
} from "../../../core/types/like-status-input.dto";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";
import {URIParamsPostIdDto} from "../../dto/URIParamsPostIdDto";
import {
  UriParamsPostIdDto
} from "../../../comments/types/uri-params-post-id.dto";

@injectable()
export class PostsController{
  protected postsQueryRepository: PostsQueryRepository
  protected postsService: PostsService
  constructor(
    @inject(PostsQueryRepository) postsQueryRepository: PostsQueryRepository,
    @inject(PostsService) postsService: PostsService
  ) {
    this.postsQueryRepository = postsQueryRepository
    this.postsService = postsService
  }
  async getPostList(req: Request, res: Response<PaginationOutput<PostViewDto>>) {
    try {
      const userId = req.user?.userId

      const queryInput = matchedData<PostQueryInput>(req, {
        locations: ["query"],
        includeOptionals: true,
      });

      const posts = await this.postsQueryRepository.findMany(queryInput, userId)

      res.status(HttpStatus.Ok_200).send(posts);
    } catch (error: unknown) {
      errorsHandler(error, res);
    }
  }

  async getPost(req: RequestWithParams<URIParamsPostIdDto>, res: Response<PostViewDto>) {
    try {
      const userId = req?.user?.userId
      const post = await this.postsQueryRepository.findByIdOrFail(req.params.id, userId)

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

  async createLikeStatus(req: RequestWithParamsAndBody<UriParamsPostIdDto, LikeStatusInputDto>, res: Response) {
    if (!req.user) {
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    const result = await this.postsService.createLikeStatus({
      postId: req.params.postId,
      userId: req.user.userId,
      likeStatus: req.body.likeStatus,
    })

    if(result.status !== ResultStatus.Success) {
      return res.sendStatus(resultCodeToHttpException(result.status))
    }

    return res.sendStatus(HttpStatus.NoContent_204)
  }
}