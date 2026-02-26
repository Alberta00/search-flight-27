'use client'

import { useState, useEffect, useRef } from 'react'
import { TrendingUp, Maximize2, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { format, subDays, differenceInDays, addDays, parseISO, differenceInCalendarDays, startOfDay, parse } from 'date-fns'
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

interface FlightRoutesChartProps {
  dailyData: any[]
  dailyDataCompare: any[]
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  compareMode: boolean
  setCompareMode: React.Dispatch<React.SetStateAction<boolean>>
  isDeparture: boolean
}

export function FlightRoutesChart({
  dailyData,
  dailyDataCompare,
  dateRange,
  setDateRange,
  compareMode,
  setCompareMode,
  isDeparture
}: FlightRoutesChartProps) {
  const [chartZoomed, setChartZoomed] = useState(false)
  const [isPortraitMobile, setIsPortraitMobile] = useState(false)
  const zoomDialogRef = useRef<HTMLDivElement>(null)

  const mainLabel = isDeparture ? 'ขาออก (Departure)' : 'ขาเข้า (Arrival)'
  const compareLabel = isDeparture ? 'ขาเข้า (Arrival)' : 'ขาออก (Departure)'

  // Calculate current days diff for buttons state
  const currentDaysDiff = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1 
    : 0

  // Prepare data with full date range (fill missing dates with 0)
  const prepareData = (data: any[]) => {
    // If no date range (All), just sort existing data
    if (!dateRange?.from || !dateRange?.to) {
      return [...data].sort((a, b) => a.date.localeCompare(b.date))
    }

    const filledData: any[] = []
    // Normalize data keys to YYYY-MM-DD to ensure matching (fix data disappearing)
    const dataMap = new Map(
    data.map(item => {
        const dateKey = format(new Date(item.date), 'yyyy-MM-dd')
        return [dateKey, item]
    })
    )
    
    // Use startOfDay to normalize dates and avoid time-related issues
    const startDate = new Date(
    dateRange.from.getFullYear(),
    dateRange.from.getMonth(),
    dateRange.from.getDate()
    )

    const endDate = new Date(
    dateRange.to.getFullYear(),
    dateRange.to.getMonth(),
    dateRange.to.getDate()
    )

    // const startDate = startOfDay(dateRange.from)
    // const endDate = startOfDay(dateRange.to)
    const days = differenceInCalendarDays(endDate, startDate)

    for (let i = 0; i <= days; i++) {
      const curr = addDays(startDate, i)
      const dateStr = format(curr, 'yyyy-MM-dd')
      
      if (dataMap.has(dateStr)) {
        // Use the dateStr we generated to ensure consistency
        filledData.push({ ...dataMap.get(dateStr), date: dateStr })
      } else {
        filledData.push({ date: dateStr, flights: 0 })
      }

    }
    return filledData
  }
  

  const baseData = prepareData(dailyData)
  const compareBaseData = prepareData(dailyDataCompare)

  // Format date for x-axis
  const formatChartDate = (dateStr: string) =>
    format(new Date(dateStr), 'd MMM', { locale: th })

  // Align dates for comparison if needed
  const displayData = compareMode
    ? baseData.map((row) => {
      const compareRow = compareBaseData.find(cr => cr.date === row.date)
      return {
        ...row,
        flightsCompare: compareRow ? compareRow.flights : 0,
        displayDate: formatChartDate(row.date)
      }
    })
    : baseData.map(row => ({
      ...row,
      displayDate: formatChartDate(row.date)
    }))

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

  return (
    <>
      {/* Daily frequency chart - responsive */}
      <Card className="p-3 sm:p-6 border min-w-0 overflow-hidden flight-routes-accent">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            สถิติความถี่เที่ยวบินรายวัน
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border bg-muted/30 p-0.5">
              <Button
                variant={!dateRange?.from && !dateRange?.to ? 'default' : 'ghost'}
                size="sm"
                className="rounded-md h-8 px-2.5 sm:px-3 text-xs sm:text-sm min-w-[52px] sm:min-w-0"
                onClick={() => setDateRange(undefined)}
              >
                ทั้งหมด
              </Button>
              <Button
                variant={currentDaysDiff === 7 ? 'default' : 'ghost'}
                size="sm"
                className="rounded-md h-8 px-2.5 sm:px-3 text-xs sm:text-sm min-w-[52px] sm:min-w-0"
                onClick={() => {
                  const to = new Date()
                  setDateRange({ from: subDays(to, 6), to })
                }}
              >
                7 วัน
              </Button>
              <Button
                variant={currentDaysDiff === 30 ? 'default' : 'ghost'}
                size="sm"
                className="rounded-md h-8 px-2.5 sm:px-3 text-xs sm:text-sm min-w-[52px] sm:min-w-0"
                onClick={() => {
                  const to = new Date()
                  setDateRange({ from: subDays(to, 29), to })
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
          <div className="h-[260px] sm:h-[320px] min-w-[280px] [&_.recharts-responsive-container]:!h-full [&_.recharts-responsive-container]:!w-full">
            <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
              <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                <defs>
                  <linearGradient id="flightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="flightCompareGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => {
                    if (!value) return ''
                    return format(parseISO(value), 'd MMM', { locale: th })
                  }}
                  minTickGap={30}
                  angle={0}
                  textAnchor="middle"
                  height={50}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(v) => `${v}`}
                  label={{ value: 'จำนวนเที่ยวบิน (เที่ยว)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                  width={45}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0].payload
                    const tooltipDate = p.date ? format(parseISO(p.date), 'd MMM yyyy', { locale: th }) : p.displayDate
                    return (
                      <div className="rounded-lg border bg-background px-3 py-2 shadow-sm min-w-[140px]">
                        <p className="font-medium mb-2">{tooltipDate}</p>
                        <p className="text-sm" style={{ color: 'hsl(221, 83%, 53%)' }}>
                          {mainLabel}: {p.flights} เที่ยว
                        </p>
                        {compareMode && (
                          <p className="text-sm mt-1" style={{ color: 'hsl(142, 76%, 36%)' }}>
                            {compareLabel}: {p.flightsCompare ?? 0} เที่ยว
                          </p>
                        )}
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="flights"
                  name={mainLabel}
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={2}
                  fill="url(#flightGradient)"
                />
                {compareMode && (
                  <Area
                    type="monotone"
                    dataKey="flightsCompare"
                    name={compareLabel}
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    fill="url(#flightCompareGradient)"
                  />
                )}
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
        {compareMode && (
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-primary shrink-0" />
              <span className="truncate">{mainLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-emerald-600 shrink-0" />
              <span className="truncate">{compareLabel}</span>
            </span>
          </div>
        )}
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
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                สถิติความถี่เที่ยวบินรายวัน
              </DialogTitle>
            </DialogHeader>
            <div className="w-full min-w-0 mt-2">
              <div className="h-[280px] sm:h-[340px] w-full min-w-[320px] [&_.recharts-responsive-container]:!h-full [&_.recharts-responsive-container]:!w-full">
                <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
                  <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <defs>
                      <linearGradient id="flightGradientZoom" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="flightCompareGradientZoom" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => {
                        if (!value) return ''
                        return format(parseISO(value), 'd MMM', { locale: th })
                      }}
                      minTickGap={30}
                      angle={0}
                      textAnchor="middle"
                      height={50}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickFormatter={(v) => `${v}`}
                      label={{ value: 'จำนวนเที่ยวบิน (เที่ยว)', angle: -90, position: 'insideLeft', fontSize: 11 }}
                      width={45}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const p = payload[0].payload
                        const tooltipDate = p.date ? format(parseISO(p.date), 'd MMM yyyy', { locale: th }) : p.displayDate
                        return (
                          <div className="rounded-lg border bg-background px-3 py-2 shadow-sm min-w-[140px]">
                            <p className="font-medium mb-2">{tooltipDate}</p>
                            <p className="text-sm" style={{ color: 'hsl(221, 83%, 53%)' }}>
                              {mainLabel}: {p.flights} เที่ยว
                            </p>
                            {compareMode && (
                              <p className="text-sm mt-1" style={{ color: 'hsl(142, 76%, 36%)' }}>
                                {compareLabel}: {p.flightsCompare ?? 0} เที่ยว
                              </p>
                            )}
                          </div>
                        )
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="flights"
                      name={mainLabel}
                      stroke="hsl(221, 83%, 53%)"
                      strokeWidth={2}
                      fill="url(#flightGradientZoom)"
                    />
                    {compareMode && (
                      <Area
                        type="monotone"
                        dataKey="flightsCompare"
                        name={compareLabel}
                        stroke="hsl(142, 76%, 36%)"
                        strokeWidth={2}
                        fill="url(#flightCompareGradientZoom)"
                      />
                    )}
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
            {compareMode && (
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-primary shrink-0" />
                  <span className="truncate">{mainLabel}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-emerald-600 shrink-0" />
                  <span className="truncate">{compareLabel}</span>
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}