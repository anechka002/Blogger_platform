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


describe('Registration-confirmation e2e', () => {
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

    jest
      .spyOn(nodemailerService, 'sendEmail')
      .mockResolvedValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await db.stop()
  })

  it('POST -> "/auth/registration-confirmation": should confirm registration by email; status 204', async () => {

    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    const user = await registerUser(app, userDto)

    await request(app)
      .post(`${AUTH_PATH}/registration-confirmation`)
      .send({code: user?.emailConfirmation.confirmationCode})
      .expect(HttpStatus.NoContent_204)

  })

  it('POST -> "/auth/registration-confirmation": should return error if code already confirmed; status 400', async () => {

    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    const user = await registerUser(app, userDto)

    const code = user!.emailConfirmation.confirmationCode

    await request(app)
      .post(`${AUTH_PATH}/registration-confirmation`)
      .send({code})
      .expect(HttpStatus.NoContent_204)

    await request(app)
      .post(`${AUTH_PATH}/registration-confirmation`)
      .send({code})
      .expect(HttpStatus.BadRequest_400)
  })

  it('POST -> "/auth/registration-confirmation": should return 429 if rate limit exceeded', async () => {
    jest
      .spyOn(apiRequestLogsRepository, 'countRecentRequests')
      .mockResolvedValue(5)

    await request(app)
      .post(`${AUTH_PATH}/registration-confirmation`)
      .send({ code: 'some-code' })
      .expect(HttpStatus.ManyRequest_429)
  })

})
