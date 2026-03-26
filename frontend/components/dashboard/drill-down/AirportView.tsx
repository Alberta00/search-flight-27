'use client';

import { useState } from 'react';
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
  calcInvestScore,
  getInvestTier,
} from '@/lib/dashboard/drill-down-data';
import { getAirportDetail } from '@/lib/dashboard/services/drilldown';
import { useDrillDown, KPIRow, BackButton, TimeToggle } from './DrillDownDashboard';
import type { KPIItem } from './DrillDownDashboard';
import type { TimeMode } from '@/types/dashboard';

const {
  routes: ROUTES,
  arrivals: ARRIVALS,
  airlines: AIRLINES,
  hourTotal: HOUR_TOTAL,
  hourTotalArr: HOUR_TOTAL_ARR,
  daily: DAILY,
  investRoutes: INVEST_ROUTES,
  monthly: MONTHLY,
  monthLabels: AP_MONTHS,
  currentMonthIdx: AP_NOW,
} = getAirportDetail();

export function AirportView() {
  const { drillTo, timeMode, selections } = useDrillDown();
  const airport = selections.airport || MK_AIRPORTS[0];

  // Derive KPIs from data
  const topRoute = ROUTES.length > 0 ? ROUTES.reduce((a, b) => a.flights > b.flights ? a : b) : null;
  const hourEntries = Object.entries(HOUR_TOTAL).map(([h, f]) => ({ hour: Number(h), flights: f }));
  const busiestHour = hourEntries.reduce((a, b) => a.flights > b.flights ? a : b);
  const totalDailyFlights = DAILY.reduce((s, d) => s + d.flights, 0);

  const kpis: KPIItem[] = [
    { label: 'เที่ยวบินขาออกทั้งหมด', value: airport.flights.toLocaleString(), delta: `\u25B2 ช่วง ${DAILY.length} วัน`, deltaType: 'up', accentColor: '#2563eb' },
    { label: 'เฉลี่ยต่อวัน', value: Math.round(totalDailyFlights / DAILY.length).toString(), delta: 'ตามรายงานล่าสุด', deltaType: 'up', accentColor: '#16a34a' },
    { label: 'จุดหมายยอดนิยม', value: topRoute ? topRoute.city : '-', delta: topRoute ? `${topRoute.flights} เที่ยวบิน \u00B7 ${topRoute.flag}` : '-', deltaType: 'up', accentColor: '#ca8a04' },
    { label: 'ชั่วโมงที่คึกคักที่สุด', value: `${busiestHour.hour.toString().padStart(2, '0')}:00`, delta: `${busiestHour.flights} เที่ยวบินขาออก`, deltaType: 'up', accentColor: '#7c3aed' },
  ];

  return (
    <div className="space-y-6">
      <BackButton label="กลับไปยังประเทศ" onClick={() => drillTo('country')} />

      <div className="flex items-start justify-between">
        <div>
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-xl font-bold">{'🛫'} {airport.iata} {'\u2014'} {airport.name}</h2>
          {selections.country && (
            <span className={`text-[13px] font-bold py-0.5 px-3 rounded-full ${
              selections.country.deltaN >= 0 ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'
            }`}>
              {selections.country.deltaN >= 0 ? '\u25B2' : '\u25BC'} {selections.country.deltaN >= 0 ? '+' : ''}{selections.country.deltaN} เที่ยวบิน ({selections.country.delta})
            </span>
          )}
        </div>
        <p className="text-[15px] text-muted-foreground">{airport.flights} ขาออก {'\u00B7'} {airport.routes} จุดหมาย {'\u00B7'} {airport.airlines} สายการบิน</p>
        </div>
        <TimeToggle />
      </div>

      <KPIRow items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <TrendSparkChart timeMode={timeMode} />
        <SeasonalTrendChart timeMode={timeMode} />
      </div>

      <TopDestinationsPanel />
      <InvestmentPanel timeMode={timeMode} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <AirlineSharePanel />
        <HourDistributionPanel timeMode={timeMode} />
      </div>
    </div>
  );
}

