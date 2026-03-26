import type {
  FilterOptions,
  FilterState,
  OverviewSummary,
  DailyTrendPoint,
  SeasonalData,
  SeasonSummary,
  MonthlyTrendPoint,
  MonthlyTrendSeries,
  MarketShareItem,
  FlightRatio,
  Top5Data,
  Top5RouteItem,
} from '@/types/dashboard';

// ============================================================
// Filter-aware data profiles
// ============================================================

interface DataProfile {
  label: string;         // display name (Thai)
  iata: string;          // code
  scale: number;         // multiplier vs BKK baseline
  growthRate: number;
  peakRange: string;
  domesticRatio: number; // % domestic
}

const PROFILES: Record<string, DataProfile> = {
  // Airports
  BKK:  { label: 'ท่าอากาศยานสุวรรณภูมิ', iata: 'BKK', scale: 1.0,  growthRate: 5.4,  peakRange: 'พฤศจิกายน - เมษายน', domesticRatio: 0.37 },
  DMK:  { label: 'ท่าอากาศยานดอนเมือง',   iata: 'DMK', scale: 0.60, growthRate: 8.1,  peakRange: 'พฤศจิกายน - เมษายน', domesticRatio: 0.72 },
  HKT:  { label: 'ท่าอากาศยานภูเก็ต',     iata: 'HKT', scale: 0.35, growthRate: 12.4, peakRange: 'พฤศจิกายน - เมษายน', domesticRatio: 0.45 },
  CNX:  { label: 'ท่าอากาศยานเชียงใหม่',  iata: 'CNX', scale: 0.25, growthRate: 6.8,  peakRange: 'พฤศจิกายน - มีนาคม',  domesticRatio: 0.68 },
  KBV:  { label: 'ท่าอากาศยานกระบี่',     iata: 'KBV', scale: 0.15, growthRate: 15.2, peakRange: 'ตุลาคม - เมษายน',     domesticRatio: 0.40 },
  USM:  { label: 'ท่าอากาศยานสมุย',       iata: 'USM', scale: 0.10, growthRate: 9.3,  peakRange: 'ธันวาคม - มีนาคม',    domesticRatio: 0.55 },
  // Countries
  TH:   { label: 'ประเทศไทย',             iata: 'TH',  scale: 2.5,  growthRate: 6.2,  peakRange: 'พฤศจิกายน - เมษายน', domesticRatio: 0.58 },
  // Japan airports
  NRT:  { label: 'ท่าอากาศยานนาริตะ',       iata: 'NRT', scale: 1.2,  growthRate: 4.8,  peakRange: 'มีนาคม - พฤษภาคม',    domesticRatio: 0.15 },
  HND:  { label: 'ท่าอากาศยานฮาเนดะ',       iata: 'HND', scale: 1.5,  growthRate: 3.9,  peakRange: 'มีนาคม - พฤษภาคม',    domesticRatio: 0.65 },
  KIX:  { label: 'ท่าอากาศยานคันไซ',        iata: 'KIX', scale: 0.8,  growthRate: 5.2,  peakRange: 'มีนาคม - พฤษภาคม',    domesticRatio: 0.45 },
  // Korea airports
  ICN:  { label: 'ท่าอากาศยานอินชอน',       iata: 'ICN', scale: 1.4,  growthRate: 7.8,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.12 },
  GMP:  { label: 'ท่าอากาศยานกิมโป',        iata: 'GMP', scale: 0.7,  growthRate: 5.1,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.88 },
  PUS:  { label: 'ท่าอากาศยานปูซาน',        iata: 'PUS', scale: 0.5,  growthRate: 9.2,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.55 },
  // Singapore
  SIN:  { label: 'ท่าอากาศยานชางงี',        iata: 'SIN', scale: 1.8,  growthRate: 9.0,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.02 },
  // Malaysia airports
  KUL:  { label: 'ท่าอากาศยานกัวลาลัมเปอร์', iata: 'KUL', scale: 1.3, growthRate: 6.2,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.42 },
  PEN:  { label: 'ท่าอากาศยานปีนัง',         iata: 'PEN', scale: 0.4,  growthRate: 4.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.55 },
  // UK airports
  LHR:  { label: 'ท่าอากาศยานฮีทโธรว์',     iata: 'LHR', scale: 2.2,  growthRate: 2.8,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.12 },
  LGW:  { label: 'ท่าอากาศยานแกตวิค',       iata: 'LGW', scale: 1.1,  growthRate: 3.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.18 },
  MAN:  { label: 'ท่าอากาศยานแมนเชสเตอร์',  iata: 'MAN', scale: 0.7,  growthRate: 4.1,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.25 },
  // Germany airports
  FRA:  { label: 'ท่าอากาศยานแฟรงก์เฟิร์ต', iata: 'FRA', scale: 2.0,  growthRate: 2.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.10 },
  MUC:  { label: 'ท่าอากาศยานมิวนิก',       iata: 'MUC', scale: 1.4,  growthRate: 3.2,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.15 },
  TXL:  { label: 'ท่าอากาศยานเบอร์ลิน',     iata: 'BER', scale: 0.9,  growthRate: 4.8,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.20 },
  // France airports
  CDG:  { label: 'ท่าอากาศยานชาร์ล เดอ โกล', iata: 'CDG', scale: 2.1, growthRate: 3.0,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.08 },
  ORY:  { label: 'ท่าอากาศยานออร์ลี',        iata: 'ORY', scale: 0.9,  growthRate: 2.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.45 },
  NCE:  { label: 'ท่าอากาศยานนีซ',           iata: 'NCE', scale: 0.5,  growthRate: 5.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.30 },
  // Countries
  JP:   { label: 'ประเทศญี่ปุ่น',          iata: 'JP',  scale: 2.8,  growthRate: 4.1,  peakRange: 'มีนาคม - พฤษภาคม',    domesticRatio: 0.62 },
  KR:   { label: 'ประเทศเกาหลีใต้',        iata: 'KR',  scale: 2.0,  growthRate: 7.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.55 },
  SG:   { label: 'ประเทศสิงคโปร์',         iata: 'SG',  scale: 1.8,  growthRate: 9.0,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.05 },
  MY:   { label: 'ประเทศมาเลเซีย',         iata: 'MY',  scale: 1.6,  growthRate: 5.8,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.48 },
  GB:   { label: 'สหราชอาณาจักร',          iata: 'GB',  scale: 3.2,  growthRate: 3.2,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.35 },
  DE:   { label: 'ประเทศเยอรมนี',          iata: 'DE',  scale: 2.9,  growthRate: 2.8,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.30 },
  FR:   { label: 'ประเทศฝรั่งเศส',         iata: 'FR',  scale: 2.7,  growthRate: 3.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.32 },
  // Cities (TH)
  bangkok:      { label: 'กรุงเทพมหานคร',  iata: 'BKK/DMK', scale: 1.6,  growthRate: 6.2,  peakRange: 'พฤศจิกายน - เมษายน', domesticRatio: 0.45 },
  chiangmai:    { label: 'เชียงใหม่',       iata: 'CNX',     scale: 0.25, growthRate: 6.8,  peakRange: 'พฤศจิกายน - มีนาคม',  domesticRatio: 0.68 },
  phuket:       { label: 'ภูเก็ต',          iata: 'HKT',     scale: 0.35, growthRate: 12.4, peakRange: 'พฤศจิกายน - เมษายน', domesticRatio: 0.45 },
  krabi:        { label: 'กระบี่',          iata: 'KBV',     scale: 0.15, growthRate: 15.2, peakRange: 'ตุลาคม - เมษายน',     domesticRatio: 0.40 },
  samui:        { label: 'สมุย',            iata: 'USM',     scale: 0.10, growthRate: 9.3,  peakRange: 'ธันวาคม - มีนาคม',    domesticRatio: 0.55 },
  // Cities (JP)
  tokyo:        { label: 'โตเกียว',         iata: 'HND/NRT', scale: 2.4,  growthRate: 4.2,  peakRange: 'มีนาคม - พฤษภาคม',    domesticRatio: 0.45 },
  osaka:        { label: 'โอซาก้า',         iata: 'KIX',     scale: 0.8,  growthRate: 5.2,  peakRange: 'มีนาคม - พฤษภาคม',    domesticRatio: 0.45 },
  // Cities (KR)
  seoul:        { label: 'โซล',             iata: 'ICN/GMP', scale: 1.8,  growthRate: 7.2,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.40 },
  busan:        { label: 'ปูซาน',           iata: 'PUS',     scale: 0.5,  growthRate: 9.2,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.55 },
  // Cities (SG)
  singapore:    { label: 'สิงคโปร์',        iata: 'SIN',     scale: 1.8,  growthRate: 9.0,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.02 },
  // Cities (MY)
  kualalumpur:  { label: 'กัวลาลัมเปอร์',   iata: 'KUL',     scale: 1.3,  growthRate: 6.2,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.42 },
  penang:       { label: 'ปีนัง',           iata: 'PEN',     scale: 0.4,  growthRate: 4.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.55 },
  // Cities (GB)
  london:       { label: 'ลอนดอน',          iata: 'LHR/LGW', scale: 2.8,  growthRate: 3.0,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.14 },
  manchester:   { label: 'แมนเชสเตอร์',    iata: 'MAN',     scale: 0.7,  growthRate: 4.1,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.25 },
  // Cities (DE)
  frankfurt:    { label: 'แฟรงก์เฟิร์ต',    iata: 'FRA',     scale: 2.0,  growthRate: 2.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.10 },
  munich:       { label: 'มิวนิก',          iata: 'MUC',     scale: 1.4,  growthRate: 3.2,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.15 },
  berlin:       { label: 'เบอร์ลิน',         iata: 'BER',     scale: 0.9,  growthRate: 4.8,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.20 },
  // Cities (FR)
  paris:        { label: 'ปารีส',           iata: 'CDG/ORY', scale: 2.6,  growthRate: 2.8,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.20 },
  nice:         { label: 'นีซ',             iata: 'NCE',     scale: 0.5,  growthRate: 5.5,  peakRange: 'มิถุนายน - สิงหาคม',  domesticRatio: 0.30 },
  // Continents
  asia:    { label: 'เอเชีย',    iata: 'ASIA', scale: 8.0,  growthRate: 6.8,  peakRange: 'พฤศจิกายน - เมษายน', domesticRatio: 0.55 },
  europe:  { label: 'ยุโรป',     iata: 'EUR',  scale: 10.0, growthRate: 3.0,  peakRange: 'มิถุนายน - สิงหาคม', domesticRatio: 0.38 },
  america: { label: 'อเมริกา',   iata: 'AMR',  scale: 9.5,  growthRate: 4.2,  peakRange: 'มิถุนายน - สิงหาคม', domesticRatio: 0.50 },
  oceania: { label: 'โอเชียเนีย', iata: 'OCN', scale: 3.0,  growthRate: 5.1,  peakRange: 'ธันวาคม - กุมภาพันธ์', domesticRatio: 0.45 },
  africa:  { label: 'แอฟริกา',   iata: 'AFR',  scale: 2.5,  growthRate: 8.5,  peakRange: 'กรกฎาคม - กันยายน',  domesticRatio: 0.42 },
};

