import {Blog} from "../types/blog";
import {UpdateBlogDto} from "../dto/updateBlogDto";
import {blogCollection} from "../../db/mongo.db";
import { ObjectId, WithId } from 'mongodb';
import {BlogQueryInput} from "../routers/input/blog-query.input";
import {calculateSkip} from "../../core/utils/calculateSkip";

export const blogsRepository = {

  // Найти все блоги
  async findMany(queryDto: BlogQueryInput): Promise<{items: WithId<Blog>[], totalCount: number}>  {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm} = queryDto;

    const filter = searchNameTerm ? {name: {$regex: searchNameTerm, $options: "i"}}: {};
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await blogCollection
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await blogCollection.countDocuments(filter)

    return {items, totalCount}
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