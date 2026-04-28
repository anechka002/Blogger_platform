/// <reference types="jest" />
import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { BLOGS_PATH, TESTING_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
//@ts-ignore
import {createBlog} from "../../utils/blogs/create-blog";
import {runDB, stopDb} from "../../../src/db/mongo.db";
import {SETTINGS} from "../../../src/core/settings/settings";

describe('testing e2e', () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL)
  })

  afterAll(async () => {
    await stopDb()
  })

  beforeEach(async () => {
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent_204);
  });

  it('should remove all data on DELETE /testing/all-data', async () => {
    await createBlog(app);

    const blogsBeforeClear = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(blogsBeforeClear.body).toHaveLength(1);

    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent_204);

    const blogsAfterClear = await request(app)
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok_200);

    expect(blogsAfterClear.body).toEqual([]);
  });
});
