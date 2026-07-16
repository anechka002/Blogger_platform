import {CreateUserDto} from "../types/create-user.dto";
import {
  UsersRepository,
} from "../repositories/users.repository";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {UniqueFieldError} from "../../core/errors/unique-field.error";
import {Argon2Service} from "../../auth/adapters/argon.service";
import {inject, injectable} from "inversify";
import {UserModel} from "../domain/user.entity";

@injectable()
export class UsersService {
  protected usersRepository: UsersRepository
  protected argon2Service: Argon2Service
  constructor(
    @inject(UsersRepository) repo: UsersRepository,
    @inject(Argon2Service) argon2Service: Argon2Service
  ) {
    this.usersRepository = repo;
    this.argon2Service = argon2Service;
  }

  async createUser(dto: CreateUserDto): Promise<string> {
    const { login, email, password } = dto;

    const userByLogin = await this.usersRepository.findByLogin(login)
    if (userByLogin) {
      throw new UniqueFieldError('login','login should be unique')
    }

    const userByEmail = await this.usersRepository.findByEmail(email);
    if (userByEmail) {
      throw new UniqueFieldError('email','email should be unique')
    }

    const passwordHash = await this.argon2Service.generateHash(password);

    const newUser = new UserModel({
      login,
      email,
      passwordHash,
      createdAt: new Date(),
      emailConfirmation: {
        confirmationCode: '',
        expirationDate: new Date(),
        isConfirmed: true,
      },
      passwordRecovery: {
        recoveryCode: null,
        expirationDate: null,
      }
    })

    return await this.usersRepository.save(newUser);
  }

  async deleteUser(id: string): Promise<boolean> {
    const deletedUser = await this.usersRepository.delete(id)

    if (!deletedUser) {
      throw new RepositoryNotFoundError('User not found')
    }

    return true;
  }

}
