import {Post} from "../types/post";
import {UpdatePostDto} from "../dto/updatePostDto";
import {ObjectId, WithId} from "mongodb";
import {postCollection} from "../../db/mongo.db";

export const postsRepository = {
  // Найти пост по ID
  async findById(id: string): Promise<WithId<Post> | null> {
    if (!ObjectId.isValid(id)) {
      return null
    }
    return await postCollection.findOne({_id: new ObjectId(id)});
  },

  // Создать новый пост
  async create(post: Post): Promise<string> {
    const insertResult = await postCollection.insertOne(post);

    return insertResult.insertedId.toString();
  },

  // Обновить данные поста
  async update(id: string, dto: UpdatePostDto, blogName: string): Promise<void> {
    const updateResult = await postCollection.updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          title: dto.title,
          content: dto.content,
          shortDescription: dto.shortDescription,
          blogId: dto.blogId,
          blogName: blogName,
        }
      }
    );

    if (updateResult.matchedCount < 1) {
      throw new Error("Post not exist");
    }

    return
  },

  // Удалить пост
  async delete(id: string): Promise<void> {
    const deletedResult = await postCollection.deleteOne({_id: new ObjectId(id)});
    if(deletedResult.deletedCount < 1) {
      throw new Error("Post not deleted");
    }

    return
  },
};