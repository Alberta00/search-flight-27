'use client';

import { TrendingUp, Plane } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Top5Data, Top5RouteItem } from '@/types/dashboard';

interface Top5RoutesandGrowthProps {
  data: Top5Data;
}

function RouteBar({ item, maxValue, showFlights }: { item: Top5RouteItem; maxValue: number; showFlights: boolean }) {
  const percentage = showFlights
    ? (item.flights / maxValue) * 100
    : (item.growthRate / maxValue) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-base sm:text-lg font-medium min-w-0">
          <span className="whitespace-nowrap">{item.origin}-{item.originName}</span>
          <Plane className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="whitespace-nowrap">{item.destination}-{item.destinationName}</span>
        </div>
        <span className="text-base sm:text-lg font-bold whitespace-nowrap ml-3">
          {showFlights ? `${item.flights.toLocaleString()} เที่ยวบิน` : `+${item.growthRate}%`}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function Top5RoutesandGrowth({ data }: Top5RoutesandGrowthProps) {
  const maxPopular = Math.max(...data.popular.map((r) => r.flights));
  const maxGrowth = Math.max(...data.growing.map((r) => r.growthRate));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Popular Routes */}
      <Card className="bg-blue-50/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold">
                5 อันดับเส้นทางการบินยอดนิยม
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">ปริมาณเที่ยวบินรายเดือน</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {data.popular.map((item, i) => (
            <RouteBar key={i} item={item} maxValue={maxPopular} showFlights={true} />
          ))}
        </CardContent>
      </Card>

      {/* Growing Routes */}
      <Card className="bg-blue-50/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold">
                5 อันดับเส้นทางการบินที่กำลังเติบโต
              </CardTitle>
              <p className="text-base text-muted-foreground mt-1">ปริมาณเที่ยวบินรายเดือน - เมื่อเทียบกับเดือนที่แล้ว</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500 shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {data.growing.map((item, i) => (
            <RouteBar key={i} item={item} maxValue={maxGrowth} showFlights={false} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
