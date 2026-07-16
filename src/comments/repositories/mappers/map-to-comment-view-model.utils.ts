import {ICommentView} from "../../types/comment.view.type";
import {CommentDocument} from "../../domain/comment.entity";
import {LikeStatus} from "../../domain/like-status.enum";

export const mapToCommentViewModel = ({comment, myStatus}:{comment: CommentDocument, myStatus: LikeStatus }): ICommentView => {
  return {
    id: comment._id.toString(),
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    likesInfo: {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus,
    }
  }
}