import { PaginationParams, PaginationResult } from "../types";

export type { PaginationParams, PaginationResult };

export const getPaginationParams = (query: any): Required<PaginationParams> => {
  return {
    page: parseInt(query.page) || 1,
    limit: parseInt(query.limit) || 10,
    sortBy: query.sortBy || "createdAt",
    sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
  };
};

export const createPaginationResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
