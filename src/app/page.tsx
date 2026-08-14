'use client';

import { useState } from 'react';

import useWebLlm from '@/shared/components/llm/useWebLlm';

import cx from 'classnames';

export default function Home() {
  // status
  const [input, setInput] = useState<string>('');

  // hooks
  const { status, progress, onChatCompletion, messages, isStreaming } = useWebLlm();

  console.log(messages);

  return (
    <div className="flex size-full flex-col gap-3 p-4">
      <div className="w-full">
        <div className="flex flex-row gap-3">
          <div className="w-32 flex-none">{status}</div>
          <div className="flex-1">
            <progress className="progress w-full" value={progress} max={1} />
          </div>
        </div>
      </div>

      <div className="w-full">
        <form
          className="flex flex-row items-center justify-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onChatCompletion({ user: input });

            setInput('');
          }}
        >
          <input className="input w-full" value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="btn btn-primary" type="submit" disabled={isStreaming}>
            전송
          </button>
        </form>
      </div>

      <div className="w-full">
        <div className="flex h-96 w-full flex-col items-center gap-2 overflow-auto">
          {messages.map((message) => (
            <div key={message.id} className={cx('chat w-full', message.type === 'user' ? 'chat-end' : 'chat-start')}>
              <div className={cx('chat-bubble', message.type === 'user' ? 'chat-bubble-info' : 'chat-bubble-neutral')}>
                {message.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
