import type { Metadata } from 'next';
import { Conges } from '@/components/dashboard/Conges';

export const metadata: Metadata = { title: 'Congés' };

export default function CongesPage() {
  return <Conges />;
}
