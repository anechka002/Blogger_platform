import {PostQueryInput} from "../routers/input/post-query.input";
import {PaginationOutput} from "../../core/types/pagination.output";
import {PostViewDto} from "../dto/postViewDto";
import {
  mapToPostViewModel
} from "./mappers/map-to-post-view-model.utils";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {
  BlogPostsQueryInput
} from "../../blogs/routers/input/blog-posts-query.input";
import {injectable} from "inversify";
import {PostModel} from "../domain/post.entity";
import mongoose from "mongoose";
import {PostLikeModel} from "../domain/post-like.entity";
import {LikeStatus} from "../../core/enum/like-status.enum";
import {
  mapExtendedToPostViewModel
} from "./mappers/map-extended-to-post-view-model.utils";

@injectable()
export class PostsQueryRepository {
  // Найти все посты у которых поле blogId равно этому blogId
  async findManyByBlogId(blogId: string, queryDto: BlogPostsQueryInput, userId?: string): Promise<PaginationOutput<PostViewDto>> {
    const { pageNumber, pageSize, sortBy, sortDirection} = queryDto;

    const filter = {blogId};
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await PostModel
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)

    const totalCount = await PostModel.countDocuments(filter)

    const postsIds = items.map(post => post._id.toString())

    const reactionForPosts = userId ? await PostLikeModel.find({
      // Реакция должна относиться к одному из постов текущей страницы.
      post_id: { $in: postsIds },
      // И реакция должна принадлежать текущему пользователю.
      user_id:  userId,
    }).lean() : []

    const allLikesForPosts = await PostLikeModel.find({
      post_id: { $in: postsIds },
      status: LikeStatus.Like
    }).sort({
      updatedAt: -1,
      _id: -1
    })

    const mappedPosts = items.map(post => {
      const postId = post._id.toString();
      const currentUserReaction = reactionForPosts.find(reaction => reaction.post_id === postId)
      const newestLikes = allLikesForPosts
        .filter(like => like.post_id === postId)
        .slice(0,3)
      const myStatus = currentUserReaction?.status ?? LikeStatus.None
      return mapExtendedToPostViewModel({post, myStatus, newestLikes})
    })

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: totalCount,
      // items — это посты, в которые mapper уже добавил extendedLikesInfo.
      items: mappedPosts
    }
  }

  // Найти все посты с пагинацией и сортировкой
  async findMany(queryDto: PostQueryInput, userId?: string): Promise<PaginationOutput<PostViewDto>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;

    const filter = {}
    const skip = calculateSkip(pageNumber, pageSize);

    // Получили посты страницы.
    const posts = await PostModel
      .find(filter)
      .sort({[sortBy]: sortDirection})
      .skip(skip)
      .limit(pageSize)

    const totalCount = await PostModel.countDocuments(filter)

    // Собрали ID этих постов.
    // Эти ID нужны, чтобы искать реакции только для найденных постов.
    const postsIds = posts.map(post => post._id.toString())

    // Одним запросом получили реакции текущего пользователя. Он нужен только для поля myStatus
    const reactionsForPosts = userId ? await PostLikeModel.find({
      // Реакция должна относиться к одному из постов текущей страницы.
      post_id: { $in: postsIds },
      // И реакция должна принадлежать текущему пользователю.
      user_id:  userId,
    }).lean() : []

    // Одним запросом получили все Like для этих постов. Он нужен только для поля newestLikes.
    const allLikesForPosts = await PostLikeModel.find({
      // Лайк должен принадлежать одному из постов текущей страницы.
      post_id: { $in: postsIds },
      // Берём только Like.
      status: LikeStatus.Like
      // Сортируем все найденные лайки: сначала самые новые.
    }).sort({
      updatedAt: -1,
      _id: -1
    })

    // Проходим по каждому посту.
    const mappedPosts = posts.map(post => {
      // Получаем ID текущего поста, который прямо сейчас мапим.
      const postId = post._id.toString();

      //Находим реакцию текущего пользователя на текущий пост.
      const currentUserReaction = reactionsForPosts.find(
        (reaction) => reaction.post_id === postId);

      // Теперь из общего массива всех лайков выбираем лайки только текущего поста.
      const newestLikes = allLikesForPosts
        .filter(like => like.post_id === postId)
        .slice(0,3)

      // Определяем myStatus.
      const myStatus =
        currentUserReaction?.status
        ?? LikeStatus.None

      return mapExtendedToPostViewModel({post, myStatus, newestLikes})
    })

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      pageSize: queryDto.pageSize,
      page: queryDto.pageNumber,
      totalCount: totalCount,
      // items — это посты, в которые mapper уже добавил extendedLikesInfo.
      items: mappedPosts
    }
  }

  // Найти пост по ID или завершить с ошибкой
  async findByIdOrFail(id: string, userId?: string): Promise<PostViewDto> {
    if (!mongoose.Types.ObjectId.isValid(id))  {
      throw new RepositoryNotFoundError(`Post with id ${id} not found`)
    }
    const foundPost = await PostModel.findById(id);
    if (!foundPost) {
      throw new RepositoryNotFoundError(`Post with id ${id} not found`)
    }

    const currentUserReaction = userId ? await PostLikeModel.findOne({post_id: id, user_id: userId}) : null;

    const myStatus = currentUserReaction?.status ?? LikeStatus.None

    // Получаем последние три реакции со статусом Like.
    const newestLikes = await PostLikeModel
      .find({post_id: id, status: LikeStatus.Like})
      .sort({updatedAt: -1})
      .limit(3)

    return mapExtendedToPostViewModel({post: foundPost, myStatus, newestLikes})
  }

  // Найти пост по ID
  async findById(postId: string): Promise<PostViewDto | null> {
    if (!mongoose.Types.ObjectId.isValid(postId))  {
      return null
    }

    const foundPost = await PostModel.findById(postId);

    return foundPost ? mapToPostViewModel(foundPost) : null
  }
}