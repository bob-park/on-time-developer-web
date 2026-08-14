import '@tanstack/react-query';

import { ProblemDetail } from '@/shared/api/common.dto';

import { HTTPError } from 'ky';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: HTTPError<ProblemDetail>;
  }
}
