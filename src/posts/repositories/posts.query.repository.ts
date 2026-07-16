import {PostQueryInput} from "../routers/input/post-query.input";
import {PaginationOutput} from "../../core/types/pagination.output";
import {PostViewDto} from "../dto/postViewDto";
import {
  mapToPostViewModel
} from "../routers/mappers/map-to-post-view-model.utils";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {
  BlogPostsQueryInput
} from "../../blogs/routers/input/blog-posts-query.input";
import {
  mapToPostListPaginationOutput
} from "../routers/mappers/map-to-post-list-pagination-output.util";
import {injectable} from "inversify";
import {PostModel} from "../domain/post.entity";
import mongoose from "mongoose";

@injectable()
export class PostsQueryRepository {
  // Найти все посты у которых поле blogId равно этому blogId
  async findManyByBlogId(blogId: string, queryDto: BlogPostsQueryInput): Promise<PaginationOutput<PostViewDto>> {
    const { pageNumber, pageSize, sortBy, sortDirection} = queryDto;

    const filter = {blogId};
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await PostModel
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .lean()

    const totalCount = await PostModel.countDocuments(filter)

    return mapToPostListPaginationOutput({items, totalCount}, queryDto)
  }

  // Найти все посты с пагинацией и сортировкой
  async findMany(queryDto: PostQueryInput): Promise<PaginationOutput<PostViewDto>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const filter = {}
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await PostModel
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .lean()

    const totalCount = await PostModel.countDocuments(filter)

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
    if (!mongoose.Types.ObjectId.isValid(id))  {
      throw new RepositoryNotFoundError(`Post with id ${id} not found`)
    }
    const foundPost = await PostModel.findById(id);
    if (!foundPost) {
      throw new RepositoryNotFoundError(`Post with id ${id} not found`)
    }

    return mapToPostViewModel(foundPost)
  }

  // Найти пост по ID
  async findById(postId: string): Promise<PostViewDto | null> {
    if (!mongoose.Types.ObjectId.isValid(postId))  {
      return null
    }

    const foundPost = await PostModel.findById(postId);

    return foundPost ? mapToPostViewModel(foundPost) : null
  }
}