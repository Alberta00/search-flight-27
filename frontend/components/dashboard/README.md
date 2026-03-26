# Dashboard Architecture & Structural Improvements

This document outlines structural and architectural improvements for processing the `DashboardSection` into a fully production-ready, highly performant web application.

## 1. Data Fetching & API Readiness (The "Waterfall" Problem)
**Current State:** 
`DashboardSection.tsx` centrally fetches all mock data synchronously (`getMockDailyTrend`, `getMockOverviewSummary`, etc.) and passes them down as props.
**Improvement:** 
- **Decentralization:** Once real endpoints are introduced, fetching all data at the root component will cause massive load-time blocking. Instead, shift to a localized data fetching pattern.
- **Tools:** Use **React Query** (or SWR) inside individual components (like we recently did with `useFlightData`), or utilize **React Server Components (RSC)** with `Suspense` borders.
- **Skeletons:** Introduce localized Loading Skeleton UI components that render during data fetching phases so the user isn't stuck looking at a blank screen.

## 2. Global State via URL Params (Shareability)
**Current State:** 
Filter variations and the `activeTab` are stored in React `useState`. If a user reloads the page, they lose their filters.
**Improvement:**
- Centralize `FilterState` into URL Query Parameters (`useSearchParams` / routing).
- Example URL: `?tab=analysis&continent=asia&country=TH`
- This ensures the dashboard is infinitely bookmarkable and completely shareable between team members.

## 3. Component Rendering & Rechart Performance
**Current State:** 
Dense UI components (like `Top10AirportTrend`) execute complex hooks, manage internal tooltips, and redraw hundreds of SVG vectors. When React triggers a state change (like a mouse hover), large chart instances are unnecessarily re-mounted if not contained.
**Improvement:**
- Implement strict `useMemo` boundaries wrapping Recharts `<ResponsiveContainer>` blocks. Recharts operates via heavy virtual DOM injections for SVGs; wrapping the chart prevents 10-20ms micro-stutters during intense mouse scrubbing.
- Implement `useCallback` on toggle functions and event handlers.

## 4. Accessibility (A11y) & Tabular Fallbacks
**Current State:** 
Visual data is heavily siloed in canvas/SVG formats.
**Improvement:**
- Add screen-reader-only standard `<table className="sr-only">` representations beneath every chart component exposing the exact statistical breakdown.
- Ensure `<Tabs>` and filter buttons utilize strict `aria-selected` and `role="tab"` properties (if not already handled by Radix UI / shadcn).
- High contrast modes and Keyboard `Tab` navigation for interacting with specific data points instead of relying solely on `onMouseMove`.

## 5. Strict Error Boundaries
**Current State:** 
If a chart algorithm receives malformed data, React's rendering lifecycle is broken, and the UI crashes entirely (e.g., Hydration mismatches).
**Improvement:**
- Wrap charts locally in strict `<ErrorBoundary>` wrappers. If the API fails to send flight counts for a specific zone, only that isolated card displays a soft "Failed to Load Data" message, rather than taking down the entire dashboard view.

## 6. CSS and Theme Uniformity
**Current State:** 
Complex logic is hardcoding hexadecimal/HSL values within scattered rendering pipelines.
**Improvement:**
- Extract all charting visual colors into your primary `tailwind.config.ts` utilizing CSS mapping variables (like `bg-chart-1`, `text-chart-2`), or abstract colors universally via a single hook output (e.g., `CHART_THEMES`), enforcing unified styling universally.
