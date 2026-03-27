'use client';

import type { OverviewSummary } from '@/types/dashboard';
import { growthDeltaTypeFromPct, growthTextClass } from '@/lib/dashboard/drill-down-data';

interface OverviewKPICardsProps {
  data: OverviewSummary;
}

export function OverviewKPICards({ data }: OverviewKPICardsProps) {
  const yoyTone = growthDeltaTypeFromPct(data.growthRate, 'yoy');
  const growthClass = growthTextClass(yoyTone);

  return (
    <div className="bg-blue-50 rounded-2xl p-6 sm:p-8">
      {/* Airport Name Header */}
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
        {data.iataCode}-{data.airportNameTh}
      </h2>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
        <div className="min-w-0">
          <p className="text-sm sm:text-base text-muted-foreground whitespace-nowrap">จำนวนเที่ยวบินทั้งหมด</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1 whitespace-nowrap">
            {data.totalFlights.toLocaleString()}
            <span className="text-sm sm:text-base font-normal text-muted-foreground ml-1">เที่ยวบิน/ปี</span>
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-sm sm:text-base text-muted-foreground whitespace-nowrap">สนามบินหลัก</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 whitespace-nowrap">
            {data.mainAirport}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-sm sm:text-base text-muted-foreground whitespace-nowrap">ช่วงฤดูท่องเที่ยว</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1 whitespace-nowrap">
            {data.peakSeasonRange}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-sm sm:text-base text-muted-foreground whitespace-nowrap">อัตราการเติบโต</p>
          <p className={`text-2xl sm:text-3xl font-bold mt-1 whitespace-nowrap ${growthClass}`}>
            {data.growthRate >= 0 ? '+' : ''}
            {data.growthRate}%
            <span className="text-sm sm:text-base font-normal text-muted-foreground ml-1">เทียบกับปีที่ผ่านมา</span>
          </p>
        </div>
      </div>
    </div>
  );
}
