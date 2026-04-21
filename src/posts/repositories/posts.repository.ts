import { db } from "../../db/in-memory.db";
import {Post} from "../types/post";
import {UpdatePostDto} from "../dto/updatePostDto";

export const postsRepository = {
  // Найти все блоги
  findAll(): Post[] {
    return db.posts;
  },

  // Найти блог по ID
  findById(id: string): Post | null {
    return db.posts.find((b) => b.id === id) ?? null;
  },

  // Создать новый блог
  create(post: Post): Post {
    db.posts.push(post);
    return post;
  },

  // Обновить данные бдога
  update(id: string, dto: UpdatePostDto, blogName: string): void {
    const post = db.posts.find((b) => b.id === id);
    if (!post) return;

    post.title = dto.title;
    post.content = dto.content;
    post.shortDescription = dto.shortDescription;
    post.blogId = dto.blogId;
    post.blogName = blogName

    return
  },

  // Удалить блог
  delete(id: string): void {
    const index = db.posts.findIndex((b) => b.id === id);
    if (index === -1) return;

    db.posts.splice(index, 1);
    return
  },

};