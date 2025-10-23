import { create } from 'zustand';
import type { MatchFormat } from '../../../shared/types';

interface GameState {
  format: MatchFormat;
  pause: boolean;
  setFormat: (f: MatchFormat) => void;
  setPause: (p: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  format: 'T20',
  pause: false,
  setFormat: (f) => set({ format: f }),
  setPause: (p) => set({ pause: p }),
}));
