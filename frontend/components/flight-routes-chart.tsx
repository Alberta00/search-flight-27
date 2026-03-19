'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp, Maximize2, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { format, differenceInDays, parseISO, addYears, subMonths, addDays } from 'date-fns'
import { th } from 'date-fns/locale/th'
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const chartConfig = {
  flights: {
    label: 'จำนวนเที่ยวบิน',
    color: 'hsl(221, 83%, 53%)',
  },
  flightsCompare: {
    label: 'เปรียบเทียบ',
    color: 'hsl(142, 76%, 36%)',
  },
}

const chartUiConfig = {
  fonts: {
    xTick: 11,
    yTick: 10,
    yLabel: 16,
    tooltipTitle: 14,
    tooltipText: 14,
    dialogTitle: 24,
    headerTitle: 26,
  },
  colors: {
    main: 'hsl(221, 83%, 53%)',
    compare: 'hsl(142, 76%, 36%)',
    grid: 'hsl(var(--border))',
    axis: 'hsl(var(--muted-foreground))',
    tickLine: 'hsl(var(--primary))',
  },
  layout: {
    cardPadding: 'p-3 sm:p-6',
    headerGap: 'gap-3 sm:gap-4',
    chartHeight: 'h-[380px] sm:h-[440px]',
    chartHeightZoom: 'h-[400px] sm:h-[500px]',
    chartMinWidth: 'min-w-[280px]',
    chartMinWidthZoom: 'min-w-[320px]',
    chartMargin: { top: 10, right: 10, left: 0, bottom: 0 },
  },
  grid: {
    strokeDasharray: '3 3',
    opacity: 0.3,
  },
  axis: {
    xTickSize: 10,
    xMinTickGap: 30,
    xHeight: 44,
    yWidth: 45,
  },
  legend: {
    container: 'absolute right-2 top-2 z-10 flex flex-col items-start gap-2 rounded-lg bg-background/90 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm',
    item: 'inline-flex items-center gap-2 min-w-0 max-w-full',
    label: 'truncate',
    marker: {
      wrapper: 'relative w-8 h-3 shrink-0',
      line: 'absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2',
      point: 'absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background',
    },
  },
  tooltip: {
    box: 'rounded-lg border bg-background px-3 py-2 shadow-sm min-w-[140px]',
  },
  zoomSliders: {
    xAccent: 'accent-blue-500',
    yAccent: 'accent-emerald-500',
  },
}

interface FlightRoutesChartProps {
  chartData: any[]
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  compareMode: boolean
  setCompareMode: React.Dispatch<React.SetStateAction<boolean>>
  isDeparture: boolean
  durationMode?: '7' | '30' | 'all' | null
  setDurationMode?: (mode: '7' | '30' | 'all' | null) => void
}

