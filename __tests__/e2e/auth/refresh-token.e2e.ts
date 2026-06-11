import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { AUTH_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import { createUser } from '../../utils/users/create-user'

describe('Refresh token e2e', () => {
  const app = express()
  setupApp(app)

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL)
  })

  afterAll(async () => {
    await db.stop()
  })

  beforeEach(async () => {
    await clearDb(app)
  })

  it('POST -> "/auth/refresh-token": should return new access token and new refresh token cookie', async () => {
    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await createUser(app, userDto)

    const response = await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({
        loginOrEmail: userDto.login,
        password: userDto.password,
      })
      .expect(HttpStatus.Ok_200)

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    })

    const cookies = response.headers['set-cookie']

    expect(cookies).toBeDefined()
    expect(cookies[0]).toContain('refreshToken=')

    const refreshResponse = await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set('Cookie', cookies)
      .expect(HttpStatus.Ok_200)

    expect(refreshResponse.body).toEqual({
      accessToken: expect.any(String),
    })

    const newCookies = refreshResponse.headers['set-cookie']

    expect(newCookies).toBeDefined()
    expect(newCookies[0]).toContain('refreshToken=')
  })

  it('POST -> "/auth/refresh-token": should return 401 if refresh token is missing', async () => {
    await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .expect(HttpStatus.Unauthorized_401)
  })

  it('POST -> "/auth/refresh-token": should return 401 if refresh token is invalid', async () => {
    await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set('Cookie', ['refreshToken=invalid-token'])
      .expect(HttpStatus.Unauthorized_401)
  })

  it('POST -> "/auth/refresh-token": should return 401 if refresh token was already used', async () => {
    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await createUser(app, userDto)

    const loginResponse = await request(app)
    .post(`${AUTH_PATH}/login`)
    .send({
      loginOrEmail: userDto.login,
      password: userDto.password,
    })
    .expect(HttpStatus.Ok_200)

    const oldRefreshToken = loginResponse.headers['set-cookie']

    await request(app)
    .post(`${AUTH_PATH}/refresh-token`)
    .set('Cookie', oldRefreshToken)
    .expect(HttpStatus.Ok_200)

    await request(app)
    .post(`${AUTH_PATH}/refresh-token`)
    .set('Cookie', oldRefreshToken)
    .expect(HttpStatus.Unauthorized_401)
  })

})
