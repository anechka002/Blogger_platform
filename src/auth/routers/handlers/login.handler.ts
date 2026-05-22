import { Response } from "express";
import {RequestWithBody} from "../../../core/types/request-types";
import {LoginDto} from "../../types/login.dto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import {ILoginView} from "../../types/login.view.type";

export const loginHandler = async (req: RequestWithBody<LoginDto>, res: Response<ILoginView>) => {
  const { loginOrEmail, password } = req.body;
  try {
    const accessToken = await authService.loginUser(loginOrEmail, password)
    // console.log('accessToken: ', accessToken)

    res.status(HttpStatus.Ok_200).send({accessToken: accessToken});
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}