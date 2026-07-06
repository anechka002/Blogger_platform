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

describe('Password recovery e2e', () => {
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

  it('POST -> "/auth/password-recovery": should send recovery email with recovery code if user exists; status 204', async () => {
    const sendEmailMock = jest
      .spyOn(nodemailerService, 'sendEmail')
      .mockResolvedValue(true)

    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    // 1. Зарегистрировали пользователя
    await registerUser(app, userDto)

    // 2. Сбрасываем историю вызовов, потому что письмо при регистрации нас уже не интересует
    sendEmailMock.mockClear()

    // 3. Дёргаем password-recovery
    await request(app)
      .post(`${AUTH_PATH}/password-recovery`)
      .send({ email: userDto.email })
      .expect(HttpStatus.NoContent_204)

    // 4. Проверяем, что письмо отправилось
    expect(sendEmailMock).toHaveBeenCalledTimes(1)

    expect(sendEmailMock).toHaveBeenCalledWith(
      userDto.email,
      expect.any(String),
      expect.any(String)
    )
  })

  it('POST -> "/auth/password-recovery": should return 204 and not send email if user does not exist', async () => {
    const sendEmailMock = jest
      .spyOn(nodemailerService, 'sendEmail')
      .mockResolvedValue(true)

    await request(app)
      .post(`${AUTH_PATH}/password-recovery`)
      .send({ email: 'natalia@gmail.com' })
      .expect(HttpStatus.NoContent_204)

    // Проверяем, что письмо не отправилось
    expect(sendEmailMock).toHaveBeenCalledTimes(0)
  })

  it('POST -> "/auth/password-recovery": should return 429 if more than 5 requests from same IP to same URL in 10 seconds', async () => {
    jest
      .spyOn(apiRequestLogsRepository, 'countRecentRequests')
      .mockResolvedValue(5)

    await request(app)
      .post(`${AUTH_PATH}/password-recovery`)
      .send({
        email: 'natalia@gmail.com',
      })
      .expect(HttpStatus.ManyRequest_429)
  })

})
