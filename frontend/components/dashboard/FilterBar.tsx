'use client';

import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilterState, FilterOptions } from '@/types/dashboard';

interface FilterBarProps {
  filters: FilterState;
  options: FilterOptions;
  onFilterChange: (filters: FilterState) => void;
  compact?: boolean; // true = show only continent + country (for analysis tab)
}

export function FilterBar({ filters, options, onFilterChange, compact }: FilterBarProps) {
  const handleChange = useCallback(
    (key: keyof FilterState, value: string) => {
      const updated = { ...filters, [key]: value };
      if (key === 'continent') {
        updated.country = 'all';
        updated.city = 'all';
        updated.airport = 'all';
      } else if (key === 'country') {
        updated.city = 'all';
        updated.airport = 'all';
      } else if (key === 'city') {
        updated.airport = 'all';
      }
      onFilterChange(updated);
    },
    [filters, onFilterChange],
  );

  const continentIsAll = filters.continent === 'all';
  const countryIsAll = filters.country === 'all';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Continent */}
      <Select value={filters.continent} onValueChange={(v) => handleChange('continent', v)}>
        <SelectTrigger className="w-[160px] h-11 text-base">
          <SelectValue placeholder="ทวีป" />
        </SelectTrigger>
        <SelectContent>
          {options.continents.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-base">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Country — disabled when continent is "all" */}
      <Select
        value={filters.country}
        onValueChange={(v) => handleChange('country', v)}
        disabled={continentIsAll}
      >
        <SelectTrigger className={`w-[160px] h-11 text-base ${continentIsAll ? 'opacity-40 cursor-not-allowed' : ''}`}>
          <SelectValue placeholder="ประเทศ" />
        </SelectTrigger>
        <SelectContent>
          {options.countries.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-base">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!compact && (
        <>
          {/* City — disabled when continent or country is "all" */}
          <Select
            value={filters.city}
            onValueChange={(v) => handleChange('city', v)}
            disabled={continentIsAll || countryIsAll}
          >
            <SelectTrigger className={`w-[200px] h-11 text-base ${continentIsAll || countryIsAll ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <SelectValue placeholder="เมือง" />
            </SelectTrigger>
            <SelectContent>
              {options.cities.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-base">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Airport — disabled when anything above is "all" */}
          <Select
            value={filters.airport}
            onValueChange={(v) => handleChange('airport', v)}
            disabled={continentIsAll || countryIsAll || filters.city === 'all'}
          >
            <SelectTrigger className={`w-[240px] h-11 text-base ${continentIsAll || countryIsAll || filters.city === 'all' ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <SelectValue placeholder="สนามบิน" />
            </SelectTrigger>
            <SelectContent>
              {options.airports.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-base">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
}
