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
import {
  CONTINENTS,
  CONTINENT_SEASONAL,
  CONTINENT_TOP_ROUTES,
  getChangeForMode,
  growthDeltaTypeFromPct,
  growthTextClass,
  parseFirstSignedPercent,
  parsePercentFromDelta,
} from '@/lib/dashboard/drill-down-data';
import { KPI_ACCENT } from '@/lib/dashboard/kpi-colors';
import { buildWowWeeklyBarData } from '@/lib/dashboard/week-chart';
import { getContinentDetail } from '@/lib/dashboard/services/drilldown';
import { useDrillDown, KPIRow, BackButton, ChangePill, TimeToggle } from './DrillDownDashboard';
import type { KPIItem } from './DrillDownDashboard';
import type { CountryData } from '@/types/dashboard';

const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

/** Match KPI ref to grid row, or minimal row so drill-down always works for any continent. */
function resolveCountryRow(ref: { flag: string; nameTh: string }, countries: CountryData[]): CountryData {
  const found = countries.find((c) => c.name === ref.nameTh || c.flag === ref.flag);
  if (found) return found;
  return {
    flag: ref.flag,
    name: ref.nameTh,
    airports: 0,
    flights: 0,
    delta: '\u2014',
    deltaN: 0,
    bar: 0,
  };
}

export function ContinentView() {
  const { drillTo, timeMode, selections } = useDrillDown();
  const continent = selections.continent || CONTINENTS[0];

  const { detail: cData } = getContinentDetail(continent.name);
  const countries = cData.countries;

  const topByFlights = countries.length
    ? [...countries].sort((a, b) => b.flights - a.flights)[0]
    : undefined;
  const topByAirports = countries.length
    ? [...countries].sort((a, b) => b.airports - a.airports)[0]
    : undefined;
  const busiestResolved = resolveCountryRow(cData.busiestCountry, countries);
  const fastestResolved = resolveCountryRow(cData.fastestGrowing, countries);

  /** Avoid two identical drill targets when the same country leads flights and airport count. */
  const airportsCardSameAsFlightsCard =
    !!topByFlights &&
    !!topByAirports &&
    topByFlights.name === topByAirports.name;

  const continentGrowthTone = growthDeltaTypeFromPct(getChangeForMode(continent, timeMode).pct, timeMode);
  const busiestPct = parseFirstSignedPercent(cData.busiestDelta);
  const fastestPct = parseFirstSignedPercent(cData.fastestDelta);
  const busiestKpiTone =
    busiestPct != null ? growthDeltaTypeFromPct(busiestPct, timeMode) : 'neutral';
  const fastestKpiTone =
    fastestPct != null ? growthDeltaTypeFromPct(fastestPct, timeMode) : 'neutral';

  const kpis: KPIItem[] = [
    {
      label: 'เที่ยวบินทั้งหมด',
      value: continent.flights.toLocaleString(),
      delta: continent.delta,
      deltaType: continentGrowthTone,
      accentColor: KPI_ACCENT.flights,
      ...(topByFlights
        ? {
            onClick: () => drillTo('country', { country: topByFlights }),
            actionLabel: `ไปยังประเทศ ${topByFlights.name} (เที่ยวบินสูงสุดในรายการนี้)`,
          }
        : {}),
    },
    {
      label: 'ประเทศที่เปิดน่านฟ้า',
      value: cData.countryCount,
      delta: `แสดงรายละเอียด ${countries.length} ประเทศ`,
      deltaType: 'neutral',
      growthColored: false,
      accentColor: KPI_ACCENT.airports,
      ...(topByAirports && !airportsCardSameAsFlightsCard
        ? {
            onClick: () => drillTo('country', { country: topByAirports }),
            actionLabel: `ไปยังประเทศ ${topByAirports.name} (สนามบินมากที่สุดในรายการนี้)`,
          }
        : {}),
    },
    {
      label: 'ประเทศที่คึกคักที่สุด',
      value: `${cData.busiestCountry.flag} ${cData.busiestCountry.nameTh}`,
      delta: cData.busiestDelta,
      deltaType: busiestKpiTone,
      growthColored: busiestPct != null,
      accentColor: KPI_ACCENT.average,
      onClick: () => drillTo('country', { country: busiestResolved }),
      actionLabel: `ไปยังประเทศ ${cData.busiestCountry.nameTh} (คึกคักที่สุด)`,
    },
    {
      label: 'เติบโตเร็วที่สุด',
      value: `${cData.fastestGrowing.flag} ${cData.fastestGrowing.nameTh}`,
      delta: cData.fastestDelta,
      deltaType: fastestKpiTone,
      growthColored: fastestPct != null,
      accentColor: KPI_ACCENT.highlight,
      onClick: () => drillTo('country', { country: fastestResolved }),
      actionLabel: `ไปยังประเทศ ${cData.fastestGrowing.nameTh} (เติบโตเร็วที่สุด)`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold mb-1 break-words">{continent.icon} {continent.name}</h2>
          <p className="text-[15px] text-muted-foreground font-medium break-words">
            คลิกประเทศเพื่อดูสนามบินในภูมิภาค {continent.name}
          </p>
        </div>
        <div className="shrink-0 self-start sm:self-auto">
          <TimeToggle />
        </div>
      </div>

      <KPIRow items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <ContinentSeasonalChart />
        <ContinentTopRoutesPanel />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {countries.map((c) => {
          const rowPct = parsePercentFromDelta(c.delta);
          const rowTone =
            rowPct != null
              ? growthDeltaTypeFromPct(rowPct, timeMode)
              : c.deltaN < 0
                ? 'down'
                : 'neutral';
          return (
          <button
            key={c.name}
            type="button"
            aria-label={`ดูข้อมูล ${c.name}`}
            onClick={() => drillTo('country', { country: c })}
            className={`bg-card border rounded-[10px] p-4 text-left transition-all hover:border-primary hover:-translate-y-0.5 cursor-pointer ${
              c.highlight ? 'border-primary bg-primary/5' : 'border-border shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-3 min-w-0">
              <span className="text-2xl">{c.flag}</span>
              <span className="text-[15px] font-semibold truncate">{c.name}</span>
              <span className="ml-auto bg-muted border border-border rounded-full text-[14px] py-0.5 px-2.5 text-muted-foreground font-medium whitespace-nowrap">
                {c.airports} สนามบิน
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-0.5 min-w-0">
              <span className="text-[24px] font-bold tabular-nums">{c.flights.toLocaleString()}</span>
              <span className="text-[15px] text-muted-foreground font-medium shrink-0">เที่ยวบิน</span>
            </div>
            <div className={`text-[14px] mt-1.5 font-bold ${growthTextClass(rowTone)}`}>
              {c.deltaN >= 0 ? '\u25B2' : '\u25BC'} {c.deltaN >= 0 ? '+' : ''}{c.deltaN.toLocaleString()} เที่ยวบิน ({c.delta})
            </div>
            <div className="mt-3.5 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${c.bar}%` }} />
            </div>
          </button>
        );
        })}
      </div>
      <div className="flex justify-center pt-1">
        <BackButton label="กลับไปยังโลก" onClick={() => drillTo('world')} />
      </div>
    </div>
  );
}

