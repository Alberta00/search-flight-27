import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Dashboard - Flight Search',
  description: 'แดชบอร์ดวิเคราะห์ข้อมูลเที่ยวบิน',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
