/// <reference types="jest" />

import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { POSTS_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { clearDb } from '../../utils/clear-db';
import { getPostDto } from "../../utils/posts/get-post-dto";
import { createBlog } from "../../utils/blogs/create-blog";
import {runDB, stopDb} from "../../../src/db/mongo.db";
import {getPostById} from "../../utils/posts/get-post-by-id";
import {createPost} from "../../utils/posts/create-post";
import dotenv from 'dotenv'
dotenv.config()

describe('posts body validation e2e', () => {
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

  const createValidPostDto = async () => {
    const blog = await createBlog(app);
    return getPostDto(blog.id);
  };

  const expectEmptyPostsList = async () => {
    const response = await request(app)
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(response.body).toEqual([]);
  };

  it(`❌ should return 401 when creating post without auth`, async () => {
    await request(app)
      .post(POSTS_PATH)
      .send({})
      .expect(HttpStatus.Unauthorized_401);
  });

  it(`POST -> "/posts": ❌ should return 400 when post body is incorrect`, async () => {

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        title: '',
        shortDescription: '',
        content: '',
        blogId: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: 'Length of title is not correct',
        },
        {
          field: 'shortDescription',
          message: 'Length of description is not correct',
        },
        {
          field: 'content',
          message: 'Length of content is not correct',
        },
        {
          field: 'blogId',
          message: 'blogId is required',
        },
      ],
    });

    const postsResponse = await request(app)
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(postsResponse.body).toEqual([]);
  });

  it(`PUT -> "/posts": ❌ should return 400 when put body is incorrect` , async () => {
    const createdBlog = await createBlog(app);
    const createdPost = await createPost(app, createdBlog.id);

    const response = await request(app)
      .put(`${POSTS_PATH}/${createdPost.id}`)
      .set('Authorization', adminAuth)
      .send({
        title: '',
        shortDescription: '',
        content: '',
        blogId: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: 'Length of title is not correct',
        },
        {
          field: 'shortDescription',
          message: 'Length of description is not correct',
        },
        {
          field: 'content',
          message: 'Length of content is not correct',
        },
        {
          field: 'blogId',
          message: 'blogId is required',
        },
      ],
    });

    const foundPost = await getPostById(app, createdPost.id);

    expect(foundPost).toEqual(createdPost);
  });

  it(`should return 400 and error for empty title`, async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        title: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: 'Length of title is not correct',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for title with spaces only', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        title: '   ',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: 'Length of title is not correct',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for too long title', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        title: 'a'.repeat(31),
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: 'Length of title is not correct',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for empty shortDescription', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        shortDescription: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'shortDescription',
          message: 'Length of description is not correct',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for shortDescription with spaces only', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        shortDescription: '   ',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'shortDescription',
          message: 'Length of description is not correct',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for too long shortDescription', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        shortDescription: 'b'.repeat(101),
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'shortDescription',
          message: 'Length of description is not correct',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for empty content', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        content: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: 'Length of content is not correct',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for content with spaces only', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        content: '   ',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: 'Length of content is not correct',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for too long content', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        content: 'c'.repeat(1001),
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: 'Length of content is not correct',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for empty blogId', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        blogId: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'blogId',
          message: 'blogId is required',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and error for non-existing blogId', async () => {
    const validPostDto = await createValidPostDto();

    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validPostDto,
        blogId: 'non-existing-blog-id',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'blogId',
          message: 'blog not found',
        },
      ],
    });

    await expectEmptyPostsList();
  });

  it('should return 400 and all errors for fully invalid body', async () => {
    const response = await request(app)
      .post(POSTS_PATH)
      .set('Authorization', adminAuth)
      .send({
        title: '',
        shortDescription: '',
        content: '',
        blogId: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'title',
          message: 'Length of title is not correct',
        },
        {
          field: 'shortDescription',
          message: 'Length of description is not correct',
        },
        {
          field: 'content',
          message: 'Length of content is not correct',
        },
        {
          field: 'blogId',
          message: 'blogId is required',
        },
      ],
    });

    await expectEmptyPostsList();
  });

});