function TrendSparkChart({ timeMode }: { timeMode: TimeMode }) {
  // WoW: derive from DAILY data
  const wowData = DAILY.map((d) => ({ day: d.date, flights: d.flights }));

  // MoM: ±2 months around current (Oct)
  const startIdx = Math.max(0, AP_NOW - 2);
  const endIdx = Math.min(11, AP_NOW + 2);
  const momData = MONTHLY
    .map((v, i) => ({ day: AP_MONTHS[i], flights: v, _idx: i }))
    .filter((d) => d._idx >= startIdx && d._idx <= endIdx);

  // YoY: all 12 months
  const yoyData = AP_MONTHS.map((m, i) => ({ day: m, flights: MONTHLY[i] }));

  const tData = timeMode === 'wow' ? wowData : timeMode === 'mom' ? momData : yoyData;
  const peak = Math.max(...tData.map((d) => d.flights));
  const total = tData.reduce((s, d) => s + d.flights, 0);
  const peakEntry = tData.find((d) => d.flights === peak)!;

  const minVal = Math.min(...tData.map((d) => d.flights));
  const yDomain: [number, number] = [Math.floor(minVal * 0.9), Math.ceil(peak * 1.1)];

  const subtitle = timeMode === 'wow'
    ? 'ภาพรวมรายวัน'
    : timeMode === 'mom'
      ? 'ภาพรวมรายเดือน (±2 เดือน)'
      : 'ภาพรวมรายปี';

  const dateRange = timeMode === 'wow'
    ? `${wowData[0]?.day} \u2013 ${wowData[wowData.length - 1]?.day}`
    : timeMode === 'mom'
      ? `${momData[0]?.day} \u2013 ${momData[momData.length - 1]?.day} 2026`
      : 'ม.ค. \u2013 ธ.ค. 2026';

  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-[10px] p-4 hover:border-primary hover:-translate-y-0.5 transition-all">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{subtitle}</div>
          <div className="text-[15px] font-bold">แนวโน้มเที่ยวบิน</div>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-bold leading-none">{total.toLocaleString()}</div>
          <div className="text-[11px] text-green-600 font-semibold mt-0.5">{'\u25B2'} คงที่</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={95}>
        <AreaChart data={tData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 4" vertical={false} className="stroke-border" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 500 }} className="text-muted-foreground" />
          <YAxis domain={yDomain} tick={{ fontSize: 10, fontWeight: 500 }} className="text-muted-foreground" tickCount={4} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '14px' }} formatter={(value: number) => [`${value} เที่ยวบิน`, '']} />
          <Area type="monotone" dataKey="flights" stroke="#2563eb" strokeWidth={2.5} fill="url(#trendGradient)" />
          <ReferenceDot x={peakEntry.day} y={peak} r={6} fill="#ff9f43" stroke="#fff" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[15px] font-medium text-muted-foreground mt-2.5">
        <span>{dateRange}</span>
        <span className="flex gap-4">
          <span className="text-primary font-bold">{'\u25CF'} จริง</span>
          <span className="text-[#ff9f43] font-bold">{'\u25CF'} {timeMode === 'wow' ? 'วันสูงสุด' : 'เดือนสูงสุด'}</span>
        </span>
      </div>
    </div>
  );
}

