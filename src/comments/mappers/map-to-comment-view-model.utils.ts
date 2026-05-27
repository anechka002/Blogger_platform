import {WithId} from "mongodb";
import {ICommentDB} from "../types/comment.db.type";
import {ICommentView} from "../types/comment.view.type";

export const mapToCommentViewModel = (comment: WithId<ICommentDB>): ICommentView => {
  return {
    id: comment._id.toString(),
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    }
  }
}