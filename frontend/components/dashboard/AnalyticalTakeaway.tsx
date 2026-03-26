'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getMockTakeawayInsights } from '@/lib/dashboard/mock-data';
import type { FilterState } from '@/types/dashboard';

interface AnalyticalTakeawayProps {
  filters: FilterState;
  tab: 'overview' | 'analysis';
}

export function AnalyticalTakeaway({ filters, tab }: AnalyticalTakeawayProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = () => {
    setLoading(true);
    const timer = setTimeout(() => {
      setInsights(getMockTakeawayInsights(tab));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    const cleanup = fetchInsights();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, tab]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            สรุปเชิงวิเคราะห์
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInsights}
            disabled={loading}
            className="h-9 text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            สร้างใหม่
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="flex gap-3 text-sm sm:text-base leading-relaxed">
                <span className="text-primary font-bold mt-0.5 shrink-0 text-lg">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
