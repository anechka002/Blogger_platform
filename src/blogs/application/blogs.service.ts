import {Blog} from "../types/blog";
import {UpdateBlogDto} from "../dto/updateBlogDto";
import {CreateBlogDto} from "../dto/createBlogDto";
import {CreatePostForBlogDto} from "../dto/createPostForBlogDto";
import {Post} from "../../posts/types/post";
import {BlogsRepository} from "../repositories/blogs.repository";
import {PostsRepository} from "../../posts/repositories/posts.repository";

export class BlogsService {
  protected blogsRepository: BlogsRepository;
  protected postsRepository: PostsRepository;
  constructor(blogsRepository: BlogsRepository, postsRepository: PostsRepository) {
    this.blogsRepository = blogsRepository;
    this.postsRepository = postsRepository;
  }
  // Создать новый пост для конкретного блога
  async createPostForBlog(blogId: string, dto: CreatePostForBlogDto): Promise<string> {
    const blog = await this.blogsRepository.findByIdOrFail(blogId);

    const newPost: Post = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blogId,
      blogName: blog.name,
      createdAt: new Date(),
    }
    return await this.postsRepository.create(newPost);
  }

  // Создать новый блог
  async create(blog: CreateBlogDto): Promise<string> {
    const newBlog: Blog = {
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(),
      isMembership: false
    }

    return await this.blogsRepository.create(newBlog);
  }

  // Обновить данные бдога
  async update(id: string, dto: UpdateBlogDto): Promise<boolean> {
    await this.blogsRepository.findByIdOrFail(id);

    return await this.blogsRepository.update(id, dto)
  }

  // Удалить блог
  async delete(id: string): Promise<boolean> {
    await this.blogsRepository.findByIdOrFail(id);

    return await this.blogsRepository.delete(id)
  }

}