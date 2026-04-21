import express, { Express } from "express";
import {blogsRouter} from "./blogs/routers/blogs.router";
import {BLOGS_PATH, POSTS_PATH} from "./core/path/path";
import {postsRouter} from "./posts/routers/posts.router";

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get("/", (req, res) => {
    res.status(200).send("Hello world!");
  });

  // Подключаем роутеры
  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);

  return app;
};