import {Blog} from "../types/blog";
import {UpdateBlogDto} from "../dto/updateBlogDto";
import {db} from "../../db/mongo.db";
import { ObjectId, WithId } from 'mongodb';
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {injectable} from "inversify";

@injectable()
export class BlogsRepository {
  // Найти блог по ID
  async findById(id: string): Promise<WithId<Blog> | null> {
    if (!ObjectId.isValid(id)) {
      return null
    }

    return db
      .getCollections()
      .blogCollection.findOne({ _id: new ObjectId(id) })
  }

  // Найти блог по ID или завершить с ошибкой
  async findByIdOrFail(id: string): Promise<WithId<Blog>> {
    if (!ObjectId.isValid(id)) {
      throw new RepositoryNotFoundError('No blog found with id ' + id);
    }

    const foundBlog = await db
      .getCollections()
      .blogCollection.findOne({_id: new ObjectId(id)});

    if(!foundBlog) {
      throw new RepositoryNotFoundError('No blog found with id ' + id);
    }

    return foundBlog
  }

  // Создать новый блог
  async create(blog: Blog): Promise<string> {
    const insertResult = await db
      .getCollections()
      .blogCollection.insertOne(blog);

    return insertResult.insertedId.toString();
  }

  // Обновить данные бдога
  async update(id: string, dto: UpdateBlogDto): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false
    }

    const updateResult = await db
      .getCollections()
      .blogCollection.updateOne(
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
  }

  // Удалить блог
  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false
    }

    const deletedResult = await db
      .getCollections()
      .blogCollection.deleteOne({_id: new ObjectId(id)});

    return deletedResult.deletedCount === 1
  }
};