'use client';

import { useState } from 'react';

import ReportPanel from '@/domain/commits/components/ReportPanel';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

export default function DailyReportContents() {
  // state
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  // hooks
  const t = useTranslations('report');

  const from = dayjs(date).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const to = dayjs(date).endOf('day').format('YYYY-MM-DDTHH:mm:ss');

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t('dailyTitle')}</h1>
        <input className="input input-sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <ReportPanel from={from} to={to} />
    </div>
  );
}
