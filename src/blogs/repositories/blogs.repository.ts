import {Blog} from "../types/blog";
import {UpdateBlogDto} from "../dto/updateBlogDto";
import {blogCollection} from "../../db/mongo.db";
import { ObjectId, WithId } from 'mongodb';
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";

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

  // async findByIdOrFail(id: string): Promise<WithId<Blog>> {
  //   const result = await blogCollection.findOne({_id: new ObjectId(id)});
  //   if (!result) {
  //     throw new RepositoryNotFoundError('No blog found with id ' + id);
  //   }
  //   return result
  // },

  // Создать новый блог
  async create(blog: Blog): Promise<string> {
    const insertResult = await blogCollection.insertOne(blog);

    return insertResult.insertedId.toString();
  },

  // Обновить данные бдога
  async update(id: string, dto: UpdateBlogDto): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false
    }

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
  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false
    }

    const deletedResult = await blogCollection.deleteOne({_id: new ObjectId(id)});

    return deletedResult.deletedCount === 1
  },
};