import {ICommentView} from "../types/comment.view.type";
import {ObjectId} from "mongodb";
import {
  RepositoryNotFoundError
} from "../../core/errors/repositiry-not-found.error";
import {db} from "../../db/mongo.db";
import {
  mapToCommentViewModel
} from "../mappers/map-to-comment-view-model.utils";
import {CommentQueryInput} from "../routers/input/comment-query.input";
import {PaginationOutput} from "../../core/types/pagination.output";
import {calculateSkip} from "../../core/utils/calculateSkip";

export const commentsQueryRepository = {
  async findById(id: string): Promise<ICommentView | null> {
    if(!ObjectId.isValid(id)) {
      return null
    }
    const foundComment = await db
      .getCollections()
      .commentCollection.findOne({_id: new ObjectId(id)});

    return foundComment ? mapToCommentViewModel(foundComment) : null
  },

  async findByIdOrFail(id: string): Promise<ICommentView> {
    if(!ObjectId.isValid(id)) {
      throw new RepositoryNotFoundError(`Comment with id ${id} not found`)
    }
    const foundComment = await db
      .getCollections()
      .commentCollection.findOne({_id: new ObjectId(id)})

    if(!foundComment) {
      throw new RepositoryNotFoundError(`Comment with id ${id} not found`)
    }

    return mapToCommentViewModel(foundComment)
  },

  async findMany(postId: string, queryInput: CommentQueryInput): Promise<PaginationOutput<ICommentView>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryInput;

    const filter = { postId }
    const skip = calculateSkip(pageNumber, pageSize);

    const items = await db
      .getCollections()
      .commentCollection
      .find(filter)
      .skip(skip)
      .sort({[sortBy]: sortDirection})
      .limit(pageSize)
      .toArray();

    const totalCount = await db
      .getCollections()
      .commentCollection.countDocuments(filter)

    return {
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      pageSize: queryInput.pageSize,
      page: queryInput.pageNumber,
      totalCount: totalCount,
      items: items.map(mapToCommentViewModel)
    }
  }
}