import {SETTINGS} from "../../../src/core/settings/settings";
import express from "express";
import {setupApp} from "../../../src/setup-app";
import {db} from "../../../src/db/mongo.db";
import {clearDb} from "../../utils/clear-db";
import {loginUser} from "../../utils/users/login-user";
import {createComment} from "../../utils/comments/create-comments";
import request from "supertest";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {
  createPostForComments
} from "../../utils/comments/create-post-for-comments";
import {container} from "../../../src/composition-root";
import {NodemailerService} from "../../../src/auth/adapters/nodemailer.service";

describe('Comments like-status e2e', () => {
  const app = express()
  setupApp(app)

  const nodemailerService = container.get(NodemailerService)

  beforeAll(async () => {
    await db.run(SETTINGS.MONGO_URL)
  })

  beforeEach(async () => {
    await clearDb(app)

    jest
      .spyOn(nodemailerService, 'sendEmail')
      .mockResolvedValue(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await db.stop()
  })

  const userDto = {
    login: 'Natalia',
    password: 'qwerty123',
    email: 'natalia@gmail.com',
  }

  // Авторизованный пользователь может поставить Like. Ответ должен быть 204.
  it('PUT -> "/comments/:commentId/like-status": should update likeStatus to Like; status 204', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const createdComment = await createComment(app, post.id, accessToken)

    await request(app)
      .put(`/comments/${createdComment.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NoContent_204)
  })

  // После Like GET comment возвращает likesCount: 1 и myStatus: "Like"
  it('GET -> "/comments/:commentId": should return likesCount 1 and myStatus Like after user liked comment', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const createdComment = await createComment(app, post.id, accessToken)

    await request(app)
      .put(`/comments/${createdComment.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/comments/${createdComment.id}`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    expect(response.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: 'Like',
    })
  })

  // Пользователь меняет Like на Dislike → likesCount: 0, dislikesCount: 1, myStatus: "Dislike"
  it('PUT -> "/comments/:commentId/like-status": should change Like to Dislike', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const comment = await createComment(app, post.id, accessToken)

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NoContent_204)

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'Dislike',
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/comments/${comment.id}`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    expect(response.body.likesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 1,
      myStatus: 'Dislike',
    })
  })

  // Пользователь убирает реакцию через None → likesCount: 0, dislikesCount: 0, myStatus: "None"
  it('PUT -> "/comments/:commentId/like-status": should remove reaction when user sends None', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const comment = await createComment(app, post.id, accessToken)

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NoContent_204)

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'None',
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/comments/${comment.id}`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    expect(response.body.likesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    })
  })

  // Неавторизованный пользователь не может поставить Like → 401
  it('PUT -> "/comments/:commentId/like-status": should return 401 if user is not authorized', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const comment = await createComment(app, post.id, accessToken)

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.Unauthorized_401)
  })

  // Невалидный likeStatus → 400
  it('PUT -> "/comments/:commentId/like-status": should return 400 if likeStatus is invalid', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const comment = await createComment(app, post.id, accessToken)

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'WrongStatus',
      })
      .expect(HttpStatus.BadRequest_400)
  })

  // Like на несуществующий commentId → 404
  it('PUT -> "/comments/:commentId/like-status": should return 404 if comment does not exist', async () => {
    const accessToken = await loginUser(app, userDto)

    await request(app)
      .put('/comments/507f1f77bcf86cd799439011/like-status')
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NotFound_404)
  })

  // Два пользователя лайкают один комментарий → likesCount: 2
  it('GET -> "/comments/:commentId": should return likesCount 2 when two users liked comment', async () => {
    const firstUserAccessToken = await loginUser(app, userDto)

    const secondUserDto = {
      login: 'Alex',
      password: 'qwerty123',
      email: 'alex@gmail.com',
    }

    const secondUserAccessToken = await loginUser(app, secondUserDto)

    const { post } = await createPostForComments(app)
    const comment = await createComment(app, post.id, firstUserAccessToken)

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set('Authorization', firstUserAccessToken)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NoContent_204)

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set('Authorization', secondUserAccessToken)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/comments/${comment.id}`)
      .set('Authorization', firstUserAccessToken)
      .expect(HttpStatus.Ok_200)

    expect(response.body.likesInfo).toEqual({
      likesCount: 2,
      dislikesCount: 0,
      myStatus: 'Like',
    })
  })

  // GET без токена → counts видны, myStatus: "None"
  it('GET -> "/comments/:commentId": should return myStatus None for unauthorized user but keep likesCount', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)
    const comment = await createComment(app, post.id, accessToken)

    await request(app)
      .put(`/comments/${comment.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'Like',
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/comments/${comment.id}`)
      .expect(HttpStatus.Ok_200)

    expect(response.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: 'None',
    })
  })
})
