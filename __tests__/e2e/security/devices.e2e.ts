import express from "express";
import {setupApp} from "../../../src/setup-app";
import {db} from "../../../src/db/mongo.db";
import {SETTINGS} from "../../../src/core/settings/settings";
import {clearDb} from "../../utils/clear-db";
import {createUser} from "../../utils/users/create-user";
import request from "supertest";
import {AUTH_PATH, SECURITY_PATH} from "../../../src/core/paths/paths";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {DeviceView} from "../../utils/device-view.type";

describe('Security devices e2e', () => {
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

  it('GET -> "/security/devices": should return current user device sessions', async () => {
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

    // проверка формы каждого device
    for (const device of devicesBefore) {
      expect(device).toEqual({
        ip: expect.any(String),
        title: expect.any(String),
        lastActiveDate: expect.any(String),
        deviceId: expect.any(String),
      })
    }

    expect(devicesBefore.map(d => d.title).sort()).toEqual(
      ['Chrome', 'Firefox', 'Postman', 'Safari'].sort()
    )
  })

  it('GET -> "/security/devices": should return 401 without refresh token', async () => {
    await request(app)
      .get(`${SECURITY_PATH}`)
      .expect(HttpStatus.Unauthorized_401)
  })

  it('GET -> "/security/devices": should return 401 if refreshToken is invalid', async () => {
    await request(app)
      .get(`${SECURITY_PATH}`)
      .set('Cookie', ['refreshToken=invalid-token'])
      .expect(HttpStatus.Unauthorized_401)
  })

  it('DELETE -> "/security/devices/:deviceId": should return 204 and delete another device of the current user', async () => {
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

    const chromeCookie = response.headers['set-cookie']

    expect(chromeCookie).toBeDefined()
    expect(chromeCookie[0]).toContain('refreshToken=')

    const other = await request(app)
      .post(`${AUTH_PATH}/login`)
      .set('User-Agent', 'Safari')
      .send({
        loginOrEmail: userDto.login,
        password: userDto.password,
      })
      .expect(HttpStatus.Ok_200)

    // Запрашиваем список устройств. Cookie берём именно от chromeCookie, чтобы сервер понял, какой пользователь делает запрос.
      const devicesBeforeResponse = await request(app)
      .get(`${SECURITY_PATH}`)
      .set('Cookie', chromeCookie)
      .expect(HttpStatus.Ok_200)

    const safariDevice = devicesBeforeResponse.body.find(
      (device: any) => device.title === 'Safari',
    )

    expect(safariDevice).toBeDefined()

    await request(app)
      .delete(`${SECURITY_PATH}/${safariDevice.deviceId}`)
      .set('Cookie', chromeCookie)
      .expect(HttpStatus.NoContent_204)

    const devicesAfter = await request(app)
      .get(SECURITY_PATH)
      .set('Cookie', chromeCookie)
      .expect(HttpStatus.Ok_200)

    expect(devicesAfter.body).toHaveLength(1)
    expect(devicesAfter.body[0].title).toBe('Chrome')

  })

  it('DELETE -> "/security/devices/:deviceId": should return 401, without refresh token', async () => {
    await request(app)
      .delete(`${SECURITY_PATH}/some-device-id`)
      .expect(HttpStatus.Unauthorized_401)
  })

  it('DELETE -> "/security/devices/:deviceId": should return 401, if refreshToken is invalid', async () => {
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

    const validCookie = response.headers['set-cookie']

    const devicesResponse = await request(app)
      .get(SECURITY_PATH)
      .set('Cookie', validCookie)
      .expect(HttpStatus.Ok_200)

    const deviceId = devicesResponse.body[0].deviceId

    await request(app)
      .delete(`${SECURITY_PATH}/${deviceId}`)
      .set('Cookie', ['refreshToken=invalid-token'])
      .expect(HttpStatus.Unauthorized_401)
  })

  it('DELETE -> "/security/devices/:deviceId": should return 403, when attempting to delete a device that belongs to another user', async () => {
    const userDtoA = {
      login: 'Natalia',
      password: 'qwerty123',
      email: 'natalia@gmail.com',
    }

    await createUser(app, userDtoA)

    const responseA = await request(app)
      .post(`${AUTH_PATH}/login`)
      .set('User-Agent', 'Chrome')
      .send({
        loginOrEmail: userDtoA.login,
        password: userDtoA.password,
      })
      .expect(HttpStatus.Ok_200)

    const userACookie = responseA.headers['set-cookie']

    const userDtoB = {
      login: 'Natalia123',
      password: 'qwerty123456',
      email: 'natalia123@gmail.com',
    }
    await createUser(app, userDtoB)
    const responseB = await request(app)
      .post(`${AUTH_PATH}/login`)
      .set('User-Agent', 'Chrome')
      .send({
        loginOrEmail: userDtoB.login,
        password: userDtoB.password,
      })
      .expect(HttpStatus.Ok_200)
    const userBCookie = responseB.headers['set-cookie']

    const devicesB = await request(app)
      .get(SECURITY_PATH)
      .set('Cookie', userBCookie)
      .expect(HttpStatus.Ok_200)

    const deviceBId = devicesB.body[0].deviceId

    await request(app)
      .delete(`${SECURITY_PATH}/${deviceBId}`)
      .set('Cookie', userACookie)
      .expect(HttpStatus.Forbidden_403)
  })

  it('DELETE -> "/security/devices/:deviceId": should return 404, if deviceId does not exist', async () => {
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

    const cookie = response.headers['set-cookie']

    expect(cookie).toBeDefined()
    expect(cookie[0]).toContain('refreshToken=')

    // авторизация прошла, но такого deviceId в базе нет → 404
    await request(app)
      .delete(`${SECURITY_PATH}/63189b06003380064c4193be`)
      .set('Cookie', cookie)
      .expect(HttpStatus.NotFound_404)
  })

  it('DELETE -> "/security/devices/:deviceId": should delete specified device using refresh token of current device', async () => {
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

    // Находим первый девайс — тот, который логинился с User-Agent: Chrome.
    const device2 = devicesBefore.find(d => d.title === 'Safari')

    if (!device2) {
      throw new Error('Device 2 was not found')
    }

    // Проверяем, что он реально найден.
    expect(device2).toBeDefined()

    // Сохраняем
    const device2Id = device2.deviceId

    // Отправляем запрос
    await request(app)
      .delete(`${SECURITY_PATH}/${device2Id}`)
      .set('Cookie', device1Cookie)
      .expect(HttpStatus.NoContent_204)

    // Снова запрашиваешь список девайсов через cookie device 1.
    const devicesResponse = await request(app)
      .get(`${SECURITY_PATH}`)
      .set('Cookie', device1Cookie)
      .expect(HttpStatus.Ok_200)

    const devicesAfter: DeviceView[] = devicesResponse.body

    // девайсов стало на 1 меньше
    expect(devicesAfter).toHaveLength(3)

    // device 2 больше нет в списке
    const deletedDevice = devicesAfter.find(d => d.deviceId === device2Id)
    expect(deletedDevice).toBeUndefined()

    // device 1 остался в списке
    const device1 = devicesAfter.find(d => d.title === 'Chrome')
    expect(device1).toBeDefined()

    // остальные девайсы остались
    const device3 = devicesAfter.find(d => d.title === 'Firefox')
    expect(device3).toBeDefined()

    const device4 = devicesAfter.find(d => d.title === 'Postman')
    expect(device4).toBeDefined()

  })

  it('DELETE -> "/security/devices": should delete all other devices except current device', async () => {
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

    const currentDeviceBefore = devicesBefore.find(d => d.title === 'Chrome')

    if (!currentDeviceBefore) {
      throw new Error('Current device was not found')
    }

    const currentDeviceId = currentDeviceBefore.deviceId

    // Отправляем запрос
    await request(app)
      .delete(`${SECURITY_PATH}`)
      .set('Cookie', device1Cookie)
      .expect(HttpStatus.NoContent_204)

    // Снова запрашиваешь список девайсов через cookie device 1.
    const devicesResponse = await request(app)
      .get(`${SECURITY_PATH}`)
      .set('Cookie', device1Cookie)
      .expect(HttpStatus.Ok_200)

    const devicesAfter: DeviceView[] = devicesResponse.body

    // в списке 1 устройство, это устройство Chrome, deviceId совпадает с device 1 до удаления
    expect(devicesAfter).toHaveLength(1)
    expect(devicesAfter[0].deviceId).toBe(currentDeviceId)
    expect(devicesAfter[0].title).toBe('Chrome')

  })

  it('DELETE -> "/security/devices": should return 204 and delete all devices except current', async () => {
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

    const chromeCookie = response.headers['set-cookie']

    expect(chromeCookie).toBeDefined()
    expect(chromeCookie[0]).toContain('refreshToken=')

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

    await request(app)
      .delete(`${SECURITY_PATH}`)
      .set('Cookie', chromeCookie)
      .expect(HttpStatus.NoContent_204)


    const devicesAfter = await request(app)
      .get(`${SECURITY_PATH}`)
      .set('Cookie', chromeCookie)
      .expect(HttpStatus.Ok_200)

    expect(devicesAfter.body).toHaveLength(1)
    expect(devicesAfter.body[0].title).toBe('Chrome')
  })

  it('DELETE -> "/security/devices": should return 401 without refresh token', async () => {
    await request(app)
      .delete(`${SECURITY_PATH}`)
      .expect(HttpStatus.Unauthorized_401)
  })
})