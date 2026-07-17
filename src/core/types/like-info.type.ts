import {LikeStatus} from "../enum/like-status.enum";

export type LikeInfo = {
  likesCount: number,
  dislikesCount: number,
  myStatus: LikeStatus
}

type NewestLike = {
  addedAt: string
  userId: string
  login: string
}

export type ExtendedLikesInfo = {
  likesCount: number,
  dislikesCount: number,
  myStatus: LikeStatus
  newestLikes: NewestLike[]
}