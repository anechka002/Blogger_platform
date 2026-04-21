import { Router, Request, Response } from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {db} from "../../db/in-memory.db";

export const testingRouter = Router({});

testingRouter.delete('/all-data', (req: Request, res: Response) => {
  db.blogs = [];
  res.sendStatus(HttpStatus.NoContent_204);
});