import {Router} from "express";
import {
  baseAuthGuardMiddleware
} from "../../auth/middlewares/base.auth.guard-middleware";
import {getUsersHandler} from "./handlers/get-users.handler";
import {
  paginationAndSortingValidation
} from "../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  userInputDtoValidation
} from "../validation/user.input-dto.validation-middlewares";
import {createUserHandler} from "./handlers/create-user.handler";
import {UserSortField} from "../types/user-query-fields.type";
import {
  idValidationMiddleware
} from "../../core/middlewares/validation/params-id.validation-middleware";
import {deleteUserHandler} from "./handlers/delete-user.handler";

export const usersRouter = Router({});

usersRouter.use(baseAuthGuardMiddleware); // для всех роутеров

usersRouter
  .get('/', paginationAndSortingValidation(UserSortField), inputValidationResultMiddleware, getUsersHandler)

  .post('/', userInputDtoValidation, inputValidationResultMiddleware, createUserHandler)

  .delete('/:id', idValidationMiddleware(), inputValidationResultMiddleware, deleteUserHandler);
