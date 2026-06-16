import React from 'react';
import { View, Text } from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';

type ButtonType = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  text: string;
  type?: ButtonType;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  text,
  type = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <View
      className={classNames(
        styles.button,
        styles[type],
        styles[size],
        disabled && styles.disabled,
        className
      )}
      onClick={handleClick}
    >
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default GradientButton;
