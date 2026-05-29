import {Response} from "express";
import {RequestWithBody} from "../../../core/types/request-types";
import {
  RegistrationEmailResendingDto
} from "../../types/registration-email-resending.dto";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";
import {HttpStatus} from "../../../core/types/http-statuses";

export const registrationEmailResendingHandler = async (req: RequestWithBody<RegistrationEmailResendingDto>, res: Response) => {
  const {email} = req.body;

  const result = await authService.registrationEmailResending(email);

  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.status)
  }

  return res.sendStatus(HttpStatus.NoContent_204)
}