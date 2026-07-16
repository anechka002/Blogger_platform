import {UpdateBlogDto} from "../dto/updateBlogDto";
import {CreateBlogDto} from "../dto/createBlogDto";
import {CreatePostForBlogDto} from "../dto/createPostForBlogDto";
import {BlogsRepository} from "../repositories/blogs.repository";
import {PostsRepository} from "../../posts/repositories/posts.repository";
import {inject, injectable} from "inversify";
import {BlogModel} from "../domain/blog.entity";
import {PostModel} from "../../posts/domain/post.entity";

@injectable()
export class BlogsService {
  protected blogsRepository: BlogsRepository;
  protected postsRepository: PostsRepository;
  constructor(
    @inject(BlogsRepository) blogsRepository: BlogsRepository,
    @inject(PostsRepository) postsRepository: PostsRepository
  ) {
    this.blogsRepository = blogsRepository;
    this.postsRepository = postsRepository;
  }
  // Создать новый пост для конкретного блога
  async createPostForBlog(blogId: string, dto: CreatePostForBlogDto): Promise<string> {
    const blog = await this.blogsRepository.findByIdOrFail(blogId);

    const newPost = new PostModel(
      {
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: blogId,
        blogName: blog.name,
        createdAt: new Date(),
      }
    )
    return await this.postsRepository.save(newPost);
  }

  // Создать новый блог
  async create(blog: CreateBlogDto): Promise<string> {
    const newBlog = new BlogModel({
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: new Date(),
      isMembership: false
    })

    return await this.blogsRepository.create(newBlog);
  }

  // Обновить данные бдога
  async update(id: string, dto: UpdateBlogDto): Promise<boolean> {
    const blog = await this.blogsRepository.findByIdOrFail(id);

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    await this.blogsRepository.save(blog);

    return true
  }

  // Удалить блог
  async delete(id: string): Promise<boolean> {
    const blog = await this.blogsRepository.findByIdOrFail(id);

    await this.blogsRepository.deleteBlog(blog)

    return true
  }
}