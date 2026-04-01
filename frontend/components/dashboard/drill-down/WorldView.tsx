'use client';

import {
  BUSIEST_AIRPORTS,
  WORLD_TOP_DEP,
  WORLD_TOP_ARR,
  CONTINENTS,
  TOP_AIRLINES_WORLD,
  TOP_AIRLINES_BY_CONTINENT,
  compareToPriorPeriodPhraseTh,
  fmtWorldKpiDeltaTh,
  getChangeForMode,
  growthCardBadgeClasses,
  growthDeltaTypeFromPct,
} from '@/lib/dashboard/drill-down-data';
import { KPI_ACCENT } from '@/lib/dashboard/kpi-colors';
import { enrichTopAirlinesWithListing } from '@/lib/dashboard/airline-ticker-map';
import { airportInfoFromBusiest } from '@/lib/dashboard/services/drilldown';
import { useDrillDown, KPIRow, TimeToggle } from './DrillDownDashboard';
import type { KPIItem } from './DrillDownDashboard';

function deltaCell(pct: number, num: number) {
  const isUp = pct >= 0;
  return (
    <span className={isUp ? 'text-accent font-semibold' : 'text-destructive font-semibold'}>
      {isUp ? '▲' : '▼'} {num >= 0 ? '+' : ''}
      {num.toLocaleString()} ({pct >= 0 ? '+' : ''}
      {pct.toFixed(1)}%)
    </span>
  );
}

function getAirlineCountry(name: string) {
  if (
    name.includes('American') ||
    name.includes('Delta') ||
    name.includes('United') ||
    name.includes('Southwest')
  ) {
    return { th: 'สหรัฐอเมริกา', en: 'USA' };
  }
  if (name.includes('Ryanair')) {
    return { th: 'ไอร์แลนด์', en: 'IE' };
  }
  return { th: '-', en: '-' };
}

export function WorldView() {
  const { drillTo, timeMode } = useDrillDown();

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
  const bcArrow = bcNum >= 0 ? '▲' : '▼';

  const busiestContinentSubline = `${bcArrow} ${bcSign}${bcNum.toLocaleString()} (${bcPct >= 0 ? '+' : ''}${bcPct.toFixed(1)}%) · ${busiestContinent.flights.toLocaleString()} เที่ยวบิน · ${compareToPriorPeriodPhraseTh(timeMode)}`;

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
      delta: '≈ คงที่',
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
            แสดงข้อมูลสำหรับ <strong>21–24 ต.ค. 2026</strong> · คลิกทวีปเพื่อดูรายละเอียด
          </p>
        </div>
        <div className="shrink-0 self-start sm:self-auto">
          <TimeToggle />
        </div>
      </div>

      <KPIRow items={kpis} />

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
                ▶ สำรวจ {c.name}
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-5">
        <ContinentRankingTable />
        <BusiestAirportsTable />
        <TopAirlinesTable />
        <CountryRouteRankingTable />
        <TopAirlinesByContinentTable />
        <TopInboundAirportsTable />
        <TopOutboundAirportsTable />
      </div>
    </div>
  );
}

