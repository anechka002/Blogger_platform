import request from 'supertest';
import { Express } from 'express';
import { HttpStatus } from '../../src/core/types/http-statuses';
import {TESTING_PATH} from "../../src/core/paths/paths";

export async function clearDb(app: Express) {
  await request(app)
    .delete(`${TESTING_PATH}/all-data`)
    .expect(HttpStatus.NoContent_204);
  return;
}