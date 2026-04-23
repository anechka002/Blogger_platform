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
import {getPostById} from "../../utils/posts/get-post-by-id";
import {createPost} from "../../utils/posts/create-post";

describe('posts e2e', () => {
  const app = express();
  setupApp(app);

  const adminAuth = generateBasicAuthToken();

  beforeEach(async () => {
    await clearDb(app);
  });

  it('POST -> "/posts": should create new post for an existing blog; status 201; content: created post; used additional methods: POST -> /blogs, GET -> /posts/:id', async () => {
    const createdBlog = await createBlog(app);
    const createdPost = await createPost(app, createdBlog.id);

    expect(createdPost).toEqual({
      id: expect.any(String),
      title: getPostDto(createdBlog.id).title,
      shortDescription: getPostDto(createdBlog.id).shortDescription,
      content: getPostDto(createdBlog.id).content,
      blogId: createdBlog.id,
      blogName: createdBlog.name,
    });

    const foundPost = await getPostById(app, createdPost.id);

    expect(foundPost).toEqual(createdPost);
  });

  it('GET -> "/posts/:id": should return status 200; content: post by id; used additional methods: POST -> /blogs, POST -> /posts', async () => {
    const createdBlog = await createBlog(app);
    const createdPost = await createPost(app, createdBlog.id);

    const foundPost = await getPostById(app, createdPost.id);

    expect(foundPost).toEqual(createdPost);
  });

  it('GET -> "/posts": should return status 200; content: posts array; used additional methods: POST -> /blogs, POST -> /posts', async () => {
    const createdBlog = await createBlog(app);
    const createdPost = await createPost(app, createdBlog.id);

    const response = await request(app)
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(response.body).toEqual([createdPost]);
  });

});



