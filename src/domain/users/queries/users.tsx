import { InfiniteData, QueryKey, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getUser, getUsers, register, removeUser, restoreUser } from '@/domain/users/apis/users';
import { User, UserRegisterRequest, UserSearchRequest } from '@/domain/users/apis/users.dto';
import { getNextPageParams } from '@/shared/api';
import { PageRequest, PagedModel } from '@/shared/api/common.dto';
import { QueryMutationHandle } from '@/shared/queries';

export function useUsers(params: UserSearchRequest & PageRequest) {
  const { data, fetchNextPage, isLoading, refetch } = useInfiniteQuery<
    PagedModel<User>,
    unknown,
    InfiniteData<PagedModel<User>>,
    QueryKey,
    PageRequest
  >({
    queryKey: ['users', params.isDeleted],
    queryFn: () => getUsers(params),
    initialPageParam: {
      size: 25,
      page: 0,
    },
    getNextPageParam: (lastPage) => getNextPageParams<User>(lastPage, params.sort),
  });

  const users = (data?.pages || ([] as PagedModel<User>[])).reduce(
    (current, value) => current.concat(value.content),
    [] as User[],
  );

  const page: Pick<PagedModel<User>, 'page'> = {
    page: {
      size: data?.pages[0]?.page?.size ?? 25,
      number: data?.pages[0]?.page?.number ?? 0,
      totalElements: data?.pages[0]?.page.totalElements ?? 0,
      totalPages: data?.pages[0]?.page?.totalPages ?? 0,
    },
  };

  return { isLoading, fetchNextPage, refetch, users, page };
}

export function useUser(id: string, enabled?: boolean) {
  const { data, isLoading } = useQuery<User>({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: !enabled,
  });

  return { user: data, isLoading };
}

export function useUserRegister({ onSuccess, onError }: QueryMutationHandle<User>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', 'register'],
    mutationFn: (req: UserRegisterRequest) => register(req),
    onSuccess: async (data) => {
      onSuccess?.(data);

      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      onError?.(err.data);
    },
  });

  return { register: mutate, isLoading: isPending };
}

export function useUserRemove({ onSuccess, onError }: QueryMutationHandle<User>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', 'remove'],
    mutationFn: (id: string) => removeUser(id),
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ['users', data.id] });

      onSuccess?.(data);
    },
    onError: (err) => {
      onError?.(err.data);
    },
  });

  return { removeUser: mutate, isLoading: isPending };
}

export function useUserRestore({ onSuccess, onError }: QueryMutationHandle<User>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', 'restore'],
    mutationFn: (id: string) => restoreUser(id),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });

      onSuccess?.(data);
    },
    onError: (err) => {
      onError?.(err.data);
    },
  });

  return { restoreUser: mutate, isLoading: isPending };
}
