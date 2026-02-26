import { create } from "zustand";
interface Filters { query: string; category: string; distance: number; minPrice: number; maxPrice: number; minRating: number; verifiedOnly: boolean; licensedOnly: boolean; sortBy: string; }
const DEFAULTS: Filters = { query: "", category: "", distance: 50, minPrice: 0, maxPrice: 5000, minRating: 0, verifiedOnly: false, licensedOnly: false, sortBy: "distance" };
interface BookingState { filters: Filters; setFilters: (f: Partial<Filters>) => void; resetFilters: () => void; }
export const useBookingStore = create<BookingState>((set) => ({
  filters: DEFAULTS,
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: DEFAULTS }),
}));
