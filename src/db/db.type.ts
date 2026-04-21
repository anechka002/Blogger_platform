import {Blog} from "../blogs/types/blog";
import {Post} from "../posts/types/post";

export type DB = {
  blogs: Blog[]
  posts: Post[]
}