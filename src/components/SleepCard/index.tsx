import React from 'react';
import { View, Text } from '@tarojs/components';
import classNames from 'classnames';
import { SleepForm } from '@/types/sleep';
import { getSnoreLevelText, getSleepPositionText } from '@/utils/analysis';
import { getRelativeDate } from '@/utils/date';
import UserAvatar from '@/components/UserAvatar';
import TagBadge from '@/components/TagBadge';
import styles from './index.module.scss';

interface SleepCardProps {
  form: SleepForm;
  userRole: 'userA' | 'userB';
  userName: string;
  userAvatar: string;
  onClick?: () => void;
  className?: string;
}

const SleepCard: React.FC<SleepCardProps> = ({
  form,
  userRole,
  userName,
  userAvatar,
  onClick,
  className,
}) => {
  const hasRisk = form.snoreLevel >= 4 || form.wakeUpChoked >= 2;

  return (
    <View
      className={classNames(styles.card, className)}
      onClick={onClick}
    >
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <UserAvatar
            src={userAvatar}
            name={userName}
            role={userRole}
            size="sm"
          />
          <View className={styles.userMeta}>
            <Text className={styles.userName}>{userName}</Text>
            <Text className={styles.date}>{getRelativeDate(form.date)}</Text>
          </View>
        </View>
        {hasRisk && (
          <TagBadge
            text={form.wakeUpChoked >= 2 ? '高风险' : '需关注'}
            type={form.wakeUpChoked >= 2 ? 'error' : 'warning'}
            size="sm"
          />
        )}
      </View>

      <View className={styles.dataGrid}>
        <View className={styles.dataItem}>
          <Text className={styles.dataLabel}>鼾声</Text>
          <Text className={styles.dataValue}>{getSnoreLevelText(form.snoreLevel)}</Text>
          <Text className={styles.dataSub}>{form.snoreLevel}/5 级</Text>
        </View>
        <View className={styles.dataItem}>
          <Text className={styles.dataLabel}>憋醒</Text>
          <Text className={styles.dataValue}>{form.wakeUpChoked} 次</Text>
          <Text className={styles.dataSub}>夜间</Text>
        </View>
        <View className={styles.dataItem}>
          <Text className={styles.dataLabel}>睡姿</Text>
          <Text className={styles.dataValue}>{getSleepPositionText(form.sleepPosition)}</Text>
          <Text className={styles.dataSub}>主要</Text>
        </View>
        <View className={styles.dataItem}>
          <Text className={styles.dataLabel}>质量</Text>
          <Text className={styles.dataValue}>{form.sleepQuality} 分</Text>
          <Text className={styles.dataSub}>自评</Text>
        </View>
      </View>

      {form.selfNotes && (
        <View className={styles.notes}>
          <Text className={styles.notesText}>{form.selfNotes}</Text>
        </View>
      )}
    </View>
  );
};

export default SleepCard;
