'use client';

import { useMemo, useState, useId, type ReactNode } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceDot,
} from 'recharts';
import {
  MK_AIRPORTS,
  growthDeltaTypeFromPct,
  parsePercentFromDelta,
} from '@/lib/dashboard/drill-down-data';
import { KPI_ACCENT } from '@/lib/dashboard/kpi-colors';
import {
  buildWowWeeklyTrendPoints,
} from '@/lib/dashboard/week-chart';
import { getAirportDetail } from '@/lib/dashboard/services/drilldown';
import { useDrillDown, BackButton, TimeToggle } from './DrillDownDashboard';
import type { TimeMode } from '@/types/dashboard';

type AirportDetail = ReturnType<typeof getAirportDetail>;

type InteractionState =
  | {
      kind: 'route';
      key: string;
      city: string;
      country: string;
      flights: number;
      direction: 'arrival' | 'departure';
    }
  | {
      kind: 'trend';
      key: string;
      label: string;
      value: number;
    }
  | {
      kind: 'season';
      key: string;
      label: string;
      value: number;
    }
  | {
      kind: 'hour';
      key: string;
      label: string;
      depAvg: number;
      arrAvg: number;
      totalAvg: number;
    }
  | {
      kind: 'airline';
      key: string;
      label: string;
      value: number;
    }
  | null;

type AirlineBase = {
  name: string;
  count: number;
};

type RouteMockModel = {
  key: string;
  city: string;
  country: string;
  flag: string;
  direction: 'arrival' | 'departure';
  totalFlights: number;
  airlineShares: Record<string, number>;
  hourShares: number[];
  wowShares: number[];
  monthShares: number[];
};

type TimeBucket =
  | {
      mode: 'wow';
      labels: string[];
    }
  | {
      mode: 'mom' | 'yoy';
      labels: string[];
    };

function buildRouteKey(city: string, country: string) {
  return `${city}__${country}`.toLowerCase();
}

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function seededFactor(seed: number, index: number, min = 0.82, max = 1.18) {
  const x = Math.sin(seed * 0.017 + index * 1.731) * 0.5 + 0.5;
  return min + x * (max - min);
}

function normalizeWeights(values: number[]) {
  const safe = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
  const sum = safe.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    if (safe.length === 0) return [];
    return safe.map(() => 1 / safe.length);
  }
  return safe.map((v) => v / sum);
}

function multiplyNormalize(base: number[], seedKey: string, min = 0.8, max = 1.2) {
  const seed = hashString(seedKey);
  return normalizeWeights(
    base.map((v, i) => v * seededFactor(seed, i + 1, min, max))
  );
}

function parseHourLabel(label: string) {
  const m = label.match(/^(\d{2})/);
  if (!m) return null;
  return Number(m[1]);
}

function round2(n: number) {
  return Number(n.toFixed(2));
}

function interactionLabel(interaction: InteractionState) {
  if (!interaction) return '';
  if (interaction.kind === 'route') {
    return `${interaction.city}, ${interaction.country} · ${
      interaction.direction === 'arrival' ? 'ขาเข้า' : 'ขาออก'
    }`;
  }
  if (interaction.kind === 'airline') return interaction.label;
  if (interaction.kind === 'hour') return interaction.label;
  if (interaction.kind === 'trend') return interaction.label;
  if (interaction.kind === 'season') return interaction.label;
  return '';
}

