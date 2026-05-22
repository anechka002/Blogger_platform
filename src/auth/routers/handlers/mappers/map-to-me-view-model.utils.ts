import {IMeView} from "../../../types/me.view";
import {WithId} from "mongodb";
import {IUserDB} from "../../../../users/types/user.db.type";

export const mapToMeViewModel = (user: WithId<IUserDB>): IMeView => {
  return {
    email: user.email,
    login: user.login,
    userId: user._id.toString()
  }
}
