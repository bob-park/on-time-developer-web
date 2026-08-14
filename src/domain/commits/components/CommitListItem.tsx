import { Commit } from '@/domain/commits/apis/commits.dto';
import dayjs from '@/shared/dayjs';

export default function CommitListItem({ commit }: Readonly<{ commit: Commit }>) {
  return (
    <div className="border-base-300 flex flex-col gap-1 border-b px-4 py-3 last:border-none">
      <div className="font-bold">{commit.commitMessage}</div>
      <div className="flex flex-row flex-wrap items-center gap-2 text-xs opacity-70">
        <span className="badge badge-sm badge-soft badge-primary">{commit.repo}</span>
        <span className="badge badge-sm badge-soft badge-info">{commit.branch}</span>
        <span className="badge badge-sm badge-soft badge-warning">{commit.author}</span>
        <span className="font-mono">{commit.commitId.slice(0, 7)}</span>
        <span>{dayjs(commit.createdDate).format('YYYY-MM-DD HH:mm')}</span>
      </div>
    </div>
  );
}
