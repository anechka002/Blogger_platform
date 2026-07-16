/// <reference types="jest" />

import request from 'supertest'
import express from 'express'
import { ObjectId } from 'mongodb'
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
import {LikeStatus} from "../../../src/comments/domain/like-status.enum";

describe('Comments for posts with auth', () => {
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

  const secondUserDto = {
    login: 'Alexandr',
    password: 'qwerty123',
    email: 'alex@gmail.com',
  }

  const validCommentBody = {
    content: 'This is valid comment content for test',
  }

  it('POST -> "/posts/:postId/comments": should create new comment; status 201', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const createdComment = await createComment(app, post.id, accessToken)

    expect(createdComment).toEqual({
      id: expect.any(String),
      content: validCommentBody.content,
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: userDto.login,
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      }
    })

    const foundComment = await request(app)
      .get(`${COMMENTS_PATH}/${createdComment.id}`)
      .expect(HttpStatus.Ok_200)

    expect(foundComment.body).toEqual(createdComment)
  })

  it('GET -> "/posts/:postId/comments": should return comments with pagination; status 200', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const comment1 = await createComment(app, post.id, accessToken)
    const comment2 = await createComment(app, post.id, accessToken)

    const response = await request(app)
      .get(`${POSTS_PATH}/${post.id}/comments`)
      .expect(HttpStatus.Ok_200)

    expect(response.body.pagesCount).toBe(1)
    expect(response.body.totalCount).toBe(2)
    expect(response.body.items).toHaveLength(2)

    expect(response.body.items).toHaveLength(2)
    expect(response.body.items).toEqual(
      expect.arrayContaining([comment1, comment2])
    )
  })

  it('GET -> "/comments/:id": should return comment by id; status 200', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const createdComment = await createComment(app, post.id, accessToken)

    const response = await request(app)
      .get(`${COMMENTS_PATH}/${createdComment.id}`)
      .expect(HttpStatus.Ok_200)

    expect(response.body).toEqual(createdComment)
  })

  it('PUT -> "/comments/:commentId": should update comment by id; status 204', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const createdComment = await createComment(app, post.id, accessToken)

    const updateBody = {
      content: 'This is updated comment content',
    }

    await request(app)
      .put(`${COMMENTS_PATH}/${createdComment.id}`)
      .set('Authorization', accessToken)
      .send(updateBody)
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`${COMMENTS_PATH}/${createdComment.id}`)
      .expect(HttpStatus.Ok_200)

    expect(response.body).toEqual({
      ...createdComment,
      content: updateBody.content,
    })
  })

  it('DELETE -> "/comments/:id": should delete comment by id; status 204', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const createdComment = await createComment(app, post.id, accessToken)

    await request(app)
      .delete(`${COMMENTS_PATH}/${createdComment.id}`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.NoContent_204)

    await request(app)
      .get(`${COMMENTS_PATH}/${createdComment.id}`)
      .expect(HttpStatus.NotFound_404)
  })

  it('DELETE, PUT -> "/comments/:id", GET, POST -> "/posts/:postId/comments": should return 404 if id not found', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const nonExistingCommentId = new ObjectId().toString()
    const nonExistingPostId = new ObjectId().toString()

    await request(app)
      .get(`${COMMENTS_PATH}/${nonExistingCommentId}`)
      .expect(HttpStatus.NotFound_404)

    await request(app)
      .put(`${COMMENTS_PATH}/${nonExistingCommentId}`)
      .set('Authorization', accessToken)
      .send(validCommentBody)
      .expect(HttpStatus.NotFound_404)

    await request(app)
      .delete(`${COMMENTS_PATH}/${nonExistingCommentId}`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.NotFound_404)

    await request(app)
      .get(`${POSTS_PATH}/${nonExistingPostId}/comments`)
      .expect(HttpStatus.NotFound_404)

    await request(app)
      .post(`${POSTS_PATH}/${nonExistingPostId}/comments`)
      .set('Authorization', accessToken)
      .send(validCommentBody)
      .expect(HttpStatus.NotFound_404)
  })

  it('DELETE, PUT -> "/comments/:id", POST -> "/posts/:postId/comments": should return 401 if auth is incorrect', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    const createdComment = await createComment(app, post.id, accessToken)

    await request(app)
      .post(`${POSTS_PATH}/${post.id}/comments`)
      .send(validCommentBody)
      .expect(HttpStatus.Unauthorized_401)

    await request(app)
      .put(`${COMMENTS_PATH}/${createdComment.id}`)
      .send(validCommentBody)
      .expect(HttpStatus.Unauthorized_401)

    await request(app)
      .delete(`${COMMENTS_PATH}/${createdComment.id}`)
      .expect(HttpStatus.Unauthorized_401)
  })

  it('PUT, DELETE -> "/comments/:id": should return 403 if access denied', async () => {
    const firstUserToken = await loginUser(app, userDto)
    const secondUserToken = await loginUser(app, secondUserDto)

    const { post } = await createPostForComments(app)

    const createdComment = await createComment(app, post.id, firstUserToken)

    await request(app)
      .put(`${COMMENTS_PATH}/${createdComment.id}`)
      .set('Authorization', secondUserToken)
      .send({
        content: 'Trying to update not my own comment',
      })
      .expect(HttpStatus.Forbidden_403)

    await request(app)
      .delete(`${COMMENTS_PATH}/${createdComment.id}`)
      .set('Authorization', secondUserToken)
      .expect(HttpStatus.Forbidden_403)
  })

})