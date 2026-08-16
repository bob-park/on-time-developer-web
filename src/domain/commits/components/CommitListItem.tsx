import { Commit } from '@/domain/commits/apis/commits.dto';
import dayjs from '@/shared/dayjs';

export default function CommitListItem({ commit }: Readonly<{ commit: Commit }>) {
  return (
    <div className="border-base-300 flex flex-col gap-1 border-b px-4 py-3 last:border-none">
      <div className="font-bold">{commit.commitMessage}</div>
      <div className="flex flex-row flex-wrap items-center gap-2 text-xs">
        <span className="badge badge-sm badge-primary">{commit.repo}</span>
        <span className="badge badge-sm badge-info">{commit.branch}</span>
        <span className="badge badge-sm badge-warning">{commit.author}</span>
        <span className="badge badge-sm badge-ghost">📅 {dayjs(commit.commitDate).format('YYYY-MM-DD HH:mm')}</span>
        <span className="font-mono opacity-70">{commit.commitId.slice(0, 7)}</span>
      </div>
    </div>
  );
}
