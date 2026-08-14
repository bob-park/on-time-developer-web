'use client';

import { useContext, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { ToastContext } from '@/shared/components/toast/ToastProvider';

import { useTranslations } from 'next-intl';

export default function QueryErrorToast() {
  // context
  const { push } = useContext(ToastContext);

  // hooks
  const t = useTranslations('common');

  // queries
  const queryClient = useQueryClient();

  // useEffect
  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error') {
        push(t('apiError'), 'error');
      }
    });
  }, [queryClient, push, t]);

  return null;
}
