import request from 'supertest'
import { Express } from 'express'
import {AUTH_PATH} from "../../../src/core/paths/paths";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {db} from "../../../src/db/mongo.db";

export const registerUser = async (app: Express, userDto: {
  login: string
  password: string
  email: string
}) => {
  await request(app)
    .post(`${AUTH_PATH}/registration`)
    .send(userDto)
    .expect(HttpStatus.NoContent_204)

  const user = await db.getCollections().userCollection.findOne({
    email: userDto.email,
  })

  return user
}