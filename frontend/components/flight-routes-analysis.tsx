'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Plane, Calendar as CalendarIcon, Search, Send, TrendingUp, ChevronDown, ChevronUp, Clock, PlaneTakeoff, PlaneLanding, ArrowRightLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { DestinationSelect } from '@/components/destination-select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format, subDays, addDays, differenceInCalendarDays } from 'date-fns'
import {th } from 'date-fns/locale/th'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { Badge } from '@/components/ui/badge'
import { FlightRoutesChart } from './flight-routes-chart'

// Mock: รายการเส้นทางสายการบิน (ใช้แสดงใต้กราฟ)
const mockRoutes = [
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'Perth', arrivalCode: 'PER', direct: true, airlineCode: 'TG' },
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'Paris', arrivalCode: 'CDG', direct: true, airlineCode: 'TG' },
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'Copenhagen', arrivalCode: 'CPH', direct: true, airlineCode: 'TG' },
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'London', arrivalCode: 'LHR', direct: true, airlineCode: 'TG' },
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'Nagoya', arrivalCode: 'NGO', direct: true, airlineCode: 'TG' },
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'Oslo', arrivalCode: 'OSL', direct: true, airlineCode: 'TG' },
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'Stockholm', arrivalCode: 'ARN', direct: true, airlineCode: 'TG' },
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'Singapore', arrivalCode: 'SIN', direct: true, airlineCode: 'TG' },
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'Tokyo', arrivalCode: 'NRT', direct: true, airlineCode: 'TG' },
  { departureName: 'Suvarnabhumi Airport', departureCode: 'BKK', arrivalCity: 'Sydney', arrivalCode: 'SYD', direct: true, airlineCode: 'TG' },
]

// Mock data: daily flight count - เส้นหลัก (departure หรือ arrival ตามที่ผู้ใช้เลือก)
const mockDailyData = [
  { day: 1, date: '1 มี.ค.', flights: 8 },
  { day: 2, date: '2 มี.ค.', flights: 12 },
  { day: 3, date: '3 มี.ค.', flights: 15 },
  { day: 4, date: '4 มี.ค.', flights: 11 },
  { day: 5, date: '5 มี.ค.', flights: 14 },
  { day: 6, date: '6 มี.ค.', flights: 18 },
  { day: 7, date: '7 มี.ค.', flights: 22 },
  { day: 8, date: '8 มี.ค.', flights: 16 },
  { day: 9, date: '9 มี.ค.', flights: 13 },
  { day: 10, date: '10 มี.ค.', flights: 10 },
]

// Mock data: เส้นเปรียบเทียบ (arrival หรือ departure ฝั่งตรงข้าม)
const mockDailyDataCompare = [
  { day: 1, date: '1 มี.ค.', flightsCompare: 6 },
  { day: 2, date: '2 มี.ค.', flightsCompare: 10 },
  { day: 3, date: '3 มี.ค.', flightsCompare: 12 },
  { day: 4, date: '4 มี.ค.', flightsCompare: 14 },
  { day: 5, date: '5 มี.ค.', flightsCompare: 11 },
  { day: 6, date: '6 มี.ค.', flightsCompare: 16 },
  { day: 7, date: '7 มี.ค.', flightsCompare: 19 },
  { day: 8, date: '8 มี.ค.', flightsCompare: 14 },
  { day: 9, date: '9 มี.ค.', flightsCompare: 11 },
  { day: 10, date: '10 มี.ค.', flightsCompare: 8 },
]


// // Helper to parse date string that might be YYYYMMDD or YYYY-MM-DD
// const parseFlightDate = (dateStr: any): Date | null => {
//   if (!dateStr) return null
//   if (dateStr instanceof Date) return dateStr
//   const str = String(dateStr)
//   // YYYYMMDD
//   if (/^\d{8}$/.test(str)) {
//     const y = parseInt(str.substring(0, 4))
//     const m = parseInt(str.substring(4, 6)) - 1
//     const d = parseInt(str.substring(6, 8))
//     return new Date(y, m, d)
//   }
//   // YYYY-MM-DD
//   const d = new Date(str)
//   return isNaN(d.getTime()) ? null : d
// }

// Helper to parse date string that might be YYYYMMDD or YYYY-MM-DD
const parseFlightDate = (dateStr: any): Date | null => {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr
  const str = String(dateStr)
  // YYYYMMDD
  if (/^\d{8}$/.test(str)) {
    const y = parseInt(str.substring(0, 4))
    const m = parseInt(str.substring(4, 6)) - 1
    const d = parseInt(str.substring(6, 8))
    return new Date(y, m, d)
  }
  // YYYY-MM-DD
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

export function FlightRoutesAnalysis() {
  const [origin, setOrigin] = useState('')
  const [originName, setOriginName] = useState('')
  const [destination, setDestination] = useState('')
  const [destinationName, setDestinationName] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [dateError, setDateError] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [durationMode, setDurationMode] = useState<'7' | '30' | 'all' | null>(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  const [dailyData, setDailyData] = useState<any[]>([])
  const [dailyDataCompare, setDailyDataCompare] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedRouteKey, setExpandedRouteKey] = useState<string | null>(null)

  const fetchedDataBounds = useRef<{ 
    main: { range: DateRange, origin: string, destination: string } | null, 
    compare: { range: DateRange, origin: string, destination: string } | null 
  }>({ main: null, compare: null });

  // Helper to check if range A is inside range B
  const isRangeCovered = (inner: DateRange, outer: DateRange | null) => {
    if (!outer || !outer.from || !outer.to || !inner.from || !inner.to) return false
    return inner.from.getTime() >= outer.from.getTime() && inner.to.getTime() <= outer.to.getTime()
  }

  // Fetch analysis data
useEffect(() => {
  async function fetchAnalysis() {
    if (!origin && !destination) {
      setHasAnalyzed(false)
      return
    }

    if (!dateRange?.from) {
      setDateError(true)
      setHasAnalyzed(false)
      return
    }
    setDateError(false)

    try {
      const requiredRange = {
        from: dateRange.from,
        to: dateRange.to || dateRange.from,
      }

      // Check if we already have this data cached
      const isMainCached = fetchedDataBounds.current.main && 
        fetchedDataBounds.current.main.origin === origin &&
        fetchedDataBounds.current.main.destination === destination &&
        isRangeCovered(requiredRange, fetchedDataBounds.current.main.range)

      const isCompareCached = !compareMode || (fetchedDataBounds.current.compare && 
        fetchedDataBounds.current.compare.origin === destination && // Swapped for compare
        fetchedDataBounds.current.compare.destination === origin && // Swapped for compare
        isRangeCovered(requiredRange, fetchedDataBounds.current.compare.range))

      if (isMainCached && isCompareCached) {
        setHasAnalyzed(true)
        return
      }

      setLoading(true)
      setHasAnalyzed(true)

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

      const isAirportCode = (val: string) => /^[A-Z]{3}$/.test(val)

      const params = new URLSearchParams()

      if (origin) {
        if (isAirportCode(origin)) params.append('origin', origin)
        else params.append('origin_country', origin)
      }

      if (destination) {
        if (isAirportCode(destination))
          params.append('destination', destination)
        else params.append('destination_country', destination)
      }

      params.append(
        'start_date',
        format(requiredRange.from, 'yyyy-MM-dd')
      )
      params.append(
        'end_date',
        format(requiredRange.to, 'yyyy-MM-dd')
      )

      if (!isMainCached) {
      // ===== MAIN FETCH =====
      const response = await fetch(
        `${baseUrl}/flights/analysis-range?${params.toString()}`
      )

      const data = await response.json()

      if (data) {
        console.log('📊 Flight Analysis Data Received:', data)
        console.log(`   - Daily Data Points: ${data.dailyFrequency?.length || 0}`)
        console.log(`   - Routes Found: ${data.routes?.length || 0}`)
        
        setDailyData(data.dailyFrequency || [])
        
        // Map routes to ensure camelCase properties
        const mappedRoutes = (data.routes || []).map((r: any) => {
          // Helper to extract time from date string if time is missing
          const getTimeFromDate = (dateStr: string) => {
            if (!dateStr) return null
            try {
              const d = new Date(dateStr)
              if (isNaN(d.getTime())) return null
              return format(d, 'HH:mm')
            } catch { return null }
          }

          // Calculate duration if missing and we have both dates
          let duration = r.duration
          if ((!duration || duration === 0) && r.departure_date && r.arrival_date) {
            const start = new Date(r.departure_date)
            const end = new Date(r.arrival_date)
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
              const diffMs = end.getTime() - start.getTime()
              if (diffMs > 0) {
                duration = Math.floor(diffMs / 60000) // minutes
              }
            }
          }

          return {
            ...r,
            departureName: r.departureName || r.departure_name,
            departureCode: r.departureCode || r.departure_code,
            arrivalCity: r.arrivalCity || r.arrival_city,
            arrivalCode: r.arrivalCode || r.arrival_code,
            airlineName: r.airlineName || r.airline_name,
            airlineCode: r.airlineCode || r.airline_code,
            // Map time fields - prioritize existing time, then extract from date
            departureTime: r.departureTime || r.departure_time || r.time || getTimeFromDate(r.departure_date) || getTimeFromDate(r.departureDate),
            arrivalTime: r.arrivalTime || r.arrival_time || getTimeFromDate(r.arrival_date) || getTimeFromDate(r.arrivalDate),
            // Map date fields
            date: r.date || r.departure_date || r.departureDate,
            arrivalDate: r.arrivalDate || r.arrival_date || r.arrivalDate,
            duration: duration
          }
        })
        setRoutes(mappedRoutes)
        
        fetchedDataBounds.current.main = { range: requiredRange, origin, destination }
        // console.log('Daily data:', data.dailyFrequency)
        
      }
      }
      
      // ===== COMPARE =====
      if (compareMode) {
        if (!isCompareCached) {
          const compareParams = new URLSearchParams()

        if (origin) {
          if (isAirportCode(origin))
            compareParams.append('destination', origin)
          else compareParams.append('destination_country', origin)
        }

        if (destination) {
          if (isAirportCode(destination))
            compareParams.append('origin', destination)
          else compareParams.append('origin_country', destination)
        }

        compareParams.append(
          'start_date',
          format(requiredRange.from, 'yyyy-MM-dd')
        )
        compareParams.append(
          'end_date',
          format(requiredRange.to, 'yyyy-MM-dd')
        )

        const compareResponse = await fetch(
          `${baseUrl}/flights/analysis-range?${compareParams.toString()}`
        )

        const compareData = await compareResponse.json()

        setDailyDataCompare(compareData.dailyFrequency || [])
        fetchedDataBounds.current.compare = { range: requiredRange, origin: destination, destination: origin }
        }
      } else {
        setDailyDataCompare([])
        fetchedDataBounds.current.compare = null
      }
    } catch (error) {
      console.error('Failed to fetch flight analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchAnalysis()
  // console.log('Fetching with:', origin, destination)
  
}, [origin, destination, dateRange, compareMode])

  // Helper to process flight data (dates, duration, etc.)
  const processFlightData = (flight: any) => {
    // Fallback date if flight.date is missing
    const baseDate = flight.date 
      ? parseFlightDate(flight.date) || parseFlightDate(flight.departure_date) || parseFlightDate(flight.departureDate)
      : (dateRange?.from ? new Date(dateRange.from) : new Date())

    let depDateObj = baseDate
    let arrDateObj = parseFlightDate(flight.arrivalDate)
    
    // 1. Parse Duration from string "4h 45m" to minutes
    let durationVal = 0
    if (typeof flight.duration === 'number') {
      durationVal = flight.duration
    } else if (typeof flight.duration === 'string') {
      const hMatch = flight.duration.match(/(\d+)h/)
      const mMatch = flight.duration.match(/(\d+)m/)
      if (hMatch) durationVal += parseInt(hMatch[1]) * 60
      if (mMatch) durationVal += parseInt(mMatch[1])
    }

    let depTime = flight.departureTime || flight.time
    let arrTime = flight.arrivalTime
    let durationStr = flight.duration

    // 2. Handle Direction: Swap time/date for Arrival flights
    if (flight.direction === 'arrival') {
      // If we have time but it's in the wrong slot (mapped to departure by default)
      if (depTime && !arrTime) {
        arrTime = depTime
        depTime = null
      }
      // The 'date' column for arrival flights is actually Arrival Date
      if (depDateObj && !arrDateObj) {
        arrDateObj = depDateObj
        depDateObj = null
      }
    }

    // Calculate if duration is numeric (minutes)
    if (!isNaN(durationVal) && durationVal > 0) {
      durationStr = `${Math.floor(durationVal / 60)} ชม. ${durationVal % 60} นาที`
      
      // Case 1: Have Departure Time, Calculate Arrival
      if (depTime && (depDateObj || baseDate)) {
        const [h, m] = depTime.split(':').map(Number)
        const start = new Date(depDateObj || baseDate!)
        start.setHours(h, m, 0, 0)
        
        const end = new Date(start.getTime() + durationVal * 60000)
        if (!arrTime) arrTime = format(end, 'HH:mm')
        if (!arrDateObj) arrDateObj = end
        if (!depDateObj) depDateObj = start
      }
      // Case 2: Have Arrival Time, Missing Departure Time
      else if (arrTime && (arrDateObj || baseDate)) {
        const [h, m] = arrTime.split(':').map(Number)
        // If arrDateObj is missing, assume baseDate (approx)
        const end = new Date(arrDateObj || baseDate!)
        end.setHours(h, m, 0, 0)
        
        const start = new Date(end.getTime() - durationVal * 60000)
        depTime = format(start, 'HH:mm')
        depDateObj = start
        if (!arrDateObj) arrDateObj = end
      }
    }
    
    return { 
      ...flight, 
      depDateObj, 
      departureTime: depTime || '-', 
      arrivalTime: arrTime || '-', 
      arrTime: arrTime || '-', // Keep for compatibility
      arrDateObj, 
      durationStr 
    }
  }

  const [selectedRouteFlights, setSelectedRouteFlights] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleShowFlightDetails = (flights: any[]) => {
    // Show unique flights only (Schedule view) - do not expand by date range
    const processed = flights.map(processFlightData)
    setSelectedRouteFlights(processed)
    setIsDialogOpen(true)
  }

  // Filter routes based on the current dateRange to sync with the chart
  const filteredRoutes = useMemo(() => {
    if (!routes || !dateRange?.from) return []

    const from = new Date(dateRange.from)
    from.setHours(0, 0, 0, 0)
    const to = dateRange.to ? new Date(dateRange.to) : new Date(from)
    to.setHours(23, 59, 59, 999)

    return routes.filter(route => {
      const routeDate = parseFlightDate(route.date)
      if (!routeDate) return false
      
      // console.log(`Checking route date: ${format(routeDate, 'yyyy-MM-dd')} vs Range: ${format(from, 'yyyy-MM-dd')} - ${format(to, 'yyyy-MM-dd')}`)
      // Ensure routeDate is within the selected range
      return routeDate.getTime() >= from.getTime() && routeDate.getTime() <= to.getTime()
    })
  }, [routes, dateRange])

  // Helper to prepare data (fill missing dates)
  const prepareChartData = (data: any[], range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
      return [...data].sort((a: any, b: any) => a.date.localeCompare(b.date))
    }

    const dataMap = new Map(
      data.map((item: any) => {
        const dateKey = format(new Date(item.date), 'yyyy-MM-dd')
        return [dateKey, item]
      })
    )
    
    const startDate = new Date(
      range.from.getFullYear(),
      range.from.getMonth(),
      range.from.getDate()
    )

    const endDate = new Date(
      range.to.getFullYear(),
      range.to.getMonth(),
      range.to.getDate()
    )

    const days = differenceInCalendarDays(endDate, startDate)
    const filledData: any[] = []

    for (let i = 0; i <= days; i++) {
      const curr = addDays(startDate, i)
      const dateStr = format(curr, 'yyyy-MM-dd')
      
      if (dataMap.has(dateStr)) {
        filledData.push({ ...dataMap.get(dateStr), date: dateStr })
      } else {
        filledData.push({ date: dateStr, flights: 0 })
      }
    }
    return filledData
  }

  // Format date for chart display
  const formatChartDate = (dateStr: string) =>
    format(new Date(dateStr), 'd MMM', { locale: th })

  const processedDailyData = prepareChartData(dailyData, dateRange)
  const processedDailyDataCompare = compareMode ? prepareChartData(dailyDataCompare, dateRange) : []

  // Filter out leading/trailing zero days for statistics calculation
  // This ensures stats reflect the actual data period, not the full selected range
  const effectiveDailyData = (() => {
    if (!processedDailyData || processedDailyData.length === 0) return []
    
    let firstIndex = -1
    let lastIndex = -1
    
    for (let i = 0; i < processedDailyData.length; i++) {
      if (processedDailyData[i].flights > 0) {
        if (firstIndex === -1) firstIndex = i
        lastIndex = i
      }
    }
    
    if (firstIndex === -1) return []
    return processedDailyData.slice(firstIndex, lastIndex + 1)
  })()

  const calculatedTotalFlights = effectiveDailyData.reduce((sum, item) => sum + (item.flights || 0), 0)
  const numberOfDays = effectiveDailyData.length || 1
  const calculatedAvgFlights =
    effectiveDailyData.length > 0
      ? Math.round(calculatedTotalFlights / effectiveDailyData.length)
      : 0

  // Calculate Most Active Carrier from routes data
  const calculateMostActiveCarrier = (filteredRoutesData: any[]) => {
    if (!filteredRoutesData || filteredRoutesData.length === 0) return 'ไม่พบข้อมูล'
    
    const carrierCounts: Record<string, number> = {}
    filteredRoutesData.forEach(r => {
      // Try to find airline name, fallback to code
      const name = r.airlineName || r.airline_name || r.airline || r.airlineCode || r.airline_code || 'Unknown'
      carrierCounts[name] = (carrierCounts[name] || 0) + 1
    })
    
    let maxCarrier = 'ไม่พบข้อมูล'
    let maxCount = 0
    
    Object.entries(carrierCounts).forEach(([carrier, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxCarrier = carrier
      }
    })
    
    return maxCarrier
  }

  // Calculate Peak Hour Range from routes data
  const calculatePeakHourRange = (filteredRoutesData: any[]) => {
    if (!filteredRoutesData || filteredRoutesData.length === 0) return 'ไม่พบข้อมูล'
    
    const hourCounts: Record<number, number> = {}
    
    filteredRoutesData.forEach(r => {
      const timeStr = r.departureTime || r.departure_time || r.time
      if (timeStr) {
        // Handle "HH:mm:ss" or "HH:mm"
        const parts = timeStr.split(':')
        if (parts.length >= 1) {
          const hour = parseInt(parts[0], 10)
          if (!isNaN(hour) && hour >= 0 && hour <= 23) {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1
          }
        }
      }
    })
    
    let maxHour = -1
    let maxCount = 0
    
    Object.entries(hourCounts).forEach(([h, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxHour = parseInt(h, 10)
      }
    })
    
    if (maxHour === -1) return 'ไม่พบข้อมูล'
    
    // Format: "08:00 - 09:00"
    const start = String(maxHour).padStart(2, '0') + ':00'
    const end = String((maxHour + 1) % 24).padStart(2, '0') + ':00'
    return `${start} - ${end}`
  }

  const calculatedMostActiveCarrier = calculateMostActiveCarrier(filteredRoutes)
  const calculatedPeakHourRange = calculatePeakHourRange(filteredRoutes)

  const chartData = processedDailyData.map(row => {
    const compareRow = processedDailyDataCompare.find((cr: any) => cr.date === row.date)
    return {
      ...row,
      flightsCompare: compareRow ? compareRow.flights : 0,
      displayDate: formatChartDate(row.date)
    }
  })

  // Group routes by Origin-Destination
  const groupedRoutes = filteredRoutes.reduce((acc, route) => {
    const key = `${route.departureCode}-${route.arrivalCode}`
    if (!acc[key]) {
      acc[key] = {
        departureName: route.departureName,
        departureCode: route.departureCode,
        arrivalCode: route.arrivalCode,
        flights: []
      }
    }
    acc[key].flights.push(route)
    return acc
  }, {} as Record<string, any>)

  const sortedGroupKeys = Object.keys(groupedRoutes).sort()

  const toggleRouteExpand = (key: string) => {
    setExpandedRouteKey(prev => prev === key ? null : key)
  }

  // Calculate most active airport in the selected region (Country)
  const getMostActiveAirport = () => {
    if (!filteredRoutes.length) return null
    
    const depCounts: Record<string, number> = {}
    const arrCounts: Record<string, number> = {}
    
    filteredRoutes.forEach(r => {
        // Fix duplicate code display: Check if name already ends with (CODE)
        const formatName = (name: string, code: string) => {
            if (!name) return code || 'Unknown'
            if (!code) return name
            if (name === code) return code
            if (name.includes(`(${code})`)) return name
            return `${name} (${code})`
        }

        const dep = formatName(r.departureName, r.departureCode)
        const arr = formatName(r.arrivalCity, r.arrivalCode)
        
        depCounts[dep] = (depCounts[dep] || 0) + 1
        arrCounts[arr] = (arrCounts[arr] || 0) + 1
    })
    
    const getMax = (counts: Record<string, number>) => {
        const keys = Object.keys(counts)
        if (keys.length <= 1) return null // Only 1 airport, no need to show "most active"
        return keys.reduce((a, b) => counts[a] > counts[b] ? a : b)
    }
    
    const maxDep = getMax(depCounts)
    const maxArr = getMax(arrCounts)
    return { maxDep, maxDepCount: maxDep ? depCounts[maxDep] : 0, maxArr, maxArrCount: maxArr ? arrCounts[maxArr] : 0 }
  }

  const mostActive = getMostActiveAirport()

  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0">
      {/* <h1 className="text-xl sm:text-2xl font-bold text-foreground">
        เส้นทางการบิน
      </h1> */}

      {/* Filter bar - responsive: stack on mobile */}
      <Card className="p-3 sm:p-6 border bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-2 min-w-0">
            <Label className="text-sm font-medium text-muted-foreground">
              สนามบินต้นทาง (Departure)
            </Label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <DestinationSelect
                value={origin}
                displayValue={originName}
                onChange={(value, name) => {
                  setOrigin(value)
                  setOriginName(name)
                  if (value) {
                    setDestination('')
                    setDestinationName('')
                  }
                }}
                placeholder={destination ? "คุณกำลังดูข้อมูลปลายทาง" : "เลือกสนามบินต้นทาง"}
                excludeCode={destination || undefined}
                className="pl-9"
                disabled={!!destination}
                enableCountrySelection={true}
              />
            </div>
          </div>
          <div className="space-y-2 min-w-0">
            <Label className="text-sm font-medium text-muted-foreground">
              สนามบินปลายทาง (Arrival)
            </Label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <DestinationSelect
                value={destination}
                displayValue={destinationName}
                onChange={(value, name) => {
                  setDestination(value)
                  setDestinationName(name)
                  if (value) {
                    setOrigin('')
                    setOriginName('')
                  }
                }}
                placeholder={origin ? "คุณกำลังดูข้อมูลต้นทาง" : "เลือกสนามบินปลายทาง"}
                excludeCode={origin || undefined}
                className="pl-9"
                disabled={!!origin}
                enableCountrySelection={true}
              />
            </div>
          </div>
          <div className="space-y-2 min-w-0">
            <Label className="text-sm font-medium text-muted-foreground">
              ช่วงวันที่ (Start - End)
            </Label>
            <div className="flex gap-2 w-full min-w-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 min-w-0 justify-start text-left font-normal h-12 sm:h-14 bg-white border-gray-300 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/10 px-2 sm:px-3',
                      !dateRange?.from && 'text-muted-foreground',
                      dateError && !dateRange?.from && 'border-red-500 ring-1 ring-red-500/20'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy') : 'วันเริ่มต้น'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 flight-routes-accent" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={(date) => {
                      if (durationMode === '7' && date) {
                        setDateRange({ from: date, to: addDays(date, 6) })
                      } else if (durationMode === '30' && date) {
                        setDateRange({ from: date, to: addDays(date, 29) })
                      } else {
                        setDateRange((prev) => ({ from: date, to: prev?.to }))
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'flex-1 min-w-0 justify-start text-left font-normal h-12 sm:h-14 bg-white border-gray-300 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/10 px-2 sm:px-3',
                      !dateRange?.to && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy') : 'วันสิ้นสุด'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 flight-routes-accent" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange?.to}
                    onSelect={(date) => {
                      setDurationMode(null)
                      setDateRange((prev) => ({ from: prev?.from, to: date }))
                    }}
                    disabled={(date) => dateRange?.from ? date < dateRange.from : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </Card>

      {/* Empty state - responsive mobile */}
      {!hasAnalyzed && (
        <Card className="p-8 sm:p-12 md:p-16 border bg-card rounded-xl shadow-sm">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
              <Search className="w-7 h-7 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <p className="text-sm sm:text-base md:text-lg font-medium text-foreground mb-2 px-1">
              กรุณาเลือกสนามบินต้นทางหรือปลายทางเพื่อดูเส้นทางการบิน
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-0 sm:block px-1">
              <span className="block sm:inline">เลือก Departure เพื่อดูเส้นทางที่ออกจากสนามบิน</span>
              <span className="hidden sm:inline"> | </span>
              <span className="block sm:inline">เลือก Arrival เพื่อดูเส้นทางที่มาถึงสนามบิน</span>
            </p>
          </div>
        </Card>
      )}

      {/* Chart + Summary + รายการเส้นทาง - แสดงหลังกดวิเคราะห์ข้อมูล */}
      {hasAnalyzed && (
        <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0 transition-opacity duration-300", loading ? "opacity-50 pointer-events-none" : "opacity-100")}>
          {loading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-sm pointer-events-none">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {/* Left column: กราฟ + รายการเส้นทาง */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 min-w-0">
            {/* Daily frequency chart - responsive */}
            <FlightRoutesChart
              chartData={chartData}
              dateRange={dateRange}
              setDateRange={setDateRange}
              compareMode={compareMode}
              setCompareMode={setCompareMode}
              isDeparture={!!origin}
              durationMode={durationMode}
              setDurationMode={setDurationMode}
            />

            {/* รายการเส้นทางสายการบิน - ใต้กราฟ */}
            <Card className="p-3 sm:p-6 border min-w-0 overflow-hidden">
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                {originName || destinationName 
                  ? `เส้นทางการบิน (${sortedGroupKeys.length} เส้นทาง)`
                  : `เส้นทางการบิน (${filteredRoutes.length} เที่ยวบิน)`}
              </h2>
              <ScrollArea className="h-[500px] sm:h-[600px] w-full rounded-md border bg-muted/20">
                <div className="p-1 space-y-2">
                  {sortedGroupKeys.length > 0 ? (
                    sortedGroupKeys.map((key) => {
                      const group = groupedRoutes[key]
                      const isExpanded = expandedRouteKey === key
                      const flights = group.flights.sort((a: any, b: any) => (a.departureTime || '').localeCompare(b.departureTime || ''))
                      const flightCount = flights.length
                      const totalFlightsInRange = flightCount * numberOfDays
                      
                      // First and Last flight
                      const firstFlight = processFlightData(flights[0])
                      const lastFlight = processFlightData(flights[flights.length - 1])

                      return (
                        <div
                          key={key}
                          className="rounded-lg bg-background border shadow-sm transition-all duration-200 overflow-hidden"
                        >
                          {/* Collapsed Header */}
                          <div 
                            className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleRouteExpand(key)}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-foreground text-sm sm:text-base truncate">
                                    {group.departureName || group.departureCode} → {group.arrivalCity || group.arrivalCode}
                                  </p>
                                  <span className="text-sm text-muted-foreground hidden sm:inline-block">ต้นทาง - ปลายทาง</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  เที่ยวบินทั้งหมด: <span className="font-medium text-primary">{totalFlightsInRange}</span> <span className="text-[10px] text-muted-foreground">({flightCount}  เที่ยวบินต่อวัน)</span>
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0 ml-2">
                              {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-4 py-5 border-t bg-muted/5 space-y-6">
                              {/* First Flight */}
                              <div>
                                <div className="mb-4 flex items-center gap-2">
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-2 py-0.5 h-5 font-normal">
                                    เที่ยวบินแรก (First Flight)
                                  </Badge>
                                </div>

                                {/* ===== SUMMARY ROW (First Flight) ===== */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                  {/* LEFT - Departure */}
                                  <div className="flex flex-col items-start text-left min-w-[90px]">
                                    <span className="text-2xl font-bold leading-none">
                                      {firstFlight.departureTime || '--:--'}
                                    </span>
                                    <span className="text-sm font-medium">
                                      {firstFlight.departureCode}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {firstFlight.depDateObj
                                        ? format(firstFlight.depDateObj, 'EEE, d MMM', { locale: th })
                                        : '-'}
                                    </span>
                                  </div>

                                  {/* CENTER - Duration + Stops */}
                                  <div className="flex-1 flex flex-col items-center relative">
                                    {/* duration */}
                                    <span className="text-sm font-medium mb-1">
                                      {firstFlight.durationStr || '-'}
                                    </span>

                                    {/* line + plane */}
                                    <div className="w-full flex items-center gap-2">
                                      <div className="flex-1 h-px bg-border" />
                                      <Plane className="w-4 h-4 text-muted-foreground" />
                                      <div className="flex-1 h-px bg-border" />
                                    </div>

                                    {/* stops */}
                                    <span className="text-xs text-muted-foreground mt-1">
                                      {firstFlight.direct
                                        ? 'Direct'
                                        : 'Connecting'}
                                    </span>
                                  </div>

                                  {/* RIGHT - Arrival */}
                                  <div className="flex flex-col items-end text-right min-w-[90px]">
                                    <span className="text-2xl font-bold leading-none">
                                      {firstFlight.arrTime || '--:--'}
                                    </span>
                                    <span className="text-sm font-medium">
                                      {firstFlight.arrivalCode}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {firstFlight.arrDateObj
                                        ? format(firstFlight.arrDateObj, 'EEE, d MMM', { locale: th })
                                        : '-'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Last Flight (if different) */}
                              {flightCount > 1 && (
                                <>
                                  <div className="h-px bg-border/50 border-dashed" />
                                  <div>
                                    <div className="mb-4 flex items-center gap-2">
                                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] px-2 py-0.5 h-5 font-normal">
                                        เที่ยวบินสุดท้าย (Last Flight)
                                      </Badge>
                                    </div>

                                    {/* ===== SUMMARY ROW (Last Flight) ===== */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                      {/* LEFT - Departure */}
                                      <div className="flex flex-col items-start text-left min-w-[90px]">
                                        <span className="text-2xl font-bold leading-none">
                                          {lastFlight.departureTime || '--:--'}
                                        </span>
                                        <span className="text-sm font-medium">
                                          {lastFlight.departureCode}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {lastFlight.depDateObj
                                            ? format(lastFlight.depDateObj, 'EEE, d MMM', { locale: th })
                                            : '-'}
                                        </span>
                                      </div>

                                      {/* CENTER - Duration + Stops */}
                                      <div className="flex-1 flex flex-col items-center relative">
                                        {/* duration */}
                                        <span className="text-sm font-medium mb-1">
                                          {lastFlight.durationStr || '-'}
                                        </span>

                                        {/* line + plane */}
                                        <div className="w-full flex items-center gap-2">
                                          <div className="flex-1 h-px bg-border" />
                                          <Plane className="w-4 h-4 text-muted-foreground" />
                                          <div className="flex-1 h-px bg-border" />
                                        </div>

                                        {/* stops */}
                                        <span className="text-xs text-muted-foreground mt-1">
                                          {lastFlight.direct
                                            ? 'Direct'
                                            : 'Connecting'}
                                        </span>
                                      </div>

                                      {/* RIGHT - Arrival */}
                                      <div className="flex flex-col items-end text-right min-w-[90px]">
                                        <span className="text-2xl font-bold leading-none">
                                          {lastFlight.arrTime || '--:--'}
                                        </span>
                                        <span className="text-sm font-medium">
                                          {lastFlight.arrivalCode}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {lastFlight.arrDateObj
                                            ? format(lastFlight.arrDateObj, 'EEE, d MMM', { locale: th })
                                            : '-'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* BUTTON */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-6 text-xs h-9"
                                onClick={() => handleShowFlightDetails(flights)}
                              >
                                ดูรายละเอียดเที่ยวบิน
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                        <Send className="w-6 h-6 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        ไม่พบข้อมูลเส้นทางการบินสำหรับวันที่เลือก
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ลองเปลี่ยนวันที่หรือสนามบินอื่น
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Right: Summary - responsive */}
          <Card className="p-3 sm:p-6 border min-w-0">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                สรุปข้อมูลเส้นทาง
              </h2>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-lg bg-muted/40 border">
                    <div className="h-3 w-1/2 bg-muted-foreground/20 rounded animate-pulse mb-2" />
                    <div className="h-6 w-3/4 bg-muted-foreground/20 rounded animate-pulse mb-2" />
                    <div className="h-2 w-1/3 bg-muted-foreground/20 rounded animate-pulse" />
                  </div>
                ))
              ) : (
                <>
              <div className="p-3 sm:p-4 rounded-lg bg-muted/40 border">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  จำนวนเที่ยวบินเฉลี่ย/วัน
                </p>
                <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
                  {calculatedAvgFlights} เที่ยว
                </p>
                <p className="text-xs text-muted-foreground mt-1">อ้างอิงข้อมูลช่วงที่เลือก</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-muted/40 border">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  ช่วงเวลาที่คนนิยมที่สุด
                </p>
                <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
                  {calculatedPeakHourRange}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Peak Hour Range</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-muted/40 border">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  สายการบินที่มีเที่ยวบินสูงสุด
                </p>
                <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
                  {calculatedMostActiveCarrier}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Most Active Carrier</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-muted/40 border">
                <p className="text-xs sm:text-sm font-medium text-foreground">
                  รวมจำนวนเที่ยวบินทั้งหมด
                </p>
                <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
                  {calculatedTotalFlights} เที่ยว
                </p>
                <p className="text-xs text-muted-foreground mt-1">ตามช่วงเวลาที่เลือก</p>
              </div>
                </>
              )}
            </div>

            {/* Most Active Airport Block (Show only if multiple airports involved) */}
            {loading ? (
              <div className="mt-4 space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="h-3 w-1/2 bg-blue-200 rounded animate-pulse mb-2" />
                  <div className="h-6 w-3/4 bg-blue-200 rounded animate-pulse mb-2" />
                  <div className="h-2 w-1/3 bg-blue-200 rounded animate-pulse" />
                </div>
              </div>
            ) : (mostActive?.maxDep || mostActive?.maxArr) && (
              <div className="mt-4 space-y-3 sm:space-y-4">
                {mostActive.maxDep && (
                  <div className="p-3 sm:p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                    <p className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      สนามบินที่มีเที่ยวบินออกมากที่สุด
                    </p>
                    <p className="text-base sm:text-lg font-bold text-blue-700 mt-1">
                      {mostActive.maxDep}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      จำนวน {mostActive.maxDepCount * numberOfDays} เที่ยวบิน
                      <span className="text-[10px] ml-1">({mostActive.maxDepCount} เที่ยวบินต่อวัน)</span>
                    </p>
                  </div>
                )}
                {mostActive.maxArr && (
                  <div className="p-3 sm:p-4 rounded-lg bg-orange-50/50 border border-orange-100">
                    <p className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      สนามบินที่มีเที่ยวบินเข้ามากที่สุด
                    </p>
                    <p className="text-base sm:text-lg font-bold text-orange-700 mt-1">
                      {mostActive.maxArr}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      จำนวน {mostActive.maxArrCount * numberOfDays} เที่ยวบิน
                      <span className="text-[10px] ml-1">({mostActive.maxArrCount} เที่ยวบินต่อวัน)</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Flight Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-none sm:max-w-none w-[35vw] max-h-[80vh] overflow-x-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดเที่ยวบิน</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-1 flight-routes-accent">
            {Object.entries(
              selectedRouteFlights.reduce((acc: any, flight: any) => {
                // Determine grouping key based on date range
                let key = 'ตารางเที่ยวบิน (Flight Schedule)'
                
                // If we have a date range and it's small enough (e.g. <= 60 days), group by date
                // We can infer this if we have multiple different dates in the flights list
                // Or simply check if we have a valid date object
                if (dateRange?.from && dateRange?.to) {
                   const daysDiff = differenceInCalendarDays(dateRange.to, dateRange.from)
                   if (daysDiff <= 60 && flight.depDateObj) {
                       key = format(flight.depDateObj, 'yyyy-MM-dd')
                   }
                }

                if (!acc[key]) acc[key] = []
                acc[key].push(flight)
                return acc
              }, {})
            ).sort((a: any, b: any) => a[0].localeCompare(b[0])).map(([key, flights]: any) => {
              // Format header date if it's a date key
              const isDateKey = /^\d{4}-\d{2}-\d{2}$/.test(key)
              const headerTitle = isDateKey ? format(new Date(key), 'EEEE, d MMMM yyyy', { locale: th }) : key

              return (
              <div key={key} className="space-y-3">
                <div className="flex items-center gap-4 pt-2">
                  <h3 className="font-medium text-sm text-muted-foreground/70 shrink-0">
                    {headerTitle}
                  </h3>
                  <div className="h-px bg-border/60 flex-1" />
                </div>
                <div className="grid gap-3">
                  {flights.map((flight: any, index: number) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg border gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border relative">
                          <img
                            src={`https://airhex.com/images/airline-logos/${(flight.airlineName || flight.airline_name || '').trim().toLowerCase().replace(/\s+/g, '-')}.png`}
                            alt={flight.airlineName || flight.airline_name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/10 hidden">
                            <Plane className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-lg">
                            {(() => {
                              const airlineCode = flight.airlineCode || flight.airline || '';
                              const flightNum = flight.flightNumber || '';
                              // Check if flight number already starts with airline code (case insensitive)
                              const showCode = !flightNum.toLowerCase().startsWith(airlineCode.toLowerCase());
                              return `${showCode ? airlineCode + ' ' : ''}${flightNum}`;
                            })()}
                          </div>
                          <div className="text-sm text-muted-foreground">{flight.airlineName || flight.airline_name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-1 justify-center sm:justify-end min-w-0">
                        <div className="text-right min-w-[80px] sm:min-w-[140px]">
                          <div className="font-bold text-lg">{flight.departureTime}</div>
                          <div className="text-xs text-muted-foreground truncate" title={flight.departureName}>
                            <span className="hidden sm:inline">{flight.departureName} ({flight.departureCode})</span>
                            <span className="sm:hidden">{flight.departureCode}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center px-2 min-w-[100px]">
                          <span className="text-xs text-muted-foreground mb-1">{flight.durationStr}</span>
                          <div className="w-full flex items-center">
                            <div className="h-px bg-border flex-1" />
                            <Plane className="w-3 h-3 text-muted-foreground ml-1 rotate-90" />
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1">{flight.direct ? 'Direct' : 'Connecting'}</span>
                        </div>
                        <div className="text-left min-w-[80px] sm:min-w-[140px]">
                          <div className="font-bold text-lg">{flight.arrivalTime}</div>
                          <div className="text-xs text-muted-foreground truncate" title={flight.arrivalCity || flight.arrivalCode}>
                            <span className="hidden sm:inline">{flight.arrivalCity || flight.arrivalCode} ({flight.arrivalCode})</span>
                            <span className="sm:hidden">{flight.arrivalCode}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
