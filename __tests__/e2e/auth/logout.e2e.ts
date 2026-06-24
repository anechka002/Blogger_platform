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

describe('Logout e2e', () => {
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

  it('POST -> "/auth/logout": should remove only current device session after logout', async () => {
    const userDto = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await createUser(app, userDto)

    // Логиним device 1
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

    // Сохраняем device1Cookie
    const device1Cookie = response.headers['set-cookie']

    expect(device1Cookie).toBeDefined()
    expect(device1Cookie[0]).toContain('refreshToken=')

    const otherUserAgents = ['Safari', 'Firefox']

    let device3Cookie: string | undefined
    // Логиним device 2,3
    for(const userAgent of otherUserAgents) {
      const loginResponse = await request(app)
        .post(`${AUTH_PATH}/login`)
        .set('User-Agent', userAgent)
        .send({
          loginOrEmail: userDto.login,
          password: userDto.password,
        })
        .expect(HttpStatus.Ok_200)

      if (userAgent === 'Firefox') {
        device3Cookie = loginResponse.headers['set-cookie'][0]
      }
    }

    if (!device3Cookie) {
      throw new Error('Device 3 cookie was not found')
    }

    expect(device3Cookie).toBeDefined()
    expect(device3Cookie).toContain('refreshToken=')

    // Запрашиваем список устройств. Cookie берём именно от device 1, чтобы сервер понял, какой пользователь делает запрос.
    const devicesBeforeResponse = await request(app)
      .get(`${SECURITY_PATH}`)
      .set('Cookie', device1Cookie)
      .expect(HttpStatus.Ok_200)

    // Достаём массив девайсов из ответа.
    const devices: DeviceView[] = devicesBeforeResponse.body

    // Проверяем, что у пользователя сейчас 3 активные session/device.
    expect(devices).toHaveLength(3)

    // Находим 3 девайс — тот, который логинился с User-Agent: Firefox.
    const device3 = devices.find(d => d.title === 'Firefox')

    if (!device3) {
      throw new Error('Device 3 was not found')
    }

    // Проверяем, что он реально найден.
    expect(device3).toBeDefined()

    // Сохраняем его deviceId
    const device3Id = device3.deviceId

    await request(app)
      .post(`${AUTH_PATH}/logout`)
      .set('Cookie', device3Cookie)
      .expect(HttpStatus.NoContent_204)

    // Запрашиваем список устройств. Cookie берём именно от device 1, чтобы сервер понял, какой пользователь делает запрос.
    const devicesResponse = await request(app)
      .get(`${SECURITY_PATH}`)
      .set('Cookie', device1Cookie)
      .expect(HttpStatus.Ok_200)

    const devicesAfter: DeviceView[] = devicesResponse.body

    expect(devicesAfter).toHaveLength(2)

    // device 3 больше нет в списке
    const deletedDevice = devicesAfter.find(d => d.deviceId === device3Id)
    expect(deletedDevice).toBeUndefined()

    // device 1 остался в списке
    const device1 = devicesAfter.find(d => d.title === 'Chrome')
    expect(device1).toBeDefined()

    // device 2 остался в списке
    const device2 = devicesAfter.find(d => d.title === 'Safari')
    expect(device2).toBeDefined()

  })

  it('POST -> "/auth/logout": should return 204 if refresh token is valid', async () => {
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

    expect(loginResponse.body).toEqual({
      accessToken: expect.any(String),
    })

    const cookies = loginResponse.headers['set-cookie']

    expect(cookies).toBeDefined()
    expect(cookies[0]).toContain('refreshToken=')

    await request(app)
      .post(`${AUTH_PATH}/logout`)
      .set('Cookie', cookies)
      .expect(HttpStatus.NoContent_204)
  })

  it('POST -> "/auth/logout": should clear refresh token cookie', async () => {
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

    const cookie = loginResponse.headers['set-cookie']

    const logoutResponse = await request(app)
      .post(`${AUTH_PATH}/logout`)
      .set('Cookie', cookie)
      .expect(HttpStatus.NoContent_204)

    const logoutCookies = logoutResponse.headers['set-cookie']

    expect(logoutCookies).toBeDefined()
    expect(logoutCookies[0]).toContain('refreshToken=')
    expect(logoutCookies[0]).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT')
  })

  it('POST -> "/auth/logout": should make old refresh token invalid', async () => {
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

    const cookie = loginResponse.headers['set-cookie']

    await request(app)
    .post(`${AUTH_PATH}/logout`)
    .set('Cookie', cookie)
    .expect(HttpStatus.NoContent_204)

    await request(app)
    .post(`${AUTH_PATH}/refresh-token`)
    .set('Cookie', cookie)
    .expect(HttpStatus.Unauthorized_401)
  })
})
