import type { Metadata } from 'next';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { AuthGuard } from '@/components/dashboard/AuthGuard';

export const metadata: Metadata = {
  title: { default: 'Tableau de bord', template: '%s | QuickSync' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-warm-25">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
