import {WithId} from "mongodb";
import {Post} from "../../types/post";
import {PostViewDto} from "../../dto/postViewDto";

export const mapToPostViewModel = (post: WithId<Post>): PostViewDto => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
     blogName: post.blogName,
    createdAt: post.createdAt.toISOString(),
  }
}