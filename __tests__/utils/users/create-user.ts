import request from 'supertest'
import { Express } from 'express'
import { USERS_PATH } from '../../../src/core/paths/paths'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { generateBasicAuthToken } from '../generate-admin-auth-token'

export const createUser = async (
  app: Express,
  userDto = {
    login: 'Natalia',
    password: 'Qwerty123!',
    email: 'natalia@gmail.com',
  }
) => {
  const adminAuth = generateBasicAuthToken()

  const response = await request(app)
    .post(USERS_PATH)
    .set('Authorization', adminAuth)
    .send(userDto)
    .expect(HttpStatus.Created_201)

  return response.body
}