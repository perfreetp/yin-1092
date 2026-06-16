import React from 'react';
import { View, Text } from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';

type TagType = 'blue' | 'pink' | 'green' | 'warning' | 'error' | 'default';

interface TagBadgeProps {
  text: string;
  type?: TagType;
  size?: 'sm' | 'md';
  className?: string;
}

const TagBadge: React.FC<TagBadgeProps> = ({
  text,
  type = 'default',
  size = 'md',
  className,
}) => {
  return (
    <View
      className={classNames(
        styles.tag,
        styles[type],
        styles[size],
        className
      )}
    >
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default TagBadge;
