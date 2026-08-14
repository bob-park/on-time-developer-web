type SearchPageParams = {
  page: number;
  size: number;
};

/**
 * Page Response
 */
interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

interface PagedModel<T> {
  page: PageMetadata;
  content: T[];
}

/**
 * Page Request
 */
type PageRequest = {
  page: number;
  size: number;
  sort?: string[];
};

/**
 * ProblemDetail
 */
type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  timestamp: Date;
  exception: string;
};

export type { SearchPageParams, PageRequest, PageMetadata, PagedModel, ProblemDetail };
