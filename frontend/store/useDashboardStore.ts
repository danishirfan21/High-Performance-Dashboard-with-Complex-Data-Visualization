import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subDays } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface WidgetVisibility {
  metrics: boolean;
  revenueChart: boolean;
  categoryChart: boolean;
  growthChart: boolean;
  heatmap: boolean;
  productsTable: boolean;
}

interface DashboardState {
  dateRange: DateRange;
  widgetVisibility: WidgetVisibility;
  setDateRange: (range: DateRange) => void;
  toggleWidget: (widget: keyof WidgetVisibility) => void;
  resetLayout: () => void;
}

const defaultWidgets: WidgetVisibility = {
  metrics: true,
  revenueChart: true,
  categoryChart: true,
  growthChart: true,
  heatmap: true,
  productsTable: true,
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      dateRange: {
        startDate: subDays(new Date(), 30),
        endDate: new Date(),
      },
      widgetVisibility: defaultWidgets,

      setDateRange: (range) => set({ dateRange: range }),

      toggleWidget: (widget) =>
        set((state) => ({
          widgetVisibility: {
            ...state.widgetVisibility,
            [widget]: !state.widgetVisibility[widget],
          },
        })),

      resetLayout: () => set({ widgetVisibility: defaultWidgets }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);
