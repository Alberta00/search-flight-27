'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MarketShareItem, FlightRatio } from '@/types/dashboard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

interface AirportMarketSharePieProps {
  data: MarketShareItem[];
}

export function AirportMarketSharePie({ data }: AirportMarketSharePieProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg sm:text-xl font-bold text-center">
          ส่วนแบ่งเที่ยวบินตามสนามบิน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:flex-1 min-w-0">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data as AnyData[]}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="80%"
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString() + ' เที่ยวบิน',
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap sm:flex-col gap-2 sm:gap-3 sm:min-w-[150px] justify-center">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2 sm:gap-3">
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm sm:text-base font-medium whitespace-nowrap">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DomesticIntlPieProps {
  data: FlightRatio[];
}

export function DomesticIntlPie({ data }: DomesticIntlPieProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg sm:text-xl font-bold text-center">
          สัดส่วนเที่ยวบิน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:flex-1 min-w-0">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data as AnyData[]}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="80%"
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="label"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString() + ' เที่ยวบิน',
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap sm:flex-col gap-2 sm:gap-3 sm:min-w-[140px] justify-center">
            {data.map((item) => (
              <div key={item.category} className="flex items-center gap-2 sm:gap-3">
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm sm:text-base font-medium whitespace-nowrap">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
