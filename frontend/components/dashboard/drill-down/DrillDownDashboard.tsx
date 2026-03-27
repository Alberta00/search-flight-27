'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import type { DrillLevel, TimeMode } from '@/types/dashboard';
import { growthDeltaTypeFromPct, growthPillSurfaceClasses, growthTextClass } from '@/lib/dashboard/drill-down-data';
import { WorldView } from './WorldView';
import { ContinentView } from './ContinentView';
import { CountryView } from './CountryView';
import { AirportView } from './AirportView';

// ── Context for drill-down state ──
interface SelectionState {
  continent?: any;
  country?: any;
  airport?: any;
}

interface DrillDownContextValue {
  level: DrillLevel;
  timeMode: TimeMode;
  drillTo: (level: DrillLevel, selection?: SelectionState) => void;
  setTimeMode: (mode: TimeMode) => void;
  selections: SelectionState;
}

const DrillDownContext = createContext<DrillDownContextValue>({
  level: 'world',
  timeMode: 'yoy',
  drillTo: () => {},
  setTimeMode: () => {},
  selections: {},
});

export function useDrillDown() {
  return useContext(DrillDownContext);
}

// ── Main component ──
export function DrillDownDashboard() {
  const [level, setLevel] = useState<DrillLevel>('world');
  const [timeMode, setTimeMode] = useState<TimeMode>('yoy');
  const [selections, setSelections] = useState<SelectionState>({});

  const drillTo = useCallback((newLevel: DrillLevel, selection?: SelectionState) => {
    setLevel(newLevel);
    if (selection) {
      setSelections((prev) => ({ ...prev, ...selection }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <DrillDownContext.Provider value={{ level, timeMode, drillTo, setTimeMode, selections }}>
      <div className="space-y-4">
        {/* Title centered */}
        {/* <h1 className="text-xl font-bold text-center">ภาพรวมการค้นหาเที่ยวบิน</h1> */}

        {/* Status line centered */}
        <div className="flex justify-center">
          <StatusLine />
        </div>

        {/* Level views */}
        {level === 'world' && <WorldView />}
        {level === 'continent' && <ContinentView />}
        {level === 'country' && <CountryView />}
        {level === 'airport' && <AirportView />}
      </div>
    </DrillDownContext.Provider>
  );
}

// ── Time Toggle ──
export function TimeToggle() {
  const { timeMode, setTimeMode } = useDrillDown();
  const modes: { key: TimeMode; label: string }[] = [
    { key: 'wow', label: 'รายสัปดาห์' },
    { key: 'mom', label: 'รายเดือน' },
    { key: 'yoy', label: 'รายปี' },
  ];

  return (
    <div className="flex w-full sm:w-auto border border-border rounded-lg overflow-hidden">
      {modes.map((m) => (
        <button
          key={m.key}
          type="button"
          onClick={() => setTimeMode(m.key)}
          className={`flex-1 sm:flex-initial min-w-0 px-3 sm:px-4 py-2 sm:py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer min-h-[44px] sm:min-h-0 ${
            timeMode === m.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

// ── Status Line (Circle Stepper) ──
function StatusLine() {
  const { level, drillTo, selections } = useDrillDown();

  const steps = [
    {
      id: 'world' as DrillLevel,
      display: 'โลก',
      icon: '🌎',
      step: 1,
    },
    {
      id: 'continent' as DrillLevel,
      display: selections.continent?.name || 'ทวีป',
      icon: selections.continent?.icon || '🌐',
      step: 2,
    },
    {
      id: 'country' as DrillLevel,
      display: selections.country?.name || 'ประเทศ',
      icon: selections.country?.flag || '🏳️',
      step: 3,
    },
    {
      id: 'airport' as DrillLevel,
      display: selections.airport?.iata || 'สนามบิน',
      icon: '🛫',
      step: 4,
    }
  ];

  const LEVELS: DrillLevel[] = ['world', 'continent', 'country', 'airport'];
  const currentIdx = LEVELS.indexOf(level);

  return (
    <div className="flex w-full min-w-0 justify-center px-1 sm:px-2">
      <div className="flex max-w-full min-w-0 flex-col items-center gap-2">
      <div className="relative flex w-full max-w-full min-w-0 flex-nowrap items-start justify-start gap-x-0 overflow-x-auto overflow-y-visible pb-1 [scrollbar-width:thin] sm:justify-center">
        {/* Connector lines layer — sits behind circles, vertically centered on them */}
        <div className="absolute top-5 sm:top-6 left-0 right-0 flex items-center pointer-events-none" aria-hidden="true">
          {steps.map((step, i) => {
            if (i === 0) {
              /* spacer for the first circle width */
              return <div key={step.id} className="w-10 sm:w-12 shrink-0" />;
            }
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`h-[3px] w-full transition-colors ${
                    i <= currentIdx ? 'bg-primary' : 'bg-border'
                  }`}
                />
                {/* spacer for circle width */}
                <div className="w-10 sm:w-12 shrink-0" />
              </div>
            );
          })}
        </div>

        {/* Steps layer */}
        {steps.map((step, i) => {
          const isActive = i === currentIdx;
          const isPast = i < currentIdx;
          const multilineLabel = step.id === 'continent' || step.id === 'country';
          const labelClass = multilineLabel
            ? 'whitespace-normal text-center leading-snug [overflow-wrap:anywhere] max-w-[10rem] sm:max-w-[12rem] md:max-w-[15rem] lg:max-w-[18rem]'
            : 'whitespace-nowrap max-w-[5rem] sm:max-w-[6rem] truncate';

          return (
            <div key={step.id} className="flex shrink-0 items-start">
              {/* Gap between steps */}
              {i > 0 && <div className="w-4 shrink-0 sm:w-6 md:w-8" />}

              <button
                type="button"
                disabled={!isPast}
                onClick={() => isPast && drillTo(step.id)}
                className={`relative z-10 flex shrink-0 flex-col items-center gap-1.5 px-0.5 group ${
                  multilineLabel ? 'max-w-[min(18rem,calc(100vw-2.5rem))]' : 'max-w-[6.5rem]'
                } ${isPast ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : 'cursor-default'}`}
              >
                <div
                  className={`flex shrink-0 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] transition-all ${
                    isPast
                      ? 'bg-primary/10 border-primary shadow-md group-hover:scale-110 group-hover:shadow-[0_0_0_4px_rgba(37,99,235,0.18),0_10px_18px_rgba(37,99,235,0.28)]'
                      : isActive
                        ? 'bg-primary/15 border-primary shadow-lg ring-4 ring-primary/20'
                        : 'bg-muted/50 border-border'
                  }`}
                >
                  <span className="text-lg leading-none" role="img">{step.icon}</span>
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold transition-colors ${labelClass} ${
                    multilineLabel ? 'w-full' : ''
                  } ${
                    isActive
                      ? 'text-primary'
                      : isPast
                        ? 'text-primary/80 group-hover:text-primary'
                        : 'text-muted-foreground/40'
                  }`}
                  title={multilineLabel ? step.display : undefined}
                >
                  {step.display}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      {currentIdx > 0 && (
        <div className="text-[15px] text-muted-foreground font-medium">
          {'\u2190'} คลิกอันก่อนหน้าเพื่อย้อนกลับ
        </div>
      )}
      </div>
    </div>
  );
}

// ── KPI Row (shared) ──
export interface KPIItem {
  label: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'down' | 'neutral';
  /** When false, delta line uses muted text (non-growth KPIs). Default true. */
  growthColored?: boolean;
  accentColor: string;
  /** When set, the card is a button (e.g. drill-down); stronger hover shadow. */
  onClick?: () => void;
  /** Announced when `onClick` is set (e.g. drill-down target). */
  actionLabel?: string;
}

function KPIRowCard({ item }: { item: KPIItem }) {
  const body = (
    <>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: item.accentColor }} />
      <div className="text-[14px] uppercase tracking-wider text-muted-foreground mb-2.5">{item.label}</div>
      <div className="text-2xl font-bold leading-none mb-1.5 break-words">{item.value}</div>
      <div
        className={`text-[13px] font-semibold ${
          item.growthColored === false
            ? 'text-muted-foreground'
            : growthTextClass(
                item.deltaType === 'up' ? 'up' : item.deltaType === 'down' ? 'down' : 'neutral',
              )
        }`}
      >
        {item.delta}
      </div>
    </>
  );

  const staticHover = 'hover:border-primary hover:-translate-y-0.5';
  const interactiveHover =
    'cursor-pointer hover:border-primary hover:-translate-y-0.5 hover:shadow-[0_0_0_4px_rgba(37,99,235,0.14),0_10px_22px_rgba(37,99,235,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

  const shell =
    'relative w-full min-w-0 overflow-hidden bg-card border border-border rounded-[10px] p-4 text-left transition-all';

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        aria-label={item.actionLabel ?? item.label}
        className={`${shell} ${interactiveHover}`}
      >
        {body}
      </button>
    );
  }

  return <div className={`${shell} ${staticHover}`}>{body}</div>;
}

export function KPIRow({ items }: { items: KPIItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {items.map((item, i) => (
        <KPIRowCard key={i} item={item} />
      ))}
    </div>
  );
}

// ── Back Button ──
export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex max-w-full items-center justify-center gap-1.5 whitespace-normal break-words bg-muted border border-border rounded-lg px-3.5 py-2 text-center text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all cursor-pointer mb-4"
    >
      {'\u2190'} {label}
    </button>
  );
}

// ── Change Pill ──
export function ChangePill({
  pct,
  num,
  active = false,
  timeMode,
}: {
  pct: number;
  num: number;
  active?: boolean;
  timeMode: TimeMode;
}) {
  const kind = growthDeltaTypeFromPct(pct, timeMode);
  const cls = growthPillSurfaceClasses(kind);
  const sign = num >= 0 ? '+' : '';
  const arrow = num >= 0 ? '\u25B2' : '\u25BC';

  return (
    <span
      className={`inline-block rounded-full whitespace-nowrap font-bold ${cls} ${
        active ? 'text-xs py-1 px-2.5' : 'text-[10px] py-0.5 px-2 opacity-50'
      }`}
    >
      {arrow} {sign}{num.toLocaleString()} ({pct >= 0 ? '+' : ''}{pct.toFixed(1)}%)
    </span>
  );
}