function SeasonalTrendChart({ timeMode }: { timeMode: TimeMode }) {
  let chartData: Array<{ month: string; value: number; color: string }>;
  let title: string;
  let modeDisplay: string;
  const peakVal = Math.max(...MONTHLY);

  if (timeMode === 'wow') {
    title = 'แนวโน้มรายสัปดาห์ (WoW)';
    modeDisplay = 'WoW';
    chartData = [
      { month: 'สัปดาห์ 1', value: 17, color: '#bfdbfe' },
      { month: 'สัปดาห์ 2', value: 18, color: '#bfdbfe' },
      { month: 'สัปดาห์ 3', value: 19, color: '#ff9f43' },
      { month: 'สัปดาห์ 4', value: 18, color: '#d29922' },
    ];
  } else if (timeMode === 'mom') {
    title = 'แนวโน้มรายเดือน (MoM)';
    modeDisplay = 'MoM';
    const PREV = 8;
    const startIdx = Math.max(0, AP_NOW - 2);
    const endIdx = Math.min(11, AP_NOW + 2);
    chartData = MONTHLY
      .map((v, i) => ({ month: AP_MONTHS[i], value: v, color: i === AP_NOW ? '#d29922' : v === peakVal ? '#ff9f43' : i === PREV ? '#2563eb' : '#bfdbfe', _idx: i }))
      .filter((d) => d._idx >= startIdx && d._idx <= endIdx);
  } else {
    title = 'แนวโน้มฤดูกาล (รายปี)';
    modeDisplay = 'รายปี';
    chartData = MONTHLY.map((v, i) => ({ month: AP_MONTHS[i], value: v, color: i === AP_NOW ? '#d29922' : v === peakVal ? '#ff9f43' : v >= 60 ? '#93c5fd' : '#bfdbfe' }));
  }

  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-[10px] p-4 hover:border-primary hover:-translate-y-0.5 transition-all">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#ca8a04]" />
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[12px] uppercase tracking-wider text-muted-foreground font-bold">รายปี</div>
          <div className="text-[16px] font-bold">{title}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold leading-none text-[#ca8a04]">{modeDisplay}</div>
          <div className="text-[12px] text-muted-foreground mt-1 font-bold">โหมด</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 500 }} className="text-muted-foreground" />
          <YAxis tick={{ fontSize: 10, fontWeight: 500 }} className="text-muted-foreground" />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '14px' }} formatter={(value: number) => [`${value} เที่ยวบิน`, '']} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={24}>
            {chartData.map((entry, i) => (<Cell key={i} fill={entry.color} opacity={entry.color === '#bfdbfe' ? 0.35 : 0.9} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[15px] font-medium text-muted-foreground mt-2">
        <span>ทั้งปี {'\u00B7'} เที่ยวบินต่อเดือน</span>
        <span className="flex gap-4">
          <span style={{ color: '#d29922' }} className="font-bold">{'\u25A0'} {timeMode === 'wow' ? 'สัปดาห์ปัจจุบัน' : 'เดือนปัจจุบัน'}</span>
          <span style={{ color: '#ff9f43' }} className="font-bold">{'\u25A0'} {timeMode === 'wow' ? 'สัปดาห์ที่สูงสุด' : 'เดือนที่สูงสุด'}</span>
          <span style={{ color: '#93c5fd' }} className="font-bold">{'\u25A0'} อื่นๆ</span>
        </span>
      </div>
    </div>
  );
}

function TopDestinationsPanel() {
  const top5dep = ROUTES.slice(0, 5);
  const maxDep = top5dep[0].flights;
  const maxArr = ARRIVALS[0].flights;

  const renderRow = (r: typeof ROUTES[0], i: number, maxF: number) => {
    const barW = ((r.flights / maxF) * 100).toFixed(0);
    return (
      <div key={r.city + i} className="flex items-center gap-2 py-2 border-b border-border/60 last:border-b-0">
        <span className="text-[14px] text-muted-foreground w-6 text-center shrink-0 font-bold">{i + 1}</span>
        <span className="text-lg shrink-0">{r.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold truncate">{r.city} <span className="text-[11px] text-muted-foreground font-medium">{'\u00B7'} {r.country}</span></div>
        </div>
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden shrink-0">
          <div className="h-full rounded-full" style={{ width: `${barW}%`, background: r.color }} />
        </div>
        <span className="text-[15px] font-bold w-10 text-right shrink-0 tabular-nums">{r.flights}</span>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-[10px]">
      <div className="flex items-start justify-between p-5 border-b border-border">
        <div>
          <div className="text-[16px] font-bold">จุดหมายปลายทางยอดนิยม</div>
          <div className="text-[15px] text-muted-foreground mt-1">21{'\u2013'}24 ต.ค. 2026 {'\u00B7'} 5 อันดับแรกแต่ละทิศทาง</div>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[14px] font-bold py-0.5 px-2.5 rounded-full bg-primary/15 text-primary">{'\u2191'} ขาออก</span>
          <span className="text-[14px] font-bold py-0.5 px-2.5 rounded-full bg-green-500/12 text-green-600">{'\u2193'} ขาเข้า</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[14px] font-bold py-0.5 px-2.5 rounded-full bg-primary/15 text-primary">{'\u2191'} ขาออก</span>
            <span className="text-[15px] text-muted-foreground font-semibold">5 อันดับเส้นทางขาออก</span>
          </div>
          {top5dep.map((r, i) => renderRow(r, i, maxDep))}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[14px] font-bold py-0.5 px-2.5 rounded-full bg-green-500/12 text-green-600">{'\u2193'} ขาเข้า</span>
            <span className="text-[15px] text-muted-foreground font-semibold">5 อันดับเส้นทางขาเข้า</span>
          </div>
          {ARRIVALS.map((r, i) => renderRow(r, i, maxArr))}
        </div>
      </div>
    </div>
  );
}

function InvestmentPanel({ timeMode }: { timeMode: TimeMode }) {
  const modeKey = timeMode;
  const modeShort = timeMode.toUpperCase();

  const scored = INVEST_ROUTES.map((r) => ({ ...r, _score: calcInvestScore(r, timeMode) }))
    .sort((a, b) => b._score - a._score);

  const factors = [
    { label: `การเติบโต ${modeShort}`, weight: '40%', active: true },
    { label: 'ความต้องการที่ยังไม่ถูกตอบสนอง', weight: '35%', active: false },
    { label: 'ความง่ายในการเข้าสู่ตลาด', weight: '15%', active: false },
    { label: 'ความสม่ำเสมอของแนวโน้ม', weight: '10%', active: false },
  ];

  return (
    <div className="bg-card border border-border rounded-[10px] p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-base font-bold">{'💡'} โอกาสการลงทุน {'\u2014'} จัดอันดับตามคะแนน {modeShort}</div>
          <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
            เส้นทางที่มีอุปสงค์ยังไม่ถูกตอบสนอง: กำลังเติบโต แต่ยังให้บริการน้อย การแข่งขันต่ำ แนวโน้มต่อเนื่อง
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-muted rounded-lg mb-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground mr-1">คะแนน =</span>
        {factors.map((f, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[13px] font-bold border whitespace-nowrap ${
              f.active ? 'bg-primary/15 border-primary text-primary' : 'bg-card border-border text-muted-foreground'
            }`}>
              {f.active && '📊 '}{f.label} <span className="opacity-70">{'\u00D7'}{f.weight}</span>
            </span>
            {i < factors.length - 1 && <span className="text-border">+</span>}
          </span>
        ))}
      </div>

      {scored.map((r, i) => {
        const tier = getInvestTier(r._score);
        const scoreColor = r._score >= 75 ? '#16a34a' : r._score >= 58 ? '#2563eb' : r._score >= 42 ? '#ca8a04' : '#6b7280';
        return (
          <div key={r.city} className="flex items-start gap-2.5 py-3 border-b border-border/60 last:border-b-0">
            <span className="text-sm text-muted-foreground w-5 text-center shrink-0 pt-0.5">{i + 1}</span>
            <span className="text-xl shrink-0 pt-0.5">{r.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold">{r.city}</span>
                <span className="text-sm text-muted-foreground">{r.country}</span>
                <span className="ml-auto text-[13px] font-bold py-1 px-2.5 rounded-full whitespace-nowrap" style={{ background: `${tier.color}15`, color: tier.color }}>
                  {tier.label}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap mt-1.5 mb-1">
                {(['wow', 'mom', 'yoy'] as const).map((mode) => {
                  const val = r[mode];
                  const isActive = mode === modeKey;
                  return (
                    <span key={mode} className={`text-[13px] font-semibold py-1 px-2.5 rounded border whitespace-nowrap ${
                      isActive ? 'bg-primary/12 border-primary text-primary text-sm font-bold' : `bg-muted border-border ${val < 0 ? 'text-red-500' : 'text-muted-foreground'}`
                    }`}>
                      {mode.toUpperCase()} {val > 0 ? '+' : ''}{val}%
                    </span>
                  );
                })}
              </div>
              <div className="text-[13px] text-muted-foreground">{'\u2708'} {r.flights} เที่ยวบิน {'\u00B7'} {r.airlines} สายการบิน {'\u00B7'} {r.airlineNames}</div>
              <div className="text-[13px] text-muted-foreground mt-0.5 italic opacity-80">{r.note}</div>
              <div className="text-sm text-primary font-semibold mt-1.5">{'\u2192'} {tier.action}</div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0 min-w-[72px] pt-0.5">
              <span className="text-[28px] font-extrabold leading-none" style={{ color: scoreColor }}>{r._score}</span>
              <span className="text-[13px] text-muted-foreground text-right">/100</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-400" style={{ width: `${r._score}%`, background: scoreColor }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AirlineSharePanel() {
  const max = AIRLINES[0].count;
  return (
    <div className="bg-card border border-border rounded-[10px] p-4">
      <div className="text-[15px] font-bold mb-3.5">ส่วนแบ่งตลาดสายการบิน</div>
      {AIRLINES.map((a) => (
        <div key={a.name} className="flex items-center gap-2 mb-2">
          <div className="text-[13px] text-muted-foreground w-24 truncate shrink-0">{a.name}</div>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(a.count / max * 100).toFixed(0)}%`, background: a.color }} />
          </div>
          <div className="text-[13px] text-muted-foreground w-7 text-right shrink-0 tabular-nums">{a.count}</div>
        </div>
      ))}
    </div>
  );
}

function HourDistributionPanel({ timeMode }: { timeMode: TimeMode }) {
  const [view, setView] = useState<'both' | 'dep' | 'arr'>('both');
  const subtitle = timeMode === 'wow' ? 'รายสัปดาห์' : timeMode === 'mom' ? 'รายเดือน' : 'รายปี';
  const BAR_HEIGHT = 96;

  const scale = timeMode === 'wow' ? 1 : timeMode === 'mom' ? 4 : 52;
  const hours = Array.from({ length: 24 }, (_, h) => ({
    hour: h.toString().padStart(2, '0'),
    dep: (HOUR_TOTAL[h] || 0) * scale,
    arr: (HOUR_TOTAL_ARR[h] || 0) * scale,
  }));

  const maxVal = Math.max(...hours.map((h) => {
    if (view === 'dep') return h.dep;
    if (view === 'arr') return h.arr;
    return h.dep + h.arr;
  }));

  const viewButtons: { key: 'both' | 'dep' | 'arr'; label: string }[] = [
    { key: 'both', label: 'ทั้งหมด' },
    { key: 'dep', label: 'ขาออก' },
    { key: 'arr', label: 'ขาเข้า' },
  ];

  return (
    <div className="bg-card border border-border rounded-[10px] p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[15px] font-bold">เที่ยวบินตามชั่วโมง</div>
        <div className="flex border border-border rounded-md overflow-hidden">
          {viewButtons.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setView(b.key)}
              className={`px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                view === b.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div className="text-sm text-muted-foreground mb-2.5">{subtitle}</div>
      <div className="flex items-end gap-[2px] mb-1" style={{ height: BAR_HEIGHT }}>
        {hours.map((h) => {
          const total = view === 'dep' ? h.dep : view === 'arr' ? h.arr : h.dep + h.arr;
          const depH = view !== 'arr' ? Math.round((h.dep / (maxVal || 1)) * BAR_HEIGHT) : 0;
          const arrH = view !== 'dep' ? Math.round((h.arr / (maxVal || 1)) * BAR_HEIGHT) : 0;

          return (
            <div
              key={h.hour}
              className="flex-1 flex flex-col justify-end min-w-1 rounded-t-sm overflow-hidden opacity-75 hover:opacity-100 transition-opacity"
              title={`${h.hour}:00 — ขาออก ${h.dep.toLocaleString()} · ขาเข้า ${h.arr.toLocaleString()} · รวม ${(h.dep + h.arr).toLocaleString()}`}
            >
              {view !== 'arr' && (
                <div style={{ height: depH, background: '#2563eb' }} />
              )}
              {view !== 'dep' && (
                <div style={{ height: arrH, background: '#16a34a' }} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
      </div>
      {view === 'both' && (
        <div className="flex gap-4 mt-2 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#2563eb]" /> ขาออก</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#16a34a]" /> ขาเข้า</span>
        </div>
      )}
    </div>
  );
}
