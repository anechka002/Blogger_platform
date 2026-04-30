import {Blog} from "../types/blog";
import {UpdateBlogDto} from "../dto/updateBlogDto";
import {blogCollection} from "../../db/mongo.db";
import { ObjectId, WithId } from 'mongodb';

export const blogsRepository = {
  // Найти все блоги
  async findAll(): Promise<WithId<Blog>[]> {
    return await blogCollection.find({}).toArray();
  },

  // Найти блог по ID
  async findById(id: string): Promise<WithId<Blog> | null> {
    if(!ObjectId.isValid(id)) {
      return null
    }
    return await blogCollection.findOne({_id: new ObjectId(id)});
  },

  // Создать новый блог
  async create(blog: Blog): Promise<WithId<Blog>| null> {
    const insertResult = await blogCollection.insertOne(blog);

    return await blogCollection.findOne({
      _id: insertResult.insertedId,
    })
  },

  // Обновить данные бдога
  async update(id: string, dto: UpdateBlogDto): Promise<boolean> {
    const updateResult = await blogCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        }
      }
    );

    return updateResult.matchedCount === 1
  },

  // Удалить блог
  async delete(id: string): Promise<void> {
    const deletedResult = await blogCollection.deleteOne({_id: new ObjectId(id)});
    if (deletedResult.deletedCount < 1) {
      throw new Error("Blog not exist");
    }
    return
  },

};