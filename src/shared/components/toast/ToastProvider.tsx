'use client';

import { ReactNode, createContext, useMemo, useState } from 'react';

import { v4 as uuid } from 'uuid';

import Toast from './Toast';

export type MessageLevel = 'success' | 'warning' | 'error' | 'info' | 'message';

export interface ToastMessage {
  id: string;
  level: MessageLevel;
  message: string;
}

interface ToastProviderContextState {
  messages: ToastMessage[];
  push: (message: string, level: MessageLevel) => void;
}

interface ToastProviderProps {
  children: ReactNode;
  limit: number;
  timeout: number;
}

export const ToastContext = createContext<ToastProviderContextState>({
  messages: [],
  push: () => {},
});

export default function ToastProvider({ children, limit, timeout }: Readonly<ToastProviderProps>) {
  // state
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  // handle
  const handlePushMessage = (message: string, level: MessageLevel) => {
    setMessages((prev) => {
      const newMessages = prev.slice();

      if (newMessages.length >= limit) {
        newMessages.splice(newMessages.length - 1, 1);
      }

      newMessages.unshift({
        id: uuid(),
        level,
        message,
      });

      return newMessages;
    });
  };

  const handleRemove = (id: string) => {
    setMessages((prev) => prev.slice().filter((item) => item.id !== id));
  };

  // memorize
  const memorizeValue = useMemo(() => ({ messages, push: handlePushMessage }), [messages]);

  return (
    <ToastContext value={memorizeValue}>
      <div className="fixed top-20 right-0 z-50 mt-2 mr-5 mb-2 flex flex-col items-end gap-2">
        {messages.map((message) => (
          <Toast
            key={`alert-${message.id}`}
            message={message}
            timeout={timeout}
            onRemove={() => handleRemove(message.id)}
          />
        ))}
      </div>
      {children}
    </ToastContext>
  );
}
