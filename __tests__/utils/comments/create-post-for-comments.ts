import {createPost} from "../posts/create-post";
import {createBlog} from "../blogs/create-blog";
import {Express} from "express";

export const createPostForComments = async (app: Express) => {
  const blog = await createBlog(app)
  const post = await createPost(app, blog.id)

  return { blog, post }
}