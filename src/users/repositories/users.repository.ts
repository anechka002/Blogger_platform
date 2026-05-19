import {IUserDB} from "../types/user.db.type";
import {db} from "../../db/mongo.db";

export const usersRepository = {
  async create(user: IUserDB): Promise<string> {
    const newUser = await db
      .getCollections()
      .userCollection
      .insertOne(user);
    return newUser.insertedId.toString();
  }
}
