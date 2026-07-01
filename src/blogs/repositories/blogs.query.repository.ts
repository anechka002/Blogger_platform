import {ObjectId} from "mongodb";
import {db} from "../../db/mongo.db";
import {BlogQueryInput} from "../routers/input/blog-query.input";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {PaginationOutput} from "../../core/types/pagination.output";
import {BlogViewDto} from "../dto/blogViewDto";
import {
  mapToBlogViewModel
} from "./mappers/map-to-blog-view-model.utils";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";

export class BlogsQueryRepository {
  // Найти все блоги с пагинацией и сортировкой
  async findMany(queryDto: BlogQueryInput): Promise<PaginationOutput<BlogViewDto>>  {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm} = queryDto;

    const filter = searchNameTerm ? {name: {$regex: searchNameTerm, $options: "i"}}: {};
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await db
      .getCollections()
      .blogCollection
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await db
      .getCollections()
      .blogCollection.countDocuments(filter)

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: totalCount,
      items: items.map(mapToBlogViewModel),
    }
  }

  // Найти блог по ID
  async findById(id: string): Promise<BlogViewDto | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const foundBlog = await db
      .getCollections()
      .blogCollection.findOne({_id: new ObjectId(id)});

    return foundBlog ? mapToBlogViewModel(foundBlog) : null;
  }

  // Найти блог по ID или завершить с ошибкой
  async findByIdOrFail(id: string): Promise<BlogViewDto> {
    if (!ObjectId.isValid(id)) {
      throw new RepositoryNotFoundError('No blog found with id ' + id);
    }

    const foundBlog = await db
      .getCollections()
      .blogCollection.findOne({_id: new ObjectId(id)});

    if (!foundBlog) {
      throw new RepositoryNotFoundError('No blog found with id ' + id);
    }

    return mapToBlogViewModel(foundBlog)
  }

}