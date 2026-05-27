import {Response} from "express";
import {
  RequestWithParams,
} from "../../../core/types/request-types";
import {URIParamsCommentIdDto} from "../../types/uri-params-comment-id.dto";
import {HttpStatus} from "../../../core/types/http-statuses";
import {commentsService} from "../../application/comments.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const deleteCommentHandler = async (req: RequestWithParams<URIParamsCommentIdDto>, res: Response) => {
  if(!req.user){
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  const result = await commentsService.deleteComment(req.params.commentId, req.user.userId);

  if(result.status !== ResultStatus.Success) {
    return res.sendStatus(resultCodeToHttpException(result.status))
  }

  return res.sendStatus(HttpStatus.NoContent_204)
}