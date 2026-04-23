import request from 'supertest';
import { Express } from 'express';
import { HttpStatus } from "../../../src/core/types/http-statuses";
import { POSTS_PATH } from "../../../src/core/paths/paths";
import { Post } from "../../../src/posts/types/post";

export async function getPostById(
  app: Express,
  postId: string,
): Promise<Post> {

  const response = await request(app)
    .get(`${POSTS_PATH}/${postId}`)
    .expect(HttpStatus.Ok_200);

  return response.body;
}