'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyTrendPoint } from '@/types/dashboard';

type TrendLine = 'total' | 'departures' | 'arrivals';

const LINE_CONFIG: Record<TrendLine, { label: string; color: string }> = {
  total: { label: 'รวม', color: 'hsl(217, 91%, 60%)' },
  departures: { label: 'ขาออก', color: 'hsl(160, 84%, 39%)' },
  arrivals: { label: 'ขาเข้า', color: 'hsl(38, 92%, 50%)' },
};

interface DailyTrendChartProps {
  data: DailyTrendPoint[];
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const [activeLines, setActiveLines] = useState<Set<TrendLine>>(
    new Set(['total', 'departures', 'arrivals']),
  );

  const toggleLine = (line: TrendLine) => {
    setActiveLines((prev) => {
      const next = new Set(prev);
      if (next.has(line)) {
        if (next.size > 1) next.delete(line);
      } else {
        next.add(line);
      }
      return next;
    });
  };

  // Dynamic Y-axis
  const activeKeys = Array.from(activeLines) as string[];
  const allValues = data.flatMap((point) =>
    activeKeys.map((key) => (point[key as keyof typeof point] as number) || 0),
  );
  const dataMax = Math.max(...allValues);
  const dataMin = Math.min(...allValues);
  const niceStep = dataMax <= 50 ? 10 : dataMax <= 200 ? 25 : dataMax <= 500 ? 50 : dataMax <= 1000 ? 200 : dataMax <= 5000 ? 500 : 1000;
  const yMax = Math.ceil(dataMax * 1.1 / niceStep) * niceStep;
  const yMin = Math.max(0, Math.floor(dataMin * 0.9 / niceStep) * niceStep);
  const customTicks: number[] = [yMin];
  for (let t = Math.ceil(yMin / niceStep) * niceStep; t <= yMax; t += niceStep) {
    if (t > yMin) customTicks.push(t);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold">เทรนด์เที่ยวบิน <span className="text-sm font-normal text-muted-foreground ml-2">(เที่ยวบิน)</span></CardTitle>
          <div className="flex bg-primary/10 rounded-full p-1 gap-0.5">
            {(Object.entries(LINE_CONFIG) as [TrendLine, { label: string; color: string }][]).map(
              ([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleLine(key)}
                  className={`px-4 py-1.5 text-sm rounded-full font-medium transition-all cursor-pointer ${
                    activeLines.has(key)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-transparent text-primary hover:bg-primary/10'
                  }`}
                >
                  {config.label}
                </button>
              ),
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 15, fontWeight: 600 }}
              interval="preserveStartEnd"
              padding={{ left: 20, right: 20 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 15, fontWeight: 600 }}
              className="text-muted-foreground"
              type="number"
              domain={[yMin, yMax]}
              ticks={customTicks}
              allowDataOverflow={true}
              tickFormatter={(value: number) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '18px',
              }}
            />
            {activeLines.has('departures') && (
              <Line
                type="monotone"
                dataKey="departures"
                name="ขาออก"
                stroke={LINE_CONFIG.departures.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {activeLines.has('arrivals') && (
              <Line
                type="monotone"
                dataKey="arrivals"
                name="ขาเข้า"
                stroke={LINE_CONFIG.arrivals.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {activeLines.has('total') && (
              <Line
                type="monotone"
                dataKey="total"
                name="รวม"
                stroke={LINE_CONFIG.total.color}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
