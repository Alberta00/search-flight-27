'use client';

import {
  BUSIEST_AIRPORTS,
  WORLD_TOP_DEP,
  WORLD_TOP_ARR,
  CONTINENTS,
  TOP_AIRLINES_WORLD,
  getChangeForMode,
  modeLabel,
} from '@/lib/dashboard/drill-down-data';
import { useDrillDown, KPIRow, ChangePill } from './DrillDownDashboard';
import type { KPIItem } from './DrillDownDashboard';

export function WorldView() {
  const { drillTo, timeMode } = useDrillDown();

  // Derive KPIs from actual data
  const totalFlights = CONTINENTS.reduce((s, c) => s + c.flights, 0);
  const busiestContinent = [...CONTINENTS].sort((a, b) => b.flights - a.flights)[0];
  const avgPerDay = Math.round(totalFlights / 4);

  const kpis: KPIItem[] = [
    { label: 'เที่ยวบินทั้งหมด', value: totalFlights.toLocaleString(), delta: `${busiestContinent.delta.split('(')[0].trim()} เทียบกับก่อนหน้า`, deltaType: 'up', accentColor: '#2563eb' },
    { label: 'สนามบินที่ใช้งาน', value: BUSIEST_AIRPORTS.length.toLocaleString() + ' อันดับ', delta: `จาก ${BUSIEST_AIRPORTS.length} สนามบินที่คึกคักที่สุด`, deltaType: 'up', accentColor: '#16a34a' },
    { label: 'เที่ยวบินเฉลี่ย/วัน', value: avgPerDay.toLocaleString(), delta: '\u2248 คงที่', deltaType: 'neutral', accentColor: '#ca8a04' },
    { label: 'ทวีปที่คึกคักที่สุด', value: <span className="text-xl">{busiestContinent.icon} {busiestContinent.name}</span>, delta: `${busiestContinent.delta.split('(')[0].trim()} \u00B7 ${busiestContinent.flights.toLocaleString()} เที่ยวบิน`, deltaType: 'up', accentColor: '#7c3aed' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">ภาพรวมเที่ยวบินทั่วโลก</h2>
        <p className="text-sm text-muted-foreground">
          แสดงข้อมูลสำหรับ <strong>21{'\u2013'}24 ต.ค. 2026</strong> {'\u00B7'} คลิกทวีปเพื่อดูรายละเอียด
        </p>
      </div>

      <KPIRow items={kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-4">
        <BusiestAirportsTable />
        <TopAirlinesTable />
      </div>
      <TopDestinations />

      {/* Continent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONTINENTS.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => drillTo('continent', { continent: c })}
            className={`relative overflow-hidden bg-card border rounded-[10px] p-6 text-left transition-all hover:border-primary hover:-translate-y-1 hover:shadow-lg cursor-pointer group ${
              c.highlight ? 'border-primary' : 'border-border'
            }`}
          >
            <span
              className={`absolute top-4 right-4 text-[13px] font-bold py-0.5 px-2 rounded-full ${
                c.deltaType === 'up'
                  ? 'bg-green-500/15 text-green-600'
                  : c.deltaType === 'down'
                    ? 'bg-red-500/15 text-red-500'
                    : 'bg-orange-500/15 text-orange-600'
              }`}
            >
              {c.delta}
            </span>
            <div className="text-[40px] mb-3">{c.icon}</div>
            <div className="text-lg font-bold mb-1.5">{c.name}</div>
            <div className="text-[15px] text-muted-foreground mb-4">{c.airports}</div>
            <div className="text-2xl font-bold text-primary">{c.flights.toLocaleString()}</div>
            <div className="text-[15px] text-muted-foreground mt-0.5">เที่ยวบินในช่วงนี้</div>
            <div className="text-[14px] text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {'\u25B6'} สำรวจ {c.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BusiestAirportsTable() {
  const { timeMode } = useDrillDown();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold flex items-center gap-2">
          {'🏆'} สนามบินที่คึกคักที่สุดในโลก
        </h3>
        <span className="text-[14px] text-muted-foreground">
          5 อันดับแรกตามจำนวนเที่ยวบิน {'\u00B7'} ไฮไลต์ {modeLabel(timeMode)}
        </span>
      </div>
      <div className="bg-card border border-border rounded-[10px] overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">#</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">สนามบิน</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">เมือง / ประเทศ</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">รวม</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">ขาออก</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">ขาเข้า</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">
                  {timeMode.toUpperCase()}
                </th>
              </tr>
            </thead>
            <tbody>
              {BUSIEST_AIRPORTS.map((a) => {
                const { pct, num } = getChangeForMode(a, timeMode);
                return (
                  <tr 
                    key={a.iata} 
                    onClick={() => drillTo('airport', { airport: { iata: a.iata, name: a.city + ' ' + a.country, flights: a.total, routes: 150, airlines: 40, color: '#2563eb' } })}
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
                    <td className="py-2.5 px-2.5 text-right"><ChangePill pct={pct} num={num} active /></td>
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold flex items-center gap-2">
          {'✈️'} 5 อันดับสายการบินทั่วโลก
        </h3>
        <span className="text-[14px] text-muted-foreground">
          ตามจำนวนเที่ยวบิน {'\u00B7'} ไฮไลต์ {modeLabel(timeMode)}
        </span>
      </div>
      <div className="bg-card border border-border rounded-[10px] overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">#</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-left">สายการบิน</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">เที่ยวบิน</th>
                <th className="text-[13px] uppercase tracking-wider text-muted-foreground font-bold py-2.5 px-2.5 text-right">
                  {timeMode.toUpperCase()}
                </th>
              </tr>
            </thead>
            <tbody>
              {TOP_AIRLINES_WORLD.map((a) => {
                const { pct, num } = getChangeForMode(a, timeMode);
                return (
                <tr key={a.iata} className="border-b border-border/60 last:border-b-0 hover:bg-primary/[0.03]">
                  <td className="py-2.5 px-2.5 font-bold text-muted-foreground w-8 text-[14px]">{a.rank}</td>
                  <td className="py-2.5 px-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.flag}</span>
                      <div>
                        <div className="font-semibold text-[15px]">{a.name}</div>
                        <div className="text-[14px] text-muted-foreground">{a.iata}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-bold tabular-nums text-[15px]">{a.flights.toLocaleString()}</td>
                  <td className="py-2.5 px-2.5 text-right"><ChangePill pct={pct} num={num} active /></td>
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
      const { pct, num } = getChangeForMode(d as any, timeMode);
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
          <ChangePill pct={pct} num={num} active />
        </div>
      );
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-bold">{'🛫🛬'} 5 อันดับจุดหมายปลายทาง {'\u2014'} ขาออก vs ขาเข้า</h3>
        <span className="text-[14px] text-muted-foreground">
          สนามบินที่ให้บริการมากที่สุดทั่วโลก {'\u00B7'} {modeLabel(timeMode)}
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <div className="bg-card border border-border rounded-[10px] p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[11px] font-bold py-0.5 px-2.5 rounded-full bg-primary/15 text-primary">{'\u2191'} ขาออก</span>
            <span className="text-[16px] font-bold">5 อันดับจุดหมายขาออก</span>
          </div>
          {renderDest(WORLD_TOP_DEP)}
        </div>
        <div className="bg-card border border-border rounded-[10px] p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[11px] font-bold py-0.5 px-2.5 rounded-full bg-green-500/12 text-green-600">{'\u2193'} ขาเข้า</span>
            <span className="text-[16px] font-bold">5 อันดับจุดหมายขาเข้า</span>
          </div>
          {renderDest(WORLD_TOP_ARR)}
        </div>
      </div>
    </div>
  );
}
