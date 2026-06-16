import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import classNames from 'classnames';
import styles from './index.module.scss';

interface UserAvatarProps {
  src: string;
  name: string;
  role?: 'userA' | 'userB';
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  role = 'userA',
  size = 'md',
  showName = false,
  className,
}) => {
  return (
    <View className={classNames(styles.avatarWrapper, className)}>
      <View
        className={classNames(styles.avatarContainer, styles[size], styles[role])}
      >
        <Image
          className={styles.avatarImage}
          src={src}
          mode="aspectFill"
          onError={(e) => {
            console.error('[UserAvatar] Image load error:', e);
          }}
        />
      </View>
      {showName && <Text className={styles.userName}>{name}</Text>}
    </View>
  );
};

export default UserAvatar;
