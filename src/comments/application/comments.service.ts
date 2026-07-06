import {CreateCommentType} from "../types/create-comment.type";
import {ICommentDB} from "../types/comment.db.type";
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

@injectable()
export class CommentsService {
  protected usersQueryRepository: UsersQueryRepository
  protected postsQueryRepository: PostsQueryRepository
  protected commentsRepository: CommentsRepository
  protected commentsQueryRepository: CommentsQueryRepository
  constructor(
    @inject(UsersQueryRepository) usersQueryRepository: UsersQueryRepository,
    @inject(PostsQueryRepository) postsQueryRepository: PostsQueryRepository,
    @inject(CommentsRepository) commentsRepository: CommentsRepository,
    @inject(CommentsQueryRepository) commentsQueryRepository: CommentsQueryRepository
  ) {
    this.usersQueryRepository = usersQueryRepository
    this.postsQueryRepository = postsQueryRepository
    this.commentsRepository = commentsRepository
    this.commentsQueryRepository = commentsQueryRepository
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

    const newComment: ICommentDB = {
      postId: postId,
      content: dto.content,
      commentatorInfo: {
        userId: user!.userId,
        userLogin: user!.login,
      },
      createdAt: new Date(),
    }

    const commentId = await this.commentsRepository.createComment(newComment);
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: commentId,
    }
  }

  async updateComment(commentId: string, dto: CreateCommentType): Promise<Result<null>> {
    const comment = await this.commentsQueryRepository.findById(commentId);
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

    await this.commentsRepository.updateComment(commentId, dto.content)
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<Result<null>> {
    const comment = await this.commentsQueryRepository.findById(commentId);
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

    await this.commentsRepository.deleteComment(commentId);
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  }
}