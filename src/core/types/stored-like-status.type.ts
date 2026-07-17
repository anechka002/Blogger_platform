import {LikeStatus} from "../enum/like-status.enum";

export type StoredLikeStatus =
  | LikeStatus.Like
  | LikeStatus.Dislike;