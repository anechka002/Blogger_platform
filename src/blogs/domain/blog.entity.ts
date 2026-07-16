import mongoose, {HydratedDocument, Model, model} from "mongoose";
import {Blog} from "../types/blog";

type BlogModel = Model<Blog>

export type BlogDocument = HydratedDocument<Blog>

const blogSchema = new mongoose.Schema<Blog>({
  name: { type: String, required: true, minlength: 1, maxlength: 15 },
  description: { type: String, required: true, minlength: 1, maxlength: 500 },
  websiteUrl: { type: String, required: true, minlength: 1, maxlength: 100 },
  isMembership: { type: Boolean, required: true, },
}, {timestamps: true});

export const BlogModel = model<Blog, BlogModel>('blogs', blogSchema);