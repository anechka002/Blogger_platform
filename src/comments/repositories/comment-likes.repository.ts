import {injectable} from "inversify";
import {
  CommentLikeDocument,
  CommentLikeModel
} from "../domain/comment-like.entity";

@injectable()
export class CommentLikesRepository {
  async findReaction({commentId, userId}: {commentId: string, userId: string}): Promise<CommentLikeDocument | null> {
    return CommentLikeModel.findOne({comment_id: commentId, user_id: userId})
  }

  async createReaction(reaction: CommentLikeDocument): Promise<CommentLikeDocument> {
    return reaction.save()
  }

  async updateReaction(reaction: CommentLikeDocument): Promise<void> {
    await reaction.save()
  }

  async deleteReaction({commentId, userId}: {commentId: string, userId: string}): Promise<void> {
    await CommentLikeModel.deleteOne({comment_id: commentId, user_id: userId})
  }

}