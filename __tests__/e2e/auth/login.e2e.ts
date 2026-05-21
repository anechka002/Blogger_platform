import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { AUTH_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import { createUser } from '../../utils/users/create-user'

describe('Login e2e', () => {
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

  it('POST -> "/auth/login": should sign in user; status 204', async () => {
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
        password: userDto.password,
      })
      .expect(HttpStatus.NoContent_204)
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
})