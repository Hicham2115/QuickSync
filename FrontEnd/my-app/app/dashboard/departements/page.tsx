import type { Metadata } from 'next';
import { Departements } from '@/components/dashboard/Departements';

export const metadata: Metadata = { title: 'Départements' };

export default function DepartementsPage() {
  return <Departements />;
}
