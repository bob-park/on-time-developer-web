'use client';

import { useState } from 'react';

import ReportPanel from '@/domain/commits/components/ReportPanel';
import dayjs from '@/shared/dayjs';

import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';

export default function WeeklyReportContents() {
  // state
  const [date, setDate] = useState<Dayjs>(dayjs());

  // hooks
  const t = useTranslations('report');

  const weekStart = date.startOf('isoWeek');
  const weekEnd = weekStart.endOf('isoWeek');

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t('weeklyTitle')}</h1>
        <div className="flex flex-row flex-wrap items-center gap-2">
          <span className="badge badge-ghost">
            {weekStart.format('YYYY-MM-DD (ddd)')} - {weekEnd.format('YYYY-MM-DD (ddd)')}
          </span>
          <DatePicker
            picker="week"
            allowClear={false}
            showWeek={false}
            value={date}
            format={(value) => {
              const monthStart = value.startOf('month');
              const week = value.startOf('isoWeek').diff(monthStart.startOf('isoWeek'), 'week') + 1;

              return t('weekOfMonth', { month: monthStart.format('YYYY-MM'), week });
            }}
            onChange={(value) => value && setDate(value)}
          />
        </div>
      </div>

      <ReportPanel from={weekStart.format('YYYY-MM-DDTHH:mm:ss')} to={weekEnd.format('YYYY-MM-DDTHH:mm:ss')} />
    </div>
  );
}
