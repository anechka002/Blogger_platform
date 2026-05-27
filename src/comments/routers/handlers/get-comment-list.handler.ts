import {Response} from "express";
import {RequestWithParams} from "../../../core/types/request-types";
import {UriParamsPostIdDto} from "../../types/uri-params-post-id.dto";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {ICommentView} from "../../types/comment.view.type";
import {matchedData} from "express-validator";
import {CommentQueryInput} from "../input/comment-query.input";
import {
  commentsQueryRepository
} from "../../repositories/comments.query.repository";
import {HttpStatus} from "../../../core/types/http-statuses";
import {
  postsQueryRepository
} from "../../../posts/repositories/posts.query.repository";

export const getCommentListHandler = async (req: RequestWithParams<UriParamsPostIdDto>, res: Response<PaginationOutput<ICommentView>>) => {
  const queryInput = matchedData<CommentQueryInput>(req, {
    locations: ["query"],
    includeOptionals: true,
  })

  const post = await postsQueryRepository.findById(req.params.postId)
  if (!post) {
    return res.sendStatus(HttpStatus.NotFound_404)
  }

  const result = await commentsQueryRepository.findMany(req.params.postId, queryInput)

  return res.status(HttpStatus.Ok_200).send(result)
}