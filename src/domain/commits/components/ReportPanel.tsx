'use client';

import { useState } from 'react';

import { Commit } from '@/domain/commits/apis/commits.dto';
import CommitListItem from '@/domain/commits/components/CommitListItem';
import { usePeriodCommits } from '@/domain/commits/queries/commits';
import ModelSelect from '@/shared/components/llm/ModelSelect';
import useWebLlm from '@/shared/components/llm/useWebLlm';

import { useTranslations } from 'next-intl';
import Markdown from 'react-markdown';

const SYSTEM_PROMPT = `너는 개발자의 커밋 내역으로 업무 보고서를 작성하는 도우미다.
입력은 "저장소 | 커밋 메시지" 형식의 목록이다.
아래 마크다운 형식만 출력한다. 인사말이나 다른 설명은 절대 출력하지 않는다.

다음 형식으로 한국어 요약을 작성하세요: 
아래는 예시입니다.불필요한 내용 다 제거하고 아래 내용만 반환해줘

1. malgn/eventify-api
  - 인증 서버
    - 권한 개편 (OpenFGA 적용)
  - 관리자 페이지
    - 전체적인 UI 수정
  - api 
    - 상장 퍼블리쉬 기능 추가 (퍼블리쉬 해야 일반 사용자에게 노출)
    - 관심 세션 기능 추가
    - 권한 개편 (OpenFGA 적용)
    - 학회 및 구독 Plan 기능 추가`;

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
            {report ? (
              <Markdown
                components={{
                  h2: (props) => <h2 className="mt-4 text-base font-bold first:mt-0" {...props} />,
                  h3: (props) => <h3 className="text-primary mt-3 text-sm font-bold" {...props} />,
                  ul: (props) => <ul className="list-disc pl-5" {...props} />,
                }}
              >
                {report}
              </Markdown>
            ) : (
              <span className="opacity-50">{t('placeholder')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
