'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FilterBar } from './FilterBar';
import { OverviewKPICards } from './overview/OverviewKPICards';
import { DailyTrendChart } from './overview/DailyTrendChart';
import { SeasonalBarChart } from './overview/SeasonalBarChart';
import { SeasonSummaryCards } from './overview/SeasonSummaryCards';
import { Top10AirportTrend } from './flight-analysis/Top10AirportTrend';
import { AirportMarketSharePie, DomesticIntlPie } from './flight-analysis/MarketSharePieCharts';
import { Top5RoutesandGrowth } from './flight-analysis/Top5RoutesandGrowth';
import { AnalyticalTakeaway } from './AnalyticalTakeaway';
import type { FilterState } from '@/types/dashboard';
import {
  getMockFilterOptions,
  getMockOverviewSummary,
  getMockDailyTrend,
  getMockSeasonalData,
  getMockMarketShare,
  getMockFlightRatio,
  getMockTop5Data,
} from '@/lib/dashboard/mock-data';

const DEFAULT_FILTERS: FilterState = {
  continent: 'asia',
  country: 'TH',
  city: 'all',
  airport: 'all',
};

export function DashboardSection() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState('overview');
  const filterOptions = getMockFilterOptions(filters.continent, filters.country, filters.city);

  const summary = getMockOverviewSummary(filters);
  const dailyTrend = getMockDailyTrend(filters);
  const { seasonal, summary: seasonSummary } = getMockSeasonalData(filters);
  const marketShare = getMockMarketShare(filters);
  const flightRatio = getMockFlightRatio(filters);
  const top5Data = getMockTop5Data(filters);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TabsList className="h-11">
            <TabsTrigger value="overview" className="px-6 text-base">
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger value="analysis" className="px-6 text-base">
              วิเคราะห์การบิน
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Filter Bar — compact on analysis tab */}
        <FilterBar
          filters={filters}
          options={filterOptions}
          onFilterChange={setFilters}
          compact={activeTab === 'analysis'}
        />

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            <OverviewKPICards data={summary} />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
              <DailyTrendChart data={dailyTrend} />
              <AnalyticalTakeaway filters={filters} tab="overview" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
              <SeasonalBarChart data={seasonal} />
              <SeasonSummaryCards data={seasonSummary} />
            </div>
          </div>
        </TabsContent>

        {/* Flight Analysis Tab */}
        <TabsContent value="analysis" className="mt-6">
          <div className="space-y-6">
            <Top10AirportTrend filters={filters} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AirportMarketSharePie data={marketShare} />
              <DomesticIntlPie data={flightRatio} />
              <AnalyticalTakeaway filters={filters} tab="analysis" />
            </div>

            <Top5RoutesandGrowth data={top5Data} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
