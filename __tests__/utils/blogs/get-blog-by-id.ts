import request from 'supertest';
import { Express } from 'express';
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {BLOGS_PATH} from "../../../src/core/paths/paths";
import {BlogViewDto} from "../../../src/blogs/dto/blogViewDto";

export async function getBlogById(
  app: Express,
  blogId: string,
): Promise<BlogViewDto> {

  const response = await request(app)
    .get(`${BLOGS_PATH}/${blogId}`)
    .expect(HttpStatus.Ok_200);

  return response.body;
}