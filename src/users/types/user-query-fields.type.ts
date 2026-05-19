import {PaginationAndSorting} from "../../core/types/pagination-and-sorting";

export enum UserSortField {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

type UserSearchInput = {
  searchLoginTerm?: string
  searchEmailTerm?: string
}

export type UserQueryFieldsType = PaginationAndSorting<UserSortField> & UserSearchInput