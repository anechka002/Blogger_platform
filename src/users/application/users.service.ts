import {CreateUserDto} from "../types/create-user.dto";
import {usersRepository} from "../repositories/users.repository";
import {IUserDB} from "../types/user.db.type";

export const usersService = {
  async create(dto: CreateUserDto): Promise<string> {
    const { login, email, password } = dto;
    const passwordHash = '123'

    const newUser: IUserDB = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
    }
    return await usersRepository.create(newUser);
  }
}
