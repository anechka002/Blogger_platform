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

@injectable()
export class CommentsQueryRepository {
  async findById(id: string): Promise<ICommentView | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null
    }
    const foundComment = await CommentModel.findById(id).lean();

    return foundComment ? mapToCommentViewModel(foundComment) : null
  }

  async findByIdOrFail(id: string): Promise<ICommentView> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new RepositoryNotFoundError(`Comment with id ${id} not found`)
    }
    const foundComment = await CommentModel.findById(id).lean();

    if(!foundComment) {
      throw new RepositoryNotFoundError(`Comment with id ${id} not found`)
    }

    return mapToCommentViewModel(foundComment)
  }

  async findMany(postId: string, queryInput: CommentQueryInput): Promise<PaginationOutput<ICommentView>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryInput;

    const filter = { postId }
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await CommentModel
      .find(filter)
      .skip(skip)
      .sort({[sortBy]: sortDirection})
      .limit(pageSize)
      .lean()

    const totalCount = await CommentModel.countDocuments(filter)

    return {
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      pageSize: queryInput.pageSize,
      page: queryInput.pageNumber,
      totalCount: totalCount,
      items: items.map(mapToCommentViewModel)
    }
  }
}