import express from "express";
import {setupApp} from "../../../src/setup-app";
import {container} from "../../../src/composition-root";
import {NodemailerService} from "../../../src/auth/adapters/nodemailer.service";
import {db} from "../../../src/db/mongo.db";
import {SETTINGS} from "../../../src/core/settings/settings";
import {clearDb} from "../../utils/clear-db";
import {loginUser} from "../../utils/users/login-user";
import {
  createPostForComments
} from "../../utils/comments/create-post-for-comments";
import request from "supertest";
import {HttpStatus} from "../../../src/core/types/http-statuses";
import {LikeStatus} from "../../../src/core/enum/like-status.enum";
import {AUTH_PATH, POSTS_PATH} from "../../../src/core/paths/paths";
import {createPost} from "../../utils/posts/create-post";
import {createBlog} from "../../utils/blogs/create-blog";
import {PostViewDto} from "../../../src/posts/dto/postViewDto";

describe('Posts like-status e2e', () => {
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
  it('PUT -> "/posts/:postId/like-status": should update likeStatus to Like; status 204', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NoContent_204)
  })

  // После Like GET post возвращает likesCount: 1 и myStatus: "Like"
  it('GET -> "/posts/:postId": should return likesCount 1 and myStatus Like after user liked comment', async () => {
    const accessToken = await loginUser(app, userDto)

    const meResponse = await request(app)
      .get(`${AUTH_PATH}/me`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    const userId = meResponse.body.userId

    const { post } = await createPostForComments(app)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/posts/${post.id}`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    expect(response.body.extendedLikesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.Like,
      newestLikes: [
        {
          addedAt: expect.any(String),
          userId,
          login: userDto.login,
        }
      ]
    })
  })

  // Пользователь меняет Like на Dislike → likesCount: 0, dislikesCount: 1, myStatus: "Dislike"
  it('PUT -> "/posts/:postId/like-status": should change Like to Dislike', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NoContent_204)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Dislike,
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/posts/${post.id}`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    expect(response.body.extendedLikesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 1,
      myStatus: LikeStatus.Dislike,
      newestLikes: []
    })
  })

  // Пользователь убирает реакцию через None → likesCount: 0, dislikesCount: 0, myStatus: "None"
  it('PUT -> "/posts/:postId/like-status": should remove reaction when user sends None', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NoContent_204)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.None,
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/posts/${post.id}`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    expect(response.body.extendedLikesInfo).toEqual({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: []
    })
  })

  // Неавторизованный пользователь не может поставить Like → 401
  it('PUT -> "/posts/:postId/like-status": should return 401 if user is not authorized', async () => {
    const { post } = await createPostForComments(app)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.Unauthorized_401)
  })

  // Невалидный likeStatus → 400
  it('PUT -> "/comments/:commentId/like-status": should return 400 if likeStatus is invalid', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: 'WrongStatus',
      })
      .expect(HttpStatus.BadRequest_400)
  })

  // Like на несуществующий postId → 404
  it('PUT -> "/posts/:postId/like-status": should return 404 if post does not exist', async () => {
    const accessToken = await loginUser(app, userDto)

    await request(app)
      .put('/posts/507f1f77bcf86cd799439011/like-status')
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NotFound_404)
  })

  // Два пользователя лайкают один post → likesCount: 2
  it('GET -> "/posts/:postId": should return likesCount 2 when two users liked post', async () => {
    const firstUserAccessToken = await loginUser(app, userDto)

    const secondUserDto = {
      login: 'Alex',
      password: 'qwerty123',
      email: 'alex@gmail.com',
    }

    const secondUserAccessToken = await loginUser(app, secondUserDto)

    const { post } = await createPostForComments(app)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', firstUserAccessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NoContent_204)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', secondUserAccessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/posts/${post.id}`)
      .set('Authorization', firstUserAccessToken)
      .expect(HttpStatus.Ok_200)

    expect(response.body.extendedLikesInfo).toEqual({
      likesCount: 2,
      dislikesCount: 0,
      myStatus: LikeStatus.Like,
      newestLikes: [
        {
          addedAt: expect.any(String),
          login: secondUserDto.login,
          userId: expect.any(String),
        },
        {
          addedAt: expect.any(String),
          login: userDto.login,
          userId: expect.any(String),
        },
      ]
    })
  })

  // GET без токена → counts видны, myStatus: "None"
  it('GET -> "/posts/:postId": should return myStatus None for unauthorized user but keep likesCount', async () => {
    const accessToken = await loginUser(app, userDto)
    const { post } = await createPostForComments(app)

    await request(app)
      .put(`/posts/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`/posts/${post.id}`)
      .expect(HttpStatus.Ok_200)

    expect(response.body.extendedLikesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [
        {
          addedAt: expect.any(String),
          login: userDto.login,
          userId: expect.any(String),
        }
      ]
    })
  })

  it('PUT -> "/posts/:postId/like-status": should increase dislikesCount after None -> Dislike', async () => {
    const accessToken = await loginUser(app, userDto)

    const blog = await createBlog(app)

    const post = await createPost(
      app,
      blog.id,
    )

    /*
     * У пользователя ещё нет реакции.
     *
     * None → Dislike
     */
    await request(app)
      .put(`${POSTS_PATH}/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Dislike,
      })
      .expect(HttpStatus.NoContent_204)

    /*
     * Получаем пост от имени того же пользователя,
     * чтобы проверить и счётчики, и myStatus.
     */
    const response = await request(app)
      .get(`${POSTS_PATH}/${post.id}`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    expect(
      response.body.extendedLikesInfo,
    ).toStrictEqual({
      likesCount: 0,
      dislikesCount: 1,
      myStatus: LikeStatus.Dislike,
      newestLikes: [],
    })
  })

  // GET /posts без авторизации
  it('GET -> "/posts": should return posts with extendedLikesInfo', async () => {
    const blog = await createBlog(app)
    const post = await createPost(app, blog.id)

    const response = await request(app)
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok_200)

    expect(response.body.items).toHaveLength(1)

    expect(response.body.items[0]).toStrictEqual({
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,

      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    })
  })

  //GET /posts с авторизацией
  it('GET -> "/posts": should return current user myStatus', async () => {
    const accessToken = await loginUser(app, userDto)

    const blog = await createBlog(app)
    const post = await createPost(app, blog.id)

    await request(app)
      .put(`${POSTS_PATH}/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Dislike,
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(POSTS_PATH)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    const foundPost = response.body.items.find(
      (item: PostViewDto) => item.id === post.id,
    )

    expect(foundPost).toBeDefined()

    expect(foundPost.extendedLikesInfo).toStrictEqual({
      likesCount: 0,
      dislikesCount: 1,
      myStatus: LikeStatus.Dislike,
      newestLikes: [],
    })
  })

  // GET /posts без авторизации после чужого лайка
  it('GET -> "/posts": without token should keep likes data but return myStatus None', async () => {
    const accessToken = await loginUser(app, userDto)

    const blog = await createBlog(app)
    const post = await createPost(app, blog.id)

    await request(app)
      .put(`${POSTS_PATH}/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NoContent_204)

    /*
     * GET отправляем без Authorization.
     */
    const response = await request(app)
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok_200)

    const foundPost = response.body.items.find(
      (item: PostViewDto) => item.id === post.id,
    )

    expect(foundPost.extendedLikesInfo).toMatchObject({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
    })

    expect(
      foundPost.extendedLikesInfo.newestLikes,
    ).toHaveLength(1)

    expect(
      foundPost.extendedLikesInfo.newestLikes[0],
    ).toMatchObject({
      login: 'Natalia',
    })
  })

  // Проверка последних трёх лайков
  it('GET -> "/posts": should return only three newest likes', async () => {
    const user1Token = await loginUser(app, {
      login: 'UserOne',
      email: 'user1@gmail.com',
      password: 'qwerty123',
    })

    const user2Token = await loginUser(app, {
      login: 'UserTwo',
      email: 'user2@gmail.com',
      password: 'qwerty123',
    })

    const user3Token = await loginUser(app, {
      login: 'UserThree',
      email: 'user3@gmail.com',
      password: 'qwerty123',
    })

    const user4Token = await loginUser(app, {
      login: 'UserFour',
      email: 'user4@gmail.com',
      password: 'qwerty123',
    })

    const blog = await createBlog(app)
    const post = await createPost(app, blog.id)

    for (const token of [
      user1Token,
      user2Token,
      user3Token,
      user4Token,
    ]) {
      await request(app)
        .put(`${POSTS_PATH}/${post.id}/like-status`)
        .set('Authorization', token)
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(HttpStatus.NoContent_204)
    }

    const response = await request(app)
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok_200)

    const foundPost = response.body.items.find(
      (item: PostViewDto) => item.id === post.id,
    )

    expect(foundPost.extendedLikesInfo.likesCount).toBe(4)

    expect(
      foundPost.extendedLikesInfo.newestLikes,
    ).toHaveLength(3)

    expect(
      foundPost.extendedLikesInfo.newestLikes.map(
        (like: { login: string }) => like.login,
      ),
    ).toStrictEqual([
      'UserFour',
      'UserThree',
      'UserTwo',
    ])
  })

})