import type { Metadata } from 'next';
import { Chat } from '@/components/dashboard/Chat';

export const metadata: Metadata = { title: 'Messagerie' };

export default function MessagesPage() {
  return <Chat />;
}
