import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { AUTH_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import {nodemailerService} from "../../../src/auth/adapters/nodemailer.service";
import {randomUUID} from "node:crypto";
import {registerUser} from "../../utils/auth/register-user";

describe('Registration-confirmation e2e', () => {
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

  it('POST -> "/auth/registration-confirmation": should confirm registration by email; status 204', async () => {
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
      .send({code: user?.emailConfirmation.confirmationCode})
      .expect(HttpStatus.NoContent_204)

  })

  it('POST -> "/auth/registration-confirmation": should return error if code already confirmed; status 400', async () => {
    jest
      .spyOn(nodemailerService, 'sendEmail')
      .mockResolvedValue(true)

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

})
