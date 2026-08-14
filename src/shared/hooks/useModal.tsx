'use client';

import { useEffect, useRef } from 'react';

export default function useModal({ open, onClose }: Readonly<{ open: boolean; onClose?: () => void }>) {
  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // useEffect
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    open ? ref.current.showModal() : ref.current.close();
  }, [open]);

  // handle
  const handleKeyboardDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      handleBackdrop();
    }
  };

  const handleBackdrop = () => {
    onClose?.();
  };

  return { ref, onKeyDown: handleKeyboardDown, onBackdrop: handleBackdrop };
}
