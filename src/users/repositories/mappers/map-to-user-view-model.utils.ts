import {WithId} from "mongodb";
import {IUserView} from "../../types/user.view.type";
import {IUserDB} from "../../types/user.db.type";

export const mapToUserViewModel = (user: WithId<IUserDB>): IUserView => {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  }
}