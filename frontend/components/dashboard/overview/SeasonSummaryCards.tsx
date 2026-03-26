'use client';

import type { SeasonSummary } from '@/types/dashboard';

interface SeasonSummaryCardsProps {
  data: SeasonSummary;
}

export function SeasonSummaryCards({ data }: SeasonSummaryCardsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Peak Season */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-6 py-5">
        <p className="text-base sm:text-lg font-bold text-amber-900 text-center">Peak season</p>
        <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1 text-center">
          {data.peakRange}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2 text-center whitespace-nowrap">
          {data.peakFlights.toLocaleString()}
          <span className="text-sm sm:text-base font-normal text-muted-foreground ml-1">เที่ยวบิน/เดือน</span>
        </p>
      </div>

      {/* Low Season */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 px-6 py-5">
        <p className="text-base sm:text-lg font-bold text-blue-900 text-center">Low season</p>
        <p className="text-xl sm:text-2xl font-bold text-blue-700 mt-1 text-center">
          {data.lowRange}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2 text-center whitespace-nowrap">
          {data.lowFlights.toLocaleString()}
          <span className="text-sm sm:text-base font-normal text-muted-foreground ml-1">เที่ยวบิน/เดือน</span>
        </p>
      </div>
    </div>
  );
}
