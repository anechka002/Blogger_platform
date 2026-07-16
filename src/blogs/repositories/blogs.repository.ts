import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {injectable} from "inversify";
import mongoose from "mongoose";
import {BlogDocument, BlogModel} from "../domain/blog.entity";

@injectable()
export class BlogsRepository {
  // Найти блог по ID
  async findById(id: string): Promise<BlogDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }

    return BlogModel.findById(id)
  }

  // Найти блог по ID или завершить с ошибкой
  async findByIdOrFail(id: string): Promise<BlogDocument> {
    if (!mongoose.Types.ObjectId.isValid(id))  {
      throw new RepositoryNotFoundError('No blog found with id ' + id);
    }

    const foundBlog = await BlogModel.findById(id)

    if(!foundBlog) {
      throw new RepositoryNotFoundError('No blog found with id ' + id);
    }

    return foundBlog
  }

  // Создать новый блог
  async create(blog: BlogDocument): Promise<string> {
    await blog.save();
    return blog._id.toString();
  }

  // Сохраняет изменения в уже существующем блоге
  async save(blog: BlogDocument): Promise<void> {
    await blog.save()
  }

  async deleteBlog(blog: BlogDocument): Promise<void> {
    await blog.deleteOne()
  }
}