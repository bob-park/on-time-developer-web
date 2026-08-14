'use client';

import { useState } from 'react';

import { FaCheckCircle } from 'react-icons/fa';
import { IoClose, IoWarning } from 'react-icons/io5';
import { RiErrorWarningFill, RiInformationLine } from 'react-icons/ri';
import { TbMessageFilled } from 'react-icons/tb';

import { MessageLevel, ToastMessage } from '@/shared/components/toast/ToastProvider';

import cx from 'classnames';

interface ToastProps {
  message: ToastMessage;
  timeout: number;
  onRemove?: () => void;
}

interface ToastIconProps {
  level: MessageLevel;
}

const LEVEL_STYLES: Record<MessageLevel, { label: string; text: string; bar: string }> = {
  success: { label: 'Success', text: 'text-[#14a94b] dark:text-[#1ed760]', bar: 'bg-[#14a94b] dark:bg-[#1ed760]' },
  error: { label: 'Error', text: 'text-[#dc4657] dark:text-[#f3727f]', bar: 'bg-[#dc4657] dark:bg-[#f3727f]' },
  warning: { label: 'Warning', text: 'text-[#d97706] dark:text-[#ffa42b]', bar: 'bg-[#d97706] dark:bg-[#ffa42b]' },
  info: { label: 'Info', text: 'text-[#2f7fd9] dark:text-[#539df5]', bar: 'bg-[#2f7fd9] dark:bg-[#539df5]' },
  message: { label: 'Message', text: 'text-[#181818] dark:text-white', bar: 'bg-[#181818] dark:bg-white' },
};

function ToastIcon({ level }: Readonly<ToastIconProps>) {
  switch (level) {
    case 'warning':
      return <IoWarning className="size-5" />;
    case 'success':
      return <FaCheckCircle className="size-5" />;
    case 'error':
      return <RiErrorWarningFill className="size-5" />;
    case 'message':
      return <TbMessageFilled className="size-5" />;
    default:
      return <RiInformationLine className="size-5" />;
  }
}

export default function Toast({ message, timeout, onRemove }: Readonly<ToastProps>) {
  // useState
  const [isLeaving, setIsLeaving] = useState<boolean>(false);

  const levelStyle = LEVEL_STYLES[message.level];

  // handle
  const handleClose = () => {
    setIsLeaving(true);
  };

  const handleTransitionEnd = () => {
    isLeaving && onRemove?.();
  };

  return (
    <div
      className={cx(
        'group relative flex w-[340px] items-start gap-3 overflow-hidden rounded-lg p-3.5 pb-4',
        'bg-[#fdfdfd] text-[#181818] shadow-[0_8px_24px_rgba(0,0,0,0.18)]',
        'dark:bg-[#181818] dark:text-white dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
        'animate-[toast-in_0.35s_cubic-bezier(0.2,0.9,0.3,1)]',
        'transition-[opacity,translate] duration-300',
        { 'translate-x-6 opacity-0': isLeaving },
      )}
      role="alert"
      onTransitionEnd={handleTransitionEnd}
    >
      <span className={cx('mt-0.5 flex-none', levelStyle.text)}>
        <ToastIcon level={message.level} />
      </span>
      <div className="min-w-0 flex-1">
        <div className={cx('text-xs font-semibold tracking-[1.4px] uppercase', levelStyle.text)}>
          {levelStyle.label}
        </div>
        <p className="text-sm text-pretty break-keep text-[#4d4d4d] dark:text-[#cbcbcb]">{message.message}</p>
      </div>
      <button
        aria-label="Close"
        className="flex-none cursor-pointer p-0.5 text-[#6a6a6a] dark:text-[#b3b3b3]"
        type="button"
        onClick={handleClose}
      >
        <IoClose className="size-4" />
      </button>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/8 dark:bg-white/8">
        {/* animation 은 class, duration 만 inline — shorthand 를 inline 으로 합치면 animation-play-state:running 이 인라인으로 박혀 hover pause 가 깨진다 */}
        <div
          className={cx(
            'h-full animate-[toast-shrink_linear_forwards] group-hover:[animation-play-state:paused]',
            levelStyle.bar,
          )}
          style={{ animationDuration: `${timeout}s` }}
          onAnimationEnd={handleClose}
        />
      </div>
    </div>
  );
}
