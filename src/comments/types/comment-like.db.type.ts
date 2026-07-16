import {LikeStatus} from "../domain/like-status.enum";

export type StoredLikeStatus =
  | LikeStatus.Like
  | LikeStatus.Dislike;


export type CommentLikeDB = {
  comment_id: string
  user_id: string
  status: StoredLikeStatus
  createdAt: Date
  updatedAt: Date
}