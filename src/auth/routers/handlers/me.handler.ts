import { Response } from 'express'
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithUserId} from "../../../core/types/request-types";
import {
  usersQueryRepository
} from "../../../users/repositories/users.query.repository";
import {IMeView} from "../../types/me.view";

export const meHandler = async (req: RequestWithUserId, res: Response<IMeView>) => {
  const userId = req.user?.userId
  if (!userId) {
    return res.sendStatus(HttpStatus.Unauthorized_401)
  }

  const me = await usersQueryRepository.findMeById(userId);
  if (!me) {
    return res.sendStatus(HttpStatus.Unauthorized_401);
  }

  return res.status(HttpStatus.Ok_200).send(me)
}
