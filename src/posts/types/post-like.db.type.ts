import {StoredLikeStatus} from "../../core/types/stored-like-status.type";

export type PostLikeDB = {
  post_id: string
  user_id: string
  user_login: string
  status: StoredLikeStatus
  createdAt: Date
  updatedAt: Date
}