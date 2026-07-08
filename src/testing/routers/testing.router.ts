import { Router, Request, Response } from 'express';
import {HttpStatus} from "../../core/types/http-statuses";
import {UserModel} from "../../users/domain/user.entity";
import {DeviceModel} from "../../devices/domain/device.entity";
import {ApiRequestLogModel} from "../../auth/domain/api-request-log.entity";
import {BlogModel} from "../../blogs/domain/blog.entity";
import {PostModel} from "../../posts/domain/post.entity";
import {CommentModel} from "../../comments/domain/comment.entity";

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  try {
    await Promise.all([
      UserModel.deleteMany({}),
      DeviceModel.deleteMany({}),
      ApiRequestLogModel.deleteMany({}),
      BlogModel.deleteMany({}),
      PostModel.deleteMany({}),
      CommentModel.deleteMany({}),
    ])
    res.sendStatus(HttpStatus.NoContent_204);
  } catch (error) {
    console.error('Error in DELETE /testing/all-data:', error);
    res.sendStatus(HttpStatus.InternalServerError_500);
  }
});