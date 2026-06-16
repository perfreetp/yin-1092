import React from 'react';
import { View, Text } from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';

interface DataPoint {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

interface DataChartProps {
  title: string;
  dataPoints: DataPoint[];
  className?: string;
}

const DataChart: React.FC<DataChartProps> = ({
  title,
  dataPoints,
  className,
}) => {
  return (
    <View className={classNames(styles.chart, className)}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.bars}>
        {dataPoints.map((point, index) => {
          const percentage = Math.min((point.value / point.maxValue) * 100, 100);
          const barColor = point.color || '#4A90D9';
          return (
            <View key={index} className={styles.barWrapper}>
              <View className={styles.barContainer}>
                <View
                  className={styles.barFill}
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: barColor,
                  }}
                />
              </View>
              <Text className={styles.barValue}>{point.value}</Text>
              <Text className={styles.barLabel}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default DataChart;
