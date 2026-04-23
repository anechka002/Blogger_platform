import request from 'supertest';
import { Express } from 'express';
import { POSTS_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../generate-admin-auth-token';
import { CreatePostDto } from '../../../src/posts/dto/createPostDto';
import {getPostDto} from "./get-post-dto";

export async function updatePost(
  app: Express,
  postId: string,
  blogId: string,
  postDto?: Partial<CreatePostDto>,
): Promise<void> {

  const testPostData: CreatePostDto = {
    ...getPostDto(blogId),
    ...postDto,
  };

  await request(app)
    .put(`${POSTS_PATH}/${postId}`)
    .set('Authorization', generateBasicAuthToken())
    .send(testPostData)
    .expect(HttpStatus.NoContent_204);
}
