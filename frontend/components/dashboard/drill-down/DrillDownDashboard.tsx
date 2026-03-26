'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import type { DrillLevel, TimeMode } from '@/types/dashboard';
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
    <div className="flex border border-border rounded-lg overflow-hidden">
      {modes.map((m) => (
        <button
          key={m.key}
          type="button"
          onClick={() => setTimeMode(m.key)}
          className={`px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
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
    <div className="flex justify-center">
      <div className="relative flex items-start">
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

          return (
            <div key={step.id} className="flex items-start" style={{ width: i === 0 ? undefined : undefined }}>
              {/* Gap between steps */}
              {i > 0 && <div className="w-10 sm:w-16" />}

              <button
                type="button"
                disabled={!isPast}
                onClick={() => isPast && drillTo(step.id)}
                className={`relative z-10 flex flex-col items-center gap-1.5 group ${
                  isPast ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[3px] transition-all ${
                    isPast
                      ? 'bg-primary/10 border-primary shadow-md group-hover:shadow-lg group-hover:scale-110'
                      : isActive
                        ? 'bg-primary/15 border-primary shadow-lg ring-4 ring-primary/20'
                        : 'bg-muted/50 border-border'
                  }`}
                >
                  <span className="text-lg leading-none" role="img">{step.icon}</span>
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold whitespace-nowrap max-w-[70px] sm:max-w-[90px] truncate transition-colors ${
                    isActive
                      ? 'text-primary'
                      : isPast
                        ? 'text-primary/80 group-hover:text-primary'
                        : 'text-muted-foreground/40'
                  }`}
                >
                  {step.display}
                </span>
              </button>
            </div>
          );
        })}
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
  accentColor: string;
}

export function KPIRow({ items }: { items: KPIItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {items.map((item, i) => (
        <div
          key={i}
          className="relative overflow-hidden bg-card border border-border rounded-[10px] p-4 hover:border-primary hover:-translate-y-0.5 transition-all"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: item.accentColor }} />
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2.5">{item.label}</div>
          <div className="text-2xl font-bold leading-none mb-1.5">{item.value}</div>
          <div
            className={`text-[13px] font-semibold ${
              item.deltaType === 'up'
                ? 'text-green-600'
                : item.deltaType === 'down'
                  ? 'text-red-500'
                  : 'text-muted-foreground'
            }`}
          >
            {item.delta}
          </div>
        </div>
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
      className="inline-flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3.5 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all cursor-pointer mb-4"
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
}: {
  pct: number;
  num: number;
  active?: boolean;
}) {
  const cls =
    pct > 0
      ? 'bg-green-500/10 text-green-600'
      : pct < 0
        ? 'bg-red-500/10 text-red-500'
        : 'bg-muted text-muted-foreground';
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
