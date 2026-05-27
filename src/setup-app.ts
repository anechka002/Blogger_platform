import express, { Express } from "express";
import {blogsRouter} from "./blogs/routers/blogs.router";
import {
  AUTH_PATH,
  BLOGS_PATH, COMMENTS_PATH,
  POSTS_PATH,
  TESTING_PATH,
  USERS_PATH
} from "./core/paths/paths";
import {postsRouter} from "./posts/routers/posts.router";
import {setupSwagger} from "./core/swagger/setup-swagger";
import {testingRouter} from "./testing/routers/testing.router";
import {usersRouter} from "./users/routers/users.router";
import {authRouter} from "./auth/routers/auth.router";
import {commentsRouter} from "./comments/routers/comments.router";

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get("/", (req, res) => {
    res.status(200).send("Hello world!");
  });

  // app.use((req, res, next) => {
  //   console.log(req.method, req.path)
  //   next()
  // })

  // Подключаем роутеры
  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(USERS_PATH, usersRouter);
  app.use(AUTH_PATH, authRouter);
  app.use(COMMENTS_PATH, commentsRouter);
  app.use(TESTING_PATH, testingRouter);

  setupSwagger(app);

  return app;
};
