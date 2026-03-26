'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  MK_AIRPORTS,
  MK_TOTAL,
  MK_INBOUND_COUNTRIES,
  COUNTRIES,
} from '@/lib/dashboard/drill-down-data';
import { useDrillDown, KPIRow, BackButton } from './DrillDownDashboard';
import type { KPIItem } from './DrillDownDashboard';

export function CountryView() {
  const { drillTo, selections } = useDrillDown();
  const country = selections.country || COUNTRIES.find(c => c.name === 'N. Macedonia') || COUNTRIES[0];

  // Airport data keyed by country name
  const AIRPORT_MAP: Record<string, Array<{ iata: string; name: string; flights: number; routes: number; airlines: number; color: string }>> = {
    // Asia-Pacific
    'Thailand': [
      { iata: 'BKK', name: 'Suvarnabhumi Airport', flights: 8420, routes: 120, airlines: 85, color: '#2563eb' },
      { iata: 'DMK', name: 'Don Mueang Int\'l Airport', flights: 2220, routes: 45, airlines: 12, color: '#d29922' },
    ],
    'Japan': [
      { iata: 'HND', name: 'Tokyo Haneda Airport', flights: 10380, routes: 95, airlines: 42, color: '#2563eb' },
      { iata: 'NRT', name: 'Narita Int\'l Airport', flights: 2070, routes: 110, airlines: 68, color: '#d29922' },
    ],
    'South Korea': [
      { iata: 'ICN', name: 'Incheon Int\'l Airport', flights: 6540, routes: 130, airlines: 72, color: '#2563eb' },
      { iata: 'GMP', name: 'Gimpo Int\'l Airport', flights: 1670, routes: 25, airlines: 8, color: '#d29922' },
    ],
    'Singapore': [
      { iata: 'SIN', name: 'Changi Airport', flights: 7840, routes: 160, airlines: 95, color: '#2563eb' },
    ],
    // Europe
    'Germany': [
      { iata: 'FRA', name: 'Frankfurt Airport', flights: 4240, routes: 150, airlines: 88, color: '#2563eb' },
      { iata: 'MUC', name: 'Munich Airport', flights: 2000, routes: 90, airlines: 45, color: '#d29922' },
    ],
    'UK': [
      { iata: 'LHR', name: 'London Heathrow Airport', flights: 12490, routes: 180, airlines: 95, color: '#2563eb' },
      { iata: 'LGW', name: 'London Gatwick Airport', flights: 5810, routes: 110, airlines: 42, color: '#d29922' },
    ],
    'France': [
      { iata: 'CDG', name: 'Paris Charles de Gaulle', flights: 9870, routes: 160, airlines: 92, color: '#2563eb' },
      { iata: 'ORY', name: 'Paris Orly Airport', flights: 2200, routes: 50, airlines: 18, color: '#d29922' },
    ],
    'Spain': [
      { iata: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', flights: 2820, routes: 120, airlines: 65, color: '#2563eb' },
      { iata: 'BCN', name: 'Barcelona–El Prat Airport', flights: 2000, routes: 95, airlines: 54, color: '#d29922' },
    ],
    'Italy': [
      { iata: 'FCO', name: 'Rome Fiumicino Airport', flights: 3100, routes: 130, airlines: 72, color: '#2563eb' },
      { iata: 'MXP', name: 'Milan Malpensa Airport', flights: 1340, routes: 85, airlines: 48, color: '#d29922' },
    ],
    'Netherlands': [
      { iata: 'AMS', name: 'Amsterdam Schiphol', flights: 3100, routes: 170, airlines: 90, color: '#2563eb' },
    ],
    'Turkey': [
      { iata: 'IST', name: 'Istanbul Airport', flights: 2200, routes: 140, airlines: 65, color: '#2563eb' },
      { iata: 'SAW', name: 'Sabiha Gökçen Airport', flights: 780, routes: 60, airlines: 18, color: '#d29922' },
    ],
    'Poland': [
      { iata: 'WAW', name: 'Warsaw Chopin Airport', flights: 1100, routes: 75, airlines: 32, color: '#2563eb' },
      { iata: 'KRK', name: 'Kraków Airport', flights: 540, routes: 45, airlines: 18, color: '#d29922' },
    ],
    'Serbia': [
      { iata: 'BEG', name: 'Belgrade Nikola Tesla', flights: 620, routes: 55, airlines: 22, color: '#2563eb' },
      { iata: 'INI', name: 'Niš Constantine Airport', flights: 200, routes: 12, airlines: 4, color: '#d29922' },
    ],
    'Austria': [
      { iata: 'VIE', name: 'Vienna Int\'l Airport', flights: 760, routes: 110, airlines: 55, color: '#2563eb' },
    ],
    'Switzerland': [
      { iata: 'ZRH', name: 'Zürich Airport', flights: 480, routes: 95, airlines: 48, color: '#2563eb' },
      { iata: 'GVA', name: 'Geneva Airport', flights: 230, routes: 60, airlines: 28, color: '#d29922' },
    ],
    'N. Macedonia': MK_AIRPORTS,
    // North America
    'USA': [
      { iata: 'ATL', name: 'Hartsfield–Jackson Atlanta', flights: 15420, routes: 210, airlines: 18, color: '#2563eb' },
      { iata: 'DFW', name: 'Dallas/Fort Worth Int\'l', flights: 13560, routes: 190, airlines: 24, color: '#d29922' },
    ],
    'Canada': [
      { iata: 'YYZ', name: 'Toronto Pearson Int\'l', flights: 3200, routes: 140, airlines: 52, color: '#2563eb' },
      { iata: 'YVR', name: 'Vancouver Int\'l Airport', flights: 2200, routes: 85, airlines: 38, color: '#d29922' },
    ],
    'Mexico': [
      { iata: 'MEX', name: 'Mexico City Int\'l Airport', flights: 2100, routes: 95, airlines: 28, color: '#2563eb' },
      { iata: 'CUN', name: 'Cancún Int\'l Airport', flights: 1100, routes: 65, airlines: 22, color: '#d29922' },
    ],
    // Middle East
    'UAE': [
      { iata: 'DXB', name: 'Dubai Int\'l Airport', flights: 2400, routes: 180, airlines: 95, color: '#2563eb' },
      { iata: 'AUH', name: 'Abu Dhabi Int\'l Airport', flights: 1080, routes: 90, airlines: 42, color: '#d29922' },
    ],
    'Saudi Arabia': [
      { iata: 'RUH', name: 'King Khalid Int\'l Airport', flights: 1200, routes: 75, airlines: 28, color: '#2563eb' },
      { iata: 'JED', name: 'King Abdulaziz Int\'l Airport', flights: 1190, routes: 80, airlines: 32, color: '#d29922' },
    ],
    'Qatar': [
      { iata: 'DOH', name: 'Hamad Int\'l Airport', flights: 1120, routes: 140, airlines: 45, color: '#2563eb' },
    ],
    'Oman': [
      { iata: 'MCT', name: 'Muscat Int\'l Airport', flights: 520, routes: 55, airlines: 22, color: '#2563eb' },
    ],
    'Bahrain': [
      { iata: 'BAH', name: 'Bahrain Int\'l Airport', flights: 380, routes: 40, airlines: 18, color: '#2563eb' },
    ],
    'Kuwait': [
      { iata: 'KWI', name: 'Kuwait Int\'l Airport', flights: 350, routes: 45, airlines: 20, color: '#2563eb' },
    ],
    // South America
    'Brazil': [
      { iata: 'GRU', name: 'São Paulo–Guarulhos Int\'l', flights: 1600, routes: 120, airlines: 38, color: '#2563eb' },
      { iata: 'GIG', name: 'Rio de Janeiro–Galeão Int\'l', flights: 1040, routes: 65, airlines: 22, color: '#d29922' },
    ],
    'Argentina': [
      { iata: 'EZE', name: 'Buenos Aires Ezeiza Int\'l', flights: 820, routes: 55, airlines: 24, color: '#2563eb' },
      { iata: 'AEP', name: 'Buenos Aires Aeroparque', flights: 360, routes: 30, airlines: 8, color: '#d29922' },
    ],
    'Colombia': [
      { iata: 'BOG', name: 'Bogotá El Dorado Int\'l', flights: 680, routes: 60, airlines: 20, color: '#2563eb' },
      { iata: 'MDE', name: 'Medellín José María Córdova', flights: 200, routes: 25, airlines: 8, color: '#d29922' },
    ],
    'Chile': [
      { iata: 'SCL', name: 'Santiago Arturo Merino Int\'l', flights: 620, routes: 50, airlines: 18, color: '#2563eb' },
    ],
    'Peru': [
      { iata: 'LIM', name: 'Lima Jorge Chávez Int\'l', flights: 500, routes: 45, airlines: 16, color: '#2563eb' },
    ],
    // Africa
    'South Africa': [
      { iata: 'JNB', name: 'Johannesburg O.R. Tambo Int\'l', flights: 320, routes: 55, airlines: 22, color: '#2563eb' },
      { iata: 'CPT', name: 'Cape Town Int\'l Airport', flights: 200, routes: 35, airlines: 14, color: '#d29922' },
    ],
    'Egypt': [
      { iata: 'CAI', name: 'Cairo Int\'l Airport', flights: 280, routes: 65, airlines: 28, color: '#2563eb' },
      { iata: 'HRG', name: 'Hurghada Int\'l Airport', flights: 100, routes: 30, airlines: 12, color: '#d29922' },
    ],
    'Morocco': [
      { iata: 'CMN', name: 'Casablanca Mohammed V Int\'l', flights: 210, routes: 50, airlines: 18, color: '#2563eb' },
      { iata: 'RAK', name: 'Marrakech Menara Airport', flights: 100, routes: 35, airlines: 14, color: '#d29922' },
    ],
    'Kenya': [
      { iata: 'NBO', name: 'Nairobi Jomo Kenyatta Int\'l', flights: 210, routes: 40, airlines: 18, color: '#2563eb' },
    ],
    'Ethiopia': [
      { iata: 'ADD', name: 'Addis Ababa Bole Int\'l', flights: 265, routes: 65, airlines: 12, color: '#2563eb' },
    ],
    'Nigeria': [
      { iata: 'LOS', name: 'Lagos Murtala Muhammed Int\'l', flights: 130, routes: 30, airlines: 14, color: '#2563eb' },
      { iata: 'ABV', name: 'Abuja Nnamdi Azikiwe Int\'l', flights: 50, routes: 12, airlines: 6, color: '#d29922' },
    ],
  };

  const displayAirports = AIRPORT_MAP[country.name] || MK_AIRPORTS;

  // Derive KPIs from the actual airport data
  const totalRoutes = displayAirports.reduce((s, a) => s + a.routes, 0);
  const topAirline: Record<string, string> = {
    'Thailand': 'Thai Airways', 'Japan': 'JAL', 'South Korea': 'Korean Air',
    'Singapore': 'Singapore Airlines', 'Germany': 'Lufthansa', 'UK': 'British Airways',
    'France': 'Air France', 'Spain': 'Iberia', 'Italy': 'ITA Airways',
    'Netherlands': 'KLM', 'Turkey': 'Turkish Airlines', 'Poland': 'LOT',
    'Serbia': 'Air Serbia', 'Austria': 'Austrian Airlines', 'Switzerland': 'SWISS',
    'N. Macedonia': 'Wizz Air',
    'USA': 'American Airlines', 'Canada': 'Air Canada', 'Mexico': 'Aeroméxico',
    'UAE': 'Emirates', 'Saudi Arabia': 'Saudia', 'Qatar': 'Qatar Airways',
    'Oman': 'Oman Air', 'Bahrain': 'Gulf Air', 'Kuwait': 'Kuwait Airways',
    'Brazil': 'LATAM Brasil', 'Argentina': 'Aerolíneas Argentinas',
    'Colombia': 'Avianca', 'Chile': 'LATAM Chile', 'Peru': 'LATAM Perú',
    'South Africa': 'South African Airways', 'Egypt': 'EgyptAir',
    'Morocco': 'Royal Air Maroc', 'Kenya': 'Kenya Airways',
    'Ethiopia': 'Ethiopian Airlines', 'Nigeria': 'Air Peace',
  };

  const kpis: KPIItem[] = [
    { label: 'เที่ยวบินขาออกทั้งหมด', value: country.flights.toLocaleString(), delta: `${country.deltaN >= 0 ? '\u25B2' : '\u25BC'} ${country.deltaN >= 0 ? '+' : ''}${country.deltaN} เที่ยวบิน (${country.delta})`, deltaType: country.deltaN >= 0 ? 'up' : 'down', accentColor: '#2563eb' },
    { label: 'สนามบินที่ใช้งาน', value: displayAirports.length.toString(), delta: 'ตามฐานข้อมูลล่าสุด', deltaType: 'neutral', accentColor: '#16a34a' },
    { label: 'จุดหมายที่ให้บริการ', value: `${totalRoutes}+`, delta: 'ครอบคลุมหลายภูมิภาค', deltaType: 'up', accentColor: '#ca8a04' },
    { label: 'สายการบินหลัก', value: <span className="text-lg">{topAirline[country.name] || 'Local Carrier'}</span>, delta: 'ส่วนแบ่งตลาดหลัก', deltaType: 'up', accentColor: '#7c3aed' },
  ];

  return (
    <div className="space-y-6">
      <BackButton label={`กลับไปยัง ${selections.continent?.name || 'ทวีป'}`} onClick={() => drillTo('continent')} />

      <div>
        <h2 className="text-xl font-bold mb-1">{country.flag} {country.name}</h2>
        <p className="text-[15px] text-muted-foreground font-medium">เลือกสนามบินใน {country.name} เพื่อดูข้อมูลวิเคราะห์</p>
      </div>

      <KPIRow items={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-3.5">
        <AirportPieChart displayAirports={displayAirports} />
        <BusiestAirportsPanel displayAirports={displayAirports} />
      </div>

      <InboundCountriesPanel countryName={country.name} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayAirports.map((a) => (
          <button
            key={a.iata}
            type="button"
            onClick={() => drillTo('airport', { airport: a })}
            className="bg-card border rounded-[10px] p-5 text-left transition-all cursor-pointer border-primary shadow-sm hover:-translate-y-0.5"
          >
            <div className="text-4xl font-extrabold tracking-tight mb-1 text-primary">
              {a.iata}
            </div>
            <div className="text-sm text-muted-foreground mb-4">{a.name}</div>
            <div className="flex gap-5">
              <div>
                <div className="text-lg font-bold">{a.flights.toLocaleString()}</div>
                <div className="text-[15px] text-muted-foreground">เที่ยวบินขาออก</div>
              </div>
              <div>
                <div className="text-lg font-bold">{a.routes}</div>
                <div className="text-[15px] text-muted-foreground">จุดหมาย</div>
              </div>
              <div>
                <div className="text-lg font-bold">{a.airlines}</div>
                <div className="text-[15px] text-muted-foreground">สายการบิน</div>
              </div>
            </div>
            <div className="text-[15px] text-primary mt-4 font-bold">{'\u25B6'} ดูข้อมูลวิเคราะห์ทั้งหมด</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AirportPieChart({ displayAirports }: { displayAirports: any[] }) {
  const total = displayAirports.reduce((s, a) => s + a.flights, 0);

  const pieData = displayAirports.map((a) => ({
    name: `${a.iata} (${a.name.split('"')[0].trim()})`,
    value: a.flights,
    color: a.color,
    iata: a.iata,
    pct: ((a.flights / (total || 1)) * 100).toFixed(1),
  }));

  return (
    <div className="bg-card border border-border rounded-[10px] p-6">
      <div className="text-[16px] font-bold mb-5">การกระจายปริมาณเที่ยวบินตามสนามบิน</div>
      <div className="flex items-center gap-6 justify-center">
        <ResponsiveContainer width={170} height={170}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name" stroke="hsl(var(--background))" strokeWidth={2}>
              {pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '14px' }} formatter={(value: number, name: string) => [`${value} เที่ยวบิน`, name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-3">
          {pieData.map((a) => (
            <div key={a.iata} className="flex items-center gap-2.5 text-[14px] px-3 py-2 rounded-md hover:bg-primary/5 transition-colors">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: a.color }} />
              <span><strong className="text-[15px]">{a.iata}</strong> {'\u00B7'} {a.value.toLocaleString()} เที่ยวบิน</span>
              <span className="font-bold ml-auto pl-4">{a.pct}%</span>
            </div>
          ))}
          <div className="text-center text-xl font-bold mt-2">{total.toLocaleString()} <span className="text-[13px] text-muted-foreground font-normal">เที่ยวบินทั้งหมด</span></div>
        </div>
      </div>
    </div>
  );
}

function BusiestAirportsPanel({ displayAirports }: { displayAirports: any[] }) {
  const sorted = [...displayAirports].sort((a, b) => b.flights - a.flights);
  return (
    <div className="bg-card border border-border rounded-[10px] p-6">
      <div className="text-[16px] font-bold mb-5">{'🏆'} สนามบินที่คึกคักที่สุด</div>
      {sorted.map((a, i) => (
        <div key={a.iata} className="flex items-center gap-3.5 py-3 border-b border-border/60 last:border-b-0">
          <div className="text-2xl font-extrabold text-primary w-8 shrink-0">#{i + 1}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-extrabold text-primary">{a.iata}</div>
            <div className="text-[14px] text-muted-foreground truncate font-medium">{a.name}</div>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="text-center"><div className="text-lg font-bold">{a.flights.toLocaleString()}</div><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">เที่ยวบิน</div></div>
            <div className="text-center"><div className="text-lg font-bold">{a.routes}</div><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">เส้นทาง</div></div>
            <div className="text-center"><div className="text-lg font-bold">{a.airlines}</div><div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">สายการบิน</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InboundCountriesPanel({ countryName }: { countryName: string }) {
  const INBOUND_MAP: Record<string, Array<{ name: string; flag: string; flights: number; pct: number }>> = {
    // Asia-Pacific
    'Thailand': [
      { name: 'China', flag: '🇨🇳', flights: 2450, pct: 23.0 },
      { name: 'Japan', flag: '🇯🇵', flights: 1840, pct: 17.3 },
      { name: 'Singapore', flag: '🇸🇬', flights: 1200, pct: 11.3 },
      { name: 'South Korea', flag: '🇰🇷', flights: 980, pct: 9.2 },
      { name: 'Malaysia', flag: '🇲🇾', flights: 850, pct: 8.0 },
    ],
    'Japan': [
      { name: 'South Korea', flag: '🇰🇷', flights: 3200, pct: 25.7 },
      { name: 'China', flag: '🇨🇳', flights: 2800, pct: 22.5 },
      { name: 'USA', flag: '🇺🇸', flights: 1900, pct: 15.3 },
      { name: 'Taiwan', flag: '🇹🇼', flights: 1400, pct: 11.2 },
      { name: 'Thailand', flag: '🇹🇭', flights: 980, pct: 7.9 },
    ],
    'South Korea': [
      { name: 'Japan', flag: '🇯🇵', flights: 2100, pct: 25.6 },
      { name: 'China', flag: '🇨🇳', flights: 1800, pct: 21.9 },
      { name: 'USA', flag: '🇺🇸', flights: 1200, pct: 14.6 },
      { name: 'Vietnam', flag: '🇻🇳', flights: 900, pct: 11.0 },
      { name: 'Thailand', flag: '🇹🇭', flights: 650, pct: 7.9 },
    ],
    'Singapore': [
      { name: 'Malaysia', flag: '🇲🇾', flights: 2100, pct: 26.8 },
      { name: 'Indonesia', flag: '🇮🇩', flights: 1600, pct: 20.4 },
      { name: 'Australia', flag: '🇦🇺', flights: 1100, pct: 14.0 },
      { name: 'India', flag: '🇮🇳', flights: 800, pct: 10.2 },
      { name: 'Thailand', flag: '🇹🇭', flights: 680, pct: 8.7 },
    ],
    // Europe
    'Germany': [
      { name: 'UK', flag: '🇬🇧', flights: 850, pct: 13.6 },
      { name: 'USA', flag: '🇺🇸', flights: 720, pct: 11.5 },
      { name: 'France', flag: '🇫🇷', flights: 640, pct: 10.3 },
      { name: 'Spain', flag: '🇪🇸', flights: 580, pct: 9.3 },
      { name: 'Italy', flag: '🇮🇹', flights: 520, pct: 8.3 },
    ],
    'UK': [
      { name: 'USA', flag: '🇺🇸', flights: 1800, pct: 15.2 },
      { name: 'Spain', flag: '🇪🇸', flights: 1400, pct: 11.8 },
      { name: 'France', flag: '🇫🇷', flights: 1100, pct: 9.3 },
      { name: 'Germany', flag: '🇩🇪', flights: 950, pct: 8.0 },
      { name: 'Ireland', flag: '🇮🇪', flights: 820, pct: 6.9 },
    ],
    'France': [
      { name: 'Germany', flag: '🇩🇪', flights: 640, pct: 12.3 },
      { name: 'UK', flag: '🇬🇧', flights: 580, pct: 11.2 },
      { name: 'Spain', flag: '🇪🇸', flights: 520, pct: 10.0 },
      { name: 'Italy', flag: '🇮🇹', flights: 480, pct: 9.2 },
      { name: 'Morocco', flag: '🇲🇦', flights: 420, pct: 8.1 },
    ],
    'Spain': [
      { name: 'UK', flag: '🇬🇧', flights: 1200, pct: 24.9 },
      { name: 'Germany', flag: '🇩🇪', flights: 680, pct: 14.1 },
      { name: 'France', flag: '🇫🇷', flights: 520, pct: 10.8 },
      { name: 'Italy', flag: '🇮🇹', flights: 380, pct: 7.9 },
      { name: 'Netherlands', flag: '🇳🇱', flights: 310, pct: 6.4 },
    ],
    'Italy': [
      { name: 'Germany', flag: '🇩🇪', flights: 580, pct: 13.1 },
      { name: 'UK', flag: '🇬🇧', flights: 520, pct: 11.7 },
      { name: 'France', flag: '🇫🇷', flights: 480, pct: 10.8 },
      { name: 'Spain', flag: '🇪🇸', flights: 350, pct: 7.9 },
      { name: 'USA', flag: '🇺🇸', flights: 300, pct: 6.8 },
    ],
    // North America
    'USA': [
      { name: 'Canada', flag: '🇨🇦', flights: 4200, pct: 14.9 },
      { name: 'Mexico', flag: '🇲🇽', flights: 3800, pct: 13.5 },
      { name: 'UK', flag: '🇬🇧', flights: 2400, pct: 8.5 },
      { name: 'Japan', flag: '🇯🇵', flights: 1600, pct: 5.7 },
      { name: 'Germany', flag: '🇩🇪', flights: 1200, pct: 4.3 },
    ],
    'Canada': [
      { name: 'USA', flag: '🇺🇸', flights: 2800, pct: 51.9 },
      { name: 'UK', flag: '🇬🇧', flights: 480, pct: 8.9 },
      { name: 'Mexico', flag: '🇲🇽', flights: 340, pct: 6.3 },
      { name: 'France', flag: '🇫🇷', flights: 260, pct: 4.8 },
      { name: 'Germany', flag: '🇩🇪', flights: 220, pct: 4.1 },
    ],
    'Mexico': [
      { name: 'USA', flag: '🇺🇸', flights: 2200, pct: 68.8 },
      { name: 'Canada', flag: '🇨🇦', flights: 340, pct: 10.6 },
      { name: 'Colombia', flag: '🇨🇴', flights: 180, pct: 5.6 },
      { name: 'Spain', flag: '🇪🇸', flights: 120, pct: 3.8 },
      { name: 'UK', flag: '🇬🇧', flights: 80, pct: 2.5 },
    ],
    // Middle East
    'UAE': [
      { name: 'India', flag: '🇮🇳', flights: 820, pct: 23.6 },
      { name: 'UK', flag: '🇬🇧', flights: 480, pct: 13.8 },
      { name: 'Pakistan', flag: '🇵🇰', flights: 380, pct: 10.9 },
      { name: 'Saudi Arabia', flag: '🇸🇦', flights: 320, pct: 9.2 },
      { name: 'USA', flag: '🇺🇸', flights: 280, pct: 8.0 },
    ],
    'Saudi Arabia': [
      { name: 'Egypt', flag: '🇪🇬', flights: 520, pct: 21.8 },
      { name: 'UAE', flag: '🇦🇪', flights: 380, pct: 15.9 },
      { name: 'India', flag: '🇮🇳', flights: 340, pct: 14.2 },
      { name: 'Jordan', flag: '🇯🇴', flights: 260, pct: 10.9 },
      { name: 'Turkey', flag: '🇹🇷', flights: 220, pct: 9.2 },
    ],
    'Qatar': [
      { name: 'India', flag: '🇮🇳', flights: 280, pct: 25.0 },
      { name: 'UK', flag: '🇬🇧', flights: 160, pct: 14.3 },
      { name: 'Philippines', flag: '🇵🇭', flights: 120, pct: 10.7 },
      { name: 'UAE', flag: '🇦🇪', flights: 100, pct: 8.9 },
      { name: 'USA', flag: '🇺🇸', flights: 90, pct: 8.0 },
    ],
    // South America
    'Brazil': [
      { name: 'Argentina', flag: '🇦🇷', flights: 480, pct: 18.2 },
      { name: 'USA', flag: '🇺🇸', flights: 420, pct: 15.9 },
      { name: 'Chile', flag: '🇨🇱', flights: 280, pct: 10.6 },
      { name: 'Portugal', flag: '🇵🇹', flights: 260, pct: 9.8 },
      { name: 'Colombia', flag: '🇨🇴', flights: 200, pct: 7.6 },
    ],
    'Argentina': [
      { name: 'Brazil', flag: '🇧🇷', flights: 320, pct: 27.1 },
      { name: 'Chile', flag: '🇨🇱', flights: 180, pct: 15.3 },
      { name: 'USA', flag: '🇺🇸', flights: 160, pct: 13.6 },
      { name: 'Uruguay', flag: '🇺🇾', flights: 120, pct: 10.2 },
      { name: 'Spain', flag: '🇪🇸', flights: 100, pct: 8.5 },
    ],
    'Colombia': [
      { name: 'USA', flag: '🇺🇸', flights: 280, pct: 31.8 },
      { name: 'Mexico', flag: '🇲🇽', flights: 140, pct: 15.9 },
      { name: 'Panama', flag: '🇵🇦', flights: 100, pct: 11.4 },
      { name: 'Spain', flag: '🇪🇸', flights: 80, pct: 9.1 },
      { name: 'Ecuador', flag: '🇪🇨', flights: 60, pct: 6.8 },
    ],
    // Africa
    'South Africa': [
      { name: 'Ethiopia', flag: '🇪🇹', flights: 80, pct: 15.4 },
      { name: 'UK', flag: '🇬🇧', flights: 70, pct: 13.5 },
      { name: 'UAE', flag: '🇦🇪', flights: 60, pct: 11.5 },
      { name: 'Kenya', flag: '🇰🇪', flights: 50, pct: 9.6 },
      { name: 'Germany', flag: '🇩🇪', flights: 40, pct: 7.7 },
    ],
    'Egypt': [
      { name: 'Saudi Arabia', flag: '🇸🇦', flights: 90, pct: 23.7 },
      { name: 'UAE', flag: '🇦🇪', flights: 60, pct: 15.8 },
      { name: 'Turkey', flag: '🇹🇷', flights: 50, pct: 13.2 },
      { name: 'Germany', flag: '🇩🇪', flights: 40, pct: 10.5 },
      { name: 'UK', flag: '🇬🇧', flights: 35, pct: 9.2 },
    ],
    'Morocco': [
      { name: 'France', flag: '🇫🇷', flights: 90, pct: 29.0 },
      { name: 'Spain', flag: '🇪🇸', flights: 60, pct: 19.4 },
      { name: 'Belgium', flag: '🇧🇪', flights: 40, pct: 12.9 },
      { name: 'Netherlands', flag: '🇳🇱', flights: 30, pct: 9.7 },
      { name: 'Italy', flag: '🇮🇹', flights: 25, pct: 8.1 },
    ],
    'N. Macedonia': MK_INBOUND_COUNTRIES,
  };

  const sorted = INBOUND_MAP[countryName] || MK_INBOUND_COUNTRIES;
  const max = sorted[0].flights;
  
  return (
    <div className="bg-card border border-border rounded-[10px] p-5">
      <div className="text-[16px] font-bold mb-4">
        {'🛬'} 5 อันดับประเทศขาเข้า {'\u2014'} เที่ยวบินที่เข้าสู่ {countryName}
      </div>
      {sorted.map((c, i) => {
        const barW = (c.flights / max * 100).toFixed(0);
        return (
          <div key={c.name} className="flex items-center gap-2.5 py-2 border-b border-border/60 last:border-b-0">
            <span className="text-[14px] text-muted-foreground w-6 text-center shrink-0 font-bold">{i + 1}</span>
            <span className="text-lg shrink-0">{c.flag}</span>
            <span className="text-[15px] font-medium flex-1 min-w-0">{c.name}</span>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden shrink-0"><div className="h-full bg-primary rounded-full" style={{ width: `${barW}%` }} /></div>
            <span className="text-[15px] font-bold w-12 text-right shrink-0 tabular-nums">{c.flights.toLocaleString()}</span>
            <span className="text-[12px] text-muted-foreground w-12 text-right shrink-0 font-bold">{c.pct}%</span>
          </div>
        );
      })}
    </div>
  );
}
