'use client';

import { useState } from 'react';

import { Commit } from '@/domain/commits/apis/commits.dto';
import CommitListItem from '@/domain/commits/components/CommitListItem';
import ReportMarkdown from '@/domain/commits/components/ReportMarkdown';
import { usePeriodCommits } from '@/domain/commits/queries/commits';
import ModelSelect from '@/shared/components/llm/ModelSelect';
import useWebLlm from '@/shared/components/llm/useWebLlm';

import { useTranslations } from 'next-intl';

const SYSTEM_PROMPT = `너는 개발자의 커밋 내역으로 업무 보고서를 작성하는 도우미다.
입력은 "저장소 | 커밋 메시지" 형식의 목록이다.
아래 마크다운 형식만 출력한다. 인사말이나 다른 설명은 절대 출력하지 않는다.

## {저장소 이름}

### {관련 커밋을 묶은 작업 단위}

- 작업 내용을 요약한 설명

규칙:
- 저장소별로 ## 섹션을 만든다. 입력에 나온 저장소 순서를 유지한다.
- 각 저장소 안에서 관련 있는 커밋끼리 작업 단위로 묶어 ### 소제목을 붙인다. 소제목은 2~6단어로 간결하게 쓴다.
- 각 작업 단위 아래 불릿은 무엇을 했는지 요약한 설명이다. 반드시 20자 이내로 쓴다.
- "feat:", "fix:", "refactor:", "build:", "docs:" 같은 커밋 prefix 는 결과에 절대 포함하지 않는다.
- 커밋 메시지를 그대로 옮겨 적지 않는다. 모든 커밋이 어느 작업 단위엔가 반영되어야 한다. 없는 내용을 지어내지 않는다.`;

function toPromptInput(commits: Commit[]) {
  return commits
    .slice()
    .reverse() // 시간순 정렬 (조회는 최신순)
    .map((commit) => `${commit.repo} | ${commit.commitMessage}`)
    .join('\n');
}

export default function ReportPanel({ from, to }: Readonly<{ from: string; to: string }>) {
  // state
  const [report, setReport] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // hooks
  const t = useTranslations('report');
  const { status, progress, isStreaming, onGenerate } = useWebLlm();

  // queries
  const { commits, isLoading } = usePeriodCommits(from, to);

  // handle
  const handleGenerate = () => {
    setReport('');
    void onGenerate({ system: SYSTEM_PROMPT, user: toPromptInput(commits), onDelta: setReport });
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(report);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2_000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <span className="text-sm opacity-70">{t('commits', { count: commits.length })}</span>
        <div className="flex flex-row items-center gap-2">
          <ModelSelect disabled={status === 'loading' || isStreaming} />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={status !== 'ready' || isStreaming || isLoading || commits.length === 0}
            onClick={handleGenerate}
          >
            {isStreaming && <span className="loading loading-spinner loading-xs" />}
            {t('generate')}
          </button>
        </div>
      </div>

      {status === 'unsupported' && <p className="text-warning text-sm">{t('unsupported')}</p>}
      {status === 'loading' && (
        <div className="flex flex-row items-center gap-2">
          <span className="text-xs opacity-60">{t('loading')}</span>
          <progress className="progress progress-primary flex-1" value={progress} max={1} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-base-200 rounded-box max-h-[32rem] overflow-y-auto shadow">
          {commits.map((commit) => (
            <CommitListItem key={commit.id} commit={commit} />
          ))}
          {!isLoading && commits.length === 0 && <p className="p-8 text-center opacity-60">{t('empty')}</p>}
        </div>

        <div className="bg-base-200 rounded-box flex max-h-[32rem] flex-col shadow">
          <div className="flex flex-row items-center justify-between p-4 pb-2">
            <span className="text-sm opacity-70">{t('result')}</span>
            <button type="button" className="btn btn-ghost btn-xs" disabled={!report} onClick={handleCopy}>
              📋 {isCopied ? t('copied') : t('copy')}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pt-0 text-sm">
            {report ? <ReportMarkdown markdown={report} /> : <span className="opacity-50">{t('placeholder')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
