/// <reference types="jest" />

import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { BLOGS_PATH, TESTING_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { clearDb } from '../../utils/clear-db';
import { createBlog } from '../../utils/blogs/create-blog';
import { getBlogDto } from '../../utils/blogs/get-blog-dto';
import { getBlogById } from '../../utils/blogs/get-blog-by-id';
import { updateBlog } from '../../utils/blogs/update-blog';
import { deleteBlog } from '../../utils/blogs/delete-blog';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { runDB, stopDb } from '../../../src/db/mongo.db';

describe('blogs e2e', () => {
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

  it('DELETE -> "/testing/all-data": should remove all data; status 204', async () => {
    await createBlog(app);

    const blogsBeforeClear = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(blogsBeforeClear.body).toHaveLength(1);

    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent_204);

    const blogsAfterClear = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(blogsAfterClear.body).toEqual([]);
  });

  it('POST -> "/blogs": should create new blog; status 201; content: created blog; used additional methods: GET -> /blogs/:id', async () => {
    const createdBlog = await createBlog(app);

    expect(createdBlog).toEqual({
      id: expect.any(String),
      ...getBlogDto(),
      createdAt: expect.any(String),
      isMembership: false,
    });

    const foundBlog = await getBlogById(app, createdBlog.id);

    expect(foundBlog).toEqual(createdBlog);
  });

  it('GET -> "blogs/:id": should return status 200; content: blog by id; used additional methods: POST -> /blogs', async () => {
    const createdBlog = await createBlog(app);

    const foundBlog = await getBlogById(app, createdBlog.id);

    expect(foundBlog).toEqual(createdBlog);
  });

  it('GET -> "/blogs": should return status 200; content: blogs array; used additional methods: POST -> /blogs', async () => {
    const createdBlog = await createBlog(app);

    const response = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(response.body).toEqual([createdBlog]);
  });

  it('PUT -> "/blogs/:id": should update blog by id; status 204; used additional methods: POST -> /blogs, GET -> /blogs/:id', async () => {
    const createdBlog = await createBlog(app);

    const updatePayload = {
      name: 'Updated blog',
      description: 'updated description',
      websiteUrl: 'https://updated-blog.dev',
    };

    await updateBlog(app, createdBlog.id, updatePayload);

    const updatedBlog = await getBlogById(app, createdBlog.id);

    expect(updatedBlog).toEqual({
      id: createdBlog.id,
      ...updatePayload,
      createdAt: createdBlog.createdAt,
      isMembership: createdBlog.isMembership,
    });
  });

  it('DELETE -> "/blogs/:id": should delete blog by id; status 204; used additional methods: POST -> /blogs, GET -> /blogs/:id', async () => {
    const createdBlog = await createBlog(app);

    await deleteBlog(app, createdBlog.id);

    await request(app)
      .get(`${BLOGS_PATH}/${createdBlog.id}`)
      .expect(HttpStatus.NotFound_404);

    const response = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(response.body).toEqual([]);
  });

  it('PUT, DELETE, GET -> "/blogs/:id": should return error if :id from uri param not found; status 404', async () => {
    const updatePayload = {
      name: 'Updated blog',
      description: 'updated description',
      websiteUrl: 'https://updated-blog.dev',
    };

    await request(app)
      .get(`${BLOGS_PATH}/999`)
      .expect(HttpStatus.NotFound_404);

    await request(app)
      .put(`${BLOGS_PATH}/999`)
      .set('Authorization', adminAuth)
      .send(updatePayload)
      .expect(HttpStatus.NotFound_404);

    await request(app)
      .delete(`${BLOGS_PATH}/999`)
      .set('Authorization', adminAuth)
      .expect(HttpStatus.NotFound_404);
  });

  it('PUT, POST, DELETE -> "/blogs": should return error if auth credentials is incorrect; status 401', async () => {
    const createdBlog = await createBlog(app);

    const updatePayload = {
      name: 'Updated blog',
      description: 'updated description',
      websiteUrl: 'https://updated-blog.dev',
    };

    await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', incorrectAdminAuth)
      .send(getBlogDto())
      .expect(HttpStatus.Unauthorized_401);

    await request(app)
      .put(`${BLOGS_PATH}/${createdBlog.id}`)
      .set('Authorization', incorrectAdminAuth)
      .send(updatePayload)
      .expect(HttpStatus.Unauthorized_401);

    await request(app)
      .delete(`${BLOGS_PATH}/${createdBlog.id}`)
      .set('Authorization', incorrectAdminAuth)
      .expect(HttpStatus.Unauthorized_401);

    const foundBlog = await getBlogById(app, createdBlog.id);

    expect(foundBlog).toEqual(createdBlog);
  });
});