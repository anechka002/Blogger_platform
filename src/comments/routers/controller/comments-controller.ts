import {
  RequestWithParams,
  RequestWithParamsAndBody
} from "../../../core/types/request-types";
import {UriParamsPostIdDto} from "../../types/uri-params-post-id.dto";
import {Response} from "express";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {ICommentView} from "../../types/comment.view.type";
import {matchedData} from "express-validator";
import {CommentQueryInput} from "../input/comment-query.input";
import {
  PostsQueryRepository,
} from "../../../posts/repositories/posts.query.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {
  CommentsQueryRepository
} from "../../repositories/comments.query.repository";
import {URIParamsIdDto} from "../../types/uri-params-id.dto";
import {CreateCommentInputDto} from "../../types/create-comment-input.dto";
import {CreateCommentType} from "../../types/create-comment.type";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";
import {
  CommentsService
} from "../../application/comments.service";
import {URIParamsCommentIdDto} from "../../types/uri-params-comment-id.dto";
import {inject, injectable} from "inversify";

@injectable()
export class CommentsController {
  protected postsQueryRepository: PostsQueryRepository;
  protected commentsQueryRepository: CommentsQueryRepository;
  protected commentsService: CommentsService;
  constructor(
    @inject(PostsQueryRepository) postsQueryRepository: PostsQueryRepository,
    @inject(CommentsQueryRepository) commentsQueryRepository: CommentsQueryRepository,
    @inject(CommentsService) commentsService: CommentsService
  ) {
    this.postsQueryRepository = postsQueryRepository;
    this.commentsQueryRepository = commentsQueryRepository;
    this.commentsService = commentsService;
  }

  async getCommentList(req: RequestWithParams<UriParamsPostIdDto>, res: Response<PaginationOutput<ICommentView>>) {
    const queryInput = matchedData<CommentQueryInput>(req, {
      locations: ["query"],
      includeOptionals: true,
    })

    const post = await this.postsQueryRepository.findById(req.params.postId)
    if (!post) {
      return res.sendStatus(HttpStatus.NotFound_404)
    }

    const result = await this.commentsQueryRepository.findMany(req.params.postId, queryInput)

    return res.status(HttpStatus.Ok_200).send(result)
  }

  async getComment(req: RequestWithParams<URIParamsIdDto>, res: Response<ICommentView>) {
    const comment = await this.commentsQueryRepository.findById(req.params.id)

    if(!comment) {
      return res.sendStatus(HttpStatus.NotFound_404)
    }

    return res.status(HttpStatus.Ok_200).send(comment)
  }

  async createComment(req: RequestWithParamsAndBody<UriParamsPostIdDto, CreateCommentInputDto>, res: Response) {
    if(!req.user) {
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    const dto: CreateCommentType = {
      content: req.body.content,
      userId: req.user.userId,
    }

    const result = await this.commentsService.createCommentForPost(req.params.postId, dto);

    if(result.status !== ResultStatus.Success) {
      return res.status(resultCodeToHttpException(result.status)).send(result.extensions)
    }

    const comment = await this.commentsQueryRepository.findByIdOrFail(result.data!)

    return res.status(HttpStatus.Created_201).send(comment)
  }

  async deleteComment(req: RequestWithParams<URIParamsCommentIdDto>, res: Response) {
    if(!req.user){
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    const result = await this.commentsService.deleteComment(req.params.commentId, req.user.userId);

    if(result.status !== ResultStatus.Success) {
      return res.sendStatus(resultCodeToHttpException(result.status))
    }

    return res.sendStatus(HttpStatus.NoContent_204)
  }

  async updateComment(req: RequestWithParamsAndBody<URIParamsCommentIdDto, CreateCommentInputDto>, res: Response) {
    if(!req.user) {
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    const dto: CreateCommentType = {
      content: req.body.content,
      userId: req.user.userId,
    }

    const result = await this.commentsService.updateComment(req.params.commentId, dto)

    if(result.status !== ResultStatus.Success) {
      return res.sendStatus(resultCodeToHttpException(result.status))
    }

    return res.sendStatus(HttpStatus.NoContent_204)
  }
}