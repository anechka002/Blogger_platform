import {Response} from "express";
import {RequestWithParamsAndBody} from "../../../core/types/request-types";
import {CreateCommentType} from "../../types/create-comment.type";
import {commentsService} from "../../application/comments.service";
import {
  commentsQueryRepository
} from "../../repositories/comments.query.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {CreateCommentInputDto} from "../../types/create-comment-input.dto";
import {UriParamsPostIdDto} from "../../types/uri-params-post-id.dto";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const createCommentHandler = async (req: RequestWithParamsAndBody<UriParamsPostIdDto, CreateCommentInputDto>, res: Response) => {
  if(!req.user) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  const dto: CreateCommentType = {
    content: req.body.content,
    userId: req.user.userId,
  }

  const result = await commentsService.createCommentForPost(req.params.postId, dto);

  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.extensions)
  }

  const comment = await commentsQueryRepository.findByIdOrFail(result.data!)

  return res.status(HttpStatus.Created_201).send(comment)
}