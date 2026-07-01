import {Post} from "../types/post";
import {UpdatePostDto} from "../dto/updatePostDto";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {CreatePostDto} from "../dto/createPostDto";
import {DomainError} from "../../core/errors/domain.error";
import {BlogsRepository} from "../../blogs/repositories/blogs.repository";
import {PostsRepository} from "../repositories/posts.repository";

export class PostsService {
  protected blogsRepository: BlogsRepository;
  protected postsRepository: PostsRepository;
  constructor(blogsRepository: BlogsRepository, postsRepository: PostsRepository) {
    this.blogsRepository = blogsRepository;
    this.postsRepository = postsRepository;
  }
  // Создать новый пост
  async create(dto: CreatePostDto): Promise<string> {
    const foundBlog = await this.blogsRepository.findByIdOrFail(dto.blogId)

    const newPost: Post = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: foundBlog!.name,
      createdAt: new Date(),
    }

    return await this.postsRepository.create(newPost)
  }

  // Обновить данные поста
  async update(id: string, dto: UpdatePostDto): Promise<boolean> {
    const foundPost = await this.postsRepository.findById(id)

    if (!foundPost) {
      throw new RepositoryNotFoundError('Post not found')
    }

    const foundBlog = await this.blogsRepository.findById(dto.blogId)

    if (!foundBlog) {
      throw new DomainError('Blog does not exist', 'blogId')
    }

    return await this.postsRepository.update(id, dto, foundBlog.name)
  }

  // Удалить пост
  async delete(id: string): Promise<boolean> {
    const foundPost = await this.postsRepository.findById(id)

    if (!foundPost) {
      throw new RepositoryNotFoundError('Post not found')
    }

    return await this.postsRepository.delete(id)
  }
}