import {LikeInfo} from "../../core/types/like-info.type";

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