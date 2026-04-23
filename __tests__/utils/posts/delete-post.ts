import request from 'supertest';
import { Express } from 'express';
import {POSTS_PATH} from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../generate-admin-auth-token';

export async function deletePost(app: Express, postId: string): Promise<void> {
  await request(app)
    .delete(`${POSTS_PATH}/${postId}`)
    .set('Authorization', generateBasicAuthToken())
    .expect(HttpStatus.NoContent_204);
}