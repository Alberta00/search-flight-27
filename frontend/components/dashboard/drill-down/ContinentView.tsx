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
  EUR_SEASONAL,
  EUR_TOP_ROUTES,
  COUNTRIES,
  getChangeForMode,
} from '@/lib/dashboard/drill-down-data';
import { useDrillDown, KPIRow, BackButton, ChangePill } from './DrillDownDashboard';
import type { KPIItem } from './DrillDownDashboard';

const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const NOW_IDX = 9;

export function ContinentView() {
  const { drillTo, timeMode, selections } = useDrillDown();
  const continent = selections.continent || CONTINENTS[0];

  // Per-continent mock data
  const CONTINENT_DATA: Record<string, {
    countryCount: string;
    busiestCountry: JSX.Element;
    busiestDelta: string;
    fastestGrowing: JSX.Element;
    fastestDelta: string;
    countries: Array<{ flag: string; name: string; airports: number; flights: number; delta: string; deltaN: number; bar: number; highlight?: boolean }>;
  }> = {
    'Europe': {
      countryCount: '52',
      busiestCountry: <span className="text-xl">🇩🇪 เยอรมนี</span>,
      busiestDelta: '+128 เที่ยวบิน YoY · 6,240 ทั้งหมด',
      fastestGrowing: <span className="text-xl">🇲🇰 มาซิโดเนียเหนือ</span>,
      fastestDelta: '\u25B2 +32 เที่ยวบิน (+12.4%)',
      countries: COUNTRIES,
    },
    'Asia-Pacific': {
      countryCount: '38',
      busiestCountry: <span className="text-xl">🇯🇵 ญี่ปุ่น</span>,
      busiestDelta: '+456 เที่ยวบิน YoY · 12,450 ทั้งหมด',
      fastestGrowing: <span className="text-xl">🇻🇳 เวียดนาม</span>,
      fastestDelta: '\u25B2 +712 เที่ยวบิน (+7.2%)',
      countries: [
        { flag: '🇯🇵', name: 'Japan', airports: 98, flights: 12450, delta: '+3.8%', deltaN: 456, bar: 100 },
        { flag: '🇹🇭', name: 'Thailand', airports: 38, flights: 10640, delta: '+7.2%', deltaN: 712, bar: 85 },
        { flag: '🇰🇷', name: 'South Korea', airports: 15, flights: 8210, delta: '+2.1%', deltaN: 168, bar: 66 },
        { flag: '🇸🇬', name: 'Singapore', airports: 1, flights: 7840, delta: '+4.5%', deltaN: 337, bar: 63 },
      ],
    },
    'North America': {
      countryCount: '3',
      busiestCountry: <span className="text-xl">🇺🇸 สหรัฐฯ</span>,
      busiestDelta: '+388 เที่ยวบิน YoY · 28,100 ทั้งหมด',
      fastestGrowing: <span className="text-xl">🇲🇽 เม็กซิโก</span>,
      fastestDelta: '\u25B2 +78 เที่ยวบิน (+2.5%)',
      countries: [
        { flag: '🇺🇸', name: 'USA', airports: 1987, flights: 28100, delta: '+1.4%', deltaN: 388, bar: 100 },
        { flag: '🇨🇦', name: 'Canada', airports: 120, flights: 5400, delta: '+0.8%', deltaN: 42, bar: 19 },
        { flag: '🇲🇽', name: 'Mexico', airports: 85, flights: 3200, delta: '+2.5%', deltaN: 78, bar: 11 },
      ],
    },
    'Middle East': {
      countryCount: '16',
      busiestCountry: <span className="text-xl">🇦🇪 สหรัฐอาหรับเอมิเรตส์</span>,
      busiestDelta: '+210 เที่ยวบิน YoY · 3,480 ทั้งหมด',
      fastestGrowing: <span className="text-xl">🇸🇦 ซาอุดีอาระเบีย</span>,
      fastestDelta: '\u25B2 +185 เที่ยวบิน (+8.4%)',
      countries: [
        { flag: '🇦🇪', name: 'UAE', airports: 12, flights: 3480, delta: '+6.4%', deltaN: 210, bar: 100 },
        { flag: '🇸🇦', name: 'Saudi Arabia', airports: 28, flights: 2390, delta: '+8.4%', deltaN: 185, bar: 69 },
        { flag: '🇶🇦', name: 'Qatar', airports: 2, flights: 1120, delta: '+5.1%', deltaN: 54, bar: 32 },
        { flag: '🇴🇲', name: 'Oman', airports: 4, flights: 520, delta: '+3.2%', deltaN: 16, bar: 15 },
        { flag: '🇧🇭', name: 'Bahrain', airports: 1, flights: 380, delta: '+2.8%', deltaN: 10, bar: 11 },
        { flag: '🇰🇼', name: 'Kuwait', airports: 1, flights: 350, delta: '+1.9%', deltaN: 7, bar: 10 },
      ],
    },
    'South America': {
      countryCount: '12',
      busiestCountry: <span className="text-xl">🇧🇷 บราซิล</span>,
      busiestDelta: '+95 เที่ยวบิน YoY · 2,640 ทั้งหมด',
      fastestGrowing: <span className="text-xl">🇨🇴 โคลอมเบีย</span>,
      fastestDelta: '\u25B2 +48 เที่ยวบิน (+5.8%)',
      countries: [
        { flag: '🇧🇷', name: 'Brazil', airports: 256, flights: 2640, delta: '+3.7%', deltaN: 95, bar: 100 },
        { flag: '🇦🇷', name: 'Argentina', airports: 54, flights: 1180, delta: '-1.2%', deltaN: -14, bar: 45 },
        { flag: '🇨🇴', name: 'Colombia', airports: 42, flights: 880, delta: '+5.8%', deltaN: 48, bar: 33 },
        { flag: '🇨🇱', name: 'Chile', airports: 18, flights: 620, delta: '+2.1%', deltaN: 13, bar: 23 },
        { flag: '🇵🇪', name: 'Peru', airports: 22, flights: 500, delta: '+3.4%', deltaN: 16, bar: 19 },
      ],
    },
    'Africa': {
      countryCount: '54',
      busiestCountry: <span className="text-xl">🇿🇦 แอฟริกาใต้</span>,
      busiestDelta: '+18 เที่ยวบิน YoY · 520 ทั้งหมด',
      fastestGrowing: <span className="text-xl">🇪🇹 เอธิโอเปีย</span>,
      fastestDelta: '\u25B2 +22 เที่ยวบิน (+9.1%)',
      countries: [
        { flag: '🇿🇦', name: 'South Africa', airports: 42, flights: 520, delta: '+3.6%', deltaN: 18, bar: 100 },
        { flag: '🇪🇬', name: 'Egypt', airports: 18, flights: 380, delta: '+4.2%', deltaN: 15, bar: 73 },
        { flag: '🇲🇦', name: 'Morocco', airports: 15, flights: 310, delta: '+5.5%', deltaN: 16, bar: 60 },
        { flag: '🇰🇪', name: 'Kenya', airports: 8, flights: 210, delta: '+6.3%', deltaN: 12, bar: 40 },
        { flag: '🇪🇹', name: 'Ethiopia', airports: 12, flights: 265, delta: '+9.1%', deltaN: 22, bar: 51 },
        { flag: '🇳🇬', name: 'Nigeria', airports: 22, flights: 180, delta: '+2.8%', deltaN: 5, bar: 35 },
      ],
    },
  };

  const cData = CONTINENT_DATA[continent.name] || CONTINENT_DATA['Europe'];

  const kpis: KPIItem[] = [
    { label: 'เที่ยวบินทั้งหมด', value: continent.flights.toLocaleString(), delta: continent.delta, deltaType: continent.deltaType as 'up' | 'down' | 'neutral', accentColor: '#2563eb' },
    { label: 'ประเทศที่ใช้งาน', value: cData.countryCount, delta: `${cData.countries.length} ประเทศที่แสดง`, deltaType: 'neutral', accentColor: '#16a34a' },
    { label: 'ประเทศที่คึกคักที่สุด', value: cData.busiestCountry, delta: cData.busiestDelta, deltaType: 'up', accentColor: '#ca8a04' },
    { label: 'เติบโตเร็วที่สุด', value: cData.fastestGrowing, delta: cData.fastestDelta, deltaType: 'up', accentColor: '#7c3aed' },
  ];

  const displayCountries = cData.countries;

  return (
    <div className="space-y-6">
      <BackButton label="กลับไปยังโลก" onClick={() => drillTo('world')} />

      <div>
        <h2 className="text-xl font-bold mb-1">{continent.icon} {continent.name}</h2>
        <p className="text-[15px] text-muted-foreground font-medium">คลิกประเทศเพื่อดูสนามบินในภูมิภาค {continent.name}</p>
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
    title = `แนวโน้มรายสัปดาห์ \u2014 ${continentName} (WoW)`;
    chartData = [
      { month: 'สัปดาห์ 1', value: 17, color: '#bfdbfe' },
      { month: 'สัปดาห์ 2', value: 18, color: '#bfdbfe' },
      { month: 'สัปดาห์ 3', value: 19, color: '#ff9f43' },
      { month: 'สัปดาห์ 4', value: 18, color: '#d29922' },
    ];
  } else if (timeMode === 'mom') {
    title = `แนวโน้มรายเดือน \u2014 ${continentName} (MoM)`;
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
    title = `แนวโน้มฤดูกาล \u2014 ${continentName} (YoY)`;
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
        <span>ทั้งปี {'\u00B7'} เที่ยวบินเป็นพันเที่ยว</span>
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
