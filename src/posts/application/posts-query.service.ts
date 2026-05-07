import {postsRepository} from "../repositories/posts.repository";
import {
  mapToPostViewModel
} from "../routers/mappers/map-to-post-view-model.utils";
import {PostViewDto} from "../dto/postViewDto";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {PostQueryInput} from "../routers/input/post-query.input";
import {PaginationOutput} from "../../core/types/pagination.output";

export const postsQueryService = {
  // Найти все посты
  async findMany(queryDto: PostQueryInput): Promise<PaginationOutput<PostViewDto>> {
    const result = await postsRepository.findMany(queryDto);

    return {
      pagesCount: Math.ceil(result.totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: result.totalCount,
      items: result.items.map(mapToPostViewModel),
    }
  },

  // Найти пост по ID или завершить с ошибкой
  async findByIdOrFail(id: string): Promise<PostViewDto> {
    const foundPost = await postsRepository.findById(id)
    if (!foundPost) {
      throw new RepositoryNotFoundError(`Post with id ${id} not found`)
    }

    return mapToPostViewModel(foundPost)
  },
};