function getProfile(filters: FilterState): DataProfile {
  if (filters.airport !== 'all' && PROFILES[filters.airport]) return PROFILES[filters.airport];
  if (filters.city   !== 'all' && PROFILES[filters.city])    return PROFILES[filters.city];
  if (filters.country !== 'all' && PROFILES[filters.country]) return PROFILES[filters.country];
  if (filters.continent !== 'all' && PROFILES[filters.continent]) return PROFILES[filters.continent];
  return { label: 'ภาพรวมทั่วโลก', iata: 'ALL', scale: 25.0, growthRate: 5.0, peakRange: 'ขึ้นอยู่กับภูมิภาค', domesticRatio: 0.48 };
}

// ============================================================
// Chart color palette (matches CSS variables)
// ============================================================
export const CHART_COLORS = [
  'hsl(217, 91%, 60%)',   // blue
  'hsl(160, 84%, 39%)',   // teal
  'hsl(38, 92%, 50%)',    // amber
  'hsl(280, 67%, 55%)',   // purple
  'hsl(346, 77%, 50%)',   // rose
  'hsl(190, 90%, 45%)',   // cyan
  'hsl(100, 60%, 45%)',   // green
  'hsl(25, 95%, 53%)',    // orange
  'hsl(220, 70%, 45%)',   // indigo
  'hsl(330, 65%, 50%)',   // pink
];

