import { useState, useMemo } from 'react';
import { getMockTop10Trend } from '@/lib/dashboard/mock-data';
import type { FilterState, GroupByMode, MonthlyTrendSeries } from '@/types/dashboard';

export interface FlightDataPoint {
  airportCode: string;
  month: string;
  flightCount: number;
  color?: string;
  name?: string;
}

export const CHART_THEME = {
  colors: [
    'hsl(217, 91%, 60%)',
    'hsl(160, 84%, 39%)',
    'hsl(38, 92%, 50%)',
    'hsl(280, 67%, 55%)',
    'hsl(346, 77%, 50%)',
    'hsl(190, 90%, 45%)',
    'hsl(100, 60%, 45%)',
    'hsl(25, 95%, 53%)',
    'hsl(220, 70%, 45%)',
    'hsl(330, 65%, 50%)',
  ],
};

export function useFlightData(filters?: FilterState) {
  const [groupBy, setGroupBy] = useState<GroupByMode>('airport');
  
  // Fetch raw data
  const { series, data: rawData } = useMemo(() => {
    return getMockTop10Trend(groupBy, filters);
  }, [groupBy, filters]);

  // Track active items
  const [activeItems, setActiveItems] = useState<Set<string>>(
    new Set(series.map((s) => s.code))
  );

  // Group by change handler
  const handleGroupByChange = (mode: GroupByMode) => {
    setGroupBy(mode);
    const newSeries = getMockTop10Trend(mode, filters).series;
    setActiveItems(new Set(newSeries.map((s) => s.code)));
  };

  const toggleItem = (code: string) => {
    setActiveItems((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        if (next.size > 1) next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (activeItems.size === series.length) {
      setActiveItems(new Set());
    } else {
      setActiveItems(new Set(series.map((s) => s.code)));
    }
  };

  const allValues = useMemo(() => {
    return rawData.flatMap((point) =>
      series.map((s) => (point[s.code] as number) || 0)
    );
  }, [rawData, series]);

  const dataMax = allValues.length > 0 ? Math.max(...allValues) : 0;
  const niceStep = dataMax <= 5000 ? 1000 : dataMax <= 10000 ? 2000 : dataMax <= 30000 ? 5000 : 10000;
  const yMax = Math.max(niceStep, Math.ceil((dataMax * 1.1) / niceStep) * niceStep);
  const yMin = 0;
  
  const customTicks: number[] = useMemo(() => {
    const ticks = [];
    for (let t = yMin; t <= yMax; t += niceStep) {
      ticks.push(t);
    }
    return ticks;
  }, [yMin, yMax, niceStep]);

  return {
    groupBy,
    setGroupBy: handleGroupByChange,
    series,
    rawData,
    activeItems,
    toggleItem,
    toggleAll,
    allActive: activeItems.size === series.length,
    yMin,
    yMax,
    customTicks,
  };
}
