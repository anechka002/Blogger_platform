import {Blog} from "../types/blog";
import {UpdateBlogDto} from "../dto/updateBlogDto";
import {blogsRepository} from "../repositories/blogs.repository";
import {CreateBlogDto} from "../dto/createBlogDto";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {CreatePostForBlogDto} from "../dto/createPostForBlogDto";
import {Post} from "../../posts/types/post";
import {postsRepository} from "../../posts/repositories/posts.repository";

export const blogsService = {

  async createPostForBlog(blogId: string, dto: CreatePostForBlogDto): Promise<string> {
    const blog = await blogsRepository.findById(blogId);

    if (!blog) {
      throw new RepositoryNotFoundError('Blog not found');
    }

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
    const blog = await blogsRepository.findById(id);
    if (!blog) {
      throw new RepositoryNotFoundError('Blog not found')
    }
    return await blogsRepository.update(id, dto)
  },

  // Удалить блог
  async delete(id: string): Promise<boolean> {
    const blog = await blogsRepository.findById(id);
    if (!blog) {
      throw new RepositoryNotFoundError('Blog not found')
    }
    //
    // const postCount = await postsRepository.findById(id)
    //
    // if(postCount > 0) {
    //   throw new Error('Blog has posts')
    // }

    return await blogsRepository.delete(id)
  },

};