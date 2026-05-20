'use client';

import { LaunchCalendar } from '@/components/launches/launch-calendar';

export default function LaunchCalendarPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <LaunchCalendar locale={locale} />
    </div>
  );
}
