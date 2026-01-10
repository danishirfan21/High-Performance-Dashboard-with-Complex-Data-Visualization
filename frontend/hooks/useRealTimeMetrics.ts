import { useEffect } from 'react';
import { useSubscription, gql } from '@apollo/client';
import { toast } from 'sonner';

const METRIC_UPDATED_SUBSCRIPTION = gql`
  subscription MetricUpdated($type: MetricType) {
    metricUpdated(type: $type) {
      id
      type
      value
      previousValue
      change
      changePercent
      timestamp
    }
  }
`;

interface MetricData {
  id: string;
  type: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  timestamp: string;
}

export function useRealTimeMetrics(type?: string, onUpdate?: (data: MetricData) => void) {
  const { data, loading, error } = useSubscription(METRIC_UPDATED_SUBSCRIPTION, {
    variables: type ? { type: type.toUpperCase() } : {},
    skip: typeof window === 'undefined',
  });

  useEffect(() => {
    if (data?.metricUpdated) {
      const metric = data.metricUpdated as MetricData;

      // Show toast notification
      const changeSign = (metric.changePercent ?? 0) > 0 ? '+' : '';
      toast.success(
        `${metric.type.charAt(0).toUpperCase() + metric.type.slice(1)} Updated`,
        {
          description: `New value: ${metric.value.toFixed(2)} (${changeSign}${(metric.changePercent ?? 0).toFixed(1)}%)`,
          duration: 3000,
        }
      );

      // Call callback if provided
      onUpdate?.(metric);
    }
  }, [data, onUpdate]);

  return { data: data?.metricUpdated, loading, error };
}
