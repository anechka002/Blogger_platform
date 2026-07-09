import {injectable} from "inversify";
import {CommentDocument, CommentModel} from "../domain/comment.entity";

@injectable()
export class CommentsRepository {
  async save(comment: CommentDocument): Promise<string>{
    await comment.save();
    return comment._id.toString();
  }

  async findById(id: string): Promise<CommentDocument | null> {
    return CommentModel.findById(id)
  }

  async saveComment(comment: CommentDocument): Promise<void>{
    await comment.save();
  }

  async deleteComment(comment: CommentDocument): Promise<void>{
    await comment.deleteOne()
  }
}