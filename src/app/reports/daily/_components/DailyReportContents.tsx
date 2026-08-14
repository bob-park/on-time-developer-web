'use client';

import { useState } from 'react';

import ReportPanel from '@/domain/commits/components/ReportPanel';
import dayjs from '@/shared/dayjs';

import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';

export default function DailyReportContents() {
  // state
  const [date, setDate] = useState<Dayjs>(dayjs());

  // hooks
  const t = useTranslations('report');

  const from = date.startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const to = date.endOf('day').format('YYYY-MM-DDTHH:mm:ss');

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t('dailyTitle')}</h1>
        <DatePicker allowClear={false} value={date} onChange={(value) => value && setDate(value)} />
      </div>

      <ReportPanel from={from} to={to} />
    </div>
  );
}
