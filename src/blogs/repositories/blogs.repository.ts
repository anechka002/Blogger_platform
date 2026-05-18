import {Blog} from "../types/blog";
import {UpdateBlogDto} from "../dto/updateBlogDto";
import {blogCollection} from "../../db/mongo.db";
import { ObjectId, WithId } from 'mongodb';
import {BlogQueryInput} from "../routers/input/blog-query.input";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {PaginationOutput} from "../../core/types/pagination.output";
import {BlogViewDto} from "../dto/blogViewDto";
import {
  mapToBlogViewModel
} from "../routers/mappers/map-to-blog-view-model.utils";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";

export const blogsRepository = {
  // Найти блог по ID
  async findById(id: string) {
    return blogCollection.findOne({ _id: new ObjectId(id) })
  },

  // Найти блог по ID или завершить с ошибкой
  async findByIdOrFail(id: string): Promise<WithId<Blog> | null> {
    const foundBlog = await blogCollection.findOne({_id: new ObjectId(id)});

    if(!foundBlog) {
      throw new RepositoryNotFoundError('No blog found with id ' + id);
    }

    return foundBlog
  },

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