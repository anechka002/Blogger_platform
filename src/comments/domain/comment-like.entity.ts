import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {CommentLikeDB} from "../types/comment-like.db.type";
import {LikeStatus} from "./like-status.enum";

type CommentLikeModel = Model<CommentLikeDB>

export type CommentLikeDocument = HydratedDocument<CommentLikeDB>

const commentLikeSchema = new mongoose.Schema<CommentLikeDB>({
    comment_id: {type: String, required: true},
    user_id: {type: String, required: true},
    status: {type: String, enum: [LikeStatus.Like, LikeStatus.Dislike], required: true},
  },
  {timestamps: true},
);

commentLikeSchema.index(
  {
    comment_id: 1,
    user_id: 1,
  },
  {
    unique: true,
  },
)

export const CommentLikeModel = model<CommentLikeDB, CommentLikeModel>('commentLikes', commentLikeSchema);