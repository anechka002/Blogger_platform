import request from 'supertest';
import { Express } from 'express';
import { BLOGS_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../generate-admin-auth-token';

export async function deleteBlog(app: Express, blogId: string): Promise<void> {
  await request(app)
    .delete(`${BLOGS_PATH}/${blogId}`)
    .set('Authorization', generateBasicAuthToken())
    .expect(HttpStatus.NoContent_204);
}