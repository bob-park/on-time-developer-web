import { ProblemDetail } from '@/shared/api/common.dto';

interface QueryMutationHandle<T> {
  onSuccess?: (data: T) => void;
  onError?: (err?: ProblemDetail | string) => void;
}

export type { QueryMutationHandle };
