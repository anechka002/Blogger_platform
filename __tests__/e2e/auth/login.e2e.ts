import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { AUTH_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import { createUser } from '../../utils/users/create-user'
import {
  apiRequestLogsRepository
} from "../../../src/auth/repositories/api-request-logs.repository";

describe('Login e2e', () => {
  const app = express()
  setupApp(app)

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL)
  })

  beforeEach(async () => {
    await clearDb(app)

    jest
      .spyOn(apiRequestLogsRepository, 'countRecentRequests')
      .mockResolvedValue(0)

    jest
      .spyOn(apiRequestLogsRepository, 'create')
      .mockResolvedValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await db.stop()
  })

  it('POST -> "/auth/login": should sign in user; status 200, access token and refresh token in cookie', async () => {
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
    expect(cookies[0]).toContain('HttpOnly')
  })

  it('POST -> "/auth/login": should return 401 if login is wrong', async () => {
    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await createUser(app, userDto)

    await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({
        loginOrEmail: 'wrong-login',
        password: userDto.password,
      })
      .expect(HttpStatus.Unauthorized_401)
  })

  it('POST -> "/auth/login": should return 401 if password is wrong', async () => {
    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await createUser(app, userDto)

    await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({
        loginOrEmail: userDto.login,
        password: 'wrong-password',
      })
      .expect(HttpStatus.Unauthorized_401)
  })

  it('POST -> "/auth/login": should return 400 if passed body is incorrect', async () => {
    await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({
        loginOrEmail: '',
        password: '',
      })
      .expect(HttpStatus.BadRequest_400)
  })

  it('POST -> "/auth/login": should return 429 if rate limit exceeded', async () => {
    jest
      .spyOn(apiRequestLogsRepository, 'countRecentRequests')
      .mockResolvedValue(5)

    await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({
        loginOrEmail: 'Natalia',
        password: 'qwerty123',
      })
      .expect(HttpStatus.ManyRequest_429)
  })
})
