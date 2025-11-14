export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginatedQuery {
  page?: number;
  pageSize?: number;
}

