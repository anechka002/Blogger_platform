import request from 'supertest';
import { Express } from 'express';
import { BLOGS_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../generate-admin-auth-token';
import { CreatePostForBlogDto } from '../../../src/blogs/dto/createPostForBlogDto';
import { PostViewDto } from '../../../src/posts/dto/postViewDto';

export async function createPostForBlog(
  app: Express,
  blogId: string,
  postDto?: Partial<CreatePostForBlogDto>,
): Promise<PostViewDto> {
  const defaultPostData: CreatePostForBlogDto = {
    title: 'Post',
    shortDescription: 'post description',
    content: 'post content',
  };

  const testPostData = { ...defaultPostData, ...postDto };

  const response = await request(app)
    .post(`${BLOGS_PATH}/${blogId}/posts`)
    .set('Authorization', generateBasicAuthToken())
    .send(testPostData)
    .expect(HttpStatus.Created_201);

  return response.body;
}
