'use client';

import { useEffect, useState } from 'react';

import { v4 as uuid } from 'uuid';

import { getEngine } from './engine';

type EngineStatus = 'loading' | 'ready' | 'unsupported';

type ChatMessages = {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  date: Date;
};

export default function useWebLlm(modelId?: string) {
  // useState
  const [status, setStatus] = useState<EngineStatus>('loading');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessages[]>([]);

  // useEffect
  useEffect(() => {
    if (!('gpu' in navigator)) {
      setStatus('unsupported');
      return;
    }
    getEngine({ modelId }, (_, p) => setProgress(p)).then(() => setStatus('ready'));
  }, []);

  // handle
  const handleChatCompletion = async ({ system = '', user }: { system?: string; user: string }) => {
    // add user message
    setMessages((prev) => {
      const newMessages = prev.slice();

      newMessages.push({
        id: uuid(),
        type: 'user',
        message: user,
        date: new Date(),
      });

      return newMessages;
    });

    setIsStreaming(true);

    const engine = await getEngine({ modelId });

    const stream = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      stream: true,
    });

    const nowMessageId = uuid();

    setMessages((prev) => {
      const newMessages = prev.slice();

      newMessages.push({
        id: nowMessageId,
        type: 'assistant',
        message: '',
        date: new Date(),
      });

      return newMessages;
    });

    for await (const chunk of stream) {
      console.log(chunk.choices[0].delta.content);

      setMessages((prev) => {
        const newMessages = prev.slice();

        const index = prev.findIndex((item) => item.id === nowMessageId);

        const newMessage = prev[index];

        console.log(index, newMessage);

        newMessages.splice(index, 1, {
          ...newMessage,
          message: newMessage.message + (chunk.choices[0].delta.content ?? ''),
        });

        return newMessages;
      });
    }

    setIsStreaming(false);
  };

  return { status, progress, messages, isStreaming, onChatCompletion: handleChatCompletion };
}