export function FlightRoutesChart({
  chartData,
  dateRange,
  setDateRange,
  compareMode,
  setCompareMode,
  isDeparture,
  durationMode,
  setDurationMode
}: FlightRoutesChartProps) {
  const { fonts, colors, layout, grid, axis, legend, tooltip, zoomSliders } = chartUiConfig
  const [chartZoomed, setChartZoomed] = useState(false)
  const [isPortraitMobile, setIsPortraitMobile] = useState(false)
  const [xZoomPercent, setXZoomPercent] = useState(0)
  const [yGapStep, setYGapStep] = useState(0)
  const zoomDialogRef = useRef<HTMLDivElement>(null)

  const mainLabel = isDeparture ? 'ขาออก (Departure)' : 'ขาเข้า (Arrival)'
  const compareLabel = isDeparture ? 'ขาเข้า (Arrival)' : 'ขาออก (Departure)'
  const formatFlightCount = (value: number | null | undefined) =>
    new Intl.NumberFormat('en-US').format(value ?? 0)
  const legendItems = [
    { key: 'main', label: mainLabel, colorClass: 'bg-primary' },
    ...(compareMode ? [{ key: 'compare', label: compareLabel, colorClass: 'bg-emerald-600' }] : []),
  ]

  const renderChartLegend = () => (
    <div className={legend.container}>
      {legendItems.map((item) => (
        <span key={item.key} className={legend.item}>
          <span className={legend.marker.wrapper}>
            <span className={`${legend.marker.line} ${item.colorClass}`} />
            <span className={`${legend.marker.point} ${item.colorClass}`} />
          </span>
          <span className={legend.label}>{item.label}</span>
        </span>
      ))}
    </div>
  )

  // Calculate current days diff for buttons state
  const currentDaysDiff = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1 
    : 0

  // ตรวจจับมือถือแนวตั้ง
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px) and (orientation: portrait)')
    const update = () => setIsPortraitMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Fullscreen handling
  useEffect(() => {
    if (chartZoomed) return

    const exitFullscreen = () => {
      const doc = document as Document & { fullscreenElement?: Element; exitFullscreen?: () => Promise<void> }
      if (doc.fullscreenElement) {
        doc.exitFullscreen?.().catch(() => { })
      }
      const so = screen as unknown as { orientation?: { unlock?: () => void } }
      so?.orientation?.unlock?.()
    }

    exitFullscreen()
  }, [chartZoomed])

  useEffect(() => {
    if (!chartZoomed) return
    const onFullscreenChange = () => {
      const doc = document as Document & { fullscreenElement?: Element }
      if (!doc.fullscreenElement) setChartZoomed(false)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [chartZoomed])

  // Filter chartData to remove leading and trailing zero-data days
  // Keep days in between even if they are zero
  const filteredChartData = (() => {
    if (!chartData || chartData.length === 0) return []

    let firstIndex = -1
    let lastIndex = -1

    for (let i = 0; i < chartData.length; i++) {
      const hasData = chartData[i].flights > 0 || (compareMode && chartData[i].flightsCompare > 0)
      if (hasData) {
        if (firstIndex === -1) firstIndex = i
        lastIndex = i
      }
    }

    return firstIndex !== -1 ? chartData.slice(firstIndex, lastIndex + 1) : chartData
  })()

  const formatXAxisDate = (value: string) => {
    if (!value) return ''
    const date = parseISO(value)
    if (currentDaysDiff > 120) {
      return format(date, 'MMM yy', { locale: th })
    } else if (currentDaysDiff > 60) {
      return format(date, 'd MMM', { locale: th })
    }
    return format(date, 'd MMM', { locale: th })
  }

  const zoomedChartData = (() => {
    if (!filteredChartData.length) return []
    if (xZoomPercent <= 0) return filteredChartData

    const zoomIn = Math.min(1, Math.max(0, xZoomPercent / 100))
    const full = filteredChartData.length
    const minWindow = Math.min(2, full)
    const windowSize = Math.max(
      minWindow,
      Math.ceil(full - (full - minWindow) * zoomIn)
    )
    // Anchor to start date, do not extend beyond end date
    return filteredChartData.slice(0, windowSize)
  })()

  const yAxisStats = (() => {
    if (!zoomedChartData.length) return { min: 0, max: 1 }
    let minVal = Infinity
    let maxVal = -Infinity
    for (const item of zoomedChartData) {
      if (typeof item.flights === 'number') {
        minVal = Math.min(minVal, item.flights)
        maxVal = Math.max(maxVal, item.flights)
      }
      if (compareMode && typeof item.flightsCompare === 'number') {
        minVal = Math.min(minVal, item.flightsCompare)
        maxVal = Math.max(maxVal, item.flightsCompare)
      }
    }
    if (!isFinite(minVal) || !isFinite(maxVal)) return { min: 0, max: 1 }
    return { min: minVal, max: maxVal }
  })()

  const yAxisMin = (() => {
    const minVal = yAxisStats.min
    const stepFactor = yGapStep / 4
    if (stepFactor >= 1) return Math.floor(minVal)

    const range = Math.max(1, yAxisStats.max - minVal)
    const pad = range * 0.2 * (1 - stepFactor)
    let nextMin = Math.max(0, minVal - pad)

    // Keep original rule for non-100%: min - 1 and round down to end with 0
    nextMin = Math.max(0, nextMin - 1)
    nextMin = Math.floor(nextMin / 10) * 10
    return Math.floor(nextMin)
  })()

  const yAxisMax = (() => {
    const minVal = yAxisStats.min
    const maxVal = yAxisStats.max
    const stepFactor = yGapStep / 4
    if (stepFactor >= 1) return Math.ceil(maxVal)

    const range = Math.max(1, maxVal - minVal)
    const pad = range * 0.2 * (1 - stepFactor)
    return Math.ceil(maxVal + pad)
  })()

  const yAxisTicks = (() => {
    if (yGapStep !== 4) return undefined
    const min = yAxisMin
    const max = yAxisMax
    const step = (max - min) / 4
    return [min, min + step, min + step * 2, min + step * 3, max]
  })()

  return (
    <>
      {/* Daily frequency chart - responsive */}
      <Card className={`${layout.cardPadding} border min-w-0 overflow-hidden flight-routes-accent`}>
        <div className={`flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${layout.headerGap} mb-3 sm:mb-4`}>
          <h1
            className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 shrink-0"
            style={{ fontSize: fonts.headerTitle }}
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            สถิติความถี่เที่ยวบินรายวัน
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2 py-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">X</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={xZoomPercent}
                  onChange={(e) => setXZoomPercent(Number(e.target.value))}
                  className={`w-20 sm:w-24 ${zoomSliders.xAccent}`}
                  aria-label="Zoom X axis"
                />
                <span className="text-[10px] w-8 text-right text-muted-foreground">
                  {xZoomPercent}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Y</span>
                <input
                  type="range"
                  min={0}
                  max={4}
                  step={1}
                  value={yGapStep}
                  onChange={(e) => setYGapStep(Number(e.target.value))}
                  className={`w-20 sm:w-24 ${zoomSliders.yAccent}`}
                  aria-label="Zoom Y axis"
                />
                <span className="text-[10px] w-8 text-right text-muted-foreground">
                  {Math.round((yGapStep / 4) * 100)}%
                </span>
              </div>
            </div>
            <div className="flex rounded-lg border bg-muted/30 p-0.5">
              <Button
                variant={durationMode === 'all' || (!durationMode && currentDaysDiff > 360) ? 'default' : 'ghost'}
                size="sm"
                className="rounded-md h-8 px-2.5 sm:px-3 text-xs sm:text-sm min-w-[52px] sm:min-w-0"
                onClick={() => {
                  const today = new Date()
                  setDateRange({ from: subMonths(today, 1), to: addYears(today, 1) })
                  setDurationMode?.('all')
                }}
              >
                ทั้งหมด
              </Button>
              <Button
                variant={durationMode === '7' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-md h-8 px-2.5 sm:px-3 text-xs sm:text-sm min-w-[52px] sm:min-w-0"
                onClick={() => {
                  const today = new Date()
                  setDateRange({ from: today, to: addDays(today, 6) })
                  setDurationMode?.('7')
                }}
              >
                7 วัน
              </Button>
              <Button
                variant={durationMode === '30' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-md h-8 px-2.5 sm:px-3 text-xs sm:text-sm min-w-[52px] sm:min-w-0"
                onClick={() => {
                  const today = new Date()
                  setDateRange({ from: today, to: addDays(today, 29) })
                  setDurationMode?.('30')
                }}
              >
                30 วัน
              </Button>
            </div>
            <Button
              variant={compareMode ? 'default' : 'ghost'}
              size="sm"
              className="rounded-lg border h-8 px-2.5 sm:px-3 text-xs sm:text-sm"
              onClick={() => setCompareMode((prev) => !prev)}
            >
              เปรียบเทียบ
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border h-8 px-2.5 sm:px-3 text-xs sm:text-sm shrink-0 md:hidden"
              onClick={() => {
                const docEl = document.documentElement as HTMLElement & { requestFullscreen?: () => Promise<void> }
                docEl.requestFullscreen?.()
                  ?.then(() => {
                    setChartZoomed(true)
                    const so = (screen as unknown as { orientation?: { lock?: (o: string) => Promise<void> } }).orientation
                    so?.lock?.('landscape').catch(() => { })
                  })
                  .catch(() => setChartZoomed(true))
              }}
              title="ขยายกราฟ (แนวนอน)"
              aria-label="ขยายกราฟ"
            >
              <Maximize2 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">ขยาย</span>
            </Button>
          </div>
        </div>
        <div className="w-full min-w-0 overflow-x-auto -mx-1 px-1">
          <div className={`relative ${layout.chartHeight} ${layout.chartMinWidth} [&_.recharts-responsive-container]:!h-full [&_.recharts-responsive-container]:!w-full`}>
            {renderChartLegend()}
            <ChartContainer config={chartConfig} className="h-full w-full aspect-auto flight-routes-accent">
              <AreaChart data={zoomedChartData} margin={layout.chartMargin}>
                <defs>
                  <linearGradient id="flightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.main} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={colors.main} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="flightCompareGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.compare} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={colors.compare} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray={grid.strokeDasharray} stroke={colors.grid} opacity={grid.opacity} />
                <Area
                  type="monotone"
                  dataKey="flights"
                  name={mainLabel}
                  stroke={colors.main}
                  strokeWidth={2}
                  fill="url(#flightGradient)"
                />
                {compareMode && (
                  <Area
                    type="monotone"
                    dataKey="flightsCompare"
                    name={compareLabel}
                    stroke={colors.compare}
                    strokeWidth={2}
                    fill="url(#flightCompareGradient)"
                  />
                )}
                <XAxis
                  dataKey="date"
                  fontSize={fonts.xTick}
                  axisLine={{ stroke: colors.axis }}
                  tickLine={{ stroke: colors.tickLine, strokeWidth: 2 }}
                  tickSize={axis.xTickSize}
                  tick={{ fill: colors.axis }}
                  tickFormatter={formatXAxisDate}
                  minTickGap={axis.xMinTickGap}
                  angle={0}
                  textAnchor="middle"
                  height={axis.xHeight}
                />
                <YAxis
                  stroke={colors.axis}
                  fontSize={fonts.yTick}
                  tickFormatter={(v) => formatFlightCount(v)}
                  domain={[yAxisMin, yAxisMax]}
                  ticks={yAxisTicks}
                  label={{ value: 'จำนวนเที่ยวบิน (เที่ยว)', angle: -90, position: 'insideLeft', fontSize: fonts.yLabel }}
                  width={axis.yWidth}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0].payload
                    const tooltipDate = p.date ? format(parseISO(p.date), 'd MMM yyyy', { locale: th }) : ''
                    return (
                      <div className={tooltip.box}>
                        <p className="font-medium mb-2" style={{ fontSize: fonts.tooltipTitle }}>
                          {tooltipDate}
                        </p>
                        <p className="text-sm" style={{ color: colors.main, fontSize: fonts.tooltipText }}>
                          {mainLabel}: {formatFlightCount(p.flights)} เที่ยว
                        </p>
                        {compareMode && (
                          <p className="text-sm mt-1" style={{ color: colors.compare, fontSize: fonts.tooltipText }}>
                            {compareLabel}: {formatFlightCount(p.flightsCompare)} เที่ยว
                          </p>
                        )}
                      </div>
                    )
                  }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </Card>

      {/* Dialog ซูมกราฟ - แนวนอนเต็มจอ (เหมาะกับ mobile) */}
      <Dialog open={chartZoomed} onOpenChange={setChartZoomed}>
        <DialogContent
          className="max-w-[95vw] w-full sm:max-w-4xl max-h-[90vh] overflow-auto p-3 sm:p-6"
          showCloseButton={true}
        >
          <div
            ref={zoomDialogRef}
            className="min-h-0 w-full rounded-lg bg-background [&:fullscreen]:min-h-screen [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:justify-center [&:fullscreen]:p-4"
          >
            {isPortraitMobile && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 text-primary px-3 py-2 mb-3 text-sm">
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>กรุณาหมุนมือถือเป็นแนวนอนเพื่อดูกราฟเต็มจอ</span>
              </div>
            )}
            <DialogHeader>
              <DialogTitle
                className="flex items-center gap-2 text-base sm:text-lg"
                style={{ fontSize: fonts.dialogTitle }}
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                สถิติความถี่เที่ยวบินรายวัน
              </DialogTitle>
            </DialogHeader>
            <div className="w-full min-w-0 mt-2">
              <div className={`relative ${layout.chartHeightZoom} w-full ${layout.chartMinWidthZoom} [&_.recharts-responsive-container]:!h-full [&_.recharts-responsive-container]:!w-full`}>
                {renderChartLegend()}
                <ChartContainer config={chartConfig} className="h-full w-full aspect-auto flight-routes-accent">
                  <AreaChart data={zoomedChartData} margin={layout.chartMargin}>
                    <defs>
                      <linearGradient id="flightGradientZoom" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.main} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={colors.main} stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="flightCompareGradientZoom" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.compare} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={colors.compare} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray={grid.strokeDasharray} stroke={colors.grid} opacity={grid.opacity} />
                  <Area
                    type="monotone"
                    dataKey="flights"
                    name={mainLabel}
                    stroke={colors.main}
                    strokeWidth={2}
                    fill="url(#flightGradientZoom)"
                  />
                  {compareMode && (
                    <Area
                      type="monotone"
                      dataKey="flightsCompare"
                      name={compareLabel}
                      stroke={colors.compare}
                      strokeWidth={2}
                      fill="url(#flightCompareGradientZoom)"
                    />
                  )}
                    <XAxis
                      dataKey="date"
                      fontSize={fonts.xTick}
                    axisLine={{ stroke: colors.axis }}
                      tickLine={{ stroke: colors.tickLine, strokeWidth: 2 }}
                      tickSize={axis.xTickSize}
                      tick={{ fill: colors.axis }}
                      tickFormatter={formatXAxisDate}
                      minTickGap={axis.xMinTickGap}
                      angle={0}
                      textAnchor="middle"
                      height={axis.xHeight}
                    />
                    <YAxis
                      stroke={colors.axis}
                      fontSize={fonts.yTick}
                      tickFormatter={(v) => formatFlightCount(v)}
                      domain={[yAxisMin, yAxisMax]}
                      ticks={yAxisTicks}
                      label={{ value: 'จำนวนเที่ยวบิน (เที่ยว)', angle: -90, position: 'insideLeft', fontSize: fonts.yLabel }}
                      width={axis.yWidth}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const p = payload[0].payload
                        const tooltipDate = p.date ? format(parseISO(p.date), 'd MMM yyyy', { locale: th }) : ''
                        return (
                          <div className={tooltip.box}>
                            <p className="font-medium mb-2">{tooltipDate}</p>
                            <p className="text-sm" style={{ color: colors.main }}>
                              {mainLabel}: {formatFlightCount(p.flights)} เที่ยว
                            </p>
                            {compareMode && (
                              <p className="text-sm mt-1" style={{ color: colors.compare }}>
                                {compareLabel}: {formatFlightCount(p.flightsCompare)} เที่ยว
                              </p>
                            )}
                          </div>
                        )
                      }}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
