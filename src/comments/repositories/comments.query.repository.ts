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
import {LikeStatus} from "../domain/like-status.enum";

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

    const items = await CommentModel
      .find(filter)
      .skip(skip)
      .sort({[sortBy]: sortDirection})
      .limit(pageSize)

    const totalCount = await CommentModel.countDocuments(filter)

    const mappedItems = await Promise.all(
      items.map(async (comment) => {
        // Если пользователь авторизован, ищем его реакцию на текущий комментарий.
        const currentUserReaction = userId ? await CommentLikeModel.findOne({comment_id: comment._id.toString(), user_id: userId}) : null;

        // Если реакция найдена — берём Like или Dislike.
        // Если не найдена или пользователь не авторизован — None.
        const myStatus = currentUserReaction?.status ?? LikeStatus.None

        // likesCount и dislikesCount маппер возьмёт прямо из документа comment.
        return mapToCommentViewModel({
          comment,
          myStatus,
        })
      })
    )

    return {
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      pageSize: queryInput.pageSize,
      page: queryInput.pageNumber,
      totalCount: totalCount,
      items: mappedItems
      // items: items.map(() => ({
      //   id: '6a50a0e86975b345ebabf3a9',
      //   content: 'bebebe',
      //   createdAt: new Date().toISOString(),
      //   commentatorInfo: {
      //     userId: '6a4f6d0392eb058b6cf5200b',
      //     userLogin: 'Anna',
      //   },
      //   likesInfo: {
      //     likesCount: 1,
      //     dislikesCount: 2,
      //     myStatus: LikeStatus.None,
      //   },
      // })),
    }
  }
}