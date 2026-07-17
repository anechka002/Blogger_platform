import {PostDocument} from "../../domain/post.entity";
import {LikeStatus} from "../../../core/enum/like-status.enum";
import {PostLikeDocument} from "../../domain/post-like.entity";
import {ExtendedPostViewDto} from "../../dto/extendedPostViewDto";

export const mapExtendedToPostViewModel = ({post, myStatus, newestLikes}:{post: PostDocument, myStatus: LikeStatus, newestLikes: PostLikeDocument[]}): ExtendedPostViewDto => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt.toISOString(),
    extendedLikesInfo: {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus,

      // Преобразуем каждый документ реакции в объект NewestLike для ответа API.
      newestLikes: newestLikes.map((like) => ({
        addedAt: like.updatedAt.toISOString(),
        userId: like.user_id,
        login: like.user_login,
      })),
    }
  }
}