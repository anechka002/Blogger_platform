import {ObjectId, WithId} from "mongodb";
import {IUserDB} from "../types/user.db.type";
import {db} from "../../db/mongo.db";

export const usersRepository = {
  async findById(id: string): Promise<WithId<IUserDB> | null> {
    return db
      .getCollections()
      .userCollection.findOne({_id: new ObjectId(id)})
  },

  async create(user: IUserDB): Promise<string> {
    const newUser = await db
      .getCollections()
      .userCollection
      .insertOne(user);
    return newUser.insertedId.toString();
  },

  async delete(id: string): Promise<boolean> {
    const isDeleted = await db
      .getCollections()
      .userCollection.deleteOne({_id: new ObjectId(id)})

    return isDeleted.deletedCount === 1
  },

  async findByLogin(login: string): Promise<WithId<IUserDB> | null> {
    return await db
      .getCollections()
      .userCollection.findOne({login})
  },

  async findByEmail(email: string): Promise<WithId<IUserDB> | null> {
    return await db
      .getCollections()
      .userCollection.findOne({email})
  },
}
