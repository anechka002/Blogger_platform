/// <reference types="jest" />

import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import { setupApp } from '../../../src/setup-app';
import {BLOGS_PATH, POSTS_PATH} from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { clearDb } from '../../utils/clear-db';
import { createBlog } from '../../utils/blogs/create-blog';
import { generateBasicAuthToken } from '../../utils/generate-admin-auth-token';
import { db } from '../../../src/db/mongo.db';
import { createPostForBlog } from '../../utils/blogs/create-post-for-blog';
import { getBlogPosts } from '../../utils/blogs/get-blog-posts';
import { PostSortField } from '../../../src/posts/routers/input/post-sort-field';
import { SortDirectionEnum } from '../../../src/core/types/sort-direction';
import {LikeStatus} from "../../../src/core/enum/like-status.enum";
import {PostViewDto} from "../../../src/posts/dto/postViewDto";
import {createPost} from "../../utils/posts/create-post";
import {loginUser} from "../../utils/users/login-user";

dotenv.config();

describe('blog posts e2e', () => {
  const app = express();
  setupApp(app);

  const adminAuth = generateBasicAuthToken();

  beforeAll(async () => {
    await db.run(process.env.MONGO_URL!);
  });

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await clearDb(app);
  });

  it('POST -> "/blogs/:blogId/posts": should create new post for existing blog; status 201', async () => {
    const createdBlog = await createBlog(app);

    const createdPost = await createPostForBlog(app, createdBlog.id, {
      title: 'New post',
      shortDescription: 'new post description',
      content: 'new post content',
    });

    expect(createdPost).toEqual({
      id: expect.any(String),
      title: 'New post',
      shortDescription: 'new post description',
      content: 'new post content',
      blogId: createdBlog.id,
      blogName: createdBlog.name,
      createdAt: expect.any(String),
      extendedLikesInfo: {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: 'None',
        newestLikes: []
      }
    });
  });

  it('POST -> "/blogs/:blogId/posts": should return 404 if blog does not exist', async () => {
    const nonExistingBlogId = new ObjectId().toString();

    await request(app)
      .post(`${BLOGS_PATH}/${nonExistingBlogId}/posts`)
      .set('Authorization', adminAuth)
      .send({
        title: 'New post',
        shortDescription: 'new post description',
        content: 'new post content',
      })
      .expect(HttpStatus.NotFound_404);
  });

  it('POST -> "/blogs/:blogId/posts": should return 400 if body is invalid', async () => {
    const createdBlog = await createBlog(app);

    await request(app)
      .post(`${BLOGS_PATH}/${createdBlog.id}/posts`)
      .set('Authorization', adminAuth)
      .send({
        title: '',
        shortDescription: '',
        content: '',
      })
      .expect(HttpStatus.BadRequest_400);
  });

  it('POST -> "/blogs/:blogId/posts": should return 401 without Authorization', async () => {
    const createdBlog = await createBlog(app);

    await request(app)
      .post(`${BLOGS_PATH}/${createdBlog.id}/posts`)
      .send({
        title: 'New post',
        shortDescription: 'new post description',
        content: 'new post content',
      })
      .expect(HttpStatus.Unauthorized_401);
  });

  it('GET -> "/blogs/:blogId/posts": should return posts pagination for specified blog only', async () => {
    const firstBlog = await createBlog(app, {
      name: 'First blog',
      description: 'first blog description',
      websiteUrl: 'https://first-blog.com',
    });
    const secondBlog = await createBlog(app, {
      name: 'Second blog',
      description: 'second blog description',
      websiteUrl: 'https://second-blog.com',
    });
    const firstBlogPost = await createPostForBlog(app, firstBlog.id, {
      title: 'First blog post',
    });

    await createPostForBlog(app, secondBlog.id, {
      title: 'Second blog post',
    });

    const response = await getBlogPosts(app, firstBlog.id);

    expect(response).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: [firstBlogPost],
    });
    expect(response.items.every((post) => post.blogId === firstBlog.id)).toBe(true);
  });

  it('GET -> "/blogs/:blogId/posts": should return 404 if blog does not exist', async () => {
    const nonExistingBlogId = new ObjectId().toString();

    await request(app)
      .get(`${BLOGS_PATH}/${nonExistingBlogId}/posts`)
      .expect(HttpStatus.NotFound_404);
  });

  it('GET -> "/blogs/:blogId/posts": should apply pageNumber and pageSize', async () => {
    const createdBlog = await createBlog(app);
    const firstPost = await createPostForBlog(app, createdBlog.id, {
      title: 'Post 01',
    });
    const secondPost = await createPostForBlog(app, createdBlog.id, {
      title: 'Post 02',
    });
    const thirdPost = await createPostForBlog(app, createdBlog.id, {
      title: 'Post 03',
    });

    const response = await getBlogPosts(app, createdBlog.id, {
      pageNumber: 2,
      pageSize: 2,
      sortBy: PostSortField.Title,
      sortDirection: SortDirectionEnum.Asc,
    });

    expect(response).toEqual({
      pagesCount: 2,
      page: 2,
      pageSize: 2,
      totalCount: 3,
      items: [thirdPost],
    });
    expect([firstPost.id, secondPost.id]).not.toContain(response.items[0].id);
  });

  it('GET -> "/blogs/:blogId/posts": should apply sortBy and sortDirection', async () => {
    const createdBlog = await createBlog(app);
    await createPostForBlog(app, createdBlog.id, { title: 'Beta post' });
    await createPostForBlog(app, createdBlog.id, { title: 'Alpha post' });
    await createPostForBlog(app, createdBlog.id, { title: 'Gamma post' });

    const ascResponse = await getBlogPosts(app, createdBlog.id, {
      sortBy: PostSortField.Title,
      sortDirection: SortDirectionEnum.Asc,
    });

    expect(ascResponse.items.map((post) => post.title)).toEqual([
      'Alpha post',
      'Beta post',
      'Gamma post',
    ]);

    const descResponse = await getBlogPosts(app, createdBlog.id, {
      sortBy: PostSortField.Title,
      sortDirection: SortDirectionEnum.Desc,
    });

    expect(descResponse.items.map((post) => post.title)).toEqual([
      'Gamma post',
      'Beta post',
      'Alpha post',
    ]);
  });

  // GET /blogs/:blogId/posts
  it('GET -> "/blogs/:blogId/posts": should return extended posts', async () => {
    const accessToken = await loginUser(app, {
      login: 'Natalia',
      email: 'natalia@gmail.com',
      password: 'qwerty123',
    })

    const blog = await createBlog(app)
    const post = await createPost(app, blog.id)

    await request(app)
      .put(`${POSTS_PATH}/${post.id}/like-status`)
      .set('Authorization', accessToken)
      .send({
        likeStatus: LikeStatus.Like,
      })
      .expect(HttpStatus.NoContent_204)

    const response = await request(app)
      .get(`${BLOGS_PATH}/${blog.id}/posts`)
      .set('Authorization', accessToken)
      .expect(HttpStatus.Ok_200)

    const foundPost = response.body.items.find(
      (item: PostViewDto) => item.id === post.id,
    )

    expect(foundPost).toBeDefined()

    expect(foundPost.extendedLikesInfo).toMatchObject({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LikeStatus.Like,
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
});
