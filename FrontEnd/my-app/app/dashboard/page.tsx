import type { Metadata } from 'next';
import { Overview } from '@/components/dashboard/Overview';

export const metadata: Metadata = { title: 'Tableau de bord' };

export default function DashboardPage() {
  return <Overview />;
}
