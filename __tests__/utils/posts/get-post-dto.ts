import {CreatePostDto} from "../../../src/posts/dto/createPostDto";

export function getPostDto(blogId: string): CreatePostDto {
  return {
    title: 'Post',
    shortDescription: 'post description',
    content: 'post content',
    blogId
  };
}
