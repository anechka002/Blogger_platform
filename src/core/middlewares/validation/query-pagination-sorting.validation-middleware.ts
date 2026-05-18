import { query } from 'express-validator';
import {SortDirectionEnum} from "../../types/sort-direction";

// Дефолтные значения
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_DIRECTION = SortDirectionEnum.Asc;

export function paginationAndSortingValidation<T extends string>(sortFieldsEnum: Record<string, T>) {
  return [
    query('pageNumber')
      .default(DEFAULT_PAGE_NUMBER)
      .isInt({ min: 1})
      .withMessage('Page number must be a positive integer')
      .toInt(),

    query('pageSize')
      .default(DEFAULT_PAGE_SIZE)
      .isInt({ min: 1, max: 100 })
      .withMessage('Page size must be between 1 and 100')
      .toInt(),

    query('sortBy')
      .default(Object.values(sortFieldsEnum)[0])
      .isIn(Object.values(sortFieldsEnum))
      .withMessage(`Invalid sort field. Allowed values: ${Object.values(sortFieldsEnum).join(', ')}`),

    query('sortDirection')
      .default(DEFAULT_SORT_DIRECTION)
      .isIn(Object.values(SortDirectionEnum))
      .withMessage(`Sort direction must be one of: ${Object.values(SortDirectionEnum).join(', ')}`),

    query('searchNameTerm')
      .optional()
      .isString()
      .trim(),
  ]
}