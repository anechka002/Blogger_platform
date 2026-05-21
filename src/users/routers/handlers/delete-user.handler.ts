import {Response} from "express";
import {RequestWithParams} from "../../../core/types/request-types";
import {URIParamsUserIdDto} from "../../types/uri-params-user-id.dto";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {usersService} from "../../application/users.service";
import {HttpStatus} from "../../../core/types/http-statuses";

export const deleteUserHandler = async (req: RequestWithParams<URIParamsUserIdDto>, res: Response) => {
  try {
    await usersService.deleteUser(req.params.id)

    res.sendStatus(HttpStatus.NoContent_204)
  } catch(error: unknown) {
    errorsHandler(error, res)
  }
}
