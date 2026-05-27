import {Response} from "express";
import {RequestWithParamsAndBody} from "../../../core/types/request-types";
import {URIParamsCommentIdDto} from "../../types/uri-params-comment-id.dto";
import {commentsService} from "../../application/comments.service";
import {CreateCommentInputDto} from "../../types/create-comment-input.dto";
import {HttpStatus} from "../../../core/types/http-statuses";
import {CreateCommentType} from "../../types/create-comment.type";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const updateCommentHandler = async (req: RequestWithParamsAndBody<URIParamsCommentIdDto, CreateCommentInputDto>, res: Response) => {
  if(!req.user) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  const dto: CreateCommentType = {
    content: req.body.content,
    userId: req.user.userId,
  }

  const result = await commentsService.updateComment(req.params.commentId, dto)

  if(result.status !== ResultStatus.Success) {
    return res.sendStatus(resultCodeToHttpException(result.status))
  }

  return res.sendStatus(HttpStatus.NoContent_204)
}