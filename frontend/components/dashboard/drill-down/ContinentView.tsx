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
  EUR_SEASONAL,
  EUR_TOP_ROUTES,
  getChangeForMode,
} from '@/lib/dashboard/drill-down-data';
import { getContinentDetail } from '@/lib/dashboard/services/drilldown';
import { useDrillDown, KPIRow, BackButton, ChangePill, TimeToggle } from './DrillDownDashboard';
import type { KPIItem } from './DrillDownDashboard';

const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const NOW_IDX = 9;

export function ContinentView() {
  const { drillTo, timeMode, selections } = useDrillDown();
  const continent = selections.continent || CONTINENTS[0];

  const { detail: cData } = getContinentDetail(continent.name);

  const kpis: KPIItem[] = [
    { label: 'เที่ยวบินทั้งหมด', value: continent.flights.toLocaleString(), delta: continent.delta, deltaType: continent.deltaType as 'up' | 'down' | 'neutral', accentColor: '#2563eb' },
    { label: 'ประเทศที่เปิดน่านฟ้า', value: cData.countryCount, delta: `${cData.countries.length} ประเทศที่แสดง`, deltaType: 'neutral', accentColor: '#16a34a' },
    { label: 'ประเทศที่คึกคักที่สุด', value: `${cData.busiestCountry.flag} ${cData.busiestCountry.nameTh}`, delta: cData.busiestDelta, deltaType: 'up', accentColor: '#ca8a04' },
    { label: 'เติบโตเร็วที่สุด', value: `${cData.fastestGrowing.flag} ${cData.fastestGrowing.nameTh}`, delta: cData.fastestDelta, deltaType: 'up', accentColor: '#7c3aed' },
  ];

  const displayCountries = cData.countries;

  return (
    <div className="space-y-6">
      <BackButton label="กลับไปยังโลก" onClick={() => drillTo('world')} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">{continent.icon} {continent.name}</h2>
          <p className="text-[15px] text-muted-foreground font-medium">คลิกประเทศเพื่อดูสนามบินในภูมิภาค {continent.name}</p>
        </div>
        <TimeToggle />
      </div>

      <KPIRow items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <EurSeasonalChart />
        <EurTopRoutesPanel />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {displayCountries.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => drillTo('country', { country: c })}
            className={`bg-card border rounded-[10px] p-4 text-left transition-all hover:border-primary hover:-translate-y-0.5 cursor-pointer ${
              c.highlight ? 'border-primary bg-primary/5' : 'border-border shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{c.flag}</span>
              <span className="text-[15px] font-semibold">{c.name}</span>
              <span className="ml-auto bg-muted border border-border rounded-full text-[14px] py-0.5 px-2.5 text-muted-foreground font-medium">
                {c.airports} สนามบิน
              </span>
            </div>
            <div className="text-[24px] font-bold mb-0.5">{c.flights.toLocaleString()}</div>
            <div className="text-[15px] text-muted-foreground">เที่ยวบิน</div>
            <div className={`text-[12px] mt-1.5 font-bold ${c.deltaN >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {c.deltaN >= 0 ? '\u25B2' : '\u25BC'} {c.deltaN >= 0 ? '+' : ''}{c.deltaN.toLocaleString()} เที่ยวบิน ({c.delta})
            </div>
            <div className="mt-3.5 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${c.bar}%` }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function EurSeasonalChart() {
  const { timeMode, selections } = useDrillDown();
  const continentName = selections.continent?.name || 'Europe';
  const peakVal = Math.max(...EUR_SEASONAL);

  let chartData: Array<{ month: string; value: number; color: string }>;
  let title: string;

  if (timeMode === 'wow') {
    title = `แนวโน้มรายสัปดาห์ \u2014 ${continentName} (รายสัปดาห์)`;
    chartData = [
      { month: 'สัปดาห์ 1', value: 17, color: '#bfdbfe' },
      { month: 'สัปดาห์ 2', value: 18, color: '#bfdbfe' },
      { month: 'สัปดาห์ 3', value: 19, color: '#ff9f43' },
      { month: 'สัปดาห์ 4', value: 18, color: '#d29922' },
    ];
  } else if (timeMode === 'mom') {
    title = `แนวโน้มรายเดือน \u2014 ${continentName} (รายเดือน)`;
    const PREV = 8;
    const startIdx = Math.max(0, NOW_IDX - 2);
    const endIdx = Math.min(11, NOW_IDX + 2);
    chartData = EUR_SEASONAL
      .map((v, i) => ({
        month: MONTHS[i],
        value: v,
        color: i === NOW_IDX ? '#d29922' : v === peakVal ? '#ff9f43' : i === PREV ? '#2563eb' : '#bfdbfe',
        _idx: i,
      }))
      .filter((d) => d._idx >= startIdx && d._idx <= endIdx);
  } else {
    title = `แนวโน้มฤดูกาล \u2014 ${continentName} (รายปี)`;
    chartData = EUR_SEASONAL.map((v, i) => ({
      month: MONTHS[i],
      value: v,
      color: i === NOW_IDX ? '#d29922' : v === peakVal ? '#ff9f43' : v >= 60 ? '#93c5fd' : '#bfdbfe',
    }));
  }

  return (
    <div className="bg-card border border-border rounded-[10px] p-5">
      <div className="text-[16px] font-bold mb-4">{title}</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 500 }} className="text-muted-foreground" />
          <YAxis tick={{ fontSize: 11, fontWeight: 500 }} className="text-muted-foreground" unit="k" />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '14px' }}
            formatter={(value: number) => [`${value}k เที่ยวบิน`, '']}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={28}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={entry.color === '#bfdbfe' ? 0.4 : 0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[11px] font-medium text-muted-foreground mt-2">
        <span>ทั้งปี </span>
        {/* {'\u00B7'} เที่ยวบินเป็นพันเที่ยว */}
        <span className="flex gap-2.5">
          <span style={{ color: '#d29922' }}>{'\u25A0'} {timeMode === 'wow' ? 'สัปดาห์ปัจจุบัน' : 'เดือนปัจจุบัน'}</span>
          <span style={{ color: '#ff9f43' }}>{'\u25A0'} {timeMode === 'wow' ? 'สัปดาห์ที่สูงสุด' : 'เดือนที่สูงสุด'}</span>
          <span style={{ color: '#93c5fd' }}>{'\u25A0'} อื่นๆ</span>
        </span>
      </div>
    </div>
  );
}

function EurTopRoutesPanel() {
  const { timeMode, selections } = useDrillDown();
  const continentName = selections.continent?.name || 'Europe';

  return (
    <div className="bg-card border border-border rounded-[10px] p-5">
      <div className="text-[16px] font-bold mb-4">
        {'🏆'} 5 อันดับเส้นทางตามจำนวนเที่ยวบิน {'\u2014'} {continentName}
      </div>
      {EUR_TOP_ROUTES.map((r, i) => {
        const { pct, num } = getChangeForMode(r as any, timeMode);
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
            <ChangePill pct={pct} num={num} active />
          </div>
        );
      })}
    </div>
  );
}
