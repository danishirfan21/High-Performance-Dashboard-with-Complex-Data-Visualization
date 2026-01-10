'use client';

import { useQuery, gql } from '@apollo/client';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import MetricCard from '@/components/cards/MetricCard';
import RevenueChart from '@/components/charts/RevenueChart';
import CategoryChart from '@/components/charts/CategoryChart';
import GrowthChart from '@/components/charts/GrowthChart';
import ProductsTable from '@/components/tables/ProductsTable';
import { DollarSign, Users, TrendingUp, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const GET_DASHBOARD_METRICS = gql`
  query GetDashboardMetrics($dateRange: DateRangeInput) {
    getDashboardMetrics(dateRange: $dateRange) {
      revenue {
        id
        value
        changePercent
      }
      users {
        id
        value
        changePercent
      }
      conversion {
        id
        value
        changePercent
      }
      growth {
        id
        value
        changePercent
      }
    }
  }
`;

export default function DashboardPage() {
  const { dateRange } = useDashboardStore();

  const { data, loading, refetch } = useQuery(GET_DASHBOARD_METRICS, {
    variables: {
      dateRange: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    },
  });

  // Subscribe to real-time updates
  useRealTimeMetrics(undefined, () => {
    refetch();
  });

  const metrics = data?.getDashboardMetrics;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Real-time analytics and insights
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={metrics?.revenue?.value || 0}
          changePercent={metrics?.revenue?.changePercent}
          format="currency"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricCard
          title="Total Users"
          value={metrics?.users?.value || 0}
          changePercent={metrics?.users?.changePercent}
          format="number"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics?.conversion?.value || 0}
          changePercent={metrics?.conversion?.changePercent}
          format="percentage"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <MetricCard
          title="Growth Rate"
          value={metrics?.growth?.value || 0}
          changePercent={metrics?.growth?.changePercent}
          format="percentage"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart dateRange={dateRange} />
        <CategoryChart dateRange={dateRange} />
      </div>

      <div className="grid gap-4">
        <GrowthChart dateRange={dateRange} />
      </div>

      {/* Products Table */}
      <ProductsTable />
    </div>
  );
}