function ContinentSeasonalChart() {
  const { timeMode, selections } = useDrillDown();
  const continentName = selections.continent?.name || 'ยุโรป';
  const peakVal = Math.max(...CONTINENT_SEASONAL);
  const nowIdx = new Date().getMonth();
  const prevIdx = (nowIdx + 11) % 12;

  let chartData: Array<{ month: string; value: number; color: string }>;
  let title: string;

  if (timeMode === 'wow') {
    title = `แนวโน้มรายสัปดาห์ \u2014 ${continentName} (\u00B12 สัปดาห์)`;
    chartData = buildWowWeeklyBarData([16, 17, 19, 18, 17]);
  } else if (timeMode === 'mom') {
    title = `แนวโน้มรายเดือน \u2014 ${continentName} (รายเดือน)`;
    const startIdx = Math.max(0, nowIdx - 2);
    const endIdx = Math.min(11, nowIdx + 2);
    chartData = CONTINENT_SEASONAL
      .map((v, i) => ({
        month: MONTHS[i],
        value: v,
        color: i === nowIdx ? '#d29922' : v === peakVal ? '#ff9f43' : i === prevIdx ? '#2563eb' : '#bfdbfe',
        _idx: i,
      }))
      .filter((d) => d._idx >= startIdx && d._idx <= endIdx);
  } else {
    title = `แนวโน้มฤดูกาล \u2014 ${continentName} (รายปี)`;
    chartData = CONTINENT_SEASONAL.map((v, i) => ({
      month: MONTHS[i],
      value: v,
      color: i === nowIdx ? '#d29922' : v === peakVal ? '#ff9f43' : '#bfdbfe',
    }));
  }

  return (
    <div className="bg-card border border-border rounded-[10px] p-5">
      <div className="text-[16px] font-bold mb-4">{title}</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          margin={{
            top: 8,
            right: 12,
            left: 8,
            bottom: timeMode === 'wow' ? 34 : 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 14, fontWeight: 600 }}
            tickMargin={8}
            interval={0}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 14, fontWeight: 600 }}
            tickMargin={8}
            width={44}
            className="text-muted-foreground"
            unit="k"
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '14px' }}
            formatter={(value: number) => [`${value}k เที่ยวบิน`, '']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={34}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                opacity={entry.color === '#bfdbfe' ? 0.55 : 0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center text-[14px] font-medium text-muted-foreground mt-2.5">
        {/* <span>ทั้งปี </span> */}
        {/* {'\u00B7'} เที่ยวบินเป็นพันเที่ยว */}
        <span className="flex items-center gap-3">
          <span style={{ color: 'var(--chart-current)' }}>{'\u25A0'} {timeMode === 'wow' ? 'สัปดาห์ปัจจุบัน' : 'เดือนปัจจุบัน'}</span>
          <span style={{ color: 'var(--chart-peak)' }}>{'\u25A0'} {timeMode === 'wow' ? 'สัปดาห์ที่สูงสุด' : 'เดือนที่สูงสุด'}</span>
          {timeMode === 'mom' && (
            <span style={{ color: 'var(--chart-1)' }}>{'\u25A0'} เดือนก่อนหน้า</span>
          )}
          <span style={{ color: timeMode === 'yoy' ? 'var(--chart-mid)' : 'var(--chart-subtle)' }}>{'\u25A0'} อื่นๆ</span>
        </span>
      </div>
    </div>
  );
}

function ContinentTopRoutesPanel() {
  const { timeMode, selections } = useDrillDown();
  const continentName = selections.continent?.name || 'ยุโรป';

  return (
    <div className="bg-card border border-border rounded-[10px] p-5">
      <div className="text-[16px] font-bold mb-4">
        {'🏆'} 5 อันดับเส้นทางตามจำนวนเที่ยวบิน {'\u2014'} {continentName}
      </div>
      {CONTINENT_TOP_ROUTES.map((r, i) => {
        const { pct, num } = getChangeForMode(r, timeMode);
        return (
          <div key={i} className="flex items-center gap-2 py-2.5 border-b border-border/60 last:border-b-0">
            <span className="text-[14px] text-muted-foreground w-6 text-center shrink-0 font-bold">{i + 1}</span>
            <span className="text-lg shrink-0">{r.fromFlag}</span>
            <span className="text-[15px] font-medium flex-1 min-w-0 truncate">
              {r.from} {'\u2192'} {r.toFlag} {r.to}
            </span>
            <span className="text-[14px] text-muted-foreground w-16 text-right shrink-0 tabular-nums font-bold">
              {r.flights.toLocaleString()}
            </span>
            <ChangePill pct={pct} num={num} active timeMode={timeMode} />
          </div>
        );
      })}
    </div>
  );
}
