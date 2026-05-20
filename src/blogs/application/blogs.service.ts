import {Blog} from "../types/blog";
import {UpdateBlogDto} from "../dto/updateBlogDto";
import {blogsRepository} from "../repositories/blogs.repository";
import {CreateBlogDto} from "../dto/createBlogDto";
import {CreatePostForBlogDto} from "../dto/createPostForBlogDto";
import {Post} from "../../posts/types/post";
import {postsRepository} from "../../posts/repositories/posts.repository";
import {
  mapToPostListPaginationOutput
} from "../../posts/routers/mappers/map-to-post-list-pagination-output.util";
import {BlogPostsQueryInput} from "../routers/input/blog-posts-query.input";
import {PaginationOutput} from "../../core/types/pagination.output";
import {PostViewDto} from "../../posts/dto/postViewDto";
import {
  postsQueryRepository
} from "../../posts/repositories/posts.query.repository";

export const blogsService = {

  // Найти посты, которые принадлежат конкретному блогу по его blogId.
  async findPostsByBlogId(blogId: string, queryDto: BlogPostsQueryInput): Promise<PaginationOutput<PostViewDto>> {
    await blogsRepository.findByIdOrFail(blogId)

    const result = await postsQueryRepository.findManyByBlogId(blogId, queryDto)

    return mapToPostListPaginationOutput(result, queryDto)
  },

  // Создать новый пост для конкретного блога
  async createPostForBlog(blogId: string, dto: CreatePostForBlogDto): Promise<string> {
    const blog = await blogsRepository.findByIdOrFail(blogId);

    const newPost: Post = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog.name,
      createdAt: new Date(),
    }
    return await postsRepository.create(newPost);
  },

  // Создать новый блог
  async create(blog: CreateBlogDto): Promise<string> {
    const newBlog: Blog = {
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(),
      isMembership: false
    }

    return await blogsRepository.create(newBlog);
  },

  // Обновить данные бдога
  async update(id: string, dto: UpdateBlogDto): Promise<boolean> {
    await blogsRepository.findByIdOrFail(id);

    return await blogsRepository.update(id, dto)
  },

  // Удалить блог
  async delete(id: string): Promise<boolean> {
    await blogsRepository.findByIdOrFail(id);

    return await blogsRepository.delete(id)
  },

};