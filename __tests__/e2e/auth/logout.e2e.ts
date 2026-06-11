import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { AUTH_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import { createUser } from '../../utils/users/create-user'
import {cookie} from "express-validator";

describe('Logout e2e', () => {
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

  it('POST -> "/auth/logout": should return 204 if refresh token is valid', async () => {
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

    expect(loginResponse.body).toEqual({
      accessToken: expect.any(String),
    })

    const cookies = loginResponse.headers['set-cookie']

    expect(cookies).toBeDefined()
    expect(cookies[0]).toContain('refreshToken=')

    await request(app)
      .post(`${AUTH_PATH}/logout`)
      .set('Cookie', cookies)
      .expect(HttpStatus.NoContent_204)
  })

  it('POST -> "/auth/logout": should clear refresh token cookie', async () => {
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

    const cookie = loginResponse.headers['set-cookie']

    const logoutResponse = await request(app)
      .post(`${AUTH_PATH}/logout`)
      .set('Cookie', cookie)
      .expect(HttpStatus.NoContent_204)

    const logoutCookies = logoutResponse.headers['set-cookie']

    expect(logoutCookies).toBeDefined()
    expect(logoutCookies[0]).toContain('refreshToken=')
    expect(logoutCookies[0]).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT')
  })

  it('POST -> "/auth/logout": should make old refresh token invalid', async () => {
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

    const cookie = loginResponse.headers['set-cookie']

    await request(app)
    .post(`${AUTH_PATH}/logout`)
    .set('Cookie', cookie)
    .expect(HttpStatus.NoContent_204)

    await request(app)
    .post(`${AUTH_PATH}/refresh-token`)
    .set('Cookie', cookie)
    .expect(HttpStatus.Unauthorized_401)
  })
})
