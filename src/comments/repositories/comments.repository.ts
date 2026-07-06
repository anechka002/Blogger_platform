import {ICommentDB} from "../types/comment.db.type";
import {db} from "../../db/mongo.db";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";

@injectable()
export class CommentsRepository {
  async createComment(comment: ICommentDB): Promise<string>{
    const insertResult = await db
      .getCollections()
      .commentCollection.insertOne(comment)

    return insertResult.insertedId.toString();
  }

  async updateComment(commentId: string, content: string): Promise<boolean>{
    const insertResult = await db
      .getCollections()
      .commentCollection.updateOne(
        { _id: new ObjectId(commentId) },
        { $set: { content } },
      )
    return insertResult.matchedCount === 1
  }

  async deleteComment(commentId: string): Promise<boolean>{
    if (!ObjectId.isValid(commentId)) {
      return false
    }

    const deleteResult = await db
    .getCollections()
    .commentCollection.deleteOne({ _id: new ObjectId(commentId) })

    return deleteResult.deletedCount === 1
  }
}