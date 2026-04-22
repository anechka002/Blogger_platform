import request from 'supertest';
import { Express } from 'express';
import {BLOGS_PATH} from "../../../src/core/path/path";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {generateBasicAuthToken} from "../generate-admin-auth-token";
import {CreateBlogDto} from "../../../src/blogs/dto/createBlogDto";
import {getBlogDto} from "./get-blog-dto";

export async function updateBlog(
  app: Express,
  blogId: string,
  blogDto?: CreateBlogDto,
): Promise<void> {
  const defaultBlogData: CreateBlogDto = getBlogDto();

  const testBlogData = { ...defaultBlogData, ...blogDto };

  await request(app)
    .put(`${BLOGS_PATH}/${blogId}`)
    .set('Authorization', generateBasicAuthToken())
    .send(testBlogData)
    .expect(HttpStatus.NoContent_204);

}