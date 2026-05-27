import { Router, Request, Response } from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {db} from "../../db/mongo.db";

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  try {
    const { blogCollection, postCollection, userCollection, commentCollection } = db.getCollections();
    await Promise.all([
      blogCollection.deleteMany({}),
      postCollection.deleteMany({}),
      userCollection.deleteMany({}),
      commentCollection.deleteMany({}),
    ])
    res.sendStatus(HttpStatus.NoContent_204);
  } catch (error) {
    console.error('Error in DELETE /testing/all-data:', error);
    res.sendStatus(HttpStatus.InternalServerError_500);
  }
});