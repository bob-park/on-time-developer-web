import { InfiniteData, QueryKey, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getCommits } from '@/domain/commits/apis/commits';
import { Commit, CommitSearchRequest } from '@/domain/commits/apis/commits.dto';
import { getNextPageParams } from '@/shared/api';
import { PageRequest, PagedModel } from '@/shared/api/common.dto';

export function useCommits(params: CommitSearchRequest) {
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery<
    PagedModel<Commit>,
    unknown,
    InfiniteData<PagedModel<Commit>>,
    QueryKey,
    PageRequest
  >({
    queryKey: ['commits', params],
    queryFn: ({ pageParam }) => getCommits({ ...params, ...pageParam }),
    initialPageParam: {
      size: 25,
      page: 0,
    },
    getNextPageParam: (lastPage) => getNextPageParams<Commit>(lastPage),
  });

  const commits = (data?.pages || []).reduce((current, value) => current.concat(value.content), [] as Commit[]);

  const totalElements = data?.pages[0]?.page.totalElements ?? 0;

  return { isLoading, fetchNextPage, hasNextPage, commits, totalElements };
}

export function usePeriodCommits(from: string, to: string) {
  const { data, isLoading } = useQuery<PagedModel<Commit>>({
    queryKey: ['commits', 'period', from, to],
    queryFn: () =>
      getCommits({
        createdDateFrom: from,
        createdDateTo: to,
        page: 0,
        // ponytail: 기간 내 1000건 초과분은 통계에서 잘림 — 집계 API 생기면 교체
        size: 1_000,
        sort: ['createdDate,desc'],
      }),
  });

  return { commits: data?.content ?? [], isLoading };
}
