import { Response } from "express";
import {RequestWithBody} from "../../../core/types/request-types";
import {LoginDto} from "../../types/login.dto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";

export const loginHandler = async (req: RequestWithBody<LoginDto>, res: Response) => {
  const { loginOrEmail, password } = req.body;
  try {
    const isLoggedIn = await authService.loginUser(loginOrEmail, password)

    // console.log('login', isLoggedIn)

    res.sendStatus(HttpStatus.NoContent_204)
  } catch (error: unknown) {
    errorsHandler(error, res)
  }
}