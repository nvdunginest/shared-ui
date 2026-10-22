type PaginationQueryResult<T> = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: T[];
};

export default PaginationQueryResult;
