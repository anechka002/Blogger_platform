import {injectable} from "inversify";
import mongoose from "mongoose";
import {PostDocument, PostModel} from "../domain/post.entity";

@injectable()
export class PostsRepository {
  // Найти пост по ID
  async findById(id: string): Promise<PostDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    return PostModel.findById(id)
  }

  // Создать новый пост
  async save(post: PostDocument): Promise<string> {
    await post.save()
    return post._id.toString()
  }

}