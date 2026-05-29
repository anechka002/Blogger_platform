import {Response} from "express";
import {RequestWithBody} from "../../../core/types/request-types";
import {LoginDto} from "../../types/login.dto";
import {HttpStatus} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";

export const loginHandler = async (req: RequestWithBody<LoginDto>, res: Response) => {
  const { loginOrEmail, password } = req.body;

  const result = await authService.loginUser(loginOrEmail, password)
  // console.log(result.data)

  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.status)
  }

  return res.status(HttpStatus.Ok_200).send(result.data);
}