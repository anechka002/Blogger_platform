import {Response} from "express";
import {RequestWithBody} from "../../../core/types/request-types";
import {RegistrationDto} from "../../types/registration.dto";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";
import {HttpStatus} from "../../../core/types/http-statuses";

export const registrationHandler = async (req: RequestWithBody<RegistrationDto>, res: Response) => {
  const {email, password, login} = req.body;

  const result = await authService.registerUser(login, email, password);

  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.extensions);
  }

  return res.sendStatus(HttpStatus.NoContent_204)
}