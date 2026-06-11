import type { Metadata } from 'next';
import { Personnel } from '@/components/dashboard/Personnel';

export const metadata: Metadata = { title: 'Personnel' };

export default function PersonnelPage() {
  return <Personnel />;
}