export const SEASON_COLORS = {
  peak: 'hsl(25, 95%, 53%)',  // orange
  low: 'hsl(217, 91%, 60%)',  // blue
};

// ============================================================
// Filter Options
// ============================================================
export function getMockFilterOptions(
  continent?: string,
  country?: string,
  city?: string,
): FilterOptions {
  const continents = [
    { value: 'all', label: 'ทุกทวีป' },
    { value: 'asia', label: 'เอเชีย' },
    { value: 'europe', label: 'ยุโรป' },
    { value: 'america', label: 'อเมริกา' },
    { value: 'oceania', label: 'โอเชียเนีย' },
    { value: 'africa', label: 'แอฟริกา' },
  ];

  // Countries filtered by continent
  let countries = [{ value: 'all', label: 'ทุกประเทศ' }];
  const showAsia    = !continent || continent === 'all' || continent === 'asia';
  const showEurope  = !continent || continent === 'all' || continent === 'europe';
  const showAmerica = !continent || continent === 'all' || continent === 'america';
  const showOceania = !continent || continent === 'all' || continent === 'oceania';
  const showAfrica  = !continent || continent === 'all' || continent === 'africa';

  if (showAsia)    countries.push({ value: 'TH', label: 'ไทย' }, { value: 'JP', label: 'ญี่ปุ่น' }, { value: 'KR', label: 'เกาหลีใต้' }, { value: 'SG', label: 'สิงคโปร์' }, { value: 'MY', label: 'มาเลเซีย' });
  if (showEurope)  countries.push({ value: 'GB', label: 'สหราชอาณาจักร' }, { value: 'DE', label: 'เยอรมนี' }, { value: 'FR', label: 'ฝรั่งเศส' });
  if (showAmerica) countries.push({ value: 'US', label: 'สหรัฐอเมริกา' }, { value: 'CA', label: 'แคนาดา' });
  if (showOceania) countries.push({ value: 'AU', label: 'ออสเตรเลีย' }, { value: 'NZ', label: 'นิวซีแลนด์' });
  if (showAfrica)  countries.push({ value: 'ZA', label: 'แอฟริกาใต้' }, { value: 'EG', label: 'อียิปต์' });

  // Cities filtered by country
  let cities = [{ value: 'all', label: 'ทุกเมือง' }];
  const c = country;
  if (!c || c === 'all' || c === 'TH') cities.push({ value: 'bangkok', label: 'กรุงเทพมหานคร' }, { value: 'chiangmai', label: 'เชียงใหม่' }, { value: 'phuket', label: 'ภูเก็ต' }, { value: 'krabi', label: 'กระบี่' }, { value: 'samui', label: 'สมุย' });
  if (!c || c === 'all' || c === 'JP') cities.push({ value: 'tokyo', label: 'โตเกียว' }, { value: 'osaka', label: 'โอซาก้า' });
  if (!c || c === 'all' || c === 'KR') cities.push({ value: 'seoul', label: 'โซล' }, { value: 'busan', label: 'ปูซาน' });
  if (!c || c === 'all' || c === 'SG') cities.push({ value: 'singapore', label: 'สิงคโปร์' });
  if (!c || c === 'all' || c === 'MY') cities.push({ value: 'kualalumpur', label: 'กัวลาลัมเปอร์' }, { value: 'penang', label: 'ปีนัง' });
  if (!c || c === 'all' || c === 'GB') cities.push({ value: 'london', label: 'ลอนดอน' }, { value: 'manchester', label: 'แมนเชสเตอร์' });
  if (!c || c === 'all' || c === 'DE') cities.push({ value: 'frankfurt', label: 'แฟรงก์เฟิร์ต' }, { value: 'munich', label: 'มิวนิก' }, { value: 'berlin', label: 'เบอร์ลิน' });
  if (!c || c === 'all' || c === 'FR') cities.push({ value: 'paris', label: 'ปารีส' }, { value: 'nice', label: 'นีซ' });
  if (!c || c === 'all' || c === 'US') cities.push({ value: 'newyork', label: 'นิวยอร์ก' }, { value: 'losangeles', label: 'ลอสแอนเจลิส' });
  if (!c || c === 'all' || c === 'AU') cities.push({ value: 'sydney', label: 'ซิดนีย์' }, { value: 'melbourne', label: 'เมลเบิร์น' });

  // Airports filtered by city
  let airports = [{ value: 'all', label: 'ทุกสนามบิน' }];
  const ci = city;
  // Thailand
  if (!ci || ci === 'all' || ci === 'bangkok')   airports.push({ value: 'BKK', label: 'BKK - สุวรรณภูมิ' }, { value: 'DMK', label: 'DMK - ดอนเมือง' });
  if (!ci || ci === 'all' || ci === 'chiangmai') airports.push({ value: 'CNX', label: 'CNX - เชียงใหม่' });
  if (!ci || ci === 'all' || ci === 'phuket')    airports.push({ value: 'HKT', label: 'HKT - ภูเก็ต' });
  if (!ci || ci === 'all' || ci === 'krabi')     airports.push({ value: 'KBV', label: 'KBV - กระบี่' });
  if (!ci || ci === 'all' || ci === 'samui')     airports.push({ value: 'USM', label: 'USM - สมุย' });
  // Japan
  if (!ci || ci === 'all' || ci === 'tokyo')     airports.push({ value: 'NRT', label: 'NRT - นาริตะ' }, { value: 'HND', label: 'HND - ฮาเนดะ' });
  if (!ci || ci === 'all' || ci === 'osaka')     airports.push({ value: 'KIX', label: 'KIX - คันไซ' });
  // Korea
  if (!ci || ci === 'all' || ci === 'seoul')     airports.push({ value: 'ICN', label: 'ICN - อินชอน' }, { value: 'GMP', label: 'GMP - กิมโป' });
  if (!ci || ci === 'all' || ci === 'busan')     airports.push({ value: 'PUS', label: 'PUS - ปูซาน' });
  // Singapore
  if (!ci || ci === 'all' || ci === 'singapore') airports.push({ value: 'SIN', label: 'SIN - ชางงี' });
  // Malaysia
  if (!ci || ci === 'all' || ci === 'kualalumpur') airports.push({ value: 'KUL', label: 'KUL - กัวลาลัมเปอร์' });
  if (!ci || ci === 'all' || ci === 'penang')    airports.push({ value: 'PEN', label: 'PEN - ปีนัง' });
  // UK
  if (!ci || ci === 'all' || ci === 'london')    airports.push({ value: 'LHR', label: 'LHR - ฮีทโธรว์' }, { value: 'LGW', label: 'LGW - แกตวิค' });
  if (!ci || ci === 'all' || ci === 'manchester') airports.push({ value: 'MAN', label: 'MAN - แมนเชสเตอร์' });
  // Germany
  if (!ci || ci === 'all' || ci === 'frankfurt') airports.push({ value: 'FRA', label: 'FRA - แฟรงก์เฟิร์ต' });
  if (!ci || ci === 'all' || ci === 'munich')    airports.push({ value: 'MUC', label: 'MUC - มิวนิก' });
  if (!ci || ci === 'all' || ci === 'berlin')    airports.push({ value: 'TXL', label: 'BER - เบอร์ลิน' });
  // France
  if (!ci || ci === 'all' || ci === 'paris')     airports.push({ value: 'CDG', label: 'CDG - ชาร์ล เดอ โกล' }, { value: 'ORY', label: 'ORY - ออร์ลี' });
  if (!ci || ci === 'all' || ci === 'nice')      airports.push({ value: 'NCE', label: 'NCE - นีซ' });

  return { continents, countries, cities, airports };
}

