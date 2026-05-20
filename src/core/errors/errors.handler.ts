import { Response } from 'express';
import {HttpStatus} from "../types/http-statuses";
import {RepositoryNotFoundError} from "./repositiry-not-found.error";
import {DomainError} from "./domain.error";
import {createErrorMessages} from "./create-error-message";
import {UniqueFieldError} from "./unique-field.error";
import {UnauthorizedError} from "./unauthorized.error";

export enum DomainErrorCode {
  BlogHasPosts = 'BLOG_HAS_POSTS',
  BlogAlreadyExists = 'BLOG_ALREADY_EXISTS',
}

export function errorsHandler(error: unknown, res: Response): void {
  console.log('ERROR:', error)

  if (error instanceof RepositoryNotFoundError) {
    res.sendStatus(HttpStatus.NotFound_404)
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.sendStatus(HttpStatus.Unauthorized_401)
    return;
  }

  if (error instanceof UniqueFieldError) {
    res.status(HttpStatus.BadRequest_400).send(
      createErrorMessages([
        {
          message: error.message,
          field: error.field,
        },
      ])
    );
    return;
  }

  if (error instanceof DomainError) {
    if (error.code === DomainErrorCode.BlogHasPosts) {
      console.log('Business rule failed:', error.code)
    }

    res.status(HttpStatus.BadRequest_400).send(
      createErrorMessages([
        {
          message: error.message,
          field: error.source ?? '',
        },
      ])
    )
    return
  }

  res.sendStatus(HttpStatus.InternalServerError_500);
  return;
}