export type PaginationOutput<T> = {
  pagesCount: number
  page: number
  pageSize: number
  totalCount: number
  items: T[]
}