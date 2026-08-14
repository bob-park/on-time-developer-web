'use client';

import { useEffect, useRef, useState } from 'react';

import ModelSelect from '@/shared/components/llm/ModelSelect';
import useWebLlm from '@/shared/components/llm/useWebLlm';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

const SYSTEM_PROMPT = `너는 "OnTime Developer" 웹사이트의 고객지원 챗봇이다. 아래 내용만 근거로 한국어로 짧고 친절하게 답한다. 모르는 내용은 모른다고 답한다.

OnTime Developer 는 개발자의 커밋 내역을 조회하고 AI 로 업무 보고서를 만드는 도구다.
- 대시보드(/dashboard): 이번주 커밋 수, 최다 커밋 저장소, 일일 커밋 수 차트, 최근 커밋을 보여준다.
- 커밋 목록(/commits): 내 커밋을 커밋 메시지/저장소/브랜치/기간으로 필터링해 조회한다.
- 일일 보고(/reports/daily): 날짜를 선택하고 "보고서 생성" 버튼을 누르면 그 날의 커밋으로 AI 가 보고서를 작성한다.
- 주간 보고(/reports/weekly): 주(월~일)를 선택해 같은 방식으로 주간 보고서를 작성한다.
- 보고서는 저장되지 않으며, 복사 버튼으로 클립보드에 복사할 수 있다.
- AI 기능은 브라우저 안에서 동작하며(WebGPU), Chrome 이 필요하다. 최초 1회 모델 다운로드가 필요하다.
- 테마(라이트/다크)와 언어는 우측 상단에서 변경한다. 로그아웃은 우측 상단 아바타 메뉴에 있다.`;

export default function Chatbot() {
  // ref
  const messagesRef = useRef<HTMLDivElement>(null);

  // state
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');

  // hooks
  const t = useTranslations('chatbot');
  const { status, progress, messages, isStreaming, onChatCompletion } = useWebLlm();

  // useEffect
  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages]);

  // handle
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isStreaming || status !== 'ready') {
      return;
    }

    void onChatCompletion({ system: SYSTEM_PROMPT, user: input.trim() });
    setInput('');
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3">
      <div
        className={cx(
          'card bg-base-200 pointer-events-auto flex h-[28rem] w-80 flex-col shadow-2xl transition-all duration-300',
          'max-sm:fixed max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:rounded-none',
          open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-6 opacity-0 max-sm:translate-y-full',
        )}
      >
        <div className="flex flex-row items-center justify-between gap-2 p-3">
          <span className="flex-none font-bold">💬 {t('title')}</span>
          <ModelSelect disabled={status === 'loading' || isStreaming} />
          <button type="button" className="btn btn-ghost btn-sm btn-circle flex-none" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <div ref={messagesRef} className="flex-1 overflow-y-auto px-3">
          {messages.length === 0 && <p className="text-sm opacity-60">{t('empty')}</p>}
          {messages.map((message) => (
            <div key={message.id} className={cx('chat', message.type === 'user' ? 'chat-end' : 'chat-start')}>
              <div
                className={cx(
                  'chat-bubble text-sm whitespace-pre-wrap',
                  message.type === 'user' && 'chat-bubble-primary',
                )}
              >
                {message.message}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3">
          {status === 'unsupported' && <p className="text-warning text-sm">{t('unsupported')}</p>}
          {status === 'loading' && (
            <div className="flex flex-row items-center gap-2">
              <span className="text-xs opacity-60">{t('loading')}</span>
              <progress className="progress progress-primary flex-1" value={progress} max={1} />
            </div>
          )}
          {status === 'ready' && (
            <form className="flex flex-row gap-2" onSubmit={handleSubmit}>
              <input
                className="input input-sm flex-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholder')}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={isStreaming || !input.trim()}>
                ➤
              </button>
            </form>
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-circle btn-lg pointer-events-auto shadow-xl"
        aria-label={t('title')}
        onClick={() => setOpen((prev) => !prev)}
      >
        💬
      </button>
    </div>
  );
}
