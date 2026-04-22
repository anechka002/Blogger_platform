import request from 'supertest';
import { Express } from 'express';
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {Blog} from "../../../src/blogs/types/blog";
import {BLOGS_PATH} from "../../../src/core/path/path";

export async function getBlogById(
  app: Express,
  blogId: string,
): Promise<Blog> {

  const response = await request(app)
    .get(`${BLOGS_PATH}/${blogId}`)
    .expect(HttpStatus.Ok_200);

  return response.body;
}