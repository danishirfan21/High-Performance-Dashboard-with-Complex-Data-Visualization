'use client';

import { memo, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const GET_USER_GROWTH = gql`
  query GetUserGrowth($dateRange: DateRangeInput!) {
    getUserGrowth(dateRange: $dateRange) {
      date
      total
      new
    }
  }
`;

interface Props {
  dateRange: { startDate: Date; endDate: Date };
}

const GrowthChart = memo(({ dateRange }: Props) => {
  const { data, loading, error } = useQuery(GET_USER_GROWTH, {
    variables: {
      dateRange: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    },
  });

  const chartData = useMemo(() => {
    if (!data?.getUserGrowth) return [];
    return data.getUserGrowth.map((item: any) => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd'),
    }));
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
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
          <p className="text-destructive">Error loading user growth data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorTotal)"
              name="Total Users"
            />
            <Area
              type="monotone"
              dataKey="new"
              stroke="hsl(var(--chart-2))"
              fillOpacity={1}
              fill="url(#colorNew)"
              name="New Users"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

GrowthChart.displayName = 'GrowthChart';

export default GrowthChart;
