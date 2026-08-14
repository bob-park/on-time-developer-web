'use client';

import { useState } from 'react';

import { Commit } from '@/domain/commits/apis/commits.dto';
import CommitListItem from '@/domain/commits/components/CommitListItem';
import { usePeriodCommits } from '@/domain/commits/queries/commits';
import useWebLlm from '@/shared/components/llm/useWebLlm';

import { useTranslations } from 'next-intl';

const SYSTEM_PROMPT = `너는 개발자의 커밋 내역으로 업무 보고서를 작성하는 도우미다.
입력은 "저장소 | 커밋 메시지" 형식의 목록이다.
아래 마크다운 형식만 출력한다. 인사말이나 다른 설명은 절대 출력하지 않는다.

## {저장소 이름}

### {관련 커밋을 묶은 주제}

- 커밋 내용
- 커밋 내용

규칙:
- 저장소별로 ## 섹션을 만든다. 입력에 나온 저장소 순서를 유지한다.
- 각 저장소 안에서 관련 있는 커밋끼리 묶어 ### 주제 소제목을 붙인다.
- 커밋 메시지의 "feat:", "fix:", "refactor:" 같은 prefix 는 제거하고 내용만 쓴다.
- 커밋을 빠뜨리지 않는다. 없는 내용을 지어내지 않는다.`;

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
      <div className="flex flex-row items-center justify-between">
        <span className="text-sm opacity-70">{t('commits', { count: commits.length })}</span>
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
          <pre className="flex-1 overflow-y-auto p-4 pt-0 font-sans text-sm whitespace-pre-wrap">
            {report || <span className="opacity-50">{t('placeholder')}</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
