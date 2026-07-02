import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { AUTH_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import {registerUser} from "../../utils/auth/register-user";
import {
  apiRequestLogsRepository,
  nodemailerService, usersRepository
} from "../../../src/composition-root";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";

describe('New password e2e', () => {
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

  it('POST -> "/auth/new-password": should update password if recovery code is valid; status 204', async () => {

    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    // 1. Зарегистрировали пользователя
    await registerUser(app, userDto)

    // 2. Дёргаем password-recovery
    await request(app)
      .post(`${AUTH_PATH}/password-recovery`)
      .send({ email: userDto.email })
      .expect(HttpStatus.NoContent_204)

    const user = await usersRepository.findByEmail(userDto.email)

    await request(app)
      .post(`${AUTH_PATH}/new-password`)
      .send({
        newPassword: 'newPassword123',
        recoveryCode: user!.passwordRecovery.recoveryCode,
      })
      .expect(HttpStatus.NoContent_204)
  })

  it('POST -> "/auth/new-password": should return 400 if recovery code is expired', async () => {
    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    // 1. Зарегистрировали пользователя
    await registerUser(app, userDto)

    const recoveryCode = randomUUID()
    const expirationDate = add(new Date(), { minutes: -1 })

    const user = await usersRepository.findByEmail(userDto.email)

    await usersRepository.updatePasswordRecoveryCode(
      user!._id.toString(),
      recoveryCode,
      expirationDate,
    )

    await request(app)
      .post(`${AUTH_PATH}/new-password`)
      .send({
        newPassword: 'newPassword123',
        recoveryCode,
      })
      .expect(HttpStatus.BadRequest_400)
  })

  it('POST -> "/auth/new-password": should return 429 if more than 5 requests from same IP to same URL in 10 seconds', async () => {
    jest
      .spyOn(apiRequestLogsRepository, 'countRecentRequests')
      .mockResolvedValue(5)

    await request(app)
      .post(`${AUTH_PATH}/new-password`)
      .send({
        newPassword: 'newPassword123',
        recoveryCode: '550e8400-e29b-41d4-a716-446655440000',
      })
      .expect(HttpStatus.ManyRequest_429)
  })

})
