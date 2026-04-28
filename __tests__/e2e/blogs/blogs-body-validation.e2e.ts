/// <reference types="jest" />

import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { BLOGS_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { clearDb } from '../../utils/clear-db';
import { getBlogDto } from '../../utils/blogs/get-blog-dto';
import {runDB, stopDb} from "../../../src/db/mongo.db";
import {createBlog} from "../../utils/blogs/create-blog";
import {getBlogById} from "../../utils/blogs/get-blog-by-id";
import dotenv from 'dotenv'
dotenv.config()

describe('blogs body validation e2e', () => {
  const app = express();
  setupApp(app);

  const adminAuth = generateBasicAuthToken();

  beforeAll(async () => {
    await runDB(process.env.MONGO_URL!);
  });

  afterAll(async () => {
    await stopDb();
  });

  beforeEach(async () => {
    await clearDb(app);
  });

  const validBlogDto = getBlogDto();

  const expectEmptyBlogsList = async () => {
    const response = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(response.body).toEqual([]);
  };


  it('POST -> "/blogs": should return error if passed body is incorrect; status 400', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        name: '',
        description: '',
        websiteUrl: 'invalid-url',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'Length of name is not correct',
        },
        {
          field: 'description',
          message: 'Length of description is not correct',
        },
        {
          field: 'websiteUrl',
          message: 'websiteUrl is not correct',
        },
      ],
    });

    const listResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(listResponse.body).toEqual([]);
  });

  it('PUT -> "/blogs/:id": should return error if passed body is incorrect; status 400; used additional methods: POST -> /blogs', async () => {
    const createdBlog = await createBlog(app);

    const response = await request(app)
      .put(`${BLOGS_PATH}/${createdBlog.id}`)
      .set('Authorization', adminAuth)
      .send({
        name: '',
        description: '',
        websiteUrl: 'invalid-url',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'Length of name is not correct',
        },
        {
          field: 'description',
          message: 'Length of description is not correct',
        },
        {
          field: 'websiteUrl',
          message: 'websiteUrl is not correct',
        },
      ],
    });

    const foundBlog = await getBlogById(app, createdBlog.id);

    expect(foundBlog).toEqual(createdBlog);
  });

  it('should return 400 and error for empty name', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validBlogDto,
        name: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'Length of name is not correct',
        },
      ],
    });

    await expectEmptyBlogsList();
  });

  it('should return 400 and error for too long name', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validBlogDto,
        name: 'a'.repeat(16),
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'Length of name is not correct',
        },
      ],
    });

    await expectEmptyBlogsList();
  });

  it('should return 400 and error for empty description', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validBlogDto,
        description: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'description',
          message: 'Length of description is not correct',
        },
      ],
    });

    await expectEmptyBlogsList();
  });

  it('should return 400 and error for too long description', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validBlogDto,
        description: 'd'.repeat(501),
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'description',
          message: 'Length of description is not correct',
        },
      ],
    });

    await expectEmptyBlogsList();
  });

  it('should return 400 and error for invalid websiteUrl', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validBlogDto,
        websiteUrl: 'http://invalid-site.dev',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'websiteUrl',
          message: 'websiteUrl is not correct',
        },
      ],
    });

    await expectEmptyBlogsList();
  });

  it('should return all field errors for invalid body', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        name: '',
        description: '',
        websiteUrl: 'invalid-url',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'name',
          message: 'Length of name is not correct',
        },
        {
          field: 'description',
          message: 'Length of description is not correct',
        },
        {
          field: 'websiteUrl',
          message: 'websiteUrl is not correct',
        },
      ],
    });

    await expectEmptyBlogsList();
  });
});