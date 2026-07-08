import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {Post} from "../types/post";

type PostModel = Model<Post>

export type PostDocument = HydratedDocument<Post>

const postSchema = new mongoose.Schema<Post>({
  title: { type: String, required: true, minlength: 1, maxlength: 30, },
  shortDescription: { type: String, required: true, minlength: 1, maxlength: 100, },
  content: { type: String, required: true, minlength: 1, maxlength: 1000, },
  createdAt: { type: Date, required: true },
  blogName: { type: String, required: true },
  blogId: { type: String, required: true },
})

export const PostModel = model<Post, PostModel>('posts', postSchema);