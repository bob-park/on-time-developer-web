'use client';

import { useState } from 'react';

import { CommitSearchRequest } from '@/domain/commits/apis/commits.dto';
import CommitListItem from '@/domain/commits/components/CommitListItem';
import { useCommits } from '@/domain/commits/queries/commits';
import useInfinityScroll from '@/shared/hooks/useInfinityScroll';

import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';

const { RangePicker } = DatePicker;

type FilterFields = {
  commitMessage: string;
  repo: string;
  branch: string;
  range: [Dayjs, Dayjs] | null;
};

const EMPTY_FILTER: FilterFields = { commitMessage: '', repo: '', branch: '', range: null };

function toSearchRequest(fields: FilterFields): CommitSearchRequest {
  return {
    commitMessage: fields.commitMessage || undefined,
    repo: fields.repo || undefined,
    branch: fields.branch || undefined,
    createdDateFrom: fields.range ? fields.range[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss') : undefined,
    createdDateTo: fields.range ? fields.range[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss') : undefined,
  };
}

export default function CommitsContents() {
  // state
  const [fields, setFields] = useState<FilterFields>(EMPTY_FILTER);
  const [applied, setApplied] = useState<CommitSearchRequest>({});

  // hooks
  const t = useTranslations('commits');

  // queries
  const { commits, totalElements, isLoading, fetchNextPage, hasNextPage } = useCommits(applied);

  const [bottomRef] = useInfinityScroll({
    hasMore: !!hasNextPage,
    onNext: async () => {
      await fetchNextPage();
    },
  });

  // handle
  const handleChange = (key: 'commitMessage' | 'repo' | 'branch') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(toSearchRequest(fields));
  };

  const handleReset = () => {
    setFields(EMPTY_FILTER);
    setApplied({});
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <form className="flex flex-row flex-wrap items-center gap-2" onSubmit={handleSearch}>
        <input
          className="input input-sm w-56"
          value={fields.commitMessage}
          onChange={handleChange('commitMessage')}
          placeholder={t('searchPlaceholder')}
        />
        <input
          className="input input-sm w-40"
          value={fields.repo}
          onChange={handleChange('repo')}
          placeholder={t('repoPlaceholder')}
        />
        <input
          className="input input-sm w-40"
          value={fields.branch}
          onChange={handleChange('branch')}
          placeholder={t('branchPlaceholder')}
        />
        <RangePicker
          value={fields.range}
          onChange={(value) =>
            setFields((prev) => ({ ...prev, range: value?.[0] && value?.[1] ? [value[0], value[1]] : null }))
          }
        />
        <button type="submit" className="btn btn-primary btn-sm">
          {t('search')}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
          {t('reset')}
        </button>
      </form>

      <div className="text-sm opacity-70">{t('total', { count: totalElements })}</div>

      <div className="bg-base-200 rounded-box shadow">
        {commits.map((commit) => (
          <CommitListItem key={commit.id} commit={commit} />
        ))}
        {!isLoading && commits.length === 0 && <p className="p-8 text-center opacity-60">{t('empty')}</p>}
        {isLoading && <div className="loading loading-spinner mx-auto my-8 block" />}
      </div>

      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