function ContinentRankingTable() {
  const { drillTo } = useDrillDown();

  return (
    <div className="bg-card border border-border rounded-[10px] overflow-hidden">
      <div className="px-4 py-3 font-bold text-base">
        🏆 จัดอันดับเส้นทางการบินในทวีป
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2">ทวีป</th>
              <th className="text-center px-3 py-2">เส้นทางการบินทั้งหมด</th>
              <th className="text-center px-3 py-2">เที่ยวบินทั้งหมด</th>
              <th className="text-center px-3 py-2">YOY</th>
              <th className="text-center px-3 py-2">MOM</th>
              <th className="text-center px-3 py-2">WOW</th>
            </tr>
          </thead>
          <tbody>
            {CONTINENTS.map((c) => (
              <tr
                key={c.name}
                onClick={() => drillTo('continent', { continent: c })}
                className="cursor-pointer hover:bg-primary/5 border-b border-border/60"
              >
                <td className="px-3 py-2 text-left font-semibold">
                  <span className="mr-2">{c.icon}</span>
                  {c.name}
                </td>
                <td className="px-3 py-2 text-center">
                  {Math.round(c.flights / 12).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-center font-bold">
                  {c.flights.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-center">{deltaCell(c.yoy, c.yoyN)}</td>
                <td className="px-3 py-2 text-center">{deltaCell(c.mom, c.momN)}</td>
                <td className="px-3 py-2 text-center">{deltaCell(c.wow, c.wowN)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BusiestAirportsTable() {
  const { drillTo } = useDrillDown();

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold flex items-center gap-2">
          🏆 5 สนามบินที่พลุกพล่านที่สุดในโลก
        </h3>
      </div>

      <div className="bg-card border border-border rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="text-center py-2.5 px-2.5">สนามบิน</th>
                <th className="text-center py-2.5 px-2.5">เมือง / ประเทศ</th>
                <th className="text-center py-2.5 px-2.5">เที่ยวบินทั้งหมด</th>
                <th className="text-center py-2.5 px-2.5">DEP</th>
                <th className="text-center py-2.5 px-2.5">ARR</th>
                <th className="text-center py-2.5 px-2.5">YOY</th>
                <th className="text-center py-2.5 px-2.5">MOM</th>
                <th className="text-center py-2.5 px-2.5">WOW</th>
              </tr>
            </thead>
            <tbody>
              {BUSIEST_AIRPORTS.map((a) => (
                <tr
                  key={a.iata}
                  onClick={() => drillTo('airport', { airport: airportInfoFromBusiest(a) })}
                  className="border-b border-border/60 last:border-b-0 hover:bg-primary/[0.03] cursor-pointer"
                >
                  <td className="py-2.5 px-2.5 text-center font-bold text-primary">
                    {a.iata} <span className="ml-1">{a.flag}</span>
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    <div className="font-medium">{a.city}</div>
                    <div className="text-[13px] text-muted-foreground">{a.country}</div>
                  </td>
                  <td className="py-2.5 px-2.5 text-center font-bold">{a.total.toLocaleString()}</td>
                  <td className="py-2.5 px-2.5 text-center">{a.dep.toLocaleString()}</td>
                  <td className="py-2.5 px-2.5 text-center">{a.arr.toLocaleString()}</td>
                  <td className="py-2.5 px-2.5 text-center">{deltaCell(a.yoy, a.yoyN)}</td>
                  <td className="py-2.5 px-2.5 text-center">{deltaCell(a.mom, a.momN)}</td>
                  <td className="py-2.5 px-2.5 text-center">{deltaCell(a.wow, a.wowN)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TopAirlinesTable() {
  const topAirlines = enrichTopAirlinesWithListing(TOP_AIRLINES_WORLD);

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold flex items-center gap-2">
          ✈️ 5 สายการบินยอดนิยมตามจำนวนเที่ยวบิน
        </h3>
      </div>

      <div className="bg-card border border-border rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="text-left py-2.5 px-2.5">สายการบิน</th>
                <th className="text-center py-2.5 px-2.5">ประเทศ</th>
                <th className="text-center py-2.5 px-2.5">เที่ยวบินทั้งหมด</th>
                <th className="text-center py-2.5 px-2.5">YOY</th>
                <th className="text-center py-2.5 px-2.5">MOM</th>
                <th className="text-center py-2.5 px-2.5">WOW</th>
              </tr>
            </thead>
            <tbody>
              {topAirlines.map((a) => {
                const country = getAirlineCountry(a.name);

                return (
                  <tr key={a.iata} className="border-b border-border/60 last:border-b-0 hover:bg-primary/[0.03]">
                    <td className="py-2.5 px-2.5 text-left">
                      <div className="flex flex-col items-start justify-center">
                        <div className="font-semibold text-primary">
                          {a.flag} {a.name}
                        </div>
                        <div className="text-[13px] text-muted-foreground">
                          ({a.iata})
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div>{country.th}</div>
                        <div className="text-[13px] text-muted-foreground">{country.en}</div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-bold">{a.flights.toLocaleString()}</td>
                    <td className="py-2.5 px-2.5 text-center">{deltaCell(a.yoy, a.yoyN)}</td>
                    <td className="py-2.5 px-2.5 text-center">{deltaCell(a.mom, a.momN)}</td>
                    <td className="py-2.5 px-2.5 text-center">{deltaCell(a.wow, a.wowN)}</td>
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

function CountryRouteRankingTable() {
  return (
    <div className="bg-card border border-border rounded-[10px] overflow-hidden">
      <div className="px-4 py-3 font-bold text-base">
        🌍 จัดอันดับเส้นทางการบินในประเทศ
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2">ประเทศ</th>
              <th className="text-center px-3 py-2">เส้นทางการบินทั้งหมด</th>
              <th className="text-center px-3 py-2">เที่ยวบินทั้งหมด</th>
              <th className="text-center px-3 py-2">YOY</th>
              <th className="text-center px-3 py-2">MOM</th>
              <th className="text-center px-3 py-2">WOW</th>
            </tr>
          </thead>
          <tbody>
            {WORLD_TOP_DEP.map((d) => (
              <tr key={d.iata} className="border-b border-border/60 hover:bg-primary/5">
                <td className="px-3 py-2 text-left font-semibold">
                  {d.icon} {d.name}
                </td>
                <td className="px-3 py-2 text-center">{Math.round(d.flights / 8).toLocaleString()}</td>
                <td className="px-3 py-2 text-center font-bold">{d.flights.toLocaleString()}</td>
                <td className="px-3 py-2 text-center">{deltaCell(d.yoy, d.yoyN)}</td>
                <td className="px-3 py-2 text-center">{deltaCell(d.mom, d.momN)}</td>
                <td className="px-3 py-2 text-center">{deltaCell(d.wow, d.wowN)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopAirlinesByContinentTable() {
  const { drillTo } = useDrillDown();

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold flex items-center gap-2">
          🏆 จัดอันดับสายการบินในภูมิภาค
        </h3>
      </div>

      <div className="bg-card border border-border rounded-[10px] overflow-hidden flex-1 min-w-0">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="text-left py-2.5 px-2.5">ภูมิภาค</th>
                <th className="text-center py-2.5 px-2.5">สายการบิน</th>
                <th className="text-center py-2.5 px-2.5">เที่ยวบินทั้งหมด</th>
                <th className="text-center py-2.5 px-2.5">YOY</th>
                <th className="text-center py-2.5 px-2.5">MOM</th>
                <th className="text-center py-2.5 px-2.5">WOW</th>
              </tr>
            </thead>

            <tbody>
              {TOP_AIRLINES_BY_CONTINENT.map((row) => {
                const continent = CONTINENTS.find((c) => c.name === row.name);

                return (
                  <tr
                    key={row.name}
                    className="border-b border-border/60 last:border-b-0 hover:bg-primary/[0.03] cursor-pointer"
                    onClick={() => {
                      if (continent) {
                        drillTo('continent', { continent });
                      }
                    }}
                  >
                    <td className="py-2.5 px-2.5 text-left font-semibold">{row.name}</td>
                    <td className="py-2.5 px-2.5 text-center">{row.airline}</td>
                    <td className="py-2.5 px-2.5 text-center font-bold">{row.flights.toLocaleString()}</td>
                    <td className="py-2.5 px-2.5 text-center">{deltaCell(row.yoy, row.yoyN)}</td>
                    <td className="py-2.5 px-2.5 text-center">{deltaCell(row.mom, row.momN)}</td>
                    <td className="py-2.5 px-2.5 text-center">{deltaCell(row.wow, row.wowN)}</td>
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

function TopInboundAirportsTable() {
  return (
    <div className="bg-card border border-border rounded-[10px] overflow-hidden">
      <div className="px-4 py-3 font-bold text-base">🛬 5 อันดับสนามบินขาเข้า</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2">สนามบิน</th>
              <th className="text-center px-3 py-2">เที่ยวบินทั้งหมด</th>
              <th className="text-center px-3 py-2">YOY</th>
              <th className="text-center px-3 py-2">MOM</th>
              <th className="text-center px-3 py-2">WOW</th>
            </tr>
          </thead>
          <tbody>
            {WORLD_TOP_ARR.map((d) => (
              <tr key={d.iata} className="border-b border-border/60 hover:bg-primary/5">
                <td className="px-3 py-2 text-left font-semibold">
                  {d.icon} {d.iata} {d.name}
                </td>
                <td className="px-3 py-2 text-center font-bold">{d.flights.toLocaleString()}</td>
                <td className="px-3 py-2 text-center">{deltaCell(d.yoy, d.yoyN)}</td>
                <td className="px-3 py-2 text-center">{deltaCell(d.mom, d.momN)}</td>
                <td className="px-3 py-2 text-center">{deltaCell(d.wow, d.wowN)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopOutboundAirportsTable() {
  return (
    <div className="bg-card border border-border rounded-[10px] overflow-hidden">
      <div className="px-4 py-3 font-bold text-base">🛫 5 อันดับสนามบินขาออก</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2">สนามบิน</th>
              <th className="text-center px-3 py-2">เที่ยวบินทั้งหมด</th>
              <th className="text-center px-3 py-2">YOY</th>
              <th className="text-center px-3 py-2">MOM</th>
              <th className="text-center px-3 py-2">WOW</th>
            </tr>
          </thead>
          <tbody>
            {WORLD_TOP_DEP.map((d) => (
              <tr key={d.iata} className="border-b border-border/60 hover:bg-primary/5">
                <td className="px-3 py-2 text-left font-semibold">
                  {d.icon} {d.iata} {d.name}
                </td>
                <td className="px-3 py-2 text-center font-bold">{d.flights.toLocaleString()}</td>
                <td className="px-3 py-2 text-center">{deltaCell(d.yoy, d.yoyN)}</td>
                <td className="px-3 py-2 text-center">{deltaCell(d.mom, d.momN)}</td>
                <td className="px-3 py-2 text-center">{deltaCell(d.wow, d.wowN)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}