import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {ICommentDB} from "../types/comment.db.type";

type CommentModel = Model<ICommentDB>

export type CommentDocument = HydratedDocument<ICommentDB>

const commentSchema = new mongoose.Schema<ICommentDB>({
  content: {type: String, required: true, minlength: 1, maxlength: 300},
  postId: {type: String, required: true},
  commentatorInfo: {
    userId: {type: String, required: true},
    userLogin: {type: String, required: true},
  },
  likesCount: {type: Number, required: true, default: 0},
  dislikesCount: {type: Number, required: true, default: 0},
}, {timestamps: true});

export const CommentModel = model<ICommentDB, CommentModel>('comments', commentSchema);