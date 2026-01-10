'use client';

import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const GET_REVENUE_DATA = gql`
  query GetRevenueData($dateRange: DateRangeInput!) {
    getRevenueData(dateRange: $dateRange) {
      date
      revenue
      transactions
    }
  }
`;

interface Props {
  dateRange: { startDate: Date; endDate: Date };
}

const RevenueChart = memo(({ dateRange }: Props) => {
  const { data, loading, error } = useQuery(GET_REVENUE_DATA, {
    variables: {
      dateRange: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    },
  });

  const chartData = useMemo(() => {
    if (!data?.getRevenueData) return [];
    return data.getRevenueData.map((item: any) => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd'),
    }));
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Error loading revenue data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              stroke="currentColor"
            />
            <YAxis
              className="text-xs"
              stroke="currentColor"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Revenue ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

RevenueChart.displayName = 'RevenueChart';

export default RevenueChart;
