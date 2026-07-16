import {LikeStatus} from "../domain/like-status.enum";

export type ICommentView = {
  id: string
  content: string
  commentatorInfo: Info
  createdAt: string
  likesInfo: LikeInfo
}

type Info = {
  userId: string
  userLogin: string
}

export type LikeInfo = {
  likesCount: number,
  dislikesCount: number,
  myStatus: LikeStatus
}