// ============================================================
// Overview Summary
// ============================================================
export function getMockOverviewSummary(filters?: FilterState): OverviewSummary {
  const p = filters ? getProfile(filters) : PROFILES['BKK'];
  const BASE = 25260;
  return {
    airportName: p.label,
    airportNameTh: p.label,
    iataCode: p.iata,
    totalFlights: Math.round(BASE * p.scale),
    mainAirport: p.iata === 'ALL' ? 'หลายสนามบิน' : `${p.iata} - ${p.label}`,
    peakSeasonRange: p.peakRange,
    growthRate: p.growthRate,
  };
}

// ============================================================
// Daily Trend Data
// ============================================================
export function getMockDailyTrend(filters?: FilterState): DailyTrendPoint[] {
  const p = filters ? getProfile(filters) : PROFILES['BKK'];
  const BASE_PEAK = Math.round(85 * p.scale);
  const BASE_LOW  = Math.round(55 * p.scale);
  const data: DailyTrendPoint[] = [];
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];

  for (let m = 0; m < 12; m++) {
    const isPeak = m >= 10 || m <= 3;
    const base = isPeak ? BASE_PEAK : BASE_LOW;
    const variance = Math.max(5, Math.round(base * 0.1));
    const departures = base + Math.floor(Math.abs(Math.sin(m * 10 + 1)) * variance * 2) - variance;
    const arrivals   = base + Math.floor(Math.abs(Math.sin(m * 10 + 2)) * variance * 2) - variance;
    data.push({ date: months[m], departures, arrivals, total: departures + arrivals });
  }
  return data;
}

// ============================================================
// Seasonal Data
// ============================================================
export function getMockSeasonalData(filters?: FilterState): { seasonal: SeasonalData[]; summary: SeasonSummary } {
  const p = filters ? getProfile(filters) : PROFILES['BKK'];
  const BASE_PEAK = Math.round(2000 * p.scale);
  const BASE_LOW  = Math.round(1200 * p.scale);
  const months = [
    { name: 'มกราคม', short: 'ม.ค.' },
    { name: 'กุมภาพันธ์', short: 'ก.พ.' },
    { name: 'มีนาคม', short: 'มี.ค.' },
    { name: 'เมษายน', short: 'เม.ย.' },
    { name: 'พฤษภาคม', short: 'พ.ค.' },
    { name: 'มิถุนายน', short: 'มิ.ย.' },
    { name: 'กรกฎาคม', short: 'ก.ค.' },
    { name: 'สิงหาคม', short: 'ส.ค.' },
    { name: 'กันยายน', short: 'ก.ย.' },
    { name: 'ตุลาคม', short: 'ต.ค.' },
    { name: 'พฤศจิกายน', short: 'พ.ย.' },
    { name: 'ธันวาคม', short: 'ธ.ค.' },
  ];

  const peakMonths = [0, 1, 2, 3, 10, 11]; // Nov-Apr
  const seasonal: SeasonalData[] = months.map((m, i) => {
    const isPeak = peakMonths.includes(i);
    const base = isPeak ? BASE_PEAK : BASE_LOW;
    const variance = Math.round(base * 0.2);
    const flights = base + Math.floor(Math.abs(Math.sin(i * 10 + 3)) * variance);
    return {
      month: m.name,
      monthShort: m.short,
      flights,
      season: isPeak ? 'peak' : 'low',
    };
  });

  const peakFlights = seasonal.filter(s => s.season === 'peak').reduce((sum, s) => sum + s.flights, 0);
  const lowFlights = seasonal.filter(s => s.season === 'low').reduce((sum, s) => sum + s.flights, 0);
  const profile = filters ? getProfile(filters) : PROFILES['BKK'];

  return {
    seasonal,
    summary: {
      peakRange: profile.peakRange,
      peakFlights,
      lowRange: 'ช่วงนอก Peak Season',
      lowFlights,
    },
  };
}

