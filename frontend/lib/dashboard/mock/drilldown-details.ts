/**
 * Centralized mock data for drill-down dashboard.
 * All data is plain objects — NO JSX allowed in this file.
 *
 * When connecting to a real API, replace the service layer
 * (services/drilldown.ts) — this file can be deleted entirely.
 */

import type {
  ContinentDetailData,
  AirportInfo,
  InboundCountry,
  CountryData,
} from '@/types/dashboard';
import { COUNTRIES, MK_AIRPORTS, MK_INBOUND_COUNTRIES } from '../drill-down-data';

// ============================================================
// Continent-level detail data (keyed by continent name)
// ============================================================
export const CONTINENT_DETAILS: Record<string, ContinentDetailData> = {
  'Europe': {
    countryCount: '52',
    busiestCountry: { flag: '🇩🇪', nameTh: 'เยอรมนี' },
    busiestDelta: '+128 เที่ยวบินรายปี · 6,240 ทั้งหมด',
    fastestGrowing: { flag: '🇲🇰', nameTh: 'มาซิโดเนียเหนือ' },
    fastestDelta: '\u25B2 +32 เที่ยวบิน (+12.4%)',
    countries: COUNTRIES,
  },
  'Asia-Pacific': {
    countryCount: '38',
    busiestCountry: { flag: '🇯🇵', nameTh: 'ญี่ปุ่น' },
    busiestDelta: '+456 เที่ยวบินรายปี · 12,450 ทั้งหมด ',
    fastestGrowing: { flag: '🇻🇳', nameTh: 'เวียดนาม' },
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
    busiestCountry: { flag: '🇺🇸', nameTh: 'สหรัฐฯ' },
    busiestDelta: '+388 เที่ยวบินรายปี · 28,100 ทั้งหมด',
    fastestGrowing: { flag: '🇲🇽', nameTh: 'เม็กซิโก' },
    fastestDelta: '\u25B2 +78 เที่ยวบิน (+2.5%)',
    countries: [
      { flag: '🇺🇸', name: 'USA', airports: 1987, flights: 28100, delta: '+1.4%', deltaN: 388, bar: 100 },
      { flag: '🇨🇦', name: 'Canada', airports: 120, flights: 5400, delta: '+0.8%', deltaN: 42, bar: 19 },
      { flag: '🇲🇽', name: 'Mexico', airports: 85, flights: 3200, delta: '+2.5%', deltaN: 78, bar: 11 },
    ],
  },
  'Middle East': {
    countryCount: '16',
    busiestCountry: { flag: '🇦🇪', nameTh: 'สหรัฐอาหรับเอมิเรตส์' },
    busiestDelta: '+210 เที่ยวบินรายปี · 3,480 ทั้งหมด',
    fastestGrowing: { flag: '🇸🇦', nameTh: 'ซาอุดีอาระเบีย' },
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
    busiestCountry: { flag: '🇧🇷', nameTh: 'บราซิล' },
    busiestDelta: '+95 เที่ยวบินรายปี · 2,640 ทั้งหมด',
    fastestGrowing: { flag: '🇨🇴', nameTh: 'โคลอมเบีย' },
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
    busiestCountry: { flag: '🇿🇦', nameTh: 'แอฟริกาใต้' },
    busiestDelta: '+18 เที่ยวบินรายปี · 520 ทั้งหมด',
    fastestGrowing: { flag: '🇪🇹', nameTh: 'เอธิโอเปีย' },
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

// ============================================================
// Country-level: airports by country name
// ============================================================
export const COUNTRY_AIRPORTS: Record<string, AirportInfo[]> = {
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

// ============================================================
// Country-level: top airline per country
// ============================================================
export const COUNTRY_TOP_AIRLINES: Record<string, string> = {
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

// ============================================================
// Country-level: inbound countries by country name
// ============================================================
export const COUNTRY_INBOUND: Record<string, InboundCountry[]> = {
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

// ============================================================
// Airport-level: monthly flight data
// ============================================================
export const AIRPORT_MONTHLY = [38, 35, 48, 55, 62, 71, 78, 76, 64, 73, 50, 44];
export const AIRPORT_MONTH_LABELS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
export const AIRPORT_CURRENT_MONTH_IDX = 9;
