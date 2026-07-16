import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import {AUTH_PATH, SECURITY_PATH} from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { clearDb } from '../../utils/clear-db'
import { createUser } from '../../utils/users/create-user'
import {DeviceView} from "../../utils/device-view.type";
import {DeviceModel} from "../../../src/devices/domain/device.entity";

describe('Refresh token e2e', () => {
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

  it('POST -> "/auth/refresh-token": should update lastActiveDate only for current device', async () => {
    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await createUser(app, userDto)

    const response = await request(app)
      .post(`${AUTH_PATH}/login`)
      .set('User-Agent', 'Chrome')
      .send({
        loginOrEmail: userDto.login,
        password: userDto.password,
      })
      .expect(HttpStatus.Ok_200)

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    })

    const device1Cookie = response.headers['set-cookie']

    expect(device1Cookie).toBeDefined()
    expect(device1Cookie[0]).toContain('refreshToken=')

    const otherUserAgents = ['Safari', 'Firefox', 'Postman']

    for(const userAgent of otherUserAgents) {
      await request(app)
        .post(`${AUTH_PATH}/login`)
        .set('User-Agent', userAgent)
        .send({
          loginOrEmail: userDto.login,
          password: userDto.password,
        })
        .expect(HttpStatus.Ok_200)
    }

    // Запрашиваем список устройств. Cookie берём именно от device 1, чтобы сервер понял, какой пользователь делает запрос.
    const devicesBeforeResponse = await request(app)
      .get(`${SECURITY_PATH}`)
      .set('Cookie', device1Cookie)
      .expect(HttpStatus.Ok_200)

    // Достаём массив девайсов из ответа.
    const devicesBefore: DeviceView[] = devicesBeforeResponse.body

    // Проверяем, что у пользователя сейчас 4 активные session/device.
    expect(devicesBefore).toHaveLength(4)

    // Сохраняем все deviceId до refresh. Потом сравним, что после refresh они не изменились.
    const deviceIds = devicesBefore.map(d => d.deviceId).sort()

    // Находим первый девайс — тот, который логинился с User-Agent: Chrome.
    const device1Before = devicesBefore.find(d => d.title === 'Chrome')

    if (!device1Before) {
      throw new Error('Device 1 was not found')
    }

    // Проверяем, что он реально найден.
    expect(device1Before).toBeDefined()

    // Сохраняем его старый lastActiveDate, чтобы после refresh проверить, что он изменился.
    const device1LastActiveDateBefore = device1Before.lastActiveDate

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Потом делаем refresh
    const refreshResponse = await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set('Cookie', device1Cookie)
      .expect(HttpStatus.Ok_200)

    const newDevice1Cookie = refreshResponse.headers['set-cookie']

    expect(newDevice1Cookie).toBeDefined()
    expect(newDevice1Cookie[0]).toContain('refreshToken=')

    // Потом снова список девайсов
    const devicesAfterResponse = await request(app)
      .get(`${SECURITY_PATH}`)
      .set('Cookie', newDevice1Cookie)
      .expect(HttpStatus.Ok_200)

    const devicesAfter: DeviceView[] = devicesAfterResponse.body

    expect(devicesAfter).toHaveLength(4)

    expect(devicesAfter.map(d => d.deviceId).sort()).toEqual(deviceIds)

    const device1After = devicesAfter.find(
      d => d.deviceId === device1Before.deviceId
    )

    if (!device1After) {
      throw new Error('Device 1 after refresh was not found')
    }

    expect(device1After.lastActiveDate).not.toBe(device1LastActiveDateBefore)

    for (const deviceBefore of devicesBefore) {
      if (deviceBefore.deviceId === device1Before.deviceId) {
        continue
      }

      const deviceAfter = devicesAfter.find(
        d => d.deviceId === deviceBefore.deviceId
      )

      if (!deviceAfter) {
        throw new Error('Device after refresh was not found')
      }

      expect(deviceAfter).toBeDefined()
      expect(deviceAfter.lastActiveDate).toBe(deviceBefore.lastActiveDate)
    }

    expect(device1After).toBeDefined()
    expect(device1After.lastActiveDate).not.toBe(device1LastActiveDateBefore)
  })

  it('POST -> "/auth/refresh-token": should update refresh token for current device session', async () => {
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

    const oldCookies = response.headers['set-cookie']

    expect(oldCookies).toBeDefined()
    expect(oldCookies[0]).toContain('refreshToken=')

    const refreshResponse = await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set('Cookie', oldCookies)
      .expect(HttpStatus.Ok_200)

    expect(refreshResponse.body).toEqual({
      accessToken: expect.any(String),
    })

    const newCookies = refreshResponse.headers['set-cookie']

    expect(newCookies).toBeDefined()
    expect(newCookies[0]).toContain('refreshToken=')

    const sessions = await DeviceModel
      .find({})
      .lean()

    expect(sessions).toHaveLength(1)
  })

  it('POST -> "/auth/refresh-token": should return new access token and new refresh token cookie', async () => {
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

    const refreshResponse = await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set('Cookie', cookies)
      .expect(HttpStatus.Ok_200)

    expect(refreshResponse.body).toEqual({
      accessToken: expect.any(String),
    })

    const newCookies = refreshResponse.headers['set-cookie']

    expect(newCookies).toBeDefined()
    expect(newCookies[0]).toContain('refreshToken=')
  })

  it('POST -> "/auth/refresh-token": should return 401 if refresh token is missing', async () => {
    await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .expect(HttpStatus.Unauthorized_401)
  })

  it('POST -> "/auth/refresh-token": should return 401 if refresh token is invalid', async () => {
    await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set('Cookie', ['refreshToken=invalid-token'])
      .expect(HttpStatus.Unauthorized_401)
  })

  it('POST -> "/auth/refresh-token": should return 401 if refresh token was already used', async () => {
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

    const oldRefreshToken = loginResponse.headers['set-cookie']

    await new Promise(resolve => setTimeout(resolve, 1000))

    await request(app)
    .post(`${AUTH_PATH}/refresh-token`)
    .set('Cookie', oldRefreshToken)
    .expect(HttpStatus.Ok_200)

    await request(app)
    .post(`${AUTH_PATH}/refresh-token`)
    .set('Cookie', oldRefreshToken)
    .expect(HttpStatus.Unauthorized_401)
  })

})
