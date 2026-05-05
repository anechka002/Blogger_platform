import {Post} from "../types/post";
import {UpdatePostDto} from "../dto/updatePostDto";
import {ObjectId, WithId} from "mongodb";
import {postCollection} from "../../db/mongo.db";
import {postsRepository} from "../repositories/posts.repository";
import {
  mapToBlogViewModel
} from "../../blogs/routers/mappers/map-to-blog-view-model.utils";
import {
  mapToPostViewModel
} from "../routers/mappers/map-to-post-view-model.utils";
import {PostViewDto} from "../dto/postViewDto";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {blogsRepository} from "../../blogs/repositories/blogs.repository";
import {CreatePostDto} from "../dto/createPostDto";
import {DomainError} from "../../core/errors/domain.error";

export const postsService = {

  // Создать новый пост
  async create(dto: CreatePostDto): Promise<string> {
    const foundBlog = await blogsRepository.findById(dto.blogId)

    if (!foundBlog) {
      throw new DomainError('Blog does not exist', 'blogId')
    }

    const newPost: Post = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: foundBlog.name,
      createdAt: new Date(),
    }

    return postsRepository.create(newPost)
  },

  // Обновить данные поста
  async update(id: string, dto: UpdatePostDto): Promise<void> {
    const foundPost = await postsRepository.findById(id)

    if (!foundPost) {
      throw new RepositoryNotFoundError('Post not found')
    }

    const foundBlog = await blogsRepository.findById(dto.blogId)

    if (!foundBlog) {
      throw new DomainError('Blog does not exist', 'blogId')
    }

    return postsRepository.update(id, dto, foundBlog.name)
  },

  // Удалить пост
  async delete(id: string): Promise<void> {
    const foundPost = await postsRepository.findById(id)

    if (!foundPost) {
      throw new RepositoryNotFoundError('Post not found')
    }

    return postsRepository.delete(id)
  },
};