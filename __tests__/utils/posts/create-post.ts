import request from 'supertest';
import { Express } from 'express';
import { POSTS_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../generate-admin-auth-token';
import { CreatePostDto } from "../../../src/posts/dto/createPostDto";
import { Post } from "../../../src/posts/types/post";
import { getPostDto } from "./get-post-dto";

export async function createPost(
  app: Express,
  blogId: string,
  postDto?: Partial<CreatePostDto>,
): Promise<Post> {

  const testPostData: CreatePostDto = {
    ...getPostDto(blogId),
    ...postDto,
  };

  const response = await request(app)
    .post(POSTS_PATH)
    .set('Authorization', generateBasicAuthToken())
    .send(testPostData)
    .expect(HttpStatus.Created_201);

  return response.body;
}
