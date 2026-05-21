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
import { getUserDto } from '../../utils/users/get-user-dto'
import { createUser } from '../../utils/users/create-user'

describe('users e2e', () => {
  const app = express()
  setupApp(app)

  const adminAuth = generateBasicAuthToken()
  const invalidAuth = 'Basic invalid-token'

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL)
  })

  afterAll(async () => {
    await db.stop()
  })

  beforeEach(async () => {
    await clearDb(app)
  })

  it('POST -> "/users": should create new user; status 201', async () => {
    const userDto = getUserDto()

    const response = await request(app)
      .post(USERS_PATH)
      .set('Authorization', adminAuth)
      .send(userDto)
      .expect(HttpStatus.Created_201)

    expect(response.body).toEqual({
      id: expect.any(String),
      login: userDto.login,
      email: userDto.email,
      createdAt: expect.any(String),
    })
  })

  it('GET -> "/users": should return status 200; content: users array with pagination', async () => {
    const createdUser = await createUser(app, getUserDto())

    const response = await request(app)
      .get(USERS_PATH)
      .set('Authorization', adminAuth)
      .expect(HttpStatus.Ok_200)

    expect(response.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [createdUser],
    })
  })

  it('DELETE -> "/users/:id": should delete user by id; status 204', async () => {
    const createdUser = await createUser(app, getUserDto())

    await request(app)
      .delete(`${USERS_PATH}/${createdUser.id}`)
      .set('Authorization', adminAuth)
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(USERS_PATH)
      .set('Authorization', adminAuth)
      .expect(HttpStatus.Ok_200)

    expect(response.body.items).toEqual([])
  })

  it('DELETE -> "/users/:id": should return 404 if user not found', async () => {
    const nonExistingId = '6a0eba40d581e957f98cb6f9'

    await request(app)
      .delete(`${USERS_PATH}/${nonExistingId}`)
      .set('Authorization', adminAuth)
      .expect(HttpStatus.NotFound_404)
  })

  it('POST, DELETE -> "/users": should return 401 if auth credentials is incorrect', async () => {
    const userDto = getUserDto()
    const createdUser = await createUser(app, userDto)

    await request(app)
      .post(USERS_PATH)
      .set('Authorization', invalidAuth)
      .send({
        login: 'Alexey',
        password: 'Qwerty123!',
        email: 'alexey@gmail.com',
      })
      .expect(HttpStatus.Unauthorized_401)

    await request(app)
      .delete(`${USERS_PATH}/${createdUser.id}`)
      .set('Authorization', invalidAuth)
      .expect(HttpStatus.Unauthorized_401)
  })
})