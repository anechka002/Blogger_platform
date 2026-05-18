import {PostQueryInput} from "../routers/input/post-query.input";
import {PaginationOutput} from "../../core/types/pagination.output";
import {PostViewDto} from "../dto/postViewDto";
import {postsRepository} from "./posts.repository";
import {
  mapToPostViewModel
} from "../routers/mappers/map-to-post-view-model.utils";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {postCollection} from "../../db/mongo.db";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {ObjectId, WithId} from "mongodb";
import {
  BlogPostsQueryInput
} from "../../blogs/routers/input/blog-posts-query.input";
import {Post} from "../types/post";

export const postsQueryRepository = {

  // Найти все посты у которых поле blogId равно этому blogId
  async findManyByBlogId(blogId: string, queryDto: BlogPostsQueryInput): Promise<{items: WithId<Post>[], totalCount: number}> {
    const { pageNumber, pageSize, sortBy, sortDirection} = queryDto;

    const filter = {blogId};
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await postCollection
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await postCollection.countDocuments(filter)

    return {items, totalCount}
  },

  // Найти все посты с пагинацией и сортировкой
  async findMany(queryDto: PostQueryInput): Promise<PaginationOutput<PostViewDto>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const filter = {}
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await postCollection
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await postCollection.countDocuments(filter)

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: totalCount,
      items: items.map(mapToPostViewModel),
    }
  },

  // Найти пост по ID или завершить с ошибкой
  async findByIdOrFail(id: string): Promise<PostViewDto> {
    const foundPost = await postCollection.findOne({_id: new ObjectId(id)});
    if (!foundPost) {
      throw new RepositoryNotFoundError(`Post with id ${id} not found`)
    }

    return mapToPostViewModel(foundPost)
  },
}