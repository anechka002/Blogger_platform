import {ObjectId} from "mongodb";
import {blogCollection} from "../../db/mongo.db";
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

export const blogsQueryRepository = {
  // Найти все блоги с пагинацией и сортировкой
  async findMany(queryDto: BlogQueryInput): Promise<PaginationOutput<BlogViewDto>>  {
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

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: totalCount,
      items: items.map(mapToBlogViewModel),
    }
  },

  // Найти блог по ID или завершить с ошибкой
  async findByIdOrFail(id: string): Promise<BlogViewDto> {
    const foundBlog = await blogCollection.findOne({_id: new ObjectId(id)});

    if (!foundBlog) {
      throw new RepositoryNotFoundError('No blog found with id ' + id);
    }

    return mapToBlogViewModel(foundBlog)
  },

}