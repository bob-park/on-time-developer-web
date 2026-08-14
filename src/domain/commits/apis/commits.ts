import { Commit, CommitSearchRequest } from '@/domain/commits/apis/commits.dto';
import api, { toSearchParams } from '@/shared/api';
import { PageRequest, PagedModel } from '@/shared/api/common.dto';

export async function getCommits(params: CommitSearchRequest & PageRequest) {
  return api.get('/api/v1/developers/commits', { searchParams: toSearchParams(params) }).json<PagedModel<Commit>>();
}
