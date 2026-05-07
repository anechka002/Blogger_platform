import {blogsRepository} from "../repositories/blogs.repository";
import {RepositoryNotFoundError} from "../../core/errors/repositiry-not-found.error";
import {BlogViewDto} from "../dto/blogViewDto";
import {mapToBlogViewModel} from "../routers/mappers/map-to-blog-view-model.utils";
import {BlogPostsQueryInput} from "../routers/input/blog-posts-query.input";
import {PostViewDto} from "../../posts/dto/postViewDto";
import {PaginationOutput} from "../../core/types/pagination.output";
import {postsRepository} from "../../posts/repositories/posts.repository";
import {mapToPostListPaginationOutput} from "../../posts/routers/mappers/map-to-post-list-pagination-output.util";
import {BlogQueryInput} from "../routers/input/blog-query-input";

export const blogsQueryService = {

  async findPostsByBlogId(blogId: string, queryDto: BlogPostsQueryInput): Promise<PaginationOutput<PostViewDto>> {

    const blog = await blogsRepository.findById(blogId)
    if (!blog) {
      throw new RepositoryNotFoundError('Blog not found')
    }

    const result = await postsRepository.findManyByBlogId(blogId, queryDto)

    return mapToPostListPaginationOutput(result, queryDto)
  },

  // Найти все блоги
  async findMany(queryDto: BlogQueryInput): Promise<PaginationOutput<BlogViewDto>> {
    const result = await blogsRepository.findMany(queryDto)
    return {
      pagesCount: Math.ceil(result.totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: result.totalCount,
      items: result.items.map(mapToBlogViewModel),
    }
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