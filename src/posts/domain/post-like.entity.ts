import mongoose, {HydratedDocument, model, Model} from "mongoose";
import {PostLikeDB} from "../types/post-like.db.type";
import {LikeStatus} from "../../core/enum/like-status.enum";

type PostLikeModel = Model<PostLikeDB>

export type PostLikeDocument = HydratedDocument<PostLikeDB>

const postLikeSchema = new mongoose.Schema<PostLikeDB>({
  post_id: {type: String, required: true},
  user_id: {type: String, required: true},
  user_login: {type: String, required: true},
  status: {type: String, required: true, enum: [LikeStatus.Like, LikeStatus.Dislike]},
}, { timestamps: true })

postLikeSchema.index(
  {
    post_id: 1,
    user_id: 1,
  },
  {
    unique: true,
  },
)

export const PostLikeModel = model<PostLikeDB, PostLikeModel>('postLikes', postLikeSchema);