import {Post} from "../types/post";
import {UpdatePostDto} from "../dto/updatePostDto";
import {ObjectId, WithId} from "mongodb";
import {BlogPostsQueryInput} from "../../blogs/routers/input/blog-posts-query.input";
import {postCollection} from "../../db/mongo.db";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {PostQueryInput} from "../routers/input/post-query.input";

export const postsRepository = {

  // Найти все посты у которых поле blogId равно этому blogId
  async findManyByBlogId(blogId: string, queryDto: BlogPostsQueryInput): Promise<{items: WithId<Post>[], totalCount: number}> {
    const { pageNumber, pageSize, sortBy, sortDirection} = queryDto;

    const filter = {blogId};
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await postCollection
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await postCollection.countDocuments(filter)

    return {items, totalCount}
  },

  // Найти все посты с пагинацией и сортировкой
  async findMany(queryDto: PostQueryInput): Promise<{items: WithId<Post>[], totalCount: number}> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const filter = {}
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await postCollection
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await postCollection.countDocuments(filter)

    return {items, totalCount}
  },

  // Найти все посты
  async findAll(): Promise<WithId<Post>[]> {
    return await postCollection.find({}).toArray();
  },

  // Найти пост по ID
  async findById(id: string): Promise<WithId<Post> | null> {
    if (!ObjectId.isValid(id)) {
      return null
    }
    return await postCollection.findOne({_id: new ObjectId(id)});
  },

  // // Найти пост по ID или завершить с ошибкой
  // async findByIdOrFail(id: string): Promise<PostViewDto> {
  //   const result = await postCollection.findOne({_id: new ObjectId(id)});
  //   if(!result) {
  //     throw new RepositoryNotFoundError()
  //   }
  //   return mapToPostViewModel(result)
  // },

  // Создать новый пост
  async create(post: Post): Promise<string> {
    const insertResult = await postCollection.insertOne(post);

    return insertResult.insertedId.toString();
  },

  // Обновить данные поста
  async update(id: string, dto: UpdatePostDto, blogName: string): Promise<void> {
    const updateResult = await postCollection.updateOne(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          title: dto.title,
          content: dto.content,
          shortDescription: dto.shortDescription,
          blogId: dto.blogId,
          blogName: blogName,
        }
      }
    );

    if (updateResult.matchedCount < 1) {
      throw new Error("Post not exist");
    }

    return
  },

  // Удалить пост
  async delete(id: string): Promise<void> {
    const deletedResult = await postCollection.deleteOne({_id: new ObjectId(id)});
    if(deletedResult.deletedCount < 1) {
      throw new Error("Post not deleted");
    }

    return
  },
};