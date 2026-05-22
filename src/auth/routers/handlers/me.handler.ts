import { Response } from 'express'
import {errorsHandler} from "../../../core/errors/errors.handler";
import {HttpStatus} from "../../../core/types/http-statuses";
import {RequestWithUserId} from "../../../core/types/request-types";
import {
  usersQueryRepository
} from "../../../users/repositories/users.query.repository";
import {IMeView} from "../../types/me.view";

export const meHandler = async (req: RequestWithUserId, res: Response<IMeView>) => {
  try {
    const userId = req.user?.userId
    if (!userId) {
      return res.sendStatus(HttpStatus.Unauthorized_401)
    }

    const me = await usersQueryRepository.findMeById(userId);
    if (!me) {
      return res.sendStatus(HttpStatus.Unauthorized_401);
    }

    res.status(HttpStatus.Ok_200).send(me)
  } catch(error: unknown) {
    errorsHandler(error, res)
  }
}
