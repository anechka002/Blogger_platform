import {PostQueryInput} from "../routers/input/post-query.input";
import {PaginationOutput} from "../../core/types/pagination.output";
import {PostViewDto} from "../dto/postViewDto";
import {
  mapToPostViewModel
} from "../routers/mappers/map-to-post-view-model.utils";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {db} from "../../db/mongo.db";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {ObjectId} from "mongodb";
import {
  BlogPostsQueryInput
} from "../../blogs/routers/input/blog-posts-query.input";
import {
  mapToPostListPaginationOutput
} from "../routers/mappers/map-to-post-list-pagination-output.util";

export class PostsQueryRepository {
  // Найти все посты у которых поле blogId равно этому blogId
  async findManyByBlogId(blogId: string, queryDto: BlogPostsQueryInput): Promise<PaginationOutput<PostViewDto>> {
    const { pageNumber, pageSize, sortBy, sortDirection} = queryDto;

    const filter = {blogId};
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await db
      .getCollections()
      .postCollection
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await db
      .getCollections()
      .postCollection.countDocuments(filter)

    return mapToPostListPaginationOutput({items, totalCount}, queryDto)
  }

  // Найти все посты с пагинацией и сортировкой
  async findMany(queryDto: PostQueryInput): Promise<PaginationOutput<PostViewDto>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const filter = {}
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await db
      .getCollections()
      .postCollection
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await db
      .getCollections()
      .postCollection.countDocuments(filter)

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: totalCount,
      items: items.map(mapToPostViewModel),
    }
  }

  // Найти пост по ID или завершить с ошибкой
  async findByIdOrFail(id: string): Promise<PostViewDto> {
    if(!ObjectId.isValid(id)) {
      throw new RepositoryNotFoundError(`Post with id ${id} not found`)
    }
    const foundPost = await db
      .getCollections()
      .postCollection.findOne({_id: new ObjectId(id)});
    if (!foundPost) {
      throw new RepositoryNotFoundError(`Post with id ${id} not found`)
    }

    return mapToPostViewModel(foundPost)
  }

  // Найти пост по ID
  async findById(postId: string): Promise<PostViewDto | null> {
    if(!ObjectId.isValid(postId)) {
      return null
    }

    const foundPost = await db
      .getCollections()
      .postCollection.findOne({_id: new ObjectId(postId)});

    return foundPost ? mapToPostViewModel(foundPost) : null
  }
}