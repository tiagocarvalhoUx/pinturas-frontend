import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'client' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  address?: { street: string; city: string; state: string; zipCode: string };
}

export interface Budget {
  _id: string;
  serviceType: string;
  description: string;
  phone?: string;
  area: number;
  status: string;
  estimatedPrice?: number;
  finalPrice?: number;
  address: { street: string; city: string; state: string };
  photos: { url: string }[];
  scheduledDate?: string;
  rating?: { stars: number; comment: string };
  client?: User;
  createdAt: string;
}

export interface PortfolioItem {
  _id: string;
  title: string;
  description?: string;
  serviceType: string;
  beforeImage?: { url: string };
  afterImage?: { url: string };
  area?: number;
  duration?: string;
  location?: string;
  featured: boolean;
}

export interface ChatMessage {
  _id: string;
  sender: { _id: string; name: string; avatar?: string };
  content?: string;
  type: 'text' | 'image';
  image?: { url: string };
  createdAt: string;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;

  // Data
  budgets: Budget[];
  portfolio: PortfolioItem[];
  adminStats: {
    totalBudgets: number;
    pendingBudgets: number;
    completedBudgets: number;
    inProgressBudgets: number;
    totalRevenue: number;
    avgRating: number;
  } | null;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setHasSeenOnboarding: (value: boolean) => void;
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  setPortfolio: (items: PortfolioItem[]) => void;
  setAdminStats: (stats: AppState['adminStats']) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasSeenOnboarding: false,
      budgets: [],
      portfolio: [],
      adminStats: null,

      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
      setBudgets: (budgets) => set({ budgets }),
      addBudget: (budget) => set((s) => ({ budgets: [budget, ...s.budgets] })),
      updateBudget: (id, updates) =>
        set((s) => ({
          budgets: s.budgets.map((b) => (b._id === id ? { ...b, ...updates } : b)),
        })),
      setPortfolio: (portfolio) => set({ portfolio }),
      setAdminStats: (adminStats) => set({ adminStats }),
      logout: () => set({ user: null, isAuthenticated: false, budgets: [], adminStats: null }),
    }),
    {
      name: 'adelcio-pinturas',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    }
  )
);
