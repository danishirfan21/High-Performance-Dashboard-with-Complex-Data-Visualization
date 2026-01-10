'use client';

import { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const GET_CATEGORY_SALES = gql`
  query GetCategorySales($dateRange: DateRangeInput!) {
    getCategorySales(dateRange: $dateRange) {
      category
      value
      count
      percentage
    }
  }
`;

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
];

interface Props {
  dateRange: { startDate: Date; endDate: Date };
}

const CategoryChart = memo(({ dateRange }: Props) => {
  const { data, loading, error } = useQuery(GET_CATEGORY_SALES, {
    variables: {
      dateRange: {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      },
    },
  });

  const chartData = useMemo(() => {
    return data?.getCategorySales || [];
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
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
          <p className="text-destructive">Error loading category data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }: any) =>
                `${category}: ${percentage.toFixed(1)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

CategoryChart.displayName = 'CategoryChart';

export default CategoryChart;
