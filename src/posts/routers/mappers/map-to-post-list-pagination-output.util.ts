import { WithId } from 'mongodb'
import {BlogPostsQueryInput} from "../../../blogs/routers/input/blog-posts-query.input";
import {Post} from "../../types/post";
import {PaginationOutput} from "../../../core/types/pagination.output";
import {PostViewDto} from "../../dto/postViewDto";
import {mapToPostViewModel} from "./map-to-post-view-model.utils";

export const mapToPostListPaginationOutput   = (result: {items: WithId<Post>[], totalCount: number}, queryDto: BlogPostsQueryInput) : PaginationOutput<PostViewDto> => {
  const {items, totalCount} = result
  const {pageNumber, pageSize} = queryDto

  return {
    pagesCount: Math.ceil(totalCount / pageSize),
    page: pageNumber,
    pageSize,
    totalCount,
    items: items.map(mapToPostViewModel),
  }
}