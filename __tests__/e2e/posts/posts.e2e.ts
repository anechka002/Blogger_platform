/// <reference types="jest" />

import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { POSTS_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { clearDb } from '../../utils/clear-db';
import { getPostDto } from "../../utils/posts/get-post-dto";
import { createBlog } from "../../utils/blogs/create-blog";
import {getPostById} from "../../utils/posts/get-post-by-id";
import {createPost} from "../../utils/posts/create-post";
import {runDB, stopDb} from "../../../src/db/mongo.db";
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {updatePost} from "../../utils/posts/update-post";
import {deletePost} from "../../utils/posts/delete-post";
import {expectPostNotFound} from "../../utils/posts/expect-post-not-found";
import {getPosts} from "../../utils/posts/get-posts";

describe('posts e2e', () => {
  const app = express();
  setupApp(app);

  const adminAuth = generateBasicAuthToken();
  const incorrectAdminAuth = generateBasicAuthToken('admin', 'wrong-password');

  beforeAll(async () => {
    await runDB('mongodb+srv://root:root@clustermongodb.98xltqo.mongodb.net/?appName=ClusterMongoDB');
  });

  afterAll(async () => {
    await stopDb();
  });

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
      createdAt: expect.any(String),
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

    const posts = await getPosts(app);

    expect(posts).toEqual([createdPost]);
  });

  it('PUT -> "/posts/:id": should update post by id; status 204; used additional methods: POST -> /blogs, POST -> /posts, GET -> /posts/:id', async () => {
    const createdBlog = await createBlog(app);
    const createdPost = await createPost(app, createdBlog.id);

    const updatePayload = await updatePost(app, createdPost.id, createdBlog.id, {
      title: 'Updated post',
      shortDescription: 'updated post description',
      content: 'updated post content',
    });

    const updatedPost = await getPostById(app, createdPost.id);

    expect(updatedPost).toEqual({
      id: createdPost.id,
      title: updatePayload.title,
      shortDescription: updatePayload.shortDescription,
      content: updatePayload.content,
      blogId: createdBlog.id,
      blogName: createdBlog.name,
      createdAt: createdPost.createdAt,
    });
  });

  it('DELETE -> "/posts/:id": should delete post by id; status 204; used additional methods: POST -> /blogs, POST -> /posts, GET -> /posts/:id', async () => {
    const createdBlog = await createBlog(app);
    const createdPost = await createPost(app, createdBlog.id);

    await deletePost(app, createdPost.id);

    await expectPostNotFound(app, createdPost.id);

    const posts = await getPosts(app);

    expect(posts).toEqual([]);
  });

  it('PUT, DELETE, GET -> "/posts/:id": should return error if :id from uri param not found; status 404', async () => {
    const createdBlog = await createBlog(app);
    const notExistingPostId = '999';

    await expectPostNotFound(app, notExistingPostId);

    await request(app)
      .put(`${POSTS_PATH}/${notExistingPostId}`)
      .set('Authorization', adminAuth)
      .send(getPostDto(createdBlog.id))
      .expect(HttpStatus.NotFound_404);

    await request(app)
      .delete(`${POSTS_PATH}/${notExistingPostId}`)
      .set('Authorization', adminAuth)
      .expect(HttpStatus.NotFound_404);
  });

  it('PUT, POST, DELETE -> "/posts": should return error if auth credentials is incorrect; status 401; used additional methods: POST -> /blogs', async () => {
    const createdBlog = await createBlog(app);
    const createdPost = await createPost(app, createdBlog.id);

    const updatePayload = {
      title: 'Updated post',
      shortDescription: 'updated post description',
      content: 'updated post content',
      blogId: createdBlog.id,
    };

    await request(app)
      .post(POSTS_PATH)
      .set('Authorization', incorrectAdminAuth)
      .send(getPostDto(createdBlog.id))
      .expect(HttpStatus.Unauthorized_401);

    await request(app)
      .put(`${POSTS_PATH}/${createdPost.id}`)
      .set('Authorization', incorrectAdminAuth)
      .send(updatePayload)
      .expect(HttpStatus.Unauthorized_401);

    await request(app)
      .delete(`${POSTS_PATH}/${createdPost.id}`)
      .set('Authorization', incorrectAdminAuth)
      .expect(HttpStatus.Unauthorized_401);

    const foundPost = await getPostById(app, createdPost.id);

    expect(foundPost).toEqual(createdPost);
  });

});



