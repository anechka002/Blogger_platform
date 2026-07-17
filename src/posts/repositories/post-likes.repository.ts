import {PostLikeDocument, PostLikeModel} from "../domain/post-like.entity";

export class PostLikesRepository {
  async findReaction({postId, userId}: {postId: string, userId: string}): Promise<PostLikeDocument | null> {
    return PostLikeModel.findOne({ post_id: postId, user_id: userId });
  }

  async createLike(reaction: PostLikeDocument): Promise<PostLikeDocument | null> {
    return reaction.save()
  }

  async deleteReaction({postId, userId}: {postId: string, userId: string}): Promise<void> {
    await PostLikeModel.deleteOne({ post_id: postId, user_id: userId })
  }

  async updateReaction(reaction: PostLikeDocument): Promise<void> {
    await reaction.save()
  }
}