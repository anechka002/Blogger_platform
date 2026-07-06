import {Request, Response} from "express";
import {matchedData} from "express-validator";
import {
  RequestWithBody,
  RequestWithParams
} from "../../../core/types/request-types";
import {CreateUserDto} from "../../types/create-user.dto";
import {UsersService} from "../../application/users.service";
import {URIParamsUserIdDto} from "../../types/uri-params-user-id.dto";
import {IUserView} from "../../types/user.view.type";
import {HttpStatus} from "../../../core/types/http-statuses";
import {errorsHandler} from "../../../core/errors/errors.handler";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {UserQueryFieldsType} from "../../types/user-query-fields.type";
import {UsersQueryRepository} from "../../repositories/users.query.repository";
import {inject, injectable} from "inversify";

@injectable()
export class UsersController {
  protected usersService: UsersService
  protected usersQueryRepository: UsersQueryRepository
  constructor(
    @inject(UsersService) service: UsersService,
    @inject(UsersQueryRepository) usersQueryRepository: UsersQueryRepository
  ) {
    this.usersService = service
    this.usersQueryRepository = usersQueryRepository
  }

  async createUser(req: RequestWithBody<CreateUserDto>, res: Response<IUserView>){
    const {email, login, password} = req.body;
    try {
      const userId = await this.usersService.createUser({email, login, password})

      const userViewModel = await this.usersQueryRepository.findById(userId)

      res.status(HttpStatus.Created_201).send(userViewModel!)
    } catch (error: unknown) {
      errorsHandler(error, res)
    }
  }
  async deleteUser (req: RequestWithParams<URIParamsUserIdDto>, res: Response){
    try {
      await this.usersService.deleteUser(req.params.id)

      res.sendStatus(HttpStatus.NoContent_204)
    } catch(error: unknown) {
      errorsHandler(error, res)
    }
  }
  async getUsers(req: Request, res: Response<PaginationOutput<IUserView>>): Promise<void>{
    try {
      const queryInput = matchedData<UserQueryFieldsType>(req, {
        locations: ["query"],
        includeOptionals: true,
      });

      const users = await this.usersQueryRepository.findAllUsers(queryInput);

      res.status(HttpStatus.Ok_200).send(users);
    } catch (error: unknown) {
      errorsHandler(error, res);
    }
  }
}