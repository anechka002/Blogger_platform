import request from 'supertest';
import { Express } from 'express';
import { BLOGS_PATH } from '../../../src/core/paths/paths';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { PaginationOutput } from '../../../src/core/types/pagination.output';
import { PostViewDto } from '../../../src/posts/dto/postViewDto';
import { PostSortField } from '../../../src/posts/routers/input/post-sort-field';
import { SortDirectionEnum } from '../../../src/core/types/sort-direction';

type GetBlogPostsQuery = {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: PostSortField;
  sortDirection?: SortDirectionEnum;
};

export async function getBlogPosts(
  app: Express,
  blogId: string,
  query?: GetBlogPostsQuery,
): Promise<PaginationOutput<PostViewDto>> {
  const response = await request(app)
    .get(`${BLOGS_PATH}/${blogId}/posts`)
    .query(query ?? {})
    .expect(HttpStatus.Ok_200);

  return response.body;
}