function SelectionChip({
  interaction,
  className = '',
}: {
  interaction: InteractionState;
  className?: string;
}) {
  if (!interaction) return null;

  let text = '';

  if (interaction.kind === 'route') {
    text = `Route: ${interaction.city}, ${interaction.country} · ${
      interaction.direction === 'arrival' ? 'ขาเข้า' : 'ขาออก'
    }`;
  } else if (interaction.kind === 'trend') {
    text = `Trend: ${interaction.label} · ${Math.round(interaction.value).toLocaleString()} เที่ยวบิน`;
  } else if (interaction.kind === 'season') {
    text = `Season: ${interaction.label} · ${Math.round(interaction.value).toLocaleString()} เที่ยวบิน`;
  } else if (interaction.kind === 'hour') {
    text = `Hour: ${interaction.label} · รวม ${interaction.totalAvg.toFixed(2)} เที่ยวบิน/ชม.`;
  } else if (interaction.kind === 'airline') {
    text = `Airline: ${interaction.label} · ${Math.round(interaction.value).toLocaleString()} เที่ยวบิน`;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary ${className}`}
    >
      <span>กำลังเลือก:</span>
      <span>{text}</span>
    </span>
  );
}

function DashboardInfoNote({ interaction }: { interaction: InteractionState }) {
  if (!interaction) return null;

  return (
    <div className="rounded-md border border-primary/15 bg-primary/5 px-3 py-2 text-[12px] text-muted-foreground">
      กราฟทั้งหมดกำลังใช้ selection เดียวกันอยู่ และกรองข้อมูลจาก mock relational data ชุดเดียวกัน
    </div>
  );
}

function ChartShell({
  children,
  interaction,
  className = '',
}: {
  children: ReactNode;
  interaction: InteractionState;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 rounded-[10px] border bg-card p-4 shadow-sm ${
        interaction ? 'border-primary/30' : 'border-border'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function ChartFrame({
  heightClass = 'h-[240px]',
  children,
}: {
  heightClass?: string;
  children: ReactNode;
}) {
  return <div className={`${heightClass} w-full min-w-0`}>{children}</div>;
}

function buildMockRouteModels(detail: AirportDetail): RouteMockModel[] {
  const airlines: AirlineBase[] = Array.isArray(detail.airlines)
    ? detail.airlines.map((a: any) => ({
        name: String(a.name ?? ''),
        count: Number(a.count ?? 0),
      }))
    : [];

  const depRows = (detail.routes ?? []).map((r: any) => ({ ...r, direction: 'departure' as const }));
  const arrRows = (detail.arrivals ?? []).map((r: any) => ({ ...r, direction: 'arrival' as const }));
  const allRows = [...depRows, ...arrRows];

  const depHourBase = Array.from({ length: 24 }, (_, h) => Number(detail.hourTotal?.[h] ?? 0));
  const arrHourBase = Array.from({ length: 24 }, (_, h) => Number(detail.hourTotalArr?.[h] ?? 0));

  const wowTrendBase = buildWowWeeklyTrendPoints(detail.daily ?? []).map((d: any) =>
    Number(d.flights ?? 0)
  );
  const monthBase = Array.isArray(detail.monthly)
    ? detail.monthly.map((v: any) => Number(v ?? 0))
    : [];

  return allRows.map((row, idx) => {
    const key = buildRouteKey(row.city, row.country);
    const routeSeedKey = `${key}:${row.direction}:${idx}`;

    const airlineBase = airlines.map((a, ai) => a.count * seededFactor(hashString(routeSeedKey), ai + 1, 0.82, 1.18));
    const airlineNorm = normalizeWeights(airlineBase);

    const airlineShares = Object.fromEntries(
      airlines.map((a, ai) => [a.name, airlineNorm[ai] ?? 0])
    );

    const hourBase = row.direction === 'departure' ? depHourBase : arrHourBase;
    const hourShares = multiplyNormalize(hourBase, `${routeSeedKey}:hours`, 0.8, 1.2);

    const wowShares = multiplyNormalize(
      wowTrendBase.length > 0 ? wowTrendBase : [1, 1, 1, 1, 1, 1, 1],
      `${routeSeedKey}:wow`,
      0.82,
      1.18
    );

    const monthShares = multiplyNormalize(
      monthBase.length > 0 ? monthBase : new Array(12).fill(1),
      `${routeSeedKey}:months`,
      0.82,
      1.18
    );

    return {
      key,
      city: row.city,
      country: row.country,
      flag: row.flag,
      direction: row.direction,
      totalFlights: Number(row.flights ?? 0),
      airlineShares,
      hourShares,
      wowShares,
      monthShares,
    };
  });
}

function buildTimeBucket(detail: AirportDetail, timeMode: TimeMode): TimeBucket {
  if (timeMode === 'wow') {
    const wow = buildWowWeeklyTrendPoints(detail.daily ?? []);
    return {
      mode: 'wow',
      labels: wow.map((d: any) => String(d.day)),
    };
  }

  const labels = Array.isArray(detail.monthLabels) ? detail.monthLabels.map(String) : [];
  if (timeMode === 'mom') {
    const nowIdx = new Date().getMonth();
    const startIdx = Math.max(0, nowIdx - 2);
    const endIdx = Math.min(11, nowIdx + 2);
    return {
      mode: 'mom',
      labels: labels.filter((_, i) => i >= startIdx && i <= endIdx),
    };
  }

  return {
    mode: 'yoy',
    labels,
  };
}

function getRouteTimeShare(
  route: RouteMockModel,
  label: string,
  timeBucket: TimeBucket,
  monthLabels: string[]
) {
  if (timeBucket.mode === 'wow') {
    const idx = timeBucket.labels.indexOf(label);
    if (idx < 0) return 0;
    return route.wowShares[idx] ?? 0;
  }

  const idx = monthLabels.indexOf(label);
  if (idx < 0) return 0;
  return route.monthShares[idx] ?? 0;
}

function getRouteInteractionFactor(
  route: RouteMockModel,
  interaction: InteractionState,
  timeBucket: TimeBucket,
  monthLabels: string[]
) {
  if (!interaction) return 1;

  if (interaction.kind === 'route') {
    if (interaction.direction !== route.direction) return 0;
    return interaction.key === route.key ? 1 : 0;
  }

  if (interaction.kind === 'airline') {
    return route.airlineShares[interaction.label] ?? 0;
  }

  if (interaction.kind === 'hour') {
    const hour = parseHourLabel(interaction.label);
    if (hour == null) return 0;
    return route.hourShares[hour] ?? 0;
  }

  if (interaction.kind === 'trend' || interaction.kind === 'season') {
    return getRouteTimeShare(route, interaction.label, timeBucket, monthLabels);
  }

  return 1;
}

function deriveRouteChartRows(params: {
  models: RouteMockModel[];
  direction: 'arrival' | 'departure';
  interaction: InteractionState;
  timeBucket: TimeBucket;
  monthLabels: string[];
}) {
  const { models, direction, interaction, timeBucket, monthLabels } = params;

  return models
    .filter((m) => m.direction === direction)
    .map((m) => {
      const flights = round2(
        m.totalFlights * getRouteInteractionFactor(m, interaction, timeBucket, monthLabels)
      );
      return {
        key: m.key,
        name: `${m.flag} ${m.city}`,
        shortName: m.city,
        country: m.country,
        flights,
      };
    })
    .filter((r) => r.flights > 0.01)
    .sort((a, b) => b.flights - a.flights);
}

function deriveAirlineRows(params: {
  models: RouteMockModel[];
  airlines: AirlineBase[];
  interaction: InteractionState;
  timeBucket: TimeBucket;
  monthLabels: string[];
}) {
  const { models, airlines, interaction, timeBucket, monthLabels } = params;

  return airlines
    .map((a) => {
      const value = models.reduce((sum, route) => {
        let baseFactor = 1;

        if (interaction?.kind === 'route') {
          baseFactor =
            interaction.direction === route.direction && interaction.key === route.key ? 1 : 0;
        } else if (interaction?.kind === 'hour') {
          const hour = parseHourLabel(interaction.label);
          baseFactor = hour == null ? 0 : route.hourShares[hour] ?? 0;
        } else if (interaction?.kind === 'trend' || interaction?.kind === 'season') {
          baseFactor = getRouteTimeShare(route, interaction.label, timeBucket, monthLabels);
        }

        const airlineFactor = route.airlineShares[a.name] ?? 0;

        if (interaction?.kind === 'airline') {
          baseFactor *= interaction.label === a.name ? 1 : 0;
        }

        return sum + route.totalFlights * baseFactor * airlineFactor;
      }, 0);

      return {
        name: a.name,
        key: `airline-${a.name}`,
        value: round2(value),
      };
    })
    .filter((a) => a.value > 0.01)
    .sort((a, b) => b.value - a.value);
}

function deriveHourRows(params: {
  models: RouteMockModel[];
  interaction: InteractionState;
  timeBucket: TimeBucket;
  monthLabels: string[];
  divisor: number;
}) {
  const { models, interaction, timeBucket, monthLabels, divisor } = params;

  return Array.from({ length: 24 }, (_, h) => {
    const depTotal = models
      .filter((m) => m.direction === 'departure')
      .reduce((sum, route) => {
        let factor = 1;

        if (interaction?.kind === 'route') {
          factor =
            interaction.direction === route.direction && interaction.key === route.key ? 1 : 0;
        } else if (interaction?.kind === 'airline') {
          factor = route.airlineShares[interaction.label] ?? 0;
        } else if (interaction?.kind === 'trend' || interaction?.kind === 'season') {
          factor = getRouteTimeShare(route, interaction.label, timeBucket, monthLabels);
        } else if (interaction?.kind === 'hour') {
          factor = 1;
        }

        return sum + route.totalFlights * factor * (route.hourShares[h] ?? 0);
      }, 0);

    const arrTotal = models
      .filter((m) => m.direction === 'arrival')
      .reduce((sum, route) => {
        let factor = 1;

        if (interaction?.kind === 'route') {
          factor =
            interaction.direction === route.direction && interaction.key === route.key ? 1 : 0;
        } else if (interaction?.kind === 'airline') {
          factor = route.airlineShares[interaction.label] ?? 0;
        } else if (interaction?.kind === 'trend' || interaction?.kind === 'season') {
          factor = getRouteTimeShare(route, interaction.label, timeBucket, monthLabels);
        } else if (interaction?.kind === 'hour') {
          factor = 1;
        }

        return sum + route.totalFlights * factor * (route.hourShares[h] ?? 0);
      }, 0);

    return {
      hour: h,
      key: `hour-${h}`,
      hourLabel: `${String(h).padStart(2, '0')}:00`,
      depAvg: round2(depTotal / divisor),
      arrAvg: round2(arrTotal / divisor),
      totalAvg: round2((depTotal + arrTotal) / divisor),
    };
  });
}

function deriveTrendRows(params: {
  models: RouteMockModel[];
  interaction: InteractionState;
  timeBucket: TimeBucket;
  monthLabels: string[];
}) {
  const { models, interaction, timeBucket, monthLabels } = params;

  return timeBucket.labels.map((label) => {
    const flights = models.reduce((sum, route) => {
      let baseFactor = getRouteTimeShare(route, label, timeBucket, monthLabels);

      if (interaction?.kind === 'route') {
        baseFactor *=
          interaction.direction === route.direction && interaction.key === route.key ? 1 : 0;
      } else if (interaction?.kind === 'airline') {
        baseFactor *= route.airlineShares[interaction.label] ?? 0;
      } else if (interaction?.kind === 'hour') {
        const hour = parseHourLabel(interaction.label);
        baseFactor *= hour == null ? 0 : route.hourShares[hour] ?? 0;
      }

      if (interaction?.kind === 'trend') {
        baseFactor *= interaction.label === label ? 1 : 0;
      }

      return sum + route.totalFlights * baseFactor;
    }, 0);

    return {
      day: label,
      key: `trend-${label}`,
      flights: round2(flights),
    };
  });
}

function deriveSeasonRows(params: {
  models: RouteMockModel[];
  interaction: InteractionState;
  timeBucket: TimeBucket;
  monthLabels: string[];
}) {
  const { models, interaction, timeBucket, monthLabels } = params;

  return timeBucket.labels.map((label, i) => {
    const value = models.reduce((sum, route) => {
      let baseFactor = getRouteTimeShare(route, label, timeBucket, monthLabels);

      if (interaction?.kind === 'route') {
        baseFactor *=
          interaction.direction === route.direction && interaction.key === route.key ? 1 : 0;
      } else if (interaction?.kind === 'airline') {
        baseFactor *= route.airlineShares[interaction.label] ?? 0;
      } else if (interaction?.kind === 'hour') {
        const hour = parseHourLabel(interaction.label);
        baseFactor *= hour == null ? 0 : route.hourShares[hour] ?? 0;
      }

      if (interaction?.kind === 'season') {
        baseFactor *= interaction.label === label ? 1 : 0;
      }

      return sum + route.totalFlights * baseFactor;
    }, 0);

    let color = '#bfdbfe';
    if (timeBucket.mode === 'wow') {
      color = i % 2 === 0 ? '#bfdbfe' : '#93c5fd';
    } else {
      const idx = monthLabels.indexOf(label);
      const nowIdx = new Date().getMonth();
      color = idx === nowIdx ? '#d29922' : '#bfdbfe';
    }

    return {
      month: label,
      key: `season-${label}`,
      value: round2(value),
      color,
    };
  });
}

function ClickableTrendDot(props: any) {
  const { cx, cy, payload, onSelect, isActive } = props;
  if (cx == null || cy == null || !payload) return null;

  return (
    <g
      onClick={() =>
        onSelect({
          kind: 'trend',
          key: payload.key,
          label: payload.day,
          value: payload.flights,
        })
      }
      style={{ cursor: 'pointer' }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={isActive ? 6 : 4}
        fill={isActive ? '#f59e0b' : '#2563eb'}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
}

export function AirportView() {
  const { drillTo, timeMode, selections } = useDrillDown();
  const airport = selections.airport || MK_AIRPORTS[0];
  const detail = getAirportDetail(airport.iata);

  const [interaction, setInteraction] = useState<InteractionState>(null);

  const countryForTone = selections.country;
  const countryPct = countryForTone ? parsePercentFromDelta(countryForTone.delta) : null;
  const countryTone =
    countryPct != null
      ? growthDeltaTypeFromPct(countryPct, timeMode)
      : countryForTone && countryForTone.deltaN < 0
        ? 'down'
        : 'neutral';

  const airlines: AirlineBase[] = useMemo(
    () =>
      Array.isArray(detail.airlines)
        ? detail.airlines.map((a: any) => ({
            name: String(a.name ?? ''),
            count: Number(a.count ?? 0),
          }))
        : [],
    [detail.airlines]
  );

  const mockModels = useMemo(() => buildMockRouteModels(detail), [detail]);
  const timeBucket = useMemo(() => buildTimeBucket(detail, timeMode), [detail, timeMode]);
  const monthLabels = useMemo(
    () => (Array.isArray(detail.monthLabels) ? detail.monthLabels.map(String) : []),
    [detail.monthLabels]
  );

  const divisor = timeMode === 'wow' ? 7 : timeMode === 'mom' ? 30 : 365;

  const departureRoutes = useMemo(
    () =>
      deriveRouteChartRows({
        models: mockModels,
        direction: 'departure',
        interaction,
        timeBucket,
        monthLabels,
      }),
    [mockModels, interaction, timeBucket, monthLabels]
  );

  const arrivalRoutes = useMemo(
    () =>
      deriveRouteChartRows({
        models: mockModels,
        direction: 'arrival',
        interaction,
        timeBucket,
        monthLabels,
      }),
    [mockModels, interaction, timeBucket, monthLabels]
  );

  const airlineRows = useMemo(
    () =>
      deriveAirlineRows({
        models: mockModels,
        airlines,
        interaction,
        timeBucket,
        monthLabels,
      }),
    [mockModels, airlines, interaction, timeBucket, monthLabels]
  );

  const trendRows = useMemo(
    () =>
      deriveTrendRows({
        models: mockModels,
        interaction,
        timeBucket,
        monthLabels,
      }),
    [mockModels, interaction, timeBucket, monthLabels]
  );

  const seasonRows = useMemo(
    () =>
      deriveSeasonRows({
        models: mockModels,
        interaction,
        timeBucket,
        monthLabels,
      }),
    [mockModels, interaction, timeBucket, monthLabels]
  );

  const hourRows = useMemo(
    () =>
      deriveHourRows({
        models: mockModels,
        interaction,
        timeBucket,
        monthLabels,
        divisor,
      }),
    [mockModels, interaction, timeBucket, monthLabels, divisor]
  );

  const airportDisplayName =
    airport.name && typeof airport.name === 'string'
      ? airport.name
      : `สนามบิน ${airport.iata}`;

  const totalFlightsFiltered = Math.round(
    mockModels.reduce((sum, route) => {
      const factor = getRouteInteractionFactor(route, interaction, timeBucket, monthLabels);
      return sum + route.totalFlights * factor;
    }, 0)
  );

  const avgPerDay = Math.round(totalFlightsFiltered / Math.max(divisor, 1));

  const topRoute = departureRoutes[0] ?? null;

  const busiestHour =
    hourRows.reduce(
      (best, row) => (row.totalAvg > best.totalAvg ? row : best),
      hourRows[0] ?? {
        key: 'hour-0',
        hourLabel: '00:00',
        depAvg: 0,
        arrAvg: 0,
        totalAvg: 0,
      }
    ) ?? null;

  const selectedRoute = interaction?.kind === 'route' ? interaction : null;

  const kpiCards = [
    {
      label: 'จำนวนเที่ยวบินทั้งหมด',
      value: totalFlightsFiltered.toLocaleString(),
      sub:
        interaction?.kind === 'airline'
          ? `สายการบินที่เลือก: ${interaction.label}`
          : `${departureRoutes.length + arrivalRoutes.length} route segment`,
      accent: KPI_ACCENT.flights,
    },
    {
      label: 'เฉลี่ยต่อวัน',
      value:
        interaction?.kind === 'trend'
          ? Math.round(interaction.value).toLocaleString()
          : avgPerDay.toLocaleString(),
      sub:
        interaction?.kind === 'hour'
          ? `ช่วงเวลาเลือก: ${interaction.label}`
          : interaction
            ? `อิงจาก ${interactionLabel(interaction)}`
            : topRoute
              ? `Peak route: ${topRoute.shortName}`
              : '-',
      accent: KPI_ACCENT.airports,
    },
    {
      label: selectedRoute ? 'เส้นทางที่เลือก' : 'จุดหมายปลายทางยอดนิยม',
      value:
        selectedRoute
          ? selectedRoute.city
          : interaction?.kind === 'season'
            ? interaction.label
            : topRoute
              ? topRoute.shortName
              : '-',
      sub: selectedRoute
        ? `${Math.round(selectedRoute.flights).toLocaleString()} เที่ยวบิน · ${selectedRoute.country}`
        : interaction?.kind === 'season'
          ? `${Math.round(interaction.value).toLocaleString()} เที่ยวบิน`
          : topRoute
            ? `${Math.round(topRoute.flights).toLocaleString()} เที่ยวบิน · ${topRoute.country}`
            : '-',
      accent: KPI_ACCENT.average,
    },
    {
      label: 'ช่วงเวลายอดนิยม',
      value:
        interaction?.kind === 'hour'
          ? interaction.label
          : busiestHour?.hourLabel ?? '-',
      sub:
        interaction?.kind === 'hour'
          ? `${interaction.totalAvg.toFixed(2)} เที่ยวบิน/ชม.`
          : `${Math.round(busiestHour?.totalAvg ?? 0).toLocaleString()} เที่ยวบินต่อช่วง`,
      accent: KPI_ACCENT.highlight,
    },
  ];

  const toggleInteraction = (next: InteractionState) => {
    if (!next) {
      setInteraction(null);
      return;
    }

    if (interaction && interaction.kind === next.kind && interaction.key === next.key) {
      setInteraction(null);
      return;
    }

    setInteraction(next);
  };

  return (
    <div className="space-y-4 min-w-0">
      <div className="rounded-[10px] border border-border bg-card px-4 py-3 min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => drillTo('country')}
              className="mb-3 inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              ← ก่อนหน้า
            </button>

            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h2 className="text-[22px] font-extrabold tracking-tight break-words min-w-0">
                {airportDisplayName}
              </h2>

              {selections.country && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    countryTone === 'up'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : countryTone === 'down'
                        ? 'border border-rose-200 bg-rose-50 text-rose-700'
                        : 'border border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {selections.country.deltaN >= 0 ? '▲' : '▼'}{' '}
                  {selections.country.deltaN >= 0 ? '+' : ''}
                  {selections.country.deltaN} เที่ยวบิน ({selections.country.delta})
                </span>
              )}

              <SelectionChip interaction={interaction} />
            </div>

            <div className="mt-1 text-[12px] text-muted-foreground">
              {totalFlightsFiltered.toLocaleString()} เที่ยวบิน · {departureRoutes.length} route ขาออก ·{' '}
              {airlineRows.length} สายการบิน
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <div className="text-[12px] font-semibold text-muted-foreground">ช่วงวันที่เลือก:</div>

            <div className="flex flex-wrap items-center gap-1.5">
              <TimeToggle />
            </div>

            {interaction && (
              <button
                type="button"
                onClick={() => setInteraction(null)}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:border-primary hover:text-primary"
              >
                ล้างการเลือกทั้งหมด
              </button>
            )}
          </div>
        </div>
      </div>

      <DashboardInfoNote interaction={interaction} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 min-w-0">
        {kpiCards.map((item) => (
          <div
            key={item.label}
            className={`min-w-0 rounded-[10px] border bg-card px-4 py-3 shadow-sm transition-all ${
              interaction ? 'border-primary/30' : 'border-border'
            }`}
          >
            <div className="text-[12px] text-muted-foreground">{item.label}</div>
            <div className="mt-1 text-[26px] font-extrabold leading-none break-words">{item.value}</div>
            <div className="mt-1 text-[12px] font-medium text-emerald-600 break-words">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 min-w-0">
        <TrendSparkChart
          timeMode={timeMode}
          interaction={interaction}
          trendRows={trendRows}
          onToggleInteraction={toggleInteraction}
        />
        <SeasonalTrendChart
          interaction={interaction}
          seasonRows={seasonRows}
          onToggleInteraction={toggleInteraction}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 min-w-0">
        <RouteBarChartPanel
          title="เส้นทางขาเข้ายอดนิยม"
          rows={arrivalRoutes.slice(0, 5)}
          barColor="#60c5dd"
          direction="arrival"
          interaction={interaction}
          onToggleInteraction={toggleInteraction}
        />
        <RouteBarChartPanel
          title="5 เส้นทางขาออกยอดนิยม"
          rows={departureRoutes.slice(0, 5)}
          barColor="#5b87ea"
          direction="departure"
          interaction={interaction}
          onToggleInteraction={toggleInteraction}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.05fr_1fr] min-w-0">
        <AirlineSharePanel
          airlineRows={airlineRows}
          interaction={interaction}
          onToggleInteraction={toggleInteraction}
        />
        <HourDistributionPanel
          timeMode={timeMode}
          chartData={hourRows}
          interaction={interaction}
          onToggleInteraction={toggleInteraction}
        />
      </div>

      <div className="flex justify-center pt-1">
        <BackButton label="กลับไปยังประเทศ" onClick={() => drillTo('country')} />
      </div>
    </div>
  );
}

function TrendSparkChart({
  timeMode,
  interaction,
  trendRows,
  onToggleInteraction,
}: {
  timeMode: TimeMode;
  interaction: InteractionState;
  trendRows: Array<{ day: string; key: string; flights: number }>;
  onToggleInteraction: (next: InteractionState) => void;
}) {
  const gradientId = useId();
  const nowYear = new Date().getFullYear();

  const tData = trendRows;
  const peak = Math.max(...tData.map((d) => d.flights), 0);
  const total = tData.reduce((s, d) => s + d.flights, 0);
  const peakEntry = tData.find((d) => d.flights === peak) ?? tData[0];

  const minVal = Math.min(...tData.map((d) => d.flights), 0);
  const yDomain: [number, number] = [Math.floor(minVal * 0.9), Math.ceil(Math.max(peak * 1.1, 10))];

  const selectedKey = interaction?.kind === 'trend' ? interaction.key : null;
  const hasForeignSelection = !!interaction && interaction.kind !== 'trend';

  return (
    <ChartShell interaction={interaction}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[15px] font-bold">เทรนด์เที่ยวบิน</div>
          <div className="text-[12px] text-muted-foreground">
            คลิกจุดเพื่อกรองกราฟอื่นตาม bucket นี้
          </div>
        </div>
        <SelectionChip interaction={interaction} />
      </div>

      <ChartFrame heightClass="h-[240px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <AreaChart
            data={tData}
            margin={{ top: 10, right: 12, left: 4, bottom: 8 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="#2563eb"
                  stopOpacity={selectedKey || hasForeignSelection ? 0.18 : 0.3}
                />
                <stop
                  offset="100%"
                  stopColor="#2563eb"
                  stopOpacity={selectedKey || hasForeignSelection ? 0.02 : 0.03}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 12, fontWeight: 600 }}
              width={44}
              tickFormatter={(v) => Math.round(v).toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              formatter={(value: number) => [`${Math.round(value).toLocaleString()} เที่ยวบิน`, 'เที่ยวบิน']}
            />
            <Area
              type="monotone"
              dataKey="flights"
              stroke={selectedKey || hasForeignSelection ? '#93c5fd' : '#2563eb'}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={(props) => (
                <ClickableTrendDot
                  {...props}
                  isActive={selectedKey === props?.payload?.key}
                  onSelect={onToggleInteraction}
                />
              )}
              activeDot={(props) => (
                <ClickableTrendDot
                  {...props}
                  isActive
                  onSelect={onToggleInteraction}
                />
              )}
            />
            {!selectedKey && peakEntry && (
              <ReferenceDot
                x={peakEntry.day}
                y={peakEntry.flights}
                r={6}
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>

      <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground">
        <span>รวมทั้งหมด {Math.round(total).toLocaleString()}</span>
        <span>{timeMode === 'yoy' ? nowYear : 'ช่วงที่เลือก'}</span>
      </div>
    </ChartShell>
  );
}

function SeasonalTrendChart({
  interaction,
  seasonRows,
  onToggleInteraction,
}: {
  interaction: InteractionState;
  seasonRows: Array<{ month: string; value: number; color: string; key: string }>;
  onToggleInteraction: (next: InteractionState) => void;
}) {
  const selectedKey = interaction?.kind === 'season' ? interaction.key : null;
  const hasForeignSelection = !!interaction && interaction.kind !== 'season';

  return (
    <ChartShell interaction={interaction}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[15px] font-bold">เทรนด์เที่ยวบินตามฤดูกาล</div>
          <div className="text-[12px] text-muted-foreground">
            คลิกแท่งกราฟเพื่อกรองกราฟอื่นตาม season bucket
          </div>
        </div>
        <SelectionChip interaction={interaction} />
      </div>

      <ChartFrame heightClass="h-[240px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <BarChart
            data={seasonRows}
            margin={{ top: 10, right: 10, left: 4, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600 }} />
            <YAxis
              width={44}
              tick={{ fontSize: 12, fontWeight: 600 }}
              tickFormatter={(v) => Math.round(v).toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              formatter={(value: number) => [`${Math.round(value).toLocaleString()} เที่ยวบิน`, 'จำนวนเที่ยวบิน']}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={42} isAnimationActive={false}>
              {seasonRows.map((entry, i) => {
                const isActive = selectedKey === entry.key;
                return (
                  <Cell
                    key={i}
                    fill={isActive ? '#2563eb' : hasForeignSelection ? '#dbeafe' : entry.color}
                    cursor="pointer"
                    onClick={() =>
                      onToggleInteraction({
                        kind: 'season',
                        key: entry.key,
                        label: entry.month,
                        value: entry.value,
                      })
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </ChartShell>
  );
}

function RouteBarChartPanel({
  title,
  rows,
  barColor,
  direction,
  interaction,
  onToggleInteraction,
}: {
  title: string;
  rows: Array<{
    key: string;
    name: string;
    shortName: string;
    country: string;
    flights: number;
  }>;
  barColor: string;
  direction: 'arrival' | 'departure';
  interaction: InteractionState;
  onToggleInteraction: (next: InteractionState) => void;
}) {
  const selectedKey = interaction?.kind === 'route' ? interaction.key : null;
  const hasForeignSelection = !!interaction && interaction.kind !== 'route';

  return (
    <ChartShell interaction={interaction}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[15px] font-bold">{title}</div>
          <div className="text-[12px] text-muted-foreground">
            คลิกแท่งกราฟเพื่อกรองข้อมูลตาม route นี้
          </div>
        </div>
        <SelectionChip interaction={interaction} />
      </div>

      <ChartFrame heightClass="h-[320px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
          <BarChart
            data={rows}
            margin={{ top: 10, right: 10, left: 0, bottom: 36 }}
            barCategoryGap={18}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fontWeight: 700 }}
              interval={0}
              angle={0}
            />
            <YAxis
              tick={{ fontSize: 12, fontWeight: 600 }}
              tickFormatter={(v) => Math.round(v).toLocaleString()}
              width={42}
            />
            <Tooltip
              cursor={{ fill: 'rgba(37,99,235,0.06)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              formatter={(value: number) => [`${Math.round(value).toLocaleString()} เที่ยวบิน`, 'จำนวนเที่ยวบิน']}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload as { country?: string } | undefined;
                return `${label}${item?.country ? ` · ${item.country}` : ''}`;
              }}
            />
            <Bar dataKey="flights" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive={false}>
              {rows.map((entry, i) => {
                const isActive = selectedKey === entry.key;
                return (
                  <Cell
                    key={i}
                    fill={isActive ? '#1d4ed8' : hasForeignSelection ? '#d1d5db' : barColor}
                    cursor="pointer"
                    onClick={() =>
                      onToggleInteraction({
                        kind: 'route',
                        key: entry.key,
                        city: entry.shortName,
                        country: entry.country,
                        flights: entry.flights,
                        direction,
                      })
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </ChartShell>
  );
}

function AirlineSharePanel({
  airlineRows,
  interaction,
  onToggleInteraction,
}: {
  airlineRows: Array<{ name: string; key: string; value: number }>;
  interaction: InteractionState;
  onToggleInteraction: (next: InteractionState) => void;
}) {
  const max = Math.max(...airlineRows.map((a) => a.value), 1);
  const selectedKey = interaction?.kind === 'airline' ? interaction.key : null;
  const hasForeignSelection = !!interaction && interaction.kind !== 'airline';

  return (
    <ChartShell interaction={interaction}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[18px] font-extrabold">ส่วนแบ่งการตลาดของสายการบิน</div>
        <SelectionChip interaction={interaction} />
      </div>

      <div className="space-y-2 min-w-0">
        {airlineRows.map((a) => {
          const isActive = selectedKey === a.key;
          const fill = isActive ? '#1d4ed8' : hasForeignSelection ? '#d1d5db' : '#2583ea';

          return (
            <button
              key={a.name}
              type="button"
              onClick={() =>
                onToggleInteraction({
                  kind: 'airline',
                  key: a.key,
                  label: a.name,
                  value: a.value,
                })
              }
              className="grid w-full min-w-0 grid-cols-[84px_1fr_44px] items-center gap-3 rounded-md text-left transition-colors hover:bg-muted/30"
            >
              <div className="truncate text-[13px] font-medium text-muted-foreground" title={a.name}>
                {a.name}
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${((a.value / max) * 100).toFixed(0)}%`,
                    background: fill,
                  }}
                />
              </div>
              <div className="text-right text-[12px] font-semibold tabular-nums text-muted-foreground">
                {Math.round(a.value)}
              </div>
            </button>
          );
        })}
      </div>
    </ChartShell>
  );
}

