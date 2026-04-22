/// <reference types="jest" />
import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { BLOGS_PATH } from '../../../src/core/path/path';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { clearDb } from '../../utils/clear-db';

describe('blogs e2e', () => {
  const app = express();
  setupApp(app);

  const adminAuth = generateBasicAuthToken();
  const incorrectAdminAuth = `Basic ${Buffer.from('admin:wrong-password').toString(
    'base64',
  )}`;
  const createBlogPayload = {
    name: 'my blog',
    description: 'blog description',
    websiteUrl: 'https://my-blog.dev',
  };

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
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send(createBlogPayload)
      .expect(HttpStatus.Created_201);

    expect(createResponse.body).toEqual({
      id: expect.any(String),
      ...createBlogPayload,
    });

    const listResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(listResponse.body).toEqual([createResponse.body]);
  });

  it('should return 401 and not create blog without auth', async () => {
    await request(app)
      .post(BLOGS_PATH)
      .send(createBlogPayload)
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
      .send(createBlogPayload)
      .expect(HttpStatus.Unauthorized_401);

    const listResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(listResponse.body).toEqual([]);
  });

  it('should return created blog by id', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send(createBlogPayload)
      .expect(HttpStatus.Created_201);

    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok_200);

    expect(getResponse.body).toEqual(createResponse.body);
  });

  it('should return 404 for non-existing blog by id', async () => {
    await request(app)
      .get(`${BLOGS_PATH}/999`)
      .expect(HttpStatus.NotFound_404);
  });

  it('should update existing blog and return updated entity by id', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send(createBlogPayload)
      .expect(HttpStatus.Created_201);

    const updatePayload = {
      name: 'updated blog',
      description: 'updated description',
      websiteUrl: 'https://updated-blog.dev',
    };

    await request(app)
      .put(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminAuth)
      .send(updatePayload)
      .expect(HttpStatus.NoContent_204);

    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok_200);

    expect(getResponse.body).toEqual({
      id: createResponse.body.id,
      ...updatePayload,
    });
  });

  it('should return 401 and not update blog without auth', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send(createBlogPayload)
      .expect(HttpStatus.Created_201);

    const updatePayload = {
      name: 'updated blog',
      description: 'updated description',
      websiteUrl: 'https://updated-blog.dev',
    };

    await request(app)
      .put(`${BLOGS_PATH}/${createResponse.body.id}`)
      .send(updatePayload)
      .expect(HttpStatus.Unauthorized_401);

    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok_200);

    expect(getResponse.body).toEqual(createResponse.body);
  });

  it('should return 404 when updating non-existing blog', async () => {
    await request(app)
      .put(`${BLOGS_PATH}/999`)
      .set('Authorization', adminAuth)
      .send({
        name: 'updated blog',
        description: 'updated description',
        websiteUrl: 'https://updated-blog.dev',
      })
      .expect(HttpStatus.NotFound_404);
  });

  it('should return 400 and validation errors for invalid body when updating blog', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send(createBlogPayload)
      .expect(HttpStatus.Created_201);

    const response = await request(app)
      .put(`${BLOGS_PATH}/${createResponse.body.id}`)
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

    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok_200);

    expect(getResponse.body).toEqual(createResponse.body);
  });

  it('should return 401 and not update blog with incorrect auth credentials', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send(createBlogPayload)
      .expect(HttpStatus.Created_201);

    const updatePayload = {
      name: 'updated blog',
      description: 'updated description',
      websiteUrl: 'https://updated-blog.dev',
    };

    await request(app)
      .put(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', incorrectAdminAuth)
      .send(updatePayload)
      .expect(HttpStatus.Unauthorized_401);

    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok_200);

    expect(getResponse.body).toEqual(createResponse.body);
  });

  it('should delete existing blog', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send(createBlogPayload)
      .expect(HttpStatus.Created_201);

    await request(app)
      .delete(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', adminAuth)
      .expect(HttpStatus.NoContent_204);

    await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.NotFound_404);

    const listResponse = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(listResponse.body).toEqual([]);
  });

  it('should return 401 and not delete blog without auth', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send(createBlogPayload)
      .expect(HttpStatus.Created_201);

    await request(app)
      .delete(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Unauthorized_401);

    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok_200);

    expect(getResponse.body).toEqual(createResponse.body);
  });

  it('should return 401 and not delete blog with incorrect auth credentials', async () => {
    const createResponse = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send(createBlogPayload)
      .expect(HttpStatus.Created_201);

    await request(app)
      .delete(`${BLOGS_PATH}/${createResponse.body.id}`)
      .set('Authorization', incorrectAdminAuth)
      .expect(HttpStatus.Unauthorized_401);

    const getResponse = await request(app)
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok_200);

    expect(getResponse.body).toEqual(createResponse.body);
  });

  it('should return 404 when deleting non-existing blog', async () => {
    await request(app)
      .delete(`${BLOGS_PATH}/999`)
      .set('Authorization', adminAuth)
      .expect(HttpStatus.NotFound_404);
  });
});