// ============================================================
// Top 10 Airport/Airline Monthly Trend
// ============================================================
// Region-specific airport and airline series
const REGION_AIRPORTS: Record<string, MonthlyTrendSeries[]> = {
  TH: [
    { code: 'BKK', name: 'สุวรรณภูมิ',  color: CHART_COLORS[0] },
    { code: 'DMK', name: 'ดอนเมือง',    color: CHART_COLORS[1] },
    { code: 'HKT', name: 'ภูเก็ต',      color: CHART_COLORS[2] },
    { code: 'CNX', name: 'เชียงใหม่',   color: CHART_COLORS[3] },
    { code: 'KBV', name: 'กระบี่',      color: CHART_COLORS[4] },
    { code: 'USM', name: 'สมุย',        color: CHART_COLORS[5] },
    { code: 'HDY', name: 'หาดใหญ่',    color: CHART_COLORS[6] },
    { code: 'UTP', name: 'อู่ตะเภา',    color: CHART_COLORS[7] },
    { code: 'CEI', name: 'เชียงราย',    color: CHART_COLORS[8] },
    { code: 'UBP', name: 'อุบลราชธานี', color: CHART_COLORS[9] },
  ],
  JP: [
    { code: 'HND', name: 'ฮาเนดะ',    color: CHART_COLORS[0] },
    { code: 'NRT', name: 'นาริตะ',     color: CHART_COLORS[1] },
    { code: 'KIX', name: 'คันไซ',      color: CHART_COLORS[2] },
    { code: 'CTS', name: 'ซัปโปโร',    color: CHART_COLORS[3] },
    { code: 'FUK', name: 'ฟูกูโอกะ',   color: CHART_COLORS[4] },
    { code: 'NGO', name: 'นาโกยา',    color: CHART_COLORS[5] },
    { code: 'OKA', name: 'โอกินาวา',   color: CHART_COLORS[6] },
    { code: 'SDJ', name: 'เซนได',      color: CHART_COLORS[7] },
    { code: 'HIJ', name: 'ฮิโรชิมา',   color: CHART_COLORS[8] },
    { code: 'KOJ', name: 'คาโกชิมา',   color: CHART_COLORS[9] },
  ],
  KR: [
    { code: 'ICN', name: 'อินชอน',     color: CHART_COLORS[0] },
    { code: 'GMP', name: 'กิมโป',      color: CHART_COLORS[1] },
    { code: 'PUS', name: 'ปูซาน',      color: CHART_COLORS[2] },
    { code: 'CJU', name: 'เชจู',       color: CHART_COLORS[3] },
    { code: 'TAE', name: 'แดกู',       color: CHART_COLORS[4] },
    { code: 'CJJ', name: 'ชองจู',      color: CHART_COLORS[5] },
    { code: 'RSU', name: 'ยอซู',       color: CHART_COLORS[6] },
    { code: 'KWJ', name: 'กวางจู',     color: CHART_COLORS[7] },
    { code: 'WJU', name: 'วอนจู',      color: CHART_COLORS[8] },
    { code: 'USN', name: 'อุลซาน',     color: CHART_COLORS[9] },
  ],
  GB: [
    { code: 'LHR', name: 'ฮีทโธรว์',   color: CHART_COLORS[0] },
    { code: 'LGW', name: 'แกตวิค',     color: CHART_COLORS[1] },
    { code: 'MAN', name: 'แมนเชสเตอร์', color: CHART_COLORS[2] },
    { code: 'STN', name: 'สแตนสเต็ด',  color: CHART_COLORS[3] },
    { code: 'LTN', name: 'ลูตัน',      color: CHART_COLORS[4] },
    { code: 'EDI', name: 'เอดินเบิร์ก', color: CHART_COLORS[5] },
    { code: 'BHX', name: 'เบอร์มิงแฮม', color: CHART_COLORS[6] },
    { code: 'GLA', name: 'กลาสโกว์',   color: CHART_COLORS[7] },
    { code: 'BRS', name: 'บริสตอล',    color: CHART_COLORS[8] },
    { code: 'NCL', name: 'นิวคาสเซิล',  color: CHART_COLORS[9] },
  ],
  DE: [
    { code: 'FRA', name: 'แฟรงก์เฟิร์ต', color: CHART_COLORS[0] },
    { code: 'MUC', name: 'มิวนิก',      color: CHART_COLORS[1] },
    { code: 'BER', name: 'เบอร์ลิน',    color: CHART_COLORS[2] },
    { code: 'DUS', name: 'ดือเซลดอร์ฟ', color: CHART_COLORS[3] },
    { code: 'HAM', name: 'ฮัมบูร์ก',    color: CHART_COLORS[4] },
    { code: 'STR', name: 'สตุตการ์ต',   color: CHART_COLORS[5] },
    { code: 'CGN', name: 'โคโลน',      color: CHART_COLORS[6] },
    { code: 'HAJ', name: 'ฮันโนเฟอร์',  color: CHART_COLORS[7] },
    { code: 'NUE', name: 'นูเรมเบิร์ก',  color: CHART_COLORS[8] },
    { code: 'LEJ', name: 'ไลพ์ซิก',    color: CHART_COLORS[9] },
  ],
  FR: [
    { code: 'CDG', name: 'ชาร์ล เดอ โกล', color: CHART_COLORS[0] },
    { code: 'ORY', name: 'ออร์ลี',        color: CHART_COLORS[1] },
    { code: 'NCE', name: 'นีซ',           color: CHART_COLORS[2] },
    { code: 'LYS', name: 'ลียง',          color: CHART_COLORS[3] },
    { code: 'MRS', name: 'มาร์แซย์',      color: CHART_COLORS[4] },
    { code: 'TLS', name: 'ตูลูซ',         color: CHART_COLORS[5] },
    { code: 'BOD', name: 'บอร์โด',        color: CHART_COLORS[6] },
    { code: 'NTE', name: 'น็องต์',        color: CHART_COLORS[7] },
    { code: 'SXB', name: 'สตราสบูร์',     color: CHART_COLORS[8] },
    { code: 'RNS', name: 'แรนน์',         color: CHART_COLORS[9] },
  ],
};

const REGION_AIRLINES: Record<string, MonthlyTrendSeries[]> = {
  TH: [
    { code: 'TG', name: 'การบินไทย',       color: CHART_COLORS[0] },
    { code: 'FD', name: 'ไทยแอร์เอเชีย',   color: CHART_COLORS[1] },
    { code: 'DD', name: 'นกแอร์',           color: CHART_COLORS[2] },
    { code: 'WE', name: 'ไทยสมายล์',        color: CHART_COLORS[3] },
    { code: 'SL', name: 'ไทยไลอ้อนแอร์',   color: CHART_COLORS[4] },
    { code: 'PG', name: 'บางกอกแอร์เวย์ส', color: CHART_COLORS[5] },
    { code: 'VZ', name: 'ไทยเวียตเจ็ท',    color: CHART_COLORS[6] },
    { code: 'SQ', name: 'สิงคโปร์แอร์ไลน์', color: CHART_COLORS[7] },
    { code: 'CX', name: 'คาเธ่ย์แปซิฟิก',  color: CHART_COLORS[8] },
    { code: 'JL', name: 'เจแปนแอร์ไลน์',   color: CHART_COLORS[9] },
  ],
  JP: [
    { code: 'NH', name: 'ANA',              color: CHART_COLORS[0] },
    { code: 'JL', name: 'Japan Airlines',   color: CHART_COLORS[1] },
    { code: 'MM', name: 'Peach Aviation',   color: CHART_COLORS[2] },
    { code: 'GK', name: 'Jetstar Japan',    color: CHART_COLORS[3] },
    { code: '7G', name: 'Star Flyer',       color: CHART_COLORS[4] },
    { code: 'BC', name: 'Skymark',          color: CHART_COLORS[5] },
    { code: 'EW', name: 'Fuji Dream',       color: CHART_COLORS[6] },
    { code: 'SQ', name: 'Singapore Airlines', color: CHART_COLORS[7] },
    { code: 'KE', name: 'Korean Air',       color: CHART_COLORS[8] },
    { code: 'TG', name: 'Thai Airways',     color: CHART_COLORS[9] },
  ],
  GB: [
    { code: 'BA', name: 'British Airways',  color: CHART_COLORS[0] },
    { code: 'EZY', name: 'easyJet',         color: CHART_COLORS[1] },
    { code: 'RYR', name: 'Ryanair',         color: CHART_COLORS[2] },
    { code: 'U2', name: 'easyJet (U2)',     color: CHART_COLORS[3] },
    { code: 'TOM', name: 'TUI Airways',     color: CHART_COLORS[4] },
    { code: 'VS',  name: 'Virgin Atlantic', color: CHART_COLORS[5] },
    { code: 'LS',  name: 'Jet2',            color: CHART_COLORS[6] },
    { code: 'LH',  name: 'Lufthansa',       color: CHART_COLORS[7] },
    { code: 'AF',  name: 'Air France',      color: CHART_COLORS[8] },
    { code: 'KL',  name: 'KLM',             color: CHART_COLORS[9] },
  ],
  europe: [
    { code: 'LH', name: 'Lufthansa',        color: CHART_COLORS[0] },
    { code: 'AF', name: 'Air France',       color: CHART_COLORS[1] },
    { code: 'BA', name: 'British Airways',  color: CHART_COLORS[2] },
    { code: 'FR', name: 'Ryanair',          color: CHART_COLORS[3] },
    { code: 'U2', name: 'easyJet',          color: CHART_COLORS[4] },
    { code: 'KL', name: 'KLM',              color: CHART_COLORS[5] },
    { code: 'IB', name: 'Iberia',           color: CHART_COLORS[6] },
    { code: 'AZ', name: 'Alitalia',         color: CHART_COLORS[7] },
    { code: 'OS', name: 'Austrian',         color: CHART_COLORS[8] },
    { code: 'LX', name: 'Swiss',            color: CHART_COLORS[9] },
  ],
  asia: [
    { code: 'SQ', name: 'Singapore Airlines', color: CHART_COLORS[0] },
    { code: 'CX', name: 'Cathay Pacific',     color: CHART_COLORS[1] },
    { code: 'TG', name: 'Thai Airways',       color: CHART_COLORS[2] },
    { code: 'NH', name: 'ANA',                color: CHART_COLORS[3] },
    { code: 'JL', name: 'Japan Airlines',     color: CHART_COLORS[4] },
    { code: 'KE', name: 'Korean Air',         color: CHART_COLORS[5] },
    { code: 'OZ', name: 'Asiana',             color: CHART_COLORS[6] },
    { code: 'MH', name: 'Malaysia Airlines',  color: CHART_COLORS[7] },
    { code: 'GA', name: 'Garuda Indonesia',   color: CHART_COLORS[8] },
    { code: 'FD', name: 'AirAsia',            color: CHART_COLORS[9] },
  ],
};

