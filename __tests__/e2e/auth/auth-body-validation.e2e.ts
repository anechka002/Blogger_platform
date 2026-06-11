/// <reference types="jest" />

import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import {AUTH_PATH} from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'

describe('auth body validation e2e', () => {
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

  const validUserDto = {
    login: 'Natalia',
    password: 'Qwerty123!',
    email: 'natalia@gmail.com',
  }

  it('POST -> "auth/registration": should return error if login is incorrect; status 400', async () => {
    const response = await request(app)
      .post(`${AUTH_PATH}/registration`)
      .send({
        ...validUserDto,
        login: 'ab',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body.errorsMessages[0].field).toBe('login')
  })

  it('POST -> "auth/registration": should return error if password is incorrect; status 400', async () => {
    const response = await request(app)
      .post(`${AUTH_PATH}/registration`)
      .send({
        ...validUserDto,
        password: '123',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body.errorsMessages[0].field).toBe('password')
  })

  it('POST -> "auth/registration": should return error if email is incorrect; status 400', async () => {
    const response = await request(app)
      .post(`${AUTH_PATH}/registration`)
      .send({
        ...validUserDto,
        email: 'invalid-email',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body.errorsMessages[0].field).toBe('email')
  })

  it('POST -> "auth/registration-confirmation": should return error if code doesnt exist; status 400', async () => {
    const response = await request(app)
      .post(`${AUTH_PATH}/registration-confirmation`)
      .send({code: ''})
      .expect(HttpStatus.BadRequest_400)

    expect(response.body.errorsMessages[0].field).toBe('code')
  })

  it('POST -> "auth/registration-email-resending": should return error if email doesnt exist; status 400', async () => {
    const response = await request(app)
      .post(`${AUTH_PATH}/registration-email-resending`)
      .send({email: ''})
      .expect(HttpStatus.BadRequest_400)

    expect(response.body.errorsMessages[0].field).toBe('email')
  })

  it('POST -> "auth/login": should return error if password is incorrect; status 400', async () => {
    const response = await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({
        loginOrEmail: 'Natalia',
        password: '12345',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body.errorsMessages[0].field).toBe('password')
  })

})