import {Response} from "express";
import {RequestWithBody} from "../../../core/types/request-types";
import {
  RegistrationConfirmationDto
} from "../../types/registration-confirmation.dto";
import {authService} from "../../application/auth.service";
import {ResultStatus} from "../../../core/result/resultCode";
import {
  resultCodeToHttpException
} from "../../../core/result/resultCodeToHttpException";
import {HttpStatus} from "../../../core/types/http-statuses";

export const registrationConfirmationHandler = async (req: RequestWithBody<RegistrationConfirmationDto>, res: Response) => {
  const {code} = req.body

  const result = await authService.registrationConfirmation(code);

  if(result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.status)
  }

  return res.sendStatus(HttpStatus.NoContent_204)

}