'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEASON_COLORS } from '@/lib/dashboard/mock-data';
import type { SeasonalData } from '@/types/dashboard';

interface SeasonalBarChartProps {
  data: SeasonalData[];
}

export function SeasonalBarChart({ data }: SeasonalBarChartProps) {
  // Dynamic Y-axis
  const allValues = data.map((d) => d.flights);
  const dataMax = Math.max(...allValues);
  const niceStep = dataMax <= 1000 ? 200 : dataMax <= 5000 ? 500 : dataMax <= 10000 ? 1000 : 5000;
  const yMax = Math.ceil(dataMax / niceStep) * niceStep;
  const yMin = 500;
  const customTicks: number[] = [yMin];
  for (let t = Math.ceil(yMin / niceStep) * niceStep; t <= yMax; t += niceStep) {
    if (t > yMin) customTicks.push(t);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold">เทรนด์ฤดูกาล <span className="text-sm font-normal text-muted-foreground ml-2">(เที่ยวบิน)</span></CardTitle>
          <div className="flex items-center gap-5 text-base">
            <span className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded inline-block"
                style={{ backgroundColor: SEASON_COLORS.peak }}
              />
              <span className="font-medium">ฤดูท่องเที่ยว (Peak)</span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded inline-block"
                style={{ backgroundColor: SEASON_COLORS.low }}
              />
              <span className="font-medium">นอกฤดูท่องเที่ยว (Low)</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="monthShort"
              tick={{ fontSize: 20 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 15 }}
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
                color: '#000000',
                fontWeight: 'bold',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'เที่ยวบิน']}
            />
            <Bar dataKey="flights" radius={[4, 4, 0, 0]} maxBarSize={44}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={SEASON_COLORS[entry.season]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
