import request from 'supertest';
import { Express } from 'express';
import { BLOGS_PATH } from '../../../src/core/path/path';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../generate-admin-auth-token';
import { CreateBlogDto } from '../../../src/blogs/dto/createBlogDto';
import { getBlogDto } from './get-blog-dto';
import {Blog} from "../../../src/blogs/types/blog";

export async function createBlog(
  app: Express,
  blogDto?: CreateBlogDto,
): Promise<Blog> {
  const defaultBlogData: CreateBlogDto = getBlogDto();

  const testBlog = { ...defaultBlogData, ...blogDto };

  const response = await request(app)
    .post(BLOGS_PATH)
    .set('Authorization', generateBasicAuthToken())
    .send(testBlog)
    .expect(HttpStatus.Created_201);

  return response.body;
}
