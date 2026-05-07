import {SortDirectionEnum} from "./sort-direction";

export type PaginationAndSorting<S> = {
  pageNumber: number;
  pageSize: number;
  sortBy: S;
  sortDirection: SortDirectionEnum;
};