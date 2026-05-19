import { Router, Request, Response } from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {db} from "../../db/mongo.db";

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  const { blogCollection, postCollection, userCollection } = db.getCollections();
  await Promise.all([
    blogCollection.deleteMany({}),
    postCollection.deleteMany({}),
    userCollection.deleteMany({}),
  ])
  res.sendStatus(HttpStatus.NoContent_204);
});