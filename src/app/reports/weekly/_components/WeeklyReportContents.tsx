'use client';

import { useState } from 'react';

import ReportPanel from '@/domain/commits/components/ReportPanel';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

export default function WeeklyReportContents() {
  // state
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  // hooks
  const t = useTranslations('report');

  const weekStart = dayjs(date).startOf('isoWeek');
  const weekEnd = weekStart.endOf('isoWeek');

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t('weeklyTitle')}</h1>
        <div className="flex flex-row items-center gap-2">
          <span className="badge badge-ghost">
            {weekStart.format('YYYY-MM-DD')} ~ {weekEnd.format('YYYY-MM-DD')}
          </span>
          <input className="input input-sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <ReportPanel from={weekStart.format('YYYY-MM-DDTHH:mm:ss')} to={weekEnd.format('YYYY-MM-DDTHH:mm:ss')} />
    </div>
  );
}
