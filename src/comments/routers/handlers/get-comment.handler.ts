import {Response} from "express";
import {
  commentsQueryRepository
} from "../../repositories/comments.query.repository";
import {RequestWithParams} from "../../../core/types/request-types";
import {ICommentView} from "../../types/comment.view.type";
import {HttpStatus} from "../../../core/types/http-statuses";
import {URIParamsIdDto} from "../../types/uri-params-id.dto";

export const getCommentHandler = async (req: RequestWithParams<URIParamsIdDto>, res: Response<ICommentView>) => {
  const comment = await commentsQueryRepository.findById(req.params.id)

  if(!comment) {
    return res.sendStatus(HttpStatus.NotFound_404)
  }

  return res.status(HttpStatus.Ok_200).send(comment)
}