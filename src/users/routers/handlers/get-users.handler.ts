import { Request, Response } from 'express';
import {PaginationOutput} from "../../../core/types/pagination.output";
import {matchedData} from "express-validator";
import {HttpStatus} from "../../../core/types/http-statuses";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {IUserView} from "../../types/user.view.type";
import {UserQueryFieldsType} from "../../types/user-query-fields.type";
import {usersQueryRepository} from "../../repositories/users.query.repository";

export const getUsersHandler = async (req: Request, res: Response<PaginationOutput<IUserView>>): Promise<void> => {
  try {
    const queryInput = matchedData<UserQueryFieldsType>(req, {
      locations: ["query"],
      includeOptionals: true,
    });

    // console.log(queryInput);

    const users = await usersQueryRepository.findAllUsers(queryInput);

    res.status(HttpStatus.Ok_200).send(users);
  } catch (error: unknown) {
    errorsHandler(error, res);
  }
}