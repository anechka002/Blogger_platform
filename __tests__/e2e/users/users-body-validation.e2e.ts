/// <reference types="jest" />

import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { USERS_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token'

describe('users body validation e2e', () => {
  const app = express()
  setupApp(app)

  const adminAuth = generateBasicAuthToken()

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL)
  })

  afterAll(async () => {
    await db.stop()
  })

  beforeEach(async () => {
    await clearDb(app)
  })

  const validUserDto = {
    login: 'Natalia',
    password: 'Qwerty123!',
    email: 'natalia@gmail.com',
  }

  it('POST -> "/users": should return 400 if login is incorrect', async () => {
    const response = await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validUserDto,
        login: 'ab',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body.errorsMessages[0].field).toBe('login')
  })

  it('POST -> "/users": should return 400 if password is incorrect', async () => {
    const response = await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validUserDto,
        password: '123',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body.errorsMessages[0].field).toBe('password')
  })

  it('POST -> "/users": should return 400 if email is incorrect', async () => {
    const response = await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validUserDto,
        email: 'invalid-email',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body.errorsMessages[0].field).toBe('email')
  })

  it('POST -> "/users": should return 400 if login is not unique', async () => {
    await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminAuth)
      .send(validUserDto)
      .expect(HttpStatus.Created_201)

    const response = await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validUserDto,
        email: 'another@gmail.com',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'login',
          message: 'login should be unique',
        },
      ],
    })
  })

  it('POST -> "/users": should return 400 if email is not unique', async () => {
    await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminAuth)
      .send(validUserDto)
      .expect(HttpStatus.Created_201)

    const response = await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminAuth)
      .send({
        ...validUserDto,
        login: 'Another',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'email',
          message: 'email should be unique',
        },
      ],
    })
  })
})