import {usersRepository} from "../../users/repositories/users.repository";
import {UnauthorizedError} from "../../core/errors/unauthorized.error";
import {argon2Service} from "../adapters/argon.service";
import {jwtService} from "../adapters/jwt.service";

export const authService = {
  async loginUser(loginOrEmail: string, password: string): Promise<string> {
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);

    // console.log('user: ', user)
    // console.log('passwordHash: ', user?.passwordHash)

    if (!user) throw new UnauthorizedError()

    const isPasswordCorrect = await argon2Service.checkPassword(password, user.passwordHash)

    if (!isPasswordCorrect) throw new UnauthorizedError()

    return await jwtService.createJWT(user._id.toString())
  },

}
