import delay from '@/utils/delay';

import ky from 'ky';

import { PagedModel } from './common.dto';

const index = ky.extend({
  hooks: {
    afterResponse: [],
  },
});

export function toSearchParams(req: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  Object.entries(req).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams;
}

export function getNextPageParams<T>(lastPage: PagedModel<T>, sort?: string[]) {
  const { totalPages, number, size } = lastPage.page;

  const nextPage = number + 1;

  if (nextPage > totalPages - 1) {
    return null;
  }

  return {
    size,
    page: nextPage,
    sort,
  };
}

export async function waitForDelay<T>(req: Promise<T>, delayTime: number = 1_000) {
  const result = Promise.allSettled([req, delay(delayTime)]);

  return result.then(([item]) => {
    if (item.status === 'rejected') {
      throw new Error(item.reason);
    }

    return item.value;
  });
}

export default index;
