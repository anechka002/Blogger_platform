import {AUTH_PATH} from "../../../src/core/paths/paths";
import {createUser} from "./create-user";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import request from "supertest";
import {Express} from "express";

export const loginUser = async (app: Express, userDto: {
  login: string
  password: string
  email: string
}) => {
  await createUser(app, userDto)

  const response = await request(app)
    .post(`${AUTH_PATH}/login`)
    .send({
      loginOrEmail: userDto.login,
      password: userDto.password,
    })
    .expect(HttpStatus.Ok_200)

  return `Bearer ${response.body.accessToken}`
}