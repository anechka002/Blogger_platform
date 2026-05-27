/// <reference types="jest" />

import request from 'supertest'
import express from 'express'
import { setupApp } from '../../../src/setup-app'
import { db } from '../../../src/db/mongo.db'
import { SETTINGS } from '../../../src/core/settings/settings'
import { HttpStatus } from '../../../src/core/types/http-statuses'
import { POSTS_PATH, COMMENTS_PATH } from '../../../src/core/paths/paths'
import { clearDb } from '../../utils/clear-db'
import { loginUser } from '../../utils/users/login-user'
import {createComment} from "../../utils/comments/create-comments";
import {
  createPostForComments
} from "../../utils/comments/create-post-for-comments";

describe('Comments body validation', () => {
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

  const userDto = {
    login: 'Natalia',
    password: 'qwerty123',
    email: 'natalia@gmail.com',
  }

  it('PUT -> "/comments/:commentId": should return 400 if body is incorrect', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const createdComment = await createComment(app, post.id, accessToken)

    const response = await request(app)
      .put(`${COMMENTS_PATH}/${createdComment.id}`)
      .set('Authorization', accessToken)
      .send({
        content: 'short',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: expect.any(String),
        },
      ],
    })
  })

  it('POST -> "/posts/:postId/comments": should return 400 if content is empty', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const response = await request(app)
      .post(`${POSTS_PATH}/${post.id}/comments`)
      .set('Authorization', accessToken)
      .send({
        content: '',
      })
      .expect(HttpStatus.BadRequest_400);

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: expect.any(String),
        },
      ],
    });
  });

  it('POST -> "/posts/:postId/comments": should return 400 if content is too short', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const response = await request(app)
      .post(`${POSTS_PATH}/${post.id}/comments`)
      .set('Authorization', accessToken)
      .send({
        content: 'short',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: expect.any(String),
        },
      ],
    })
  })

  it('POST -> "/posts/:postId/comments": should return 400 if content is too long', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const response = await request(app)
      .post(`${POSTS_PATH}/${post.id}/comments`)
      .set('Authorization', accessToken)
      .send({
        content: 'a'.repeat(301),
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: expect.any(String),
        },
      ],
    })
  })

  it('PUT -> "/comments/:commentId": should return 400 if content is empty', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const comment = await createComment(app, post.id, accessToken)

    const response = await request(app)
      .put(`${COMMENTS_PATH}/${comment.id}`)
      .set('Authorization', accessToken)
      .send({
        content: '',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: expect.any(String),
        },
      ],
    })
  })

  it('PUT -> "/comments/:commentId": should return 400 if content is too short', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const comment = await createComment(app, post.id, accessToken)

    const response = await request(app)
      .put(`${COMMENTS_PATH}/${comment.id}`)
      .set('Authorization', accessToken)
      .send({
        content: 'short',
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: expect.any(String),
        },
      ],
    })
  })

  it('PUT -> "/comments/:commentId": should return 400 if content is too long', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const comment = await createComment(app, post.id, accessToken)

    const response = await request(app)
      .put(`${COMMENTS_PATH}/${comment.id}`)
      .set('Authorization', accessToken)
      .send({
        content: 'a'.repeat(301),
      })
      .expect(HttpStatus.BadRequest_400)

    expect(response.body).toEqual({
      errorsMessages: [
        {
          field: 'content',
          message: expect.any(String),
        },
      ],
    })
  })

})