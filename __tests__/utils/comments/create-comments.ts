import {POSTS_PATH} from "../../../src/core/paths/paths";
import request from "supertest";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {Express} from "express";

export const createComment = async (app: Express, postId: string, accessToken: string, content = 'This is valid comment content for test') => {
  const response = await request(app)
    .post(`${POSTS_PATH}/${postId}/comments`)
    .set('Authorization', accessToken)
    .send({content})
    .expect(HttpStatus.Created_201)

  return response.body
}