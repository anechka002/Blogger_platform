import {postsRepository} from "../repositories/posts.repository";
import {
  mapToPostViewModel
} from "../routers/mappers/map-to-post-view-model.utils";
import {PostViewDto} from "../dto/postViewDto";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";

export const postsQueryService = {
  // Найти все посты
  async findMany(): Promise<PostViewDto[]> {
    const posts = await postsRepository.findAll()
    return posts.map(mapToPostViewModel)
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