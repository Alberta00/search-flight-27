/**
 * Service layer for drill-down dashboard data.
 *
 * All data access goes through these functions. Currently backed
 * by mock data — swap implementations here when connecting to a
 * real API without touching any component code.
 */

import type {
  ContinentData,
  CountryData,
  ContinentDetailData,
  AirportInfo,
  InboundCountry,
} from '@/types/dashboard';
import {
  CONTINENTS,
  BUSIEST_AIRPORTS,
  TOP_AIRLINES_WORLD,
  WORLD_TOP_DEP,
  WORLD_TOP_ARR,
  EUR_SEASONAL,
  EUR_TOP_ROUTES,
  ROUTES,
  ARRIVALS,
  AIRLINES,
  HOUR_TOTAL,
  HOUR_TOTAL_ARR,
  DAILY,
  INVEST_ROUTES,
  MK_AIRPORTS,
  MK_INBOUND_COUNTRIES,
} from '../drill-down-data';
import {
  CONTINENT_DETAILS,
  COUNTRY_AIRPORTS,
  COUNTRY_TOP_AIRLINES,
  COUNTRY_INBOUND,
  AIRPORT_MONTHLY,
  AIRPORT_MONTH_LABELS,
  AIRPORT_CURRENT_MONTH_IDX,
} from '../mock/drilldown-details';

// ── World level ──

export function getWorldSummary() {
  return {
    continents: CONTINENTS,
    busiestAirports: BUSIEST_AIRPORTS,
    topAirlines: TOP_AIRLINES_WORLD,
    topDepartures: WORLD_TOP_DEP,
    topArrivals: WORLD_TOP_ARR,
  };
}

// ── Continent level ──

export function getContinentDetail(continentName: string) {
  const detail = CONTINENT_DETAILS[continentName] || CONTINENT_DETAILS['Europe'];
  return {
    detail,
    seasonal: EUR_SEASONAL,
    topRoutes: EUR_TOP_ROUTES,
  };
}

// ── Country level ──

export function getCountryAirports(countryName: string): AirportInfo[] {
  return COUNTRY_AIRPORTS[countryName] || MK_AIRPORTS;
}

export function getCountryTopAirline(countryName: string): string {
  return COUNTRY_TOP_AIRLINES[countryName] || 'Local Carrier';
}

export function getCountryInbound(countryName: string): InboundCountry[] {
  return COUNTRY_INBOUND[countryName] || MK_INBOUND_COUNTRIES;
}

// ── Airport level ──

export function getAirportDetail() {
  return {
    routes: ROUTES,
    arrivals: ARRIVALS,
    airlines: AIRLINES,
    hourTotal: HOUR_TOTAL,
    hourTotalArr: HOUR_TOTAL_ARR,
    daily: DAILY,
    investRoutes: INVEST_ROUTES,
    monthly: AIRPORT_MONTHLY,
    monthLabels: AIRPORT_MONTH_LABELS,
    currentMonthIdx: AIRPORT_CURRENT_MONTH_IDX,
  };
}
