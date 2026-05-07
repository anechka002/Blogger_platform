import {PaginationAndSorting} from "../types/pagination-and-sorting";
import {SortDirectionEnum} from "../types/sort-direction";

export const getPaginationAndSortingFromQuery= <T extends string> (
  query: any,
  defaultSortBy: T
): PaginationAndSorting<T> => {
  return {
    pageNumber: Number(query.pageNumber) || 1,
    pageSize: Number(query.pageSize) || 10,
    sortBy: (query.sortBy as T) || defaultSortBy,
    sortDirection: query.sortDirection === SortDirectionEnum.Desc
      ? SortDirectionEnum.Desc
      : SortDirectionEnum.Asc,
  }
}