import {Post} from "../types/post";
import {UpdatePostDto} from "../dto/updatePostDto";
import {ObjectId, WithId} from "mongodb";
import {db} from "../../db/mongo.db";

export const postsRepository = {
  // Найти пост по ID
  async findById(id: string): Promise<WithId<Post> | null> {
    if (!ObjectId.isValid(id)) {
      return null
    }
    return await db
      .getCollections()
      .postCollection.findOne({_id: new ObjectId(id)});
  },

  // Создать новый пост
  async create(post: Post): Promise<string> {
    const insertResult = await db
      .getCollections()
      .postCollection.insertOne(post);

    return insertResult.insertedId.toString();
  },

  // Обновить данные поста
  async update(id: string, dto: UpdatePostDto, blogName: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const isUpdated = await db
      .getCollections()
      .postCollection.updateOne(
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

    return isUpdated.matchedCount === 1
  },

  // Удалить пост
  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const isDeleted = await db
      .getCollections()
      .postCollection.deleteOne({_id: new ObjectId(id)});

    return isDeleted.deletedCount === 1
  },
};