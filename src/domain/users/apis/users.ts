import { User, UserRegisterRequest, UserSearchRequest } from '@/domain/users/apis/users.dto';
import api, { toSearchParams } from '@/shared/api';
import { PageRequest, PagedModel } from '@/shared/api/common.dto';
import delay from '@/utils/delay';

export async function getUsers(params: UserSearchRequest & PageRequest) {
  return api.get('/api/v1//users/summary', { searchParams: toSearchParams(params) }).json<PagedModel<User>>();
}

export async function getUser(id: string) {
  return api.get(`/api/v1/users/${id}/summary`).json<User>();
}

export async function register(req: UserRegisterRequest) {
  const result = await api.post('/api/v1/users', { json: req }).json<User>();

  await delay(1_000);

  return result;
}

export async function removeUser(id: string) {
  const result = await api.delete(`/api/v1/users/${id}`).json<User>();

  await delay(1_000);

  return result;
}

export async function restoreUser(id: string) {
  const result = await api.put(`/api/v1/users/${id}/restore`).json<User>();

  await delay(1_000);

  return result;
}
