'use client'

import { Plane, Target } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AboutUsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Configuration สำหรับเส้นใต้หัวข้อ - สามารถปรับสีได้ที่นี่
const underlineConfig = {
  // สี gradient ของเส้นใต้หัวข้อ - ใช้ CSS color values
  // ตัวอย่าง:
  // - Blue to Purple: { from: '#93c5fd', via: '#60a5fa', to: '#a855f7' } (blue-300 via blue-400 to purple-500)
  // - Green to Blue: { from: '#86efac', via: '#4ade80', to: '#3b82f6' } (green-300 via green-400 to blue-500)
  // - Orange to Red: { from: '#fdba74', via: '#fb923c', to: '#ef4444' } (orange-300 via orange-400 to red-500)
  // - Pink to Purple: { from: '#f9a8d4', via: '#f472b6', to: '#a855f7' } (pink-300 via pink-400 to purple-500)
  gradient: {
    from: '#93c5fd',  // blue-300
    via: '#93c5fd',   // blue-400
    to: '#93c5fd',    // purple-500
  },
  // ความสูงของเส้น
  height: 'h-0.5',
  // ความกว้างของเส้น (ใช้ Tailwind classes หรือ custom width)
  width: 'w-71',
}

export function AboutUsDialog({ open, onOpenChange }: AboutUsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!top-0 !left-0 !translate-x-0 !translate-y-0 !w-full !h-full !max-w-full !max-h-full md:!top-[50%] md:!left-[50%] md:!translate-x-[-50%] md:!translate-y-[-50%] md:!max-w-[50vw] md:!w-[90vw] md:!max-h-[90vh] overflow-y-auto p-0 m-0 rounded-none border-0 shadow-none md:rounded-lg md:border md:shadow-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>เกี่ยวกับเรา (About Us)</DialogTitle>
        </DialogHeader>
        {/* Main Content Section */}
        <div className="px-6 py-8 bg-white">
          {/* Main Title */}
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2 drop-shadow-sm">
              เกี่ยวกับเรา (About Us)
            </h1>
            <div
              className={`${underlineConfig.height} ${underlineConfig.width} rounded-full`}
              style={{
                background: `linear-gradient(to right, ${underlineConfig.gradient.from}, ${underlineConfig.gradient.via}, ${underlineConfig.gradient.to})`
              }}
            ></div>
          </div>

          {/* Mission Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              พันธกิจของเรา
            </h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-foreground">
                เราคือเครื่องมือช่วยค้นหาตั๋วเครื่องบินที่ไม่ได้แค่บอกราคา แต่ช่วยวิเคราะห์{' '}
                <span className="font-bold">"ช่วงเวลาที่ดีที่สุด"</span> ให้คุณ
              </p>
            </div>
            <p className="text-foreground leading-relaxed">
              เราเชื่อว่าการเดินทางควรเป็นเรื่องที่{' '}
              <span className="font-bold">"ง่ายและคุ้มค่าที่สุด"</span> ไม่ใช่ต้องเปิดหลายเว็บเทียบราคาเองจนยิ่งดูยิ่งงง ระบบของเราถูกสร้างขึ้นมาเพื่อช่วยให้คุณ{' '}
              <span className="font-bold">หาช่วงเวลาที่ตั๋วเครื่องบินไม่ว่าจะเป็นตั๋ว เที่ยวเดียว หรือ ไป-กลับ ได้ถูกที่สุด</span> โดยอ้างอิงจากข้อมูลเที่ยวบินจริงและสถิติของราคาในแต่ละฤดูกาล (High / Low / Normal Season)
            </p>
          </div>

          {/* What Our System Does Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-primary fill-primary" />
              <h2 className="text-lg font-semibold text-primary">
                สิ่งที่ระบบของเราทำคือ
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-blue-50 rounded-lg flex overflow-hidden">
                <div className="w-1.5 bg-primary flex-shrink-0"></div>
                <p className="text-primary p-4 flex-1">
                  วิเคราะห์ราคาตั๋วตาม <span className="font-bold">ประเทศ/เมืองปลายทาง</span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg flex overflow-hidden">
                <div className="w-1.5 bg-primary flex-shrink-0"></div>
                <p className="text-primary p-4 flex-1">
                  วิเคราะห์ตาม <span className="font-bold">จำนวนวันที่ต้องการเดินทาง เช่น 5, 7, 10 วัน</span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg flex overflow-hidden">
                <div className="w-1.5 bg-primary flex-shrink-0"></div>
                <p className="text-primary p-4 flex-1">
                  สามารถเลือกความ <span className="font-bold">ต้องการ/ไม่ต้องการสายการบิน นั้นๆ แบบเจาะจงได้</span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg flex overflow-hidden">
                <div className="w-1.5 bg-primary flex-shrink-0"></div>
                <p className="text-primary p-4 flex-1">
                  ประมวลผลออกมาเป็น <span className="font-bold">กราฟแนวโน้มราคา</span> ที่เห็นภาพว่า "ถ้าไปวันนี้... ราคาจะประมาณเท่าไหร่"
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg flex overflow-hidden">
                <div className="w-1.5 bg-primary flex-shrink-0"></div>
                <p className="text-primary p-4 flex-1">
                  <span className="font-bold">แนะนำช่วงที่ คุ้มค่าที่สุด</span> ให้แบบตรงไปตรงมา
                </p>
              </div>
            </div>
          </div>

          {/* Our Goals Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-black" />
              <h2 className="text-lg font-semibold text-foreground">
                เป้าหมายของเรา
              </h2>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-foreground leading-relaxed">
                ช่วยให้ผู้ใช้ <span className="font-bold">ประหยัดเวลา ประหยัดเงิน และตัดสินใจได้แบบมีข้อมูลประกอบ</span> เราจะเก็บสถิติ เช่น ปลายทางยอดนิยม ช่วงที่คนเดินทางเยอะ ราคาเฉลี่ยแต่ละเดือน เพื่อนำกลับไปปรับระบบให้แนะนำได้แม่นยำยิ่งขึ้น
              </p>
            </div>
          </div>

          {/* Closing Message */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-foreground leading-relaxed">
              ระบบนี้ถูกออกแบบมาเพื่อคนที่รักการเดินทาง แต่ไม่อยากเสียเวลาหาตั๋วนาน ๆ ให้เราเป็นผู้ช่วยวางแผนการเดินทางของคุณ 🌎
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
