/// <reference types="jest" />
import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { BLOGS_PATH } from '../../../src/core/path/path';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import {generateBasicAuthToken} from "../../utils/generate-admin-auth-token";
import {clearDb} from "../../utils/clear-db";

describe('blogs body validation e2e', () => {
  const app = express();
  setupApp(app);

  const adminAuth = generateBasicAuthToken();

  beforeEach(async () => {
    await clearDb(app);
  });

  it('should return 400 and error for empty name', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        name: '',
        description: 'valid description',
        websiteUrl: 'https://valid-site.dev',
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

    const result = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(result.body).toEqual([]);
  });

  it('should return 400 and error for too long name', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        name: 'a'.repeat(16),
        description: 'valid description',
        websiteUrl: 'https://valid-site.dev',
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
  });

  it('should return 400 and error for empty description', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        name: 'valid name',
        description: '',
        websiteUrl: 'https://valid-site.dev',
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
  });

  it('should return 400 and error for too long description', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        name: 'valid name',
        description: 'd'.repeat(501),
        websiteUrl: 'https://valid-site.dev',
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
  });

  it('should return 400 and error for invalid websiteUrl', async () => {
    const response = await request(app)
      .post(BLOGS_PATH)
      .set('Authorization', adminAuth)
      .send({
        name: 'valid name',
        description: 'valid description',
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
  });
});
