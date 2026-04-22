/// <reference types="jest" />

import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { BLOGS_PATH } from '../../../src/core/path/path';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { clearDb } from '../../utils/clear-db';
import { createBlog } from '../../utils/blogs/create-blog';
import { getBlogDto } from '../../utils/blogs/get-blog-dto';
import { getBlogById } from '../../utils/blogs/get-blog-by-id';
import { updateBlog } from '../../utils/blogs/update-blog';
import { deleteBlog } from '../../utils/blogs/delete-blog';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';

describe('blogs e2e', () => {
  const app = express();
  setupApp(app);

  const adminAuth = generateBasicAuthToken();
  const incorrectAdminAuth = generateBasicAuthToken('admin', 'wrong-password');

  beforeEach(async () => {
    await clearDb(app);
  });

  it('should return empty array when db is empty', async () => {
    const response = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(response.body).toEqual([]);
  });

  it('should create blog with valid auth and return it in list', async () => {
    const createdBlog = await createBlog(app);

    expect(createdBlog).toEqual({
      id: expect.any(String),
      ...getBlogDto(),
    });

    const listResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(listResponse.body).toEqual([createdBlog]);
  });

  it('should return 401 and not create blog without auth', async () => {
    await request(app)
      .post(BLOGS_PATH)
      .send(getBlogDto())
      .expect(HttpStatus.Unauthorized_401);

    const listResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(listResponse.body).toEqual([]);
  });

  it('should return 401 and not create blog with incorrect auth credentials', async () => {
    await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', incorrectAdminAuth)
      .send(getBlogDto())
      .expect(HttpStatus.Unauthorized_401);

    const listResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(listResponse.body).toEqual([]);
  });

  it('should return created blog by id', async () => {
    const createdBlog = await createBlog(app);
    const foundBlog = await getBlogById(app, createdBlog.id);

    expect(foundBlog).toEqual(createdBlog);
  });

  it('should return 404 for non-existing blog by id', async () => {
    await request(app)
      .get(`${BLOGS_PATH}/999`)
      .expect(HttpStatus.NotFound_404);
  });

  it('should update existing blog and return updated entity by id', async () => {
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
    });
  });

  it('should return 401 and not update blog without auth', async () => {
    const createdBlog = await createBlog(app);

    const updatePayload = {
      name: 'Updated blog',
      description: 'updated description',
      websiteUrl: 'https://updated-blog.dev',
    };

    await request(app)
      .put(`${BLOGS_PATH}/${createdBlog.id}`)
      .send(updatePayload)
      .expect(HttpStatus.Unauthorized_401);

    const foundBlog = await getBlogById(app, createdBlog.id);

    expect(foundBlog).toEqual(createdBlog);
  });

  it('should return 401 and not update blog with incorrect auth credentials', async () => {
    const createdBlog = await createBlog(app);

    const updatePayload = {
      name: 'Updated blog',
      description: 'updated description',
      websiteUrl: 'https://updated-blog.dev',
    };

    await request(app)
      .put(`${BLOGS_PATH}/${createdBlog.id}`)
      .set('Authorization', incorrectAdminAuth)
      .send(updatePayload)
      .expect(HttpStatus.Unauthorized_401);

    const foundBlog = await getBlogById(app, createdBlog.id);

    expect(foundBlog).toEqual(createdBlog);
  });

  it('should return 404 when updating non-existing blog', async () => {
    await request(app)
      .put(`${BLOGS_PATH}/999`)
      .set('Authorization', adminAuth)
      .send({
        name: 'Updated blog',
        description: 'updated description',
        websiteUrl: 'https://updated-blog.dev',
      })
      .expect(HttpStatus.NotFound_404);
  });

  it('should return 400 and validation errors for invalid body when updating blog', async () => {
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

  it('should delete existing blog', async () => {
    const createdBlog = await createBlog(app);

    await deleteBlog(app, createdBlog.id);

    await request(app)
      .get(`${BLOGS_PATH}/${createdBlog.id}`)
      .expect(HttpStatus.NotFound_404);

    const listResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(listResponse.body).toEqual([]);
  });

  it('should return 401 and not delete blog without auth', async () => {
    const createdBlog = await createBlog(app);

    await request(app)
      .delete(`${BLOGS_PATH}/${createdBlog.id}`)
      .expect(HttpStatus.Unauthorized_401);

    const foundBlog = await getBlogById(app, createdBlog.id);

    expect(foundBlog).toEqual(createdBlog);
  });

  it('should return 401 and not delete blog with incorrect auth credentials', async () => {
    const createdBlog = await createBlog(app);

    await request(app)
      .delete(`${BLOGS_PATH}/${createdBlog.id}`)
      .set('Authorization', incorrectAdminAuth)
      .expect(HttpStatus.Unauthorized_401);

    const foundBlog = await getBlogById(app, createdBlog.id);

    expect(foundBlog).toEqual(createdBlog);
  });

  it('should return 404 when deleting non-existing blog', async () => {
    await request(app)
      .delete(`${BLOGS_PATH}/999`)
      .set('Authorization', adminAuth)
      .expect(HttpStatus.NotFound_404);
  });
});