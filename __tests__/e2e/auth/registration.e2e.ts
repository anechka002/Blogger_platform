import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { AUTH_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import {nodemailerService} from "../../../src/auth/adapters/nodemailer.service";
import {registerUser} from "../../utils/auth/register-user";
import {
  apiRequestLogsRepository
} from "../../../src/auth/repositories/api-request-logs.repository";

describe('Registration e2e', () => {
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

  it('POST -> "/auth/registration": should create new user and send confirmation email with code; status 204', async () => {
    const sendEmailMock = jest
      .spyOn(nodemailerService, 'sendEmail')
      .mockResolvedValue(true)

    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await registerUser(app, userDto)

    expect(sendEmailMock).toHaveBeenCalledTimes(1)
    expect(sendEmailMock).toHaveBeenCalledWith(
      userDto.email,
      expect.any(String),
      expect.any(String)
    )
  })

  it('POST -> "/auth/registration": should return error if email or login already exist; status 400', async () => {
    jest
      .spyOn(nodemailerService, 'sendEmail')
      .mockResolvedValue(true)

    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await registerUser(app, userDto)

    await request(app)
      .post(`${AUTH_PATH}/registration`)
      .send(userDto)
      .expect(HttpStatus.BadRequest_400)
  })

  it('POST -> "/auth/registration": should return 429 if rate limit exceeded', async () => {
    jest
      .spyOn(apiRequestLogsRepository, 'countRecentRequests')
      .mockResolvedValue(5)

    await request(app)
      .post(`${AUTH_PATH}/registration`)
      .send({
        login: 'Natalia',
        password: 'qwerty123',
        email: 'natalia@gmail.com',
      })
      .expect(HttpStatus.ManyRequest_429)
  })

})
