import { create } from 'zustand';
import { LEAVES_DATA, Leave } from '@/lib/mock/hr-data';

interface HRState {
  leaves: Leave[];
  updateLeave: (id: number, status: 'approuve' | 'refuse') => void;
}

export const useHRStore = create<HRState>((set) => ({
  leaves: LEAVES_DATA,
  updateLeave: (id, status) =>
    set((s) => ({
      leaves: s.leaves.map((l) => (l.id === id ? { ...l, status } : l)),
    })),
}));
