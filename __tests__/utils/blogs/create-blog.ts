import request from 'supertest';
import { Express } from 'express';
import { BLOGS_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../generate-admin-auth-token';
import { CreateBlogDto } from '../../../src/blogs/dto/createBlogDto';
import { getBlogDto } from './get-blog-dto';
import {BlogViewDto} from "../../../src/blogs/dto/blogViewDto";

export async function createBlog(
  app: Express,
  blogDto?: CreateBlogDto,
): Promise<BlogViewDto> {
  const defaultBlogData: CreateBlogDto = getBlogDto();

  const testBlog = { ...defaultBlogData, ...blogDto };

  const response = await request(app)
    .post(BLOGS_PATH)
    .set('Authorization', generateBasicAuthToken())
    .send(testBlog)
    .expect(HttpStatus.Created_201);

  return response.body;
}
