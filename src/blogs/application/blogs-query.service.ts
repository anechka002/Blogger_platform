import {blogsRepository} from "../repositories/blogs.repository";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {BlogViewDto} from "../dto/blogViewDto";
import {
  mapToBlogViewModel
} from "../routers/mappers/map-to-blog-view-model.utils";

export const blogsQueryService = {
  // Найти все блоги
  async findMany(): Promise<BlogViewDto[]> {
    const blogs = await blogsRepository.findAll()
    return blogs.map(mapToBlogViewModel)
  },

  // Найти блог по ID
  async findByIdOrFail(id: string): Promise<BlogViewDto> {
    const foundBlog = await blogsRepository.findById(id)

    if (!foundBlog) {
      throw new RepositoryNotFoundError('Blog not found')
    }

    return mapToBlogViewModel(foundBlog)
  },
}