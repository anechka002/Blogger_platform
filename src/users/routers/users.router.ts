import {Router} from "express";
import {
  baseAuthGuardMiddleware
} from "../../auth/middlewares/base.auth.guard-middleware";
import {
  paginationAndSortingValidation
} from "../../core/middlewares/validation/query-pagination-sorting.validation-middleware";
import {
  inputValidationResultMiddleware
} from "../../core/middlewares/validation/input-validation-result.middleware";
import {
  UserSortField
} from "../types/user-query-fields.type";
import {
  idValidationMiddleware
} from "../../core/middlewares/validation/params-id.validation-middleware";
import {
  searchEmailTermValidation,
  searchLoginTermValidation
} from "../middleware/users-query.validation";
import {passwordValidation} from "../middleware/password.validation";
import {
  email,
  login,
  usersController,
} from "../../composition-root";

export const usersRouter = Router({});

usersRouter.use(baseAuthGuardMiddleware); // для всех роутеров

usersRouter
  .get('/', paginationAndSortingValidation(UserSortField), searchLoginTermValidation, searchEmailTermValidation, inputValidationResultMiddleware, usersController.getUsers.bind(usersController))

  .post('/', passwordValidation, email, login, inputValidationResultMiddleware, usersController.createUser.bind(usersController))

  .delete('/:id', idValidationMiddleware(), inputValidationResultMiddleware, usersController.deleteUser.bind(usersController));