const CITY_TO_COUNTRY: Record<string, string> = {
  bangkok: 'TH', chiangmai: 'TH', phuket: 'TH', krabi: 'TH', samui: 'TH',
  tokyo: 'JP', osaka: 'JP',
  seoul: 'KR', busan: 'KR',
  singapore: 'SG',
  kualalumpur: 'MY', penang: 'MY',
  london: 'GB', manchester: 'GB',
  frankfurt: 'DE', munich: 'DE', berlin: 'DE',
  paris: 'FR', nice: 'FR',
};

function getRegionKey(filters?: FilterState): string {
  if (!filters) return 'TH';
  if (filters.airport !== 'all') {
    const thAirports = ['BKK','DMK','HKT','CNX','KBV','USM','HDY','UTP','CEI','UBP'];
    if (thAirports.includes(filters.airport)) return 'TH';
    if (['NRT','HND','KIX'].includes(filters.airport)) return 'JP';
    if (['ICN','GMP','PUS'].includes(filters.airport)) return 'KR';
    if (['LHR','LGW','MAN'].includes(filters.airport)) return 'GB';
    if (['FRA','MUC','TXL'].includes(filters.airport)) return 'DE';
    if (['CDG','ORY','NCE'].includes(filters.airport)) return 'FR';
  }
  if (filters.city !== 'all' && CITY_TO_COUNTRY[filters.city]) return CITY_TO_COUNTRY[filters.city];
  if (filters.country !== 'all' && REGION_AIRPORTS[filters.country]) return filters.country;
  if (filters.continent !== 'all' && REGION_AIRPORTS[filters.continent]) return filters.continent;
  return 'asia';
}

export function getMockTop10Trend(groupBy: 'airport' | 'airline' = 'airport', filters?: FilterState): {
  series: MonthlyTrendSeries[];
  data: MonthlyTrendPoint[];
} {
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const regionKey = getRegionKey(filters);
  const p = filters ? getProfile(filters) : PROFILES['BKK'];

  const airportSeries = REGION_AIRPORTS[regionKey] ?? REGION_AIRPORTS['TH'];
  const airlineSeries = REGION_AIRLINES[regionKey] ?? REGION_AIRLINES[regionKey === 'TH' ? 'TH' : 'asia'];
  const series = groupBy === 'airport' ? airportSeries : airlineSeries;

  const baseCounts = [22000, 12000, 8500, 6500, 5500, 4800, 4200, 3500, 3000, 2500].map(b => Math.round(b * p.scale));

  const data: MonthlyTrendPoint[] = months.map((month, mi) => {
    const point: MonthlyTrendPoint = { month };
    const isPeak = mi >= 10 || mi <= 3;
    const seasonMultiplier = isPeak ? 1.3 : 0.85;
    series.forEach((s, si) => {
      const base = baseCounts[si] * seasonMultiplier;
      point[s.code] = Math.floor(base + (Math.abs(Math.sin(mi * 100 + si)) * base * 0.15 - base * 0.075));
    });
    return point;
  });

  return { series, data };
}

// ============================================================
// Market Share (Pie Charts)
// ============================================================
const MARKET_SHARE_DATA: Record<string, { name: string; value: number }[]> = {
  TH: [
    { name: 'BKK - สุวรรณภูมิ', value: 12540 },
    { name: 'DMK - ดอนเมือง',   value: 7820 },
    { name: 'HKT - ภูเก็ต',     value: 3450 },
    { name: 'CNX - เชียงใหม่',  value: 2680 },
    { name: 'KBV - กระบี่',     value: 1850 },
    { name: 'อื่นๆ',            value: 3120 },
  ],
  JP: [
    { name: 'HND - ฮาเนดะ',   value: 18200 },
    { name: 'NRT - นาริตะ',    value: 14500 },
    { name: 'KIX - คันไซ',     value: 9800 },
    { name: 'FUK - ฟูกูโอกะ',  value: 5200 },
    { name: 'CTS - ซัปโปโร',   value: 3800 },
    { name: 'อื่นๆ',           value: 6100 },
  ],
  KR: [
    { name: 'ICN - อินชอน',  value: 16400 },
    { name: 'GMP - กิมโป',   value: 8200 },
    { name: 'CJU - เชจู',    value: 7500 },
    { name: 'PUS - ปูซาน',   value: 4800 },
    { name: 'TAE - แดกู',    value: 1900 },
    { name: 'อื่นๆ',         value: 2600 },
  ],
  GB: [
    { name: 'LHR - ฮีทโธรว์',    value: 24000 },
    { name: 'LGW - แกตวิค',       value: 14000 },
    { name: 'MAN - แมนเชสเตอร์',  value: 8500 },
    { name: 'STN - สแตนสเต็ด',    value: 7200 },
    { name: 'LTN - ลูตัน',        value: 5100 },
    { name: 'อื่นๆ',              value: 6800 },
  ],
  DE: [
    { name: 'FRA - แฟรงก์เฟิร์ต', value: 20000 },
    { name: 'MUC - มิวนิก',        value: 14500 },
    { name: 'BER - เบอร์ลิน',      value: 9200 },
    { name: 'DUS - ดือเซลดอร์ฟ',   value: 6400 },
    { name: 'HAM - ฮัมบูร์ก',      value: 5100 },
    { name: 'อื่นๆ',              value: 4800 },
  ],
  FR: [
    { name: 'CDG - ชาร์ล เดอ โกล', value: 22000 },
    { name: 'ORY - ออร์ลี',         value: 9500 },
    { name: 'NCE - นีซ',            value: 5200 },
    { name: 'LYS - ลียง',           value: 4800 },
    { name: 'MRS - มาร์แซย์',       value: 3200 },
    { name: 'อื่นๆ',               value: 4500 },
  ],
};

