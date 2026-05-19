import {Router} from "express";
import {
  superAdminGuardMiddleware
} from "../../auth/middlewares/super-admin.guard-middleware";
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

export const usersRouter = Router({});

usersRouter.use(superAdminGuardMiddleware); // для всех роутеров

usersRouter
  .get('/', paginationAndSortingValidation(UserSortField), inputValidationResultMiddleware, getUsersHandler)

  .post('/', userInputDtoValidation, inputValidationResultMiddleware, createUserHandler)
