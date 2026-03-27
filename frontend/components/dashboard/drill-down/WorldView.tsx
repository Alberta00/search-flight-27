'use client';

import {
  BUSIEST_AIRPORTS,
  WORLD_TOP_DEP,
  WORLD_TOP_ARR,
  CONTINENTS,
  TOP_AIRLINES_WORLD,
  compareToPriorPeriodPhraseTh,
  fmtWorldKpiDeltaTh,
  getChangeForMode,
  growthCardBadgeClasses,
  growthDeltaTypeFromPct,
  modeLabel,
} from '@/lib/dashboard/drill-down-data';
import { KPI_ACCENT } from '@/lib/dashboard/kpi-colors';
import { enrichTopAirlinesWithListing } from '@/lib/dashboard/airline-ticker-map';
import { airportInfoFromBusiest } from '@/lib/dashboard/services/drilldown';
import { useDrillDown, KPIRow, ChangePill, TimeToggle } from './DrillDownDashboard';
import type { KPIItem } from './DrillDownDashboard';

export function WorldView() {
  const { drillTo, timeMode } = useDrillDown();

  // Derive KPIs from actual data
  const totalFlights = CONTINENTS.reduce((s, c) => s + c.flights, 0);
  const busiestContinent = [...CONTINENTS].sort((a, b) => b.flights - a.flights)[0];
  const avgPerDay = Math.round(totalFlights / 4);
  const busiestChange = getChangeForMode(busiestContinent, timeMode);
  const busiestGrowthTone = growthDeltaTypeFromPct(busiestChange.pct, timeMode);
  const busiestDeltaLine = fmtWorldKpiDeltaTh(
    busiestChange.pct,
    busiestChange.num,
    timeMode,
  );
  const { pct: bcPct, num: bcNum } = busiestChange;
  const bcSign = bcNum >= 0 ? '+' : '';
  const bcArrow = bcNum >= 0 ? '\u25B2' : '\u25BC';
  const busiestContinentSubline = `${bcArrow} ${bcSign}${bcNum.toLocaleString()} (${bcPct >= 0 ? '+' : ''}${bcPct.toFixed(1)}%) \u00B7 ${busiestContinent.flights.toLocaleString()} เที่ยวบิน \u00B7 ${compareToPriorPeriodPhraseTh(timeMode)}`;

  const kpis: KPIItem[] = [
    {
      label: 'เที่ยวบินทั้งหมด',
      value: totalFlights.toLocaleString(),
      delta: busiestDeltaLine,
      deltaType: busiestGrowthTone,
      accentColor: KPI_ACCENT.flights,
    },
    {
      label: 'สนามบินที่มีการใช้งาน',
      value: BUSIEST_AIRPORTS.length.toLocaleString() + ' อันดับ',
      delta: `จาก ${BUSIEST_AIRPORTS.length} สนามบินที่คึกคักที่สุด`,
      deltaType: 'neutral',
      growthColored: false,
      accentColor: KPI_ACCENT.airports,
    },
    {
      label: 'เที่ยวบินเฉลี่ย/วัน',
      value: avgPerDay.toLocaleString(),
      delta: '\u2248 คงที่',
      deltaType: 'neutral',
      growthColored: false,
      accentColor: KPI_ACCENT.average,
    },
    {
      label: 'ทวีปที่คึกคักที่สุด',
      value: `${busiestContinent.icon} ${busiestContinent.name}`,
      delta: busiestContinentSubline,
      deltaType: busiestGrowthTone,
      accentColor: KPI_ACCENT.highlight,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold mb-1">ภาพรวมเที่ยวบินทั่วโลก</h2>
          <p className="text-sm text-muted-foreground">
            แสดงข้อมูลสำหรับ <strong>21{'\u2013'}24 ต.ค. 2026</strong> {'\u00B7'} คลิกทวีปเพื่อดูรายละเอียด
          </p>
        </div>
        <div className="shrink-0 self-start sm:self-auto">
          <TimeToggle />
        </div>
      </div>

      <KPIRow items={kpis} />

      {/* Continent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONTINENTS.map((c) => {
          const continentTone = growthDeltaTypeFromPct(getChangeForMode(c, timeMode).pct, timeMode);
          return (
          <button
            key={c.name}
            type="button"
            aria-label={`สำรวจ ${c.name}`}
            onClick={() => drillTo('continent', { continent: c })}
            className={`relative overflow-hidden bg-card border rounded-[10px] p-4 sm:p-6 text-left transition-all hover:border-primary hover:-translate-y-1 hover:shadow-lg cursor-pointer group ${
              c.highlight ? 'border-primary' : 'border-border'
            }`}
          >
            <span
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 text-[12px] sm:text-[14px] font-bold py-0.5 px-2 rounded-full ${growthCardBadgeClasses(continentTone)}`}
            >
              {c.delta.includes(' (') ? c.delta.replace(' (', ' เที่ยวบิน (') : c.delta}
            </span>
            <div className="text-[32px] sm:text-[40px] mb-2 sm:mb-3">{c.icon}</div>
            <div className="text-base sm:text-lg font-bold mb-1 sm:mb-1.5">{c.name}</div>
            <div className="text-[14px] sm:text-[16px] text-muted-foreground mb-3 sm:mb-4">{c.airports}</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <div className="text-xl sm:text-2xl font-bold text-primary">{c.flights.toLocaleString()}</div>
              <div className="text-[13px] sm:text-[15px] text-muted-foreground">เที่ยวบิน</div>
            </div>
            <div className="text-[13px] sm:text-[14px] text-primary mt-2 sm:mt-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {'\u25B6'} สำรวจ {c.name}
            </div>
          </button>
        );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_2fr] gap-4">
        <BusiestAirportsTable />
        <TopAirlinesTable />
      </div>
      <TopDestinations />
    </div>
  );
}

function BusiestAirportsTable() {
  const { timeMode, drillTo } = useDrillDown();

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold flex items-center gap-2">
          {'🏆'} 5 อันดับสนามบินที่คึกคักที่สุดในโลก
        </h3>
        {/* <span className="text-[14px] text-muted-foreground">
          5 อันดับแรกตามจำนวนเที่ยวบิน {'\u00B7'} {modeLabel(timeMode)}
        </span> */}
      </div>
      <div className="bg-card border border-border rounded-[10px] overflow-hidden flex-1 min-w-0">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">#</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">สนามบิน</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">เมือง / ประเทศ</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">รวม</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">ขาออก</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">ขาเข้า</th>
                <th className="text-[13px] tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">
                  {timeMode === 'wow' ? 'รายสัปดาห์' : timeMode === 'mom' ? 'รายเดือน' : 'รายปี'}
                </th>
              </tr>
            </thead>
            <tbody>
              {BUSIEST_AIRPORTS.map((a) => {
                const { pct, num } = getChangeForMode(a, timeMode);
                return (
                  <tr 
                    key={a.iata} 
                    onClick={() => drillTo('airport', { airport: airportInfoFromBusiest(a) })}
                    className="border-b border-border/60 last:border-b-0 hover:bg-primary/[0.03] cursor-pointer group/row"
                  >
                    <td className="py-2.5 px-2.5 font-bold text-muted-foreground w-8 text-[14px] group-hover/row:text-primary transition-colors">{a.rank}</td>
                    <td className="py-2.5 px-2.5">
                      <span className="font-extrabold text-primary tracking-tight">{a.iata}</span>{' '}
                      <span className="text-base">{a.flag}</span>
                    </td>
                    <td className="py-2.5 px-2.5">
                      <div className="font-medium">{a.city}</div>
                      <div className="text-[13px] text-muted-foreground">{a.country}</div>
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-bold tabular-nums">{a.total.toLocaleString()}</td>
                    <td className="py-2.5 px-2.5 text-right tabular-nums">{a.dep.toLocaleString()}</td>
                    <td className="py-2.5 px-2.5 text-right tabular-nums">{a.arr.toLocaleString()}</td>
                    <td className="py-2.5 px-2.5 text-right"><ChangePill pct={pct} num={num} active timeMode={timeMode} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TopAirlinesTable() {
  const { timeMode } = useDrillDown();
  const topAirlines = enrichTopAirlinesWithListing(TOP_AIRLINES_WORLD);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold flex items-center gap-2">
          {'✈️'} 5 อันดับสายการบินทั่วโลก
        </h3>
        <span className="text-[14px] text-muted-foreground">
          ตามจำนวนเที่ยวบิน
        </span>
      </div>
      <div className="bg-card border border-border rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full min-w-[640px] border-collapse text-sm table-fixed">
            <thead>
              <tr className="border-b border-border">
                <th className="w-7 max-w-7 px-1 text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 text-center">#</th>
                <th className="w-[27%] text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">สายการบิน</th>
                <th className="w-[9%] text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">Ticker</th>
                <th className="w-[28%] text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">ตลาดหลักทรัพย์</th>
                <th className="w-[18%] text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">เที่ยวบิน</th>
                <th className="w-[18%] min-w-[7.5rem] text-[13px] tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">
                  {timeMode === 'wow' ? 'รายสัปดาห์' : timeMode === 'mom' ? 'รายเดือน' : 'รายปี'}
                </th>
              </tr>
            </thead>
            <tbody>
              {topAirlines.map((a) => {
                const { pct, num } = getChangeForMode(a, timeMode);
                return (
                <tr key={a.iata} className="border-b border-border/60 last:border-b-0 hover:bg-primary/[0.03]">
                  <td className="w-7 max-w-7 px-1 py-2.5 text-center font-bold tabular-nums text-muted-foreground text-[14px] align-middle">{a.rank}</td>
                  <td className="py-2.5 px-2.5 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.flag}</span>
                      <div className="min-w-0">
                        <div className="font-semibold text-[15px] whitespace-normal break-words leading-tight">{a.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-bold tabular-nums text-[14px] align-middle">{a.ticker || '-'}</td>
                  <td className="py-2.5 px-2.5 text-[13px] text-muted-foreground align-middle">
                    <span className="block whitespace-normal break-words leading-tight" title={a.exchange || '-'}>
                      {a.exchange || '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-bold tabular-nums text-[15px] align-middle">{a.flights.toLocaleString()}</td>
                  <td className="py-2.5 px-2.5 text-right align-middle">
                    <ChangePill pct={pct} num={num} active timeMode={timeMode} />
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TopDestinations() {
  const { timeMode } = useDrillDown();

  const renderDest = (items: typeof WORLD_TOP_DEP) =>
    items.map((d, i) => {
      const { pct, num } = getChangeForMode(d, timeMode);
      return (
        <div key={d.iata} className="flex items-center gap-2 py-1.5 border-b border-border/60 last:border-b-0">
          <span className="text-[14px] text-muted-foreground w-5 text-center shrink-0">{i + 1}</span>
          <span className="text-base shrink-0">{d.icon}</span>
          <span className="text-[15px] font-medium flex-1 min-w-0 truncate">
            <strong>{d.iata}</strong> {d.name}
          </span>
          <span className="text-[14px] text-muted-foreground w-14 text-right shrink-0 tabular-nums">
            {(d.flights / 1000).toFixed(1)}k
          </span>
          <ChangePill pct={pct} num={num} active timeMode={timeMode} />
        </div>
      );
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[16px] font-bold">{'🛫🛬'} 5 อันดับจุดหมายปลายทาง {'\u2014'} ขาออก vs ขาเข้า</h3>
        <span className="text-[14px] text-muted-foreground">
          สนามบินที่ให้บริการมากที่สุดทั่วโลก {'\u00B7'} {modeLabel(timeMode)}
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <div className="bg-card border border-border rounded-[10px] p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[14px] font-bold py-0.5 px-2.5 rounded-full bg-primary/15 text-primary">{'\u2191'} ขาออก</span>
            <span className="text-[16px] font-bold">5 อันดับจุดหมายขาออก</span>
          </div>
          {renderDest(WORLD_TOP_DEP)}
        </div>
        <div className="bg-card border border-border rounded-[10px] p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[14px] font-bold py-0.5 px-2.5 rounded-full bg-accent/10 text-accent">{'\u2193'} ขาเข้า</span>
            <span className="text-[16px] font-bold">5 อันดับจุดหมายขาเข้า</span>
          </div>
          {renderDest(WORLD_TOP_ARR)}
        </div>
      </div>
    </div>
  );
}
