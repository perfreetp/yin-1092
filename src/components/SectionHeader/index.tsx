import React from 'react';
import { View, Text } from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showMore?: boolean;
  onMore?: () => void;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  showMore = false,
  onMore,
  className,
}) => {
  return (
    <View className={classNames(styles.header, className)}>
      <View className={styles.left}>
        <Text className={styles.title}>{title}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
      {showMore && (
        <View className={styles.more} onClick={onMore}>
          <Text className={styles.moreText}>查看全部</Text>
        </View>
      )}
    </View>
  );
};

export default SectionHeader;
