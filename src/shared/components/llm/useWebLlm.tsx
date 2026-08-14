'use client';

import { useEffect, useState } from 'react';

import { useStore } from '@/shared/store/rootStore';

import { v4 as uuid } from 'uuid';

import { getEngine, subscribeProgress } from './engine';

type EngineStatus = 'loading' | 'ready' | 'unsupported';

type ChatMessages = {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  date: Date;
};

export default function useWebLlm() {
  // state
  const [status, setStatus] = useState<EngineStatus>('loading');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessages[]>([]);

  // store
  const modelId = useStore((state) => state.llm.modelId);

  // useEffect
  useEffect(() => {
    if (!('gpu' in navigator) || !navigator.userAgent.includes('Chrome')) {
      setStatus('unsupported');
      return;
    }

    setStatus('loading');
    setProgress(0);

    const unsubscribe = subscribeProgress((_, p) => setProgress(p));

    getEngine({ modelId })
      .then(() => setStatus('ready'))
      .catch(() => setStatus('unsupported'));

    return unsubscribe;
  }, [modelId]);

  // handle
  const handleGenerate = async ({
    system = '',
    user,
    onDelta,
  }: {
    system?: string;
    user: string;
    onDelta?: (fullText: string) => void;
  }) => {
    setIsStreaming(true);

    try {
      const engine = await getEngine({ modelId });

      const stream = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
        stream: true,
      });

      let fullText = '';

      for await (const chunk of stream) {
        fullText += chunk.choices[0].delta.content ?? '';
        onDelta?.(fullText);
      }

      return fullText;
    } finally {
      setIsStreaming(false);
    }
  };

  const handleChatCompletion = async ({ system = '', user }: { system?: string; user: string }) => {
    const userMessage: ChatMessages = { id: uuid(), type: 'user', message: user, date: new Date() };
    const assistantMessage: ChatMessages = { id: uuid(), type: 'assistant', message: '', date: new Date() };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    await handleGenerate({
      system,
      user,
      onDelta: (fullText) =>
        setMessages((prev) =>
          prev.map((item) => (item.id === assistantMessage.id ? { ...item, message: fullText } : item)),
        ),
    });
  };

  return {
    status,
    progress,
    messages,
    isStreaming,
    onChatCompletion: handleChatCompletion,
    onGenerate: handleGenerate,
  };
}
