import {CreateCommentType} from "../types/create-comment.type";
import {ResultStatus} from "../../core/result/resultCode";
import {Result} from "../../core/result/result.type";
import {
  UsersQueryRepository
} from "../../users/repositories/users.query.repository";
import {
  PostsQueryRepository
} from "../../posts/repositories/posts.query.repository";
import {CommentsRepository} from "../repositories/comments.repository";
import {
  CommentsQueryRepository
} from "../repositories/comments.query.repository";
import {inject, injectable} from "inversify";
import {CommentModel} from "../domain/comment.entity";
import {CommentLikesRepository} from "../repositories/comment-likes.repository";
import {LikeStatus} from "../domain/like-status.enum";
import {CommentLikeModel} from "../domain/comment-like.entity";

@injectable()
export class CommentsService {
  protected usersQueryRepository: UsersQueryRepository
  protected postsQueryRepository: PostsQueryRepository
  protected commentsRepository: CommentsRepository
  protected commentsQueryRepository: CommentsQueryRepository
  protected commentLikesRepository: CommentLikesRepository
  constructor(
    @inject(UsersQueryRepository) usersQueryRepository: UsersQueryRepository,
    @inject(PostsQueryRepository) postsQueryRepository: PostsQueryRepository,
    @inject(CommentsRepository) commentsRepository: CommentsRepository,
    @inject(CommentsQueryRepository) commentsQueryRepository: CommentsQueryRepository,
    @inject(CommentLikesRepository) commentLikesRepository: CommentLikesRepository,
  ) {
    this.usersQueryRepository = usersQueryRepository
    this.postsQueryRepository = postsQueryRepository
    this.commentsRepository = commentsRepository
    this.commentsQueryRepository = commentsQueryRepository
    this.commentLikesRepository = commentLikesRepository
  }
  async createCommentForPost(postId: string, dto: CreateCommentType): Promise<Result<string | null>> {
    const user = await this.usersQueryRepository.findMeById(dto.userId)
    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'User not found',
        extensions: [],
        data: null
      }
    }

    const post = await this.postsQueryRepository.findById(postId);
    if (!post) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'Post not found',
        extensions: [{field: 'postId', message: 'Post not found'}],
        data: null
      }
    }

    const newComment = new CommentModel(
      {
        postId: postId,
        content: dto.content,
        commentatorInfo: {
          userId: user!.userId,
          userLogin: user!.login,
        },
        createdAt: new Date(),
      }
    )

    const commentId = await this.commentsRepository.save(newComment);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: commentId,
    }
  }

  async updateComment(commentId: string, dto: CreateCommentType): Promise<Result<null>> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'Comment not found',
        extensions: [{field: 'commentId', message: 'Comment not found'}],
        data: null
      }
    }

    if(comment.commentatorInfo.userId !== dto.userId) {
      return {
        status: ResultStatus.Forbidden,
        errorMessage: 'Forbidden',
        extensions: [],
        data: null,
      }
    }

    comment.content = dto.content;

    await this.commentsRepository.saveComment(comment);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<Result<null>> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'Comment not found',
        extensions: [{field: 'commentId', message: 'Comment not found'}],
        data: null
      }
    }

    if(comment.commentatorInfo.userId !== userId) {
      return {
        status: ResultStatus.Forbidden,
        errorMessage: 'Forbidden',
        extensions: [],
        data: null,
      }
    }

    await this.commentsRepository.deleteComment(comment)

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  }

  async updateLikeStatus({commentId, likeStatus, userId}:{commentId: string, userId: string, likeStatus: LikeStatus}): Promise<Result<null>> {
    const comment = await this.commentsRepository.findById(commentId);
    if (!comment) {
      return {
        status: ResultStatus.NotFound,
        errorMessage: 'Comment not found',
        extensions: [{field: 'commentId', message: 'Comment not found'}],
        data: null
      }
    }

    // Ищем реакцию именно этого пользователя именно на этот комментарий.
    const currentReaction = await this.commentLikesRepository.findReaction({commentId, userId})

    // Случай 1: реакции в базе нет
    // Если в коллекции commentLikes нет документа с таким commentId и userId.
    if (!currentReaction) {

      // Дальше смотрим, какое новое состояние пришло из request body.

      // Было: None -> Пришло: None -> Действие: ничего не делать
      if(likeStatus === LikeStatus.None) {
        return {
          status: ResultStatus.Success,
          extensions: [],
          data: null
        }
      }

      // текущей реакции нет;
      // Пришёл Like или Dislike — создаём реакцию.
      const reaction = new CommentLikeModel({
        comment_id: commentId,
        user_id: userId,
        status: likeStatus,
      })

      // Создаём новый Mongoose-документ
      await this.commentLikesRepository.createReaction(reaction)

      // Если создали Like — увеличиваем likesCount.
      if (likeStatus === LikeStatus.Like) {
        comment.likesCount += 1
      }

      // Если создали Dislike — увеличиваем dislikesCount.
      if (likeStatus === LikeStatus.Dislike) {
        comment.dislikesCount += 1
      }

      // Сохраняем изменённые счётчики комментария.
      await this.commentsRepository.saveComment(comment)

      return {
        status: ResultStatus.Success,
        extensions: [],
        data: null
      }
    }

    // Случай 2: статус уже такой же.
    // В базе сейчас Like И новый likeStatus тоже Like
    if (currentReaction.status === likeStatus) {
      return {
        status: ResultStatus.Success,
        extensions: [],
        data: null
      }
    }

    // Случай 3: существующую реакцию убираем, пришёл None
    // currentReaction существует -> текущий статус не равен новому -> новый статус — None.
    // Было: Like -> Пришло: None
    if (likeStatus === LikeStatus.None) {

      // Удаляем документ реакции
      await this.commentLikesRepository.deleteReaction({ commentId, userId })

      // // Был Dislike -> None — уменьшаем dislikesCount.
      if (currentReaction.status === LikeStatus.Dislike) {
        comment.dislikesCount -= 1
      }

      // Был Like -> None — уменьшаем likesCount.
      if (currentReaction.status === LikeStatus.Like) {
        comment.likesCount -= 1
      }

      // Сохраняем изменённые счётчики комментария.
      await this.commentsRepository.saveComment(comment)

      return {
        status: ResultStatus.Success,
        extensions: [],
        data: null,
      }
    }

    // Случай 4: меняем Like на Dislike или Dislike на Like

    // Запоминаем старый статус до изменения. Например, сейчас в базе стоит Like.
    const previousStatus = currentReaction.status

    // Меняем статус у уже найденного Mongoose-документа.
    currentReaction.status = likeStatus
    // Репозиторий сохраняет изменённый документ.
    await this.commentLikesRepository.updateReaction(currentReaction)

    // нужно синхронно обновить счётчики в документе комментария.
    // Был Like, стал Dislike: уменьшаем лайки и увеличиваем дизлайки.
    if(previousStatus === LikeStatus.Like && likeStatus === LikeStatus.Dislike) {
      comment.likesCount -= 1
      comment.dislikesCount += 1
    }

    // Был Dislike, стал Like: увеличиваем лайки и уменьшаем дизлайки.
    if(previousStatus === LikeStatus.Dislike && likeStatus === LikeStatus.Like) {
      comment.likesCount += 1
      comment.dislikesCount -= 1
    }

    // Сохраняем изменённые счётчики комментария.
    await this.commentsRepository.saveComment(comment)

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  }
}