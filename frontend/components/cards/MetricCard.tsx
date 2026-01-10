'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  changePercent?: number;
  icon?: React.ReactNode;
  format?: 'currency' | 'number' | 'percentage';
  loading?: boolean;
}

const MetricCard = memo(({
  title,
  value,
  change,
  changePercent,
  icon,
  format = 'number',
  loading = false
}: MetricCardProps) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
  };

  const isPositive = (changePercent ?? 0) >= 0;

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded mt-2 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <motion.div
            key={value}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold"
          >
            {formatValue(value)}
          </motion.div>
          {changePercent !== undefined && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {isPositive ? (
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span className={cn(isPositive ? 'text-green-500' : 'text-red-500')}>
                {Math.abs(changePercent).toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;
