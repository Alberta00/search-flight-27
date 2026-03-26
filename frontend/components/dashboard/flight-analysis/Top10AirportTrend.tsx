'use client';

import { useState, useMemo, memo, useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFlightData, FlightDataPoint, CHART_THEME } from '@/hooks/use-flight-data';
import type { FilterState } from '@/types/dashboard';

interface Top10AirportTrendProps {
  filters?: FilterState;
}

// 4. Abstract the Tooltip Component
const TooltipOverlay = memo(({
  data,
  label,
  coordinate,
  containerRect
}: {
  data: FlightDataPoint[];
  label: string;
  coordinate: { x: number; y: number };
  containerRect: DOMRect | null;
}) => {
  if (!data.length || !coordinate || !containerRect) return null;

  // 7. Switch to "Portal" Rendering
  if (typeof document === 'undefined') return null;

  // Calculate top/left position avoiding edge clippings
  const left = containerRect.left + coordinate.x + 20;
  const top = containerRect.top + coordinate.y - 50;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 9999,
        pointerEvents: 'none',
        transform: 'translateY(-50%)',
      }}
      className="bg-card text-card-foreground p-3.5 rounded-lg shadow-xl border border-border"
    >
      <p className="font-bold mb-2 text-base border-b pb-1 dark:border-slate-800">{label}</p>
      {/* 6. Utilize CSS Grid for Tooltips */}
      <div className="grid grid-cols-[auto_auto_auto] gap-x-4 gap-y-1.5 items-center">
        {data.map((item, idx) => {
          const s = CHART_THEME.colors[idx % CHART_THEME.colors.length];
          return (
            <Fragment key={item.airportCode}>
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: item.color || s }}
              />
              <span className="text-sm font-medium whitespace-nowrap">{item.name || item.airportCode}</span>
              <span className="text-sm text-right tabular-nums whitespace-nowrap">
                {item.flightCount.toLocaleString()} <span className="text-muted-foreground text-xs font-normal">เที่ยวบิน</span>
              </span>
            </Fragment>
          );
        })}
      </div>
    </div>,
    document.body
  );
});

TooltipOverlay.displayName = 'TooltipOverlay';

export function Top10AirportTrend({ filters }: Top10AirportTrendProps) {
  // 1. Decouple Data from View -> useFlightData
  const {
    groupBy,
    setGroupBy,
    series,
    rawData,
    activeItems,
    toggleItem,
    toggleAll,
    allActive,
    yMin,
    yMax,
    customTicks,
  } = useFlightData(filters);

  // 3. Implement a "Active Index" State
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeCoordinate, setActiveCoordinate] = useState<{ x: number; y: number } | null>(null);
  
  // 8. Debounce the Hover Event
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track hovered line to manipulate z-index layer
  const [hoveredSeriesCode, setHoveredSeriesCode] = useState<string | null>(null);

  // Container ref for reliable Portal Positioning base calculation
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, []);

  // Recharts specific mouse move
  const handleMouseMove = (e: any) => {
    if (e && e.activeTooltipIndex !== undefined && e.activeCoordinate) {
      if (activeIndex === null) {
        // Tooltip is currently hidden, require 50ms intent to display it (prevent flash-flicker)
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          setActiveIndex(e.activeTooltipIndex);
          setActiveCoordinate(e.activeCoordinate);
        }, 50);
      } else {
        // Tooltip is already active! Update instantly for smooth scrubbing without trailing-debounce lag.
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setActiveIndex(e.activeTooltipIndex);
        setActiveCoordinate(e.activeCoordinate);
      }
    } else {
      handleMouseLeave();
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    // Add deliberate 50ms intent to leaving to prevent accidental flickers when passing overlapping gaps
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveIndex(null);
      setActiveCoordinate(null);
    }, 50);
  };

  // Compile tooltip data
  const hoveredData: FlightDataPoint[] = useMemo(() => {
    if (activeIndex === null || !rawData[activeIndex]) return [];
    
    const point = rawData[activeIndex];
    const month = point.month;
    
    const mapped: FlightDataPoint[] = series
      .filter((s) => activeItems.has(s.code))
      .map((s) => ({
        airportCode: s.code,
        month,
        flightCount: (point[s.code] as number) || 0,
        color: s.color,
        name: s.name,
      }));

    // 5. Apply a Sorting Utility (leaderboard)
    return mapped.sort((a, b) => b.flightCount - a.flightCount);
  }, [activeIndex, rawData, series, activeItems]);

  // 10. Layer the Canvas: programmatically reorder the Line elements so the hovered one comes last (highest z-index on SVG stack)
  const sortedSeries = useMemo(() => {
    if (!hoveredSeriesCode) return series;
    return [...series].sort((a, b) => {
      if (a.code === hoveredSeriesCode) return 1;
      if (b.code === hoveredSeriesCode) return -1;
      return 0;
    });
  }, [series, hoveredSeriesCode]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl font-bold">
            แนวโน้มเที่ยวบินรายเดือนของ{groupBy === 'airport' ? 'สนามบิน' : 'สายการบิน'} (Top 10) <span className="text-base font-medium text-muted-foreground ml-2">(เที่ยวบิน)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAll}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all cursor-pointer ${
                allActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              รวม
            </button>
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={groupBy === 'airport' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 text-sm px-4"
                onClick={() => setGroupBy('airport')}
              >
                สนามบิน
              </Button>
              <Button
                variant={groupBy === 'airline' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 text-sm px-4"
                onClick={() => setGroupBy('airline')}
              >
                สายการบิน
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6 -mt-1" ref={containerRef}>
          {/* Chart */}
          <div className="flex-1 min-w-0" onMouseLeave={handleMouseLeave}>
            <ResponsiveContainer width="100%" height={400}>
              {useMemo(() => (
                <LineChart 
                  data={rawData} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 16 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 16 }}
                    className="text-muted-foreground"
                    type="number"
                    domain={[yMin, yMax]}
                    ticks={customTicks}
                    allowDataOverflow={true}
                    tickFormatter={(value: number) => value.toLocaleString()}
                  />
                  
                  {sortedSeries.map((s) =>
                    activeItems.has(s.code) ? (
                      <Line
                        key={s.code}
                        type="monotone"
                        dataKey={s.code}
                        stroke={s.color}
                        strokeWidth={hoveredSeriesCode === s.code ? 4 : 2.5}
                        strokeOpacity={hoveredSeriesCode && hoveredSeriesCode !== s.code ? 0.3 : 1}
                        dot={hoveredSeriesCode === s.code ? { r: 5, fill: s.color } : { r: 3, fill: s.color }}
                        activeDot={{ r: 6 }}
                        isAnimationActive={false} // Important so layering sorting doesn't constantly replay animation!
                        onMouseEnter={() => setHoveredSeriesCode(s.code)}
                        onMouseLeave={() => setHoveredSeriesCode(null)}
                      />
                    ) : null,
                  )}
                </LineChart>
              ), [rawData, sortedSeries, activeItems, yMin, yMax, customTicks, hoveredSeriesCode])}
            </ResponsiveContainer>
            
            {/* 4. & 7. Render our Custom Tooltip via Portal */}
            <TooltipOverlay 
              data={hoveredData}
              label={activeIndex !== null && rawData[activeIndex] ? rawData[activeIndex].month : ''}
              coordinate={activeCoordinate as { x: number; y: number }}
              containerRect={containerRect}
            />
          </div>

          {/* Clickable Legend Panel */}
          <div className="flex flex-wrap lg:flex-col gap-2 lg:min-w-[200px] mt-4 lg:mt-0">
            {series.map((s) => {
              const isActive = activeItems.has(s.code);
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => toggleItem(s.code)}
                  onMouseEnter={() => setHoveredSeriesCode(s.code)}
                  onMouseLeave={() => setHoveredSeriesCode(null)}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-transparent hover:bg-muted/50'
                      : 'bg-muted/30 opacity-40 hover:opacity-60'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-base font-medium whitespace-nowrap">
                    {s.code}-{s.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
