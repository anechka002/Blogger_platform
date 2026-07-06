import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { AUTH_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import {registerUser} from "../../utils/auth/register-user";
import {container} from "../../../src/composition-root";
import {
  ApiRequestLogsRepository
} from "../../../src/auth/repositories/api-request-logs.repository";
import {NodemailerService} from "../../../src/auth/adapters/nodemailer.service";

describe('Registration-email-resending e2e', () => {
  const app = express()
  setupApp(app)

  const apiRequestLogsRepository = container.get(ApiRequestLogsRepository)
  const nodemailerService = container.get(NodemailerService)

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

  it('POST -> "/auth/registration-email-resending": should send email with new code if user exists but not confirmed yet; status 204', async () => {
    const sendEmailMock = jest
      .spyOn(nodemailerService, 'sendEmail')
      .mockResolvedValue(true)

    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await registerUser(app, userDto)

    await request(app)
      .post(`${AUTH_PATH}/registration-email-resending`)
      .send({email: userDto.email})
      .expect(HttpStatus.NoContent_204)

    expect(sendEmailMock).toHaveBeenCalledTimes(2)
  })

  it('POST -> "/auth/registration-email-resending": should return error if email already confirmed; status 400', async () => {
    jest
      .spyOn(nodemailerService, 'sendEmail')
      .mockResolvedValue(true)

    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    const user = await registerUser(app, userDto)

    await request(app)
      .post(`${AUTH_PATH}/registration-confirmation`)
      .send({code: user!.emailConfirmation.confirmationCode,})
      .expect(HttpStatus.NoContent_204)

    await request(app)
      .post(`${AUTH_PATH}/registration-email-resending`)
      .send({email: userDto.email})
      .expect(HttpStatus.BadRequest_400)
  })

  it('POST -> "/auth/registration-email-resending": should return 429 if rate limit exceeded', async () => {
    jest
      .spyOn(apiRequestLogsRepository, 'countRecentRequests')
      .mockResolvedValue(5)

    await request(app)
      .post(`${AUTH_PATH}/registration-email-resending`)
      .send({
        email: 'natalia@gmail.com',
      })
      .expect(HttpStatus.ManyRequest_429)
  })

})
