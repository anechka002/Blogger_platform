import { Router, Request, Response } from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {blogCollection, postCollection} from "../../db/mongo.db";

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  await Promise.all([
    blogCollection.deleteMany({}),
    postCollection.deleteMany({}),
  ])
  res.sendStatus(HttpStatus.NoContent_204);
});