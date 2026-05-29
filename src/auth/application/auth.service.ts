import {usersRepository} from "../../users/repositories/users.repository";
import {argon2Service} from "../adapters/argon.service";
import {jwtService} from "../adapters/jwt.service";
import {ResultStatus} from "../../core/result/resultCode";
import {Result} from "../../core/result/result.type";
import {ILoginView} from "../types/login.view.type";

export const authService = {
  async loginUser(loginOrEmail: string, password: string): Promise<Result<ILoginView | null>> {
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);

    // console.log('user: ', user)
    // console.log('passwordHash: ', user?.passwordHash)

    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Unauthorized' }],
      }
    }

    const isPasswordCorrect = await argon2Service.checkPassword(password, user.passwordHash)

    if (!isPasswordCorrect) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'password', message: 'Unauthorized' }],
      };
    }

    const accessToken = await jwtService.createJWT(user._id.toString())

    return {
      status: ResultStatus.Success,
      data: { accessToken },
      extensions: [],
    };
  },

}
