'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  COUNTRIES,
  growthDeltaTypeFromPct,
  parsePercentFromDelta,
} from '@/lib/dashboard/drill-down-data';
import { KPI_ACCENT } from '@/lib/dashboard/kpi-colors';
import {
  getCountryAirports,
  getCountryTopAirline,
  getCountryTopAirlineSharePercent,
} from '@/lib/dashboard/services/drilldown';
import { useDrillDown, KPIRow, TimeToggle } from './DrillDownDashboard';
import type { KPIItem } from './DrillDownDashboard';
import type { AirportInfo } from '@/types/dashboard';

function shortAirportLabel(name: string) {
  return name
    .replace(/International/gi, 'Intl')
    .replace(/Airport/gi, '')
    .replace(/Aerodrome/gi, '')
    .replace(/Alexander the Great/gi, 'Alexander')
    .replace(/St\./gi, 'St')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortCountryLabel(name: string) {
  return name.replace(/North Macedonia/gi, 'มาซิโดเนียเหนือ').trim();
}

export function CountryView() {
  const { drillTo, selections, timeMode } = useDrillDown();
  const country =
    selections.country || COUNTRIES.find((c) => c.name === 'N. Macedonia') || COUNTRIES[0];

  const displayAirports = getCountryAirports(country.name);
  const topAirlineName = getCountryTopAirline(country.name);
  const topAirlineSharePct = getCountryTopAirlineSharePercent(country.name);

  const totalRoutes = displayAirports.reduce((s, a) => s + a.routes, 0);

  const countryPct = parsePercentFromDelta(country.delta);
  const countryFlightTone =
    countryPct != null
      ? growthDeltaTypeFromPct(countryPct, timeMode)
      : country.deltaN < 0
        ? 'down'
        : 'neutral';

  const kpis: KPIItem[] = [
    {
      label: 'เที่ยวบินทั้งหมด',
      value: country.flights.toLocaleString(),
      delta: `${country.deltaN >= 0 ? '▲' : '▼'} ${country.deltaN >= 0 ? '+' : ''}${country.deltaN} เที่ยวบิน (${country.delta})`,
      deltaType: countryFlightTone,
      accentColor: KPI_ACCENT.flights,
    },
    {
      label: 'สนามบินที่ยังเปิดให้บริการ',
      value: displayAirports.length.toString(),
      delta: 'ตามฐานข้อมูลล่าสุด',
      deltaType: 'neutral',
      growthColored: false,
      accentColor: KPI_ACCENT.airports,
    },
    {
      label: 'จุดหมายปลายทางที่ให้บริการ',
      value: `${totalRoutes}`,
      delta: `ครอบคลุม ${displayAirports.length} สนามบิน`,
      deltaType: 'neutral',
      growthColored: false,
      accentColor: KPI_ACCENT.average,
    },
    {
      label: 'สายการบินชั้นนำ',
      value: topAirlineName,
      delta:
        topAirlineSharePct != null
          ? `ส่วนแบ่ง ${topAirlineSharePct.toFixed(0)}% · ${country.flights.toLocaleString()} เที่ยวบิน`
          : 'ส่วนแบ่งตลาดหลัก',
      deltaType: 'neutral',
      growthColored: false,
      accentColor: KPI_ACCENT.highlight,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => drillTo('continent')}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary"
          >
            ← ก่อนหน้า
          </button>

          <h2 className="text-xl font-bold mb-1 break-words">
            {country.flag} {country.name}
          </h2>
          <p className="text-[15px] text-muted-foreground font-medium break-words">
            เลือกสนามบินใน {country.name} เพื่อดูข้อมูลวิเคราะห์
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          <TimeToggle />
        </div>
      </div>

      <KPIRow items={kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.78fr_1.12fr] gap-3.5 items-stretch">
        <TopInboundAirportRoutesPanel
          countryName={country.name}
          displayAirports={displayAirports}
        />
        <AirportPieChart displayAirports={displayAirports} />
        <BusiestAirportsPanel displayAirports={displayAirports} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayAirports.map((a) => (
          <button
            key={a.iata}
            type="button"
            onClick={() => drillTo('airport', { airport: a })}
            className="bg-card border rounded-[10px] p-5 text-left transition-all cursor-pointer border-primary shadow-sm hover:-translate-y-0.5 hover:border-primary"
          >
            <div className="text-4xl font-extrabold tracking-tight mb-1 text-primary">
              {a.iata}
            </div>

            <div className="text-sm text-muted-foreground mb-4 break-words">{a.name}</div>

            <div className="flex gap-5">
              <div>
                <div className="text-lg font-bold">{a.flights.toLocaleString()}</div>
                <div className="text-[15px] text-muted-foreground">เที่ยวบิน</div>
              </div>
              <div>
                <div className="text-lg font-bold">{a.routes}</div>
                <div className="text-[15px] text-muted-foreground">เส้นทาง</div>
              </div>
              <div>
                <div className="text-lg font-bold">{a.airlines}</div>
                <div className="text-[15px] text-muted-foreground">สายการบิน</div>
              </div>
            </div>

            <div className="text-[15px] text-primary mt-4 font-bold">▶ ดูข้อมูลวิเคราะห์ทั้งหมด</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AirportPieChart({ displayAirports }: { displayAirports: AirportInfo[] }) {
  const total = displayAirports.reduce((s, a) => s + a.flights, 0);

  const pieData = displayAirports.map((a) => ({
    name: shortAirportLabel(a.name),
    fullName: a.name,
    value: a.flights,
    color: a.color,
    iata: a.iata,
    pct: ((a.flights / (total || 1)) * 100).toFixed(1),
  }));

  return (
    <div className="bg-card border border-border rounded-[10px] px-4 py-4 h-full min-w-0">
      <div className="text-[16px] font-bold mb-3 text-center">
        การกระจายปริมาณเที่ยวบินตามสนามบิน
      </div>

      <div className="flex flex-col h-[calc(100%-28px)] min-w-0">
        <div className="relative flex items-center justify-center h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={86}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                formatter={(value: number, _name: string, item: any) => [
                  `${value.toLocaleString()} เที่ยวบิน`,
                  `${item?.payload?.iata} - ${item?.payload?.fullName ?? ''}`,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center leading-none">
              <div className="text-[24px] sm:text-[26px] font-extrabold">
                {total.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2 mt-2 min-w-0">
          {pieData.map((a) => (
            <div key={a.iata} className="flex items-center gap-2 text-[13px] min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: a.color }}
              />
              <span
                className="min-w-0 flex-1 break-words leading-snug"
                title={`${a.iata} - ${a.fullName}`}
              >
                <strong>{a.iata}</strong> · {a.value.toLocaleString()} flights
              </span>
              <span className="font-semibold shrink-0">{a.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BusiestAirportsPanel({ displayAirports }: { displayAirports: AirportInfo[] }) {
  const sorted = [...displayAirports].sort((a, b) => b.flights - a.flights);

  return (
    <div className="bg-card border border-border rounded-[10px] p-5 h-full overflow-hidden min-w-0">
      <div className="text-[16px] font-bold mb-4">🏆 สนามบินที่พลุกพล่านที่สุด</div>

      <div className="space-y-1">
        {sorted.map((a, i) => (
          <div
            key={a.iata}
            className="grid grid-cols-[54px_minmax(0,1fr)] gap-x-3 py-4 border-b border-border/60 last:border-b-0"
          >
            <div className="text-[18px] sm:text-[20px] font-extrabold text-primary leading-none pt-1">
              #{i + 1}
            </div>

            <div className="min-w-0">
              <div className="grid grid-cols-[minmax(140px,1fr)_92px_82px_98px] gap-x-3 items-start">
                <div className="min-w-0">
                  <div className="text-[18px] sm:text-[20px] font-extrabold text-primary leading-none">
                    {a.iata}
                  </div>
                  <div
                    className="text-[13px] sm:text-[14px] text-muted-foreground font-semibold leading-snug mt-1 break-words whitespace-normal"
                    title={a.name}
                  >
                    {shortAirportLabel(a.name)}
                  </div>
                </div>

                <div className="text-center min-w-0">
                  <div className="text-[18px] sm:text-[20px] font-extrabold leading-none">
                    {a.flights.toLocaleString()}
                  </div>
                  <div className="text-[12px] text-muted-foreground font-bold mt-1 leading-tight whitespace-nowrap">
                    เที่ยวบิน
                  </div>
                </div>

                <div className="text-center min-w-0">
                  <div className="text-[18px] sm:text-[20px] font-extrabold leading-none">
                    {a.routes}
                  </div>
                  <div className="text-[12px] text-muted-foreground font-bold mt-1 leading-tight whitespace-nowrap">
                    เส้นทาง
                  </div>
                </div>

                <div className="text-center min-w-0">
                  <div className="text-[18px] sm:text-[20px] font-extrabold leading-none">
                    {a.airlines}
                  </div>
                  <div className="text-[12px] text-muted-foreground font-bold mt-1 leading-tight whitespace-nowrap">
                    สายการบิน
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopInboundAirportRoutesPanel({
  countryName,
  displayAirports,
}: {
  countryName: string;
  displayAirports: AirportInfo[];
}) {
  const { drillTo } = useDrillDown();

  const sorted = [...displayAirports]
    .sort((a, b) => b.flights - a.flights)
    .slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-[10px] overflow-hidden h-full min-w-0">
      <div className="px-4 sm:px-5 pt-4 pb-3">
        <div className="text-[16px] sm:text-[17px] font-extrabold break-words">
          5 เส้นทางขาเข้ายอดนิยม-{countryName}
        </div>
      </div>

      <div className="min-w-0">
        <div className="grid grid-cols-[86px_1.15fr_1fr_86px] bg-[#cfe3ff] text-[13px] sm:text-[14px] font-bold border-y border-border min-w-0">
          <div className="px-4 py-3">สนามบิน</div>
          <div className="px-3 py-3">ชื่อสนามบิน</div>
          <div className="px-3 py-3">เมือง / ประเทศ</div>
          <div className="px-3 py-3 text-right">เที่ยวบิน</div>
        </div>

        {sorted.map((airport) => {
          const shortName = shortAirportLabel(airport.name);
          const countryShort = shortCountryLabel(countryName);

          return (
            <button
              key={airport.iata}
              type="button"
              onClick={() => drillTo('airport', { airport })}
              className="w-full grid grid-cols-[86px_1.15fr_1fr_86px] items-center text-left border-b border-border hover:bg-primary/5 transition-colors min-w-0"
              title={`${airport.iata} - ${airport.name}`}
            >
              <div className="px-4 py-5">
                <div className="text-[16px] sm:text-[18px] font-extrabold text-primary leading-none">
                  {airport.iata}
                </div>
              </div>

              <div className="px-3 py-5 min-w-0">
                <div
                  className="text-[13px] sm:text-[14px] text-foreground font-semibold break-words leading-snug whitespace-normal"
                  title={airport.name}
                >
                  {shortName}
                </div>
              </div>

              <div className="px-3 py-5 min-w-0">
                <div
                  className="text-[14px] sm:text-[15px] font-extrabold break-words leading-snug whitespace-normal"
                  title={shortName}
                >
                  {shortName}
                </div>
                <div
                  className="text-[12px] sm:text-[13px] text-muted-foreground break-words whitespace-normal mt-1 leading-snug"
                  title={countryShort}
                >
                  {countryShort}
                </div>
              </div>

              <div className="px-3 py-5 text-right text-[16px] font-bold tabular-nums">
                {airport.flights.toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}