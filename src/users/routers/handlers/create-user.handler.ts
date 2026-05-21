import {Response} from "express";
import {RequestWithBody} from "../../../core/types/request-types";
import {CreateUserDto} from "../../types/create-user.dto";
import {IUserView} from "../../types/user.view.type";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {usersService} from "../../application/users.service";
import {HttpStatus} from "../../../core/types/http-statuses";
import {usersQueryRepository} from "../../repositories/users.query.repository";

export const createUserHandler = async (req: RequestWithBody<CreateUserDto>, res: Response<IUserView>) => {
  const {email, login, password} = req.body;
  try {
    const userId = await usersService.createUser({email, login, password})
    // console.log(userId)

    const userViewModel = await usersQueryRepository.findById(userId)

    res.status(HttpStatus.Created_201).send(userViewModel!)
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}