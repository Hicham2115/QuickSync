import type { Metadata } from 'next';
import { Equipe } from '@/components/dashboard/Equipe';

export const metadata: Metadata = { title: 'Équipe' };

export default function EquipePage() {
  return <Equipe />;
}