export function getMockMarketShare(filters?: FilterState): MarketShareItem[] {
  const p = filters ? getProfile(filters) : PROFILES['BKK'];
  const regionKey = filters ? getRegionKey(filters) : 'TH';
  const baseData = MARKET_SHARE_DATA[regionKey] ?? MARKET_SHARE_DATA['TH'];
  const raw = baseData.map(item => ({ ...item, value: Math.round(item.value * p.scale) }));
  const total = raw.reduce((sum, i) => sum + i.value, 0);
  return raw.map((item, i) => ({
    ...item,
    percentage: Math.round((item.value / total) * 1000) / 10,
    color: CHART_COLORS[i],
  }));
}

export function getMockFlightRatio(filters?: FilterState): FlightRatio[] {
  const p = filters ? getProfile(filters) : PROFILES['BKK'];
  const total = Math.round(25260 * p.scale);
  const domestic = Math.round(total * p.domesticRatio);
  const intl = total - domestic;
  const domPct = Math.round(p.domesticRatio * 1000) / 10;
  return [
    { category: 'domestic',      label: 'ในประเทศ',      value: domestic, percentage: domPct,          color: CHART_COLORS[0] },
    { category: 'international', label: 'ระหว่างประเทศ', value: intl,     percentage: 100 - domPct,    color: CHART_COLORS[2] },
  ];
}

// ============================================================
// Top 5 Arrival / Departure
// ============================================================
export function getMockTop5Data(filters?: FilterState): Top5Data {
  const p = filters ? getProfile(filters) : PROFILES['BKK'];
  const s = p.scale;
  return {
    popular: [
      { origin: 'DMK', originName: 'ดอนเมือง',   destination: 'CNX', destinationName: 'เชียงใหม่', flights: Math.round(710 * s), growthRate: 12.5 },
      { origin: 'BKK', originName: 'สุวรรณภูมิ', destination: 'HKT', destinationName: 'ภูเก็ต',    flights: Math.round(680 * s), growthRate: 8.3 },
      { origin: 'DMK', originName: 'ดอนเมือง',   destination: 'HKT', destinationName: 'ภูเก็ต',    flights: Math.round(590 * s), growthRate: 6.7 },
      { origin: 'BKK', originName: 'สุวรรณภูมิ', destination: 'CNX', destinationName: 'เชียงใหม่', flights: Math.round(450 * s), growthRate: 5.2 },
      { origin: 'DMK', originName: 'ดอนเมือง',   destination: 'KBV', destinationName: 'กระบี่',    flights: Math.round(420 * s), growthRate: 9.1 },
    ],
    growing: [
      { origin: 'BKK', originName: 'สุวรรณภูมิ', destination: 'KBV', destinationName: 'กระบี่',    flights: Math.round(320 * s), growthRate: 40 },
      { origin: 'DMK', originName: 'ดอนเมือง',   destination: 'CNX', destinationName: 'เชียงใหม่', flights: Math.round(710 * s), growthRate: 32 },
      { origin: 'BKK', originName: 'สุวรรณภูมิ', destination: 'HKT', destinationName: 'ภูเก็ต',    flights: Math.round(680 * s), growthRate: 28 },
      { origin: 'DMK', originName: 'ดอนเมือง',   destination: 'KBV', destinationName: 'กระบี่',    flights: Math.round(420 * s), growthRate: 21 },
      { origin: 'BKK', originName: 'สุวรรณภูมิ', destination: 'UTH', destinationName: 'อุดรธานี', flights: Math.round(280 * s), growthRate: 18 },
    ],
    totalArrivals:    Math.round(2850 * s),
    totalDepartures:  Math.round(2710 * s),
    arrivalGrowth:    p.growthRate,
    departureGrowth:  +(p.growthRate * 1.1).toFixed(1),
  };
}

// ============================================================
// Mock Takeaway Insights
// ============================================================
export function getMockTakeawayInsights(tab: 'overview' | 'analysis'): string[] {
  if (tab === 'overview') {
    return [
      'สนามบินสุวรรณภูมิมีจำนวนเที่ยวบินรวม 25,260 เที่ยวบิน เติบโต +5.4% เมื่อเทียบกับปีก่อน แสดงถึงการฟื้นตัวที่แข็งแกร่งของอุตสาหกรรมการบิน',
      'ช่วง Peak Season (พ.ย.-เม.ย.) มีเที่ยวบินมากกว่าช่วง Low Season ถึง 76% โดยเดือนธันวาคมเป็นเดือนที่มีเที่ยวบินหนาแน่นที่สุด',
      'อัตราการเติบโตของเที่ยวบินขาเข้าสูงกว่าขาออก 2.7% ชี้ให้เห็นว่าประเทศไทยยังคงเป็นจุดหมายปลายทางที่ได้รับความนิยมสูง',
      'แนะนำให้สายการบินเพิ่มความถี่เที่ยวบินในเส้นทาง BKK-HKT และ BKK-CNX ในช่วง Peak Season เนื่องจากมี demand สูง',
    ];
  }
  return [
    'การบินไทย (TG) ครองส่วนแบ่งตลาดสูงสุดที่ 28.3% ตามด้วยไทยแอร์เอเชีย (FD) ที่ 22.1% แข่งขันกันอย่างเข้มข้น',
    'สนามบินภูเก็ต (HKT) มีอัตราเติบโตสูงที่สุดที่ +12.4% สะท้อนการฟื้นตัวของการท่องเที่ยวทางทะเล',
    'สัดส่วนเที่ยวบินในประเทศ (62.7%) ยังคงสูงกว่าระหว่างประเทศ (37.3%) แต่เที่ยวบินระหว่างประเทศเติบโตเร็วกว่า 3 เท่า',
    'เส้นทาง BKK-CNX เป็นเส้นทางในประเทศที่มีผู้โดยสารหนาแน่นที่สุด ควรพิจารณาเพิ่มเที่ยวบินในช่วงวันหยุดยาว',
  ];
}
