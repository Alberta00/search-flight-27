'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterBar } from './FilterBar';
import type { FilterState } from '@/types/dashboard';
import { getMockFilterOptions } from '@/lib/dashboard/mock-data';

const DEFAULT_FILTERS: FilterState = {
  continent: 'asia',
  country: 'TH',
  city: 'all',
  airport: 'all',
};

interface DashboardShellProps {
  children: (filters: FilterState) => React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const activeTab = pathname.includes('flight-analysis') ? 'analysis' : 'overview';

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === 'overview') {
        router.push('/dashboard/overview');
      } else {
        router.push('/dashboard/flight-analysis');
      }
    },
    [router],
  );

  const filterOptions = getMockFilterOptions(filters.continent, filters.country, filters.city);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="h-10">
            <TabsTrigger value="overview" className="px-6">
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger value="analysis" className="px-6">
              วิเคราะห์การบิน
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} options={filterOptions} onFilterChange={setFilters} />

      {/* Tab Content */}
      <div>{children(filters)}</div>
    </div>
  );
}
