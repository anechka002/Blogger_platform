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
import {UserSortField} from "../types/user-query-fields.type";

export const usersRouter = Router({});

usersRouter.use(superAdminGuardMiddleware); // для всех роутеров

usersRouter
  .get('/', paginationAndSortingValidation(UserSortField), inputValidationResultMiddleware, getUsersHandler)