function HourDistributionPanel({
  timeMode,
  chartData,
  interaction,
  onToggleInteraction,
}: {
  timeMode: TimeMode;
  chartData: Array<{
    hour: number;
    key: string;
    hourLabel: string;
    depAvg: number;
    arrAvg: number;
    totalAvg: number;
  }>;
  interaction: InteractionState;
  onToggleInteraction: (next: InteractionState) => void;
}) {
  const [view, setView] = useState<'both' | 'dep' | 'arr'>('both');

  const xTickHours = new Set([0, 3, 6, 9, 12, 15, 18, 21, 23]);

  const subtitle =
    timeMode === 'wow'
      ? 'เฉลี่ยต่อวันในช่วง 7 วัน'
      : timeMode === 'mom'
        ? 'เฉลี่ยต่อวันในช่วง 30 วัน'
        : 'เฉลี่ยต่อวันในช่วง 1 ปี';

  const selectedKey = interaction?.kind === 'hour' ? interaction.key : null;
  const hasForeignSelection = !!interaction && interaction.kind !== 'hour';

  const handleHourClick = (entry: {
    key: string;
    hourLabel: string;
    depAvg: number;
    arrAvg: number;
    totalAvg: number;
  }) => {
    onToggleInteraction({
      kind: 'hour',
      key: entry.key,
      label: entry.hourLabel,
      depAvg: entry.depAvg,
      arrAvg: entry.arrAvg,
      totalAvg: entry.totalAvg,
    });
  };

  return (
    <ChartShell interaction={interaction}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[15px] font-bold">เฉลี่ยเที่ยวบินตามชั่วโมง</div>
          <div className="text-[12px] text-muted-foreground">{subtitle}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SelectionChip interaction={interaction} />
          <div className="flex overflow-hidden rounded-md border border-border">
            {[
              { key: 'both', label: 'ทั้งหมด' },
              { key: 'dep', label: 'ขาออก' },
              { key: 'arr', label: 'ขาเข้า' },
            ].map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => setView(b.key as 'both' | 'dep' | 'arr')}
                className={`px-2.5 py-1 text-[11px] font-bold ${
                  view === b.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ChartFrame heightClass="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 4, bottom: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey="hourLabel"
              tick={{ fontSize: 11, fontWeight: 600 }}
              interval={0}
              tickFormatter={(value, index) => (xTickHours.has(index) ? value : '')}
            />
            <YAxis
              tick={{ fontSize: 11, fontWeight: 600 }}
              width={52}
              tickFormatter={(v) => Number(v).toFixed(1)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '13px',
              }}
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)} เที่ยวบิน/ชม.`,
                name,
              ]}
            />

            {view === 'both' && (
              <>
                <Bar dataKey="depAvg" name="ขาออก" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
                  {chartData.map((entry, i) => {
                    const isActive = selectedKey === entry.key;
                    return (
                      <Cell
                        key={`dep-${i}`}
                        fill={isActive ? '#94a3b8' : hasForeignSelection ? '#e5e7eb' : '#d1d5db'}
                        cursor="pointer"
                        onClick={() => handleHourClick(entry)}
                      />
                    );
                  })}
                </Bar>
                <Bar dataKey="arrAvg" name="ขาเข้า" radius={[4, 4, 0, 0]} maxBarSize={14} isAnimationActive={false}>
                  {chartData.map((entry, i) => {
                    const isActive = selectedKey === entry.key;
                    return (
                      <Cell
                        key={`arr-${i}`}
                        fill={isActive ? '#1d4ed8' : hasForeignSelection ? '#bfdbfe' : '#5b87ea'}
                        cursor="pointer"
                        onClick={() => handleHourClick(entry)}
                      />
                    );
                  })}
                </Bar>
              </>
            )}

            {view === 'dep' && (
              <>
                <Bar dataKey="arrAvg" name="ขาเข้า (พื้นหลัง)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
                  {chartData.map((entry, i) => {
                    const isActive = selectedKey === entry.key;
                    return (
                      <Cell
                        key={`arrbg-${i}`}
                        fill={isActive ? '#cbd5e1' : hasForeignSelection ? '#e5e7eb' : '#d1d5db'}
                        cursor="pointer"
                        onClick={() => handleHourClick(entry)}
                      />
                    );
                  })}
                </Bar>
                <Bar dataKey="depAvg" name="ขาออก" radius={[4, 4, 0, 0]} maxBarSize={14} isAnimationActive={false}>
                  {chartData.map((entry, i) => {
                    const isActive = selectedKey === entry.key;
                    return (
                      <Cell
                        key={`depfg-${i}`}
                        fill={isActive ? '#0891b2' : hasForeignSelection ? '#bae6fd' : '#60c5dd'}
                        cursor="pointer"
                        onClick={() => handleHourClick(entry)}
                      />
                    );
                  })}
                </Bar>
              </>
            )}

            {view === 'arr' && (
              <>
                <Bar dataKey="depAvg" name="ขาออก (พื้นหลัง)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
                  {chartData.map((entry, i) => {
                    const isActive = selectedKey === entry.key;
                    return (
                      <Cell
                        key={`depbg-${i}`}
                        fill={isActive ? '#cbd5e1' : hasForeignSelection ? '#e5e7eb' : '#d1d5db'}
                        cursor="pointer"
                        onClick={() => handleHourClick(entry)}
                      />
                    );
                  })}
                </Bar>
                <Bar dataKey="arrAvg" name="ขาเข้า" radius={[4, 4, 0, 0]} maxBarSize={14} isAnimationActive={false}>
                  {chartData.map((entry, i) => {
                    const isActive = selectedKey === entry.key;
                    return (
                      <Cell
                        key={`arrfg-${i}`}
                        fill={isActive ? '#1d4ed8' : hasForeignSelection ? '#bfdbfe' : '#5b87ea'}
                        cursor="pointer"
                        onClick={() => handleHourClick(entry)}
                      />
                    );
                  })}
                </Bar>
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
        {view === 'both' ? (
          <>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#d1d5db]" />
              ขาออก
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#5b87ea]" />
              ขาเข้า
            </span>
          </>
        ) : view === 'dep' ? (
          <>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#60c5dd]" />
              ขาออก
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#d1d5db]" />
              ขาเข้า (พื้นหลัง)
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#5b87ea]" />
              ขาเข้า
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#d1d5db]" />
              ขาออก (พื้นหลัง)
            </span>
          </>
        )}
      </div>
    </ChartShell>
  );
}