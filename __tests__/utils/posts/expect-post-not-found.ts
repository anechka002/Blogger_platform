import request from 'supertest';
import { Express } from 'express';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { POSTS_PATH } from '../../../src/core/paths/paths';

export async function expectPostNotFound(
  app: Express,
  postId: string,
): Promise<void> {
  await request(app)
    .get(`${POSTS_PATH}/${postId}`)
    .expect(HttpStatus.NotFound_404);
}