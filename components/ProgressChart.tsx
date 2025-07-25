import { Progress } from '@/types';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

interface ProgressChartProps {
  data: Progress[];
  type: 'weight' | 'bodyFat' | 'muscleMass';
  title: string;
  unit: string;
  color: string;
}

const { width } = Dimensions.get('window');
const chartWidth = width - 80;
const chartHeight = 120;

export default function ProgressChart({ data, type, title, unit, color }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Filter data points that have the required value
  const filteredData = data
    .filter(item => item[type] !== undefined && item[type] !== null)
    .reverse(); // Reverse to show oldest to newest

  if (filteredData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No {title.toLowerCase()} data</Text>
        </View>
      </View>
    );
  }

  const values = filteredData.map(item => item[type] as number);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1; // Avoid division by zero

  const getLatestValue = () => {
    return filteredData[filteredData.length - 1]?.[type];
  };

  const getTrend = () => {
    if (filteredData.length < 2) return null;
    const latest = filteredData[filteredData.length - 1][type] as number;
    const previous = filteredData[filteredData.length - 2][type] as number;
    const change = latest - previous;
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    };
  };

  const renderChart = () => {
    if (filteredData.length === 1) {
      // Single data point
      return (
        <View style={styles.singlePoint}>
          <View style={[styles.point, { backgroundColor: color }]} />
          <Text style={styles.singlePointText}>
            {filteredData[0][type]} {unit}
          </Text>
        </View>
      );
    }

    const points = filteredData.map((item, index) => {
      const value = item[type] as number;
      const x = (index / (filteredData.length - 1)) * (chartWidth - 20);
      const y = chartHeight - 40 - ((value - minValue) / range) * (chartHeight - 60);
      
      return { x, y, value };
    });

    return (
      <View style={styles.chartContainer}>
        <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
          {/* Grid lines */}
          <View style={styles.gridContainer}>
            {[0, 1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[
                  styles.gridLine,
                  { top: (i / 4) * (chartHeight - 40) + 20 }
                ]}
              />
            ))}
          </View>

          {/* Data points and connecting lines */}
          <View style={styles.pointsContainer}>
            {points.map((point, index) => (
              <React.Fragment key={index}>
                {/* Connecting line to next point */}
                {index < points.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      {
                        left: point.x + 10,
                        top: point.y + 10,
                        width: Math.sqrt(
                          Math.pow(points[index + 1].x - point.x, 2) +
                          Math.pow(points[index + 1].y - point.y, 2)
                        ),
                        transform: [{
                          rotate: `${Math.atan2(
                            points[index + 1].y - point.y,
                            points[index + 1].x - point.x
                          )}rad`
                        }],
                        backgroundColor: color,
                      }
                    ]}
                  />
                )}
                
                {/* Data point */}
                <View
                  style={[
                    styles.dataPoint,
                    {
                      left: point.x + 5,
                      top: point.y + 5,
                      backgroundColor: color,
                    }
                  ]}
                />
              </React.Fragment>
            ))}
          </View>

          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            <Text style={styles.axisLabel}>{maxValue.toFixed(1)}</Text>
            <Text style={styles.axisLabel}>{((minValue + maxValue) / 2).toFixed(1)}</Text>
            <Text style={styles.axisLabel}>{minValue.toFixed(1)}</Text>
          </View>
        </View>

        {/* X-axis labels */}
        <View style={styles.xAxisLabels}>
          <Text style={styles.axisLabel}>
            {filteredData[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <Text style={styles.axisLabel}>
            {filteredData[filteredData.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>
    );
  };

  const trend = getTrend();
  const latestValue = getLatestValue();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.currentValue, { color }]}>
            {latestValue} {unit}
          </Text>
          {trend && (
            <Text style={[
              styles.trendText,
              trend.direction === 'up' ? styles.trendUp : 
              trend.direction === 'down' ? styles.trendDown : styles.trendSame
            ]}>
              {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} 
              {trend.value.toFixed(1)}
            </Text>
          )}
        </View>
      </View>
      {renderChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  trendUp: {
    color: '#ff6b6b',
  },
  trendDown: {
    color: '#51cf66',
  },
  trendSame: {
    color: '#666',
  },
  emptyChart: {
    height: chartHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  singlePoint: {
    height: chartHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  point: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  singlePointText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartArea: {
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  pointsContainer: {
    position: 'relative',
    left: 10,
    top: 10,
  },
  line: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 15,
    bottom: 25,
    justifyContent: 'space-between',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: chartWidth - 40,
    marginTop: 8,
    paddingHorizontal: 20,
  },
  axisLabel: {
    fontSize: 10,
    color: '#666',
  },
});
