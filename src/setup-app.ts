import express, { Express } from "express";
import {blogsRouter} from "./blogs/routers/blogs.router";
import {BLOGS_PATH} from "./core/path/path";

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get("/", (req, res) => {
    res.status(200).send("Hello Anna!");
  });

  // Подключаем роутеры
  app.use(BLOGS_PATH, blogsRouter);

  return app;
};