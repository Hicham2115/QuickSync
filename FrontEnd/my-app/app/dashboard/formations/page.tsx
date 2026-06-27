import type { Metadata } from 'next';
import { Formations } from '@/components/dashboard/Formations';

export const metadata: Metadata = { title: 'Formations & Certifications' };

export default function FormationsPage() {
  return <Formations />;
}
