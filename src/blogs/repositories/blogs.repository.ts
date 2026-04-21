import { db } from "../../db/in-memory.db";
import {Blog} from "../types/blog";
import {UpdateBlogDto} from "../dto/updateBlogDto";

export const blogsRepository = {
  // Найти все блоги
  findAll(): Blog[] {
    return db.blogs;
  },

  // Найти блог по ID
  findById(id: string): Blog | null {
    return db.blogs.find((b) => b.id === id) ?? null;
  },

  // Создать новый блог
  create(blog: Blog): Blog {
    db.blogs.push(blog);
    return blog;
  },

  // Обновить данные бдога
  update(id: string, dto: UpdateBlogDto): void {
    const blog = db.blogs.find((b) => b.id === id);
    if (!blog) return;

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return
  },

  // Удалить блог
  delete(id: string): void {
    const index = db.blogs.findIndex((b) => b.id === id);
    if (index === -1) return;

    db.blogs.splice(index, 1);
    return
  },

};