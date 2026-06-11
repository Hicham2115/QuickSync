import type { Metadata } from 'next';
import { Rapports } from '@/components/dashboard/Rapports';

export const metadata: Metadata = { title: 'Rapports' };

export default function RapportsPage() {
  return <Rapports />;
}
