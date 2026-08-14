'use client';

import Link from 'next/link';

import { Commit } from '@/domain/commits/apis/commits.dto';
import CommitListItem from '@/domain/commits/components/CommitListItem';
import { usePeriodCommits } from '@/domain/commits/queries/commits';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

const WEEK_START = dayjs().startOf('isoWeek');
const LAST_WEEK_START = WEEK_START.subtract(1, 'week');

function countBy(commits: Commit[], keyOf: (commit: Commit) => string) {
  const counts = new Map<string, number>();

  commits.forEach((commit) => {
    const key = keyOf(commit);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default function DashboardContents() {
  // hooks
  const t = useTranslations('dashboard');

  // queries
  const { commits, isLoading } = usePeriodCommits(
    LAST_WEEK_START.format('YYYY-MM-DDTHH:mm:ss'),
    WEEK_START.endOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss'),
  );

  const thisWeek = commits.filter((commit) => !dayjs(commit.createdDate).isBefore(WEEK_START));
  const lastWeek = commits.filter((commit) => dayjs(commit.createdDate).isBefore(WEEK_START));

  const diff = thisWeek.length - lastWeek.length;

  const topRepoBranch = countBy(thisWeek, (commit) => `${commit.repo}|${commit.branch}`)[0];

  const dailyCounts = Array.from({ length: 7 }, (_, index) => {
    const day = WEEK_START.add(index, 'day');
    return {
      label: day.format('dd'),
      count: thisWeek.filter((commit) => dayjs(commit.createdDate).isSame(day, 'day')).length,
    };
  });
  const maxDaily = Math.max(1, ...dailyCounts.map((day) => day.count));

  const repoCounts = countBy(thisWeek, (commit) => commit.repo);
  const maxRepo = Math.max(1, ...repoCounts.map(([, count]) => count));

  const recent = commits.slice(0, 5);

  if (isLoading) {
    return <div className="loading loading-spinner mx-auto my-24 block" />;
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* stat tiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card bg-base-200 p-5 shadow">
          <div className="text-sm opacity-70">{t('weeklyCount')}</div>
          <div className="text-3xl font-bold">
            {thisWeek.length}{' '}
            <span className={diff >= 0 ? 'text-success text-sm' : 'text-error text-sm'}>
              {diff >= 0 ? '▲' : '▼'} {Math.abs(diff)} ({t('vsLastWeek')})
            </span>
          </div>
        </div>
        <div className="card bg-base-200 p-5 shadow">
          <div className="text-sm opacity-70">{t('topRepo')}</div>
          {topRepoBranch ? (
            <>
              <div className="truncate text-lg font-bold">{topRepoBranch[0].split('|')[0]}</div>
              <div className="text-sm opacity-70">
                {topRepoBranch[0].split('|')[1]} · {topRepoBranch[1]} commits
              </div>
            </>
          ) : (
            <div className="opacity-60">{t('empty')}</div>
          )}
        </div>
      </div>

      {/* daily bar chart */}
      <div className="card bg-base-200 p-5 shadow">
        <div className="mb-4 text-sm opacity-70">{t('dailyChart')}</div>
        <div className="flex h-32 flex-row items-end gap-3">
          {dailyCounts.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs opacity-70">{day.count}</span>
              <div
                className="bg-primary w-full rounded-t"
                style={{ height: `${(day.count / maxDaily) * 100}%`, opacity: day.count === maxDaily ? 1 : 0.55 }}
              />
              <span className="text-xs opacity-70">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* repo distribution */}
        <div className="card bg-base-200 p-5 shadow">
          <div className="mb-4 text-sm opacity-70">{t('repoDistribution')}</div>
          <div className="flex flex-col gap-2">
            {repoCounts.length === 0 && <p className="opacity-60">{t('empty')}</p>}
            {repoCounts.map(([repo, count]) => (
              <div key={repo} className="flex flex-row items-center gap-2 text-sm">
                <span className="w-52 truncate">{repo}</span>
                <div className="bg-base-300 h-3 flex-1 overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${(count / maxRepo) * 100}%` }} />
                </div>
                <span className="w-6 text-right opacity-70">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* report shortcuts */}
        <div className="card bg-base-200 flex flex-col justify-center gap-3 p-5 shadow">
          <Link href="/reports/daily" className="btn btn-primary">
            ✨ {t('writeDailyReport')}
          </Link>
          <Link href="/reports/weekly" className="btn btn-outline">
            ✨ {t('writeWeeklyReport')}
          </Link>
        </div>
      </div>

      {/* recent commits */}
      <div className="card bg-base-200 shadow">
        <div className="flex flex-row items-center justify-between p-5 pb-0">
          <span className="text-sm opacity-70">{t('recentCommits')}</span>
          <Link href="/commits" className="link text-sm opacity-70">
            {t('viewAll')}
          </Link>
        </div>
        {recent.map((commit) => (
          <CommitListItem key={commit.id} commit={commit} />
        ))}
        {recent.length === 0 && <p className="p-8 text-center opacity-60">{t('empty')}</p>}
      </div>
    </div>
  );
}
