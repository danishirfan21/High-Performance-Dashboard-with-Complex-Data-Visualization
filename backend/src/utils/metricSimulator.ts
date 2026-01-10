import Metric from '../models/Metric';
import { pubsub, EVENTS } from '../graphql/subscriptions/pubsub';

/**
 * Simulates real-time metric updates for demonstration purposes
 * Publishes updates every 7-10 seconds
 */
export const startMetricSimulator = () => {
  console.log('🔄 Starting metric simulator for real-time demo');

  const metricTypes = ['revenue', 'users', 'conversion', 'growth'] as const;

  const updateMetric = async () => {
    try {
      // Random metric type
      const type = metricTypes[Math.floor(Math.random() * metricTypes.length)];

      // Get previous metric
      const previous = await Metric.findOne({ type }).sort({ timestamp: -1 });

      // Calculate new value with realistic changes
      const baseValue = previous?.value || getDefaultValue(type);
      const changePercent = (Math.random() - 0.5) * 10; // -5% to +5%
      const change = (baseValue * changePercent) / 100;
      const newValue = Math.max(0, baseValue + change);

      // Create new metric
      const metric = await Metric.create({
        type,
        value: newValue,
        previousValue: baseValue,
        change,
        changePercent,
        timestamp: new Date(),
      });

      // Publish to subscribers
      await pubsub.publish(EVENTS.METRIC_UPDATED, {
        metricUpdated: metric,
      });

      console.log(`📊 Metric updated: ${type} = ${newValue.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)`);
    } catch (error) {
      console.error('Error updating metric:', error);
    }
  };

  // Update metrics every 7-10 seconds
  setInterval(updateMetric, 7000 + Math.random() * 3000);

  // Initial update
  setTimeout(updateMetric, 2000);
};

function getDefaultValue(type: string): number {
  switch (type) {
    case 'revenue':
      return 50000;
    case 'users':
      return 1250;
    case 'conversion':
      return 3.5;
    case 'growth':
      return 12.5;
    default:
      return 1000;
  }
}
