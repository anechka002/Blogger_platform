import {ICommentView} from "../types/comment.view.type";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {
  mapToCommentViewModel
} from "./mappers/map-to-comment-view-model.utils";
import {CommentQueryInput} from "../routers/input/comment-query.input";
import {PaginationOutput} from "../../core/types/pagination.output";
import {calculateSkip} from "../../core/utils/calculateSkip";
import {injectable} from "inversify";
import mongoose from "mongoose";
import {CommentModel} from "../domain/comment.entity";
import {CommentLikeModel} from "../domain/comment-like.entity";
import {LikeStatus} from "../../core/enum/like-status.enum";

@injectable()
export class CommentsQueryRepository {
  // id комментария, который мы хотим получить
  // userId текущего пользователя. Он необязательный, потому что GET-комментария публичный.
  async findById(id: string, userId?: string): Promise<ICommentView | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }

    // Ищем сам комментарий в коллекции comments по его _id.
    const foundComment = await CommentModel.findById(id);

    // Если комментария с таким id нет в базе, возвращаем null.
    // Контроллер затем преобразует это в HTTP 404.
    if (!foundComment) {
      return null;
    }

    // Определяем реакцию текущего пользователя.
    // Если userId существует, значит optional middleware смогла определить пользователя по access-токену. Тогда ищем реакцию по двум полям: comment_id + user_id.
    // Если userId нет, запрос в базу не выполняем и сразу устанавливаем currentUserReaction в null.
    const currentUserReaction = userId ? await CommentLikeModel.findOne({comment_id: id, user_id: userId}) : null;

    // Определяем значение myStatus.
    // Если реакция пользователя найдена, берём её статус: Like или Dislike.
    // Если реакция не найдена или пользователь не авторизован, возвращаем None.
    const myStatus = currentUserReaction?.status ?? LikeStatus.None

    // Передаём в маппер две части данных:
    // foundComment — данные из коллекции comments;
    // likesInfo — данные, полученные из коллекции commentLikes.
    // Маппер объединит их в объект ICommentView, который будет отправлен клиенту.
    return mapToCommentViewModel({comment: foundComment, myStatus})
  }

  async findByIdOrFail(id: string, userId?: string): Promise<ICommentView> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new RepositoryNotFoundError(`Comment with id ${id} not found`)
    }
    const foundComment = await CommentModel.findById(id);

    if(!foundComment) {
      throw new RepositoryNotFoundError(`Comment with id ${id} not found`)
    }

    const currentUserReaction = userId ? await CommentLikeModel.findOne({comment_id: id, user_id: userId}) : null;

    const myStatus = currentUserReaction?.status ?? LikeStatus.None

    return mapToCommentViewModel({comment: foundComment, myStatus})
  }

  async findMany(postId: string, queryInput: CommentQueryInput, userId?: string): Promise<PaginationOutput<ICommentView>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryInput;

    const filter = { postId }
    const skip = calculateSkip(pageNumber, pageSize);

    // не все комментарии из базы, а только комментарии:
    // 1-принадлежащие этому посту, 2-попавшие на текущую страницу пагинации.
    const comments = await CommentModel
      .find(filter)
      .skip(skip)
      .sort({[sortBy]: sortDirection})
      .limit(pageSize)

    // Сколько всего комментариев принадлежит этому посту
    const totalCount = await CommentModel.countDocuments(filter)

    // собираем ID комментариев текущей страницы
    const commentsIds = comments.map(comment => comment._id.toString());

    // реакции авторизованного пользователя на эти комментарии
    const reactionsForComments = userId ? await CommentLikeModel.find({
      comment_id: { $in: commentsIds }, user_id: userId
    }) : []

    return {
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      pageSize: queryInput.pageSize,
      page: queryInput.pageNumber,
      totalCount: totalCount,

      items: comments.map((comment) => {
        // одна конкретная реакция пользователя на текущий comment
        const currentUserReaction = reactionsForComments.find(
          (reaction) => reaction.comment_id === comment._id.toString())
        return mapToCommentViewModel({comment, myStatus: currentUserReaction?.status ?? LikeStatus.None})
      })
    }
  }
}