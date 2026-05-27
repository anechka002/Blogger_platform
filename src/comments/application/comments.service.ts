import {CreateCommentType} from "../types/create-comment.type";
import {ICommentDB} from "../types/comment.db.type";
import {
  postsQueryRepository
} from "../../posts/repositories/posts.query.repository";
import {
  usersQueryRepository
} from "../../users/repositories/users.query.repository";
import {commentsRepository} from "../repositories/comments.repository";
import {ResultStatus} from "../../core/result/resultCode";
import {Result} from "../../core/result/result.type";
import {
  commentsQueryRepository
} from "../repositories/comments.query.repository";

export const commentsService = {
  async createCommentForPost(postId: string, dto: CreateCommentType): Promise<Result<string | null>> {
    const user = await usersQueryRepository.findMeById(dto.userId)
    if (!user) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'User not found',
        extensions: [],
        data: null
      }
    }

    const post = await postsQueryRepository.findById(postId);
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

    const commentId = await commentsRepository.createComment(newComment);
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: commentId,
    }
  },

  async updateComment(commentId: string, dto: CreateCommentType): Promise<Result<null>> {
    const comment = await commentsQueryRepository.findById(commentId);
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

    await commentsRepository.updateComment(commentId, dto.content)
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  },

  async deleteComment(commentId: string, userId: string): Promise<Result<null>> {
    const comment = await commentsQueryRepository.findById(commentId);
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

    await commentsRepository.deleteComment(commentId);
    return {
      status: ResultStatus.Success,
      extensions: [],
      data: null
    }
  }
}