import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import {
  mockUserA,
  mockUserB,
  mockFormA,
  mockForms,
  mockRecordings,
  mockHistoryRecords,
} from '@/data/mockData';
import SleepCard from '@/components/SleepCard';
import UserAvatar from '@/components/UserAvatar';
import TagBadge from '@/components/TagBadge';
import { formatTime } from '@/utils/date';
import { getSnoreLevelText } from '@/utils/analysis';
import styles from './index.module.scss';

type TabType = 'my' | 'partner' | 'recording' | 'history';

const ObservePage: React.FC = () => {
  const { state, dispatch } = useSleep();
  const [activeTab, setActiveTab] = useState<TabType>('my');

  useEffect(() => {
    console.log('[ObservePage] Component mounted, activeTab:', activeTab);
    if (!state.currentUser) {
      dispatch({ type: 'SET_USER', payload: mockUserA });
      dispatch({ type: 'SET_PARTNER', payload: mockUserB });
      dispatch({ type: 'SET_FORMS', payload: mockForms });
      dispatch({ type: 'SET_RECORDINGS', payload: mockRecordings });
    }
  }, [dispatch, state.currentUser, activeTab]);

  const handleTabChange = (tab: TabType) => {
    console.log('[ObservePage] Switch tab to:', tab);
    setActiveTab(tab);
  };

  const handleAddRecord = () => {
    console.log('[ObservePage] Navigate to form page');
    Taro.navigateTo({ url: '/pages/form/index' });
  };

  const handleFormClick = (formId: string) => {
    console.log('[ObservePage] Click form:', formId);
    Taro.showToast({
      title: '查看详情',
      icon: 'none',
    });
  };

  const handleRecordingClick = (recordingId: string) => {
    console.log('[ObservePage] Click recording:', recordingId);
    Taro.navigateTo({ url: '/pages/record/index?id=' + recordingId });
  };

  const myForms = mockForms.filter((f) => f.userId === mockUserA.id);
  const partnerObserveForms = mockForms.filter((f) => f.userId === mockUserB.id);

  const renderMyForms = () => {
    if (myForms.length === 0) {
      return (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📝</Text>
          <Text className={styles.emptyText}>暂无填报记录</Text>
        </View>
      );
    }

    return (
      <View className={styles.formList}>
        {myForms.map((form) => (
          <SleepCard
            key={form.id}
            form={form}
            userRole="userA"
            userName={mockUserA.name}
            userAvatar={mockUserA.avatar}
            onClick={() => handleFormClick(form.id)}
          />
        ))}
      </View>
    );
  };

  const renderPartnerObserve = () => {
    if (partnerObserveForms.length === 0) {
      return (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>👀</Text>
          <Text className={styles.emptyText}>暂无对方观察记录</Text>
        </View>
      );
    }

    return (
      <View>
        {partnerObserveForms.map((form) => (
          <View key={form.id} className={styles.observeCard}>
            <View className={styles.observeHeader}>
              <View className={styles.observeUser}>
                <UserAvatar
                  src={mockUserB.avatar}
                  name={mockUserB.name}
                  role="userB"
                  size="sm"
                />
                <View>
                  <Text className={styles.observeName}>{mockUserB.name} 的观察</Text>
                  <Text className={styles.observeDate}>{form.date}</Text>
                </View>
              </View>
              {form.observeSnoreLevel && form.observeSnoreLevel >= 4 && (
                <TagBadge text="需关注" type="warning" size="sm" />
              )}
            </View>

            {form.observeNotes && (
              <View className={styles.observeContent}>
                <Text className={styles.observeTitle}>观察备注</Text>
                <Text className={styles.observeText}>{form.observeNotes}</Text>
              </View>
            )}

            {form.observeAbnormalEvents && (
              <View className={styles.observeContent} style={{ marginTop: 16 }}>
                <Text className={styles.observeTitle}>异常事件</Text>
                <Text className={styles.observeText}>{form.observeAbnormalEvents}</Text>
              </View>
            )}

            <View className={styles.observeData}>
              <View className={styles.observeDataItem}>
                <Text className={styles.observeDataLabel}>观察鼾声</Text>
                <Text className={styles.observeDataValue}>
                  {form.observeSnoreLevel ? getSnoreLevelText(form.observeSnoreLevel) : '-'}
                </Text>
              </View>
              <View className={styles.observeDataItem}>
                <Text className={styles.observeDataLabel}>观察憋醒</Text>
                <Text className={styles.observeDataValue}>
                  {form.observeWakeUpChoked ?? 0} 次
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRecordings = () => {
    if (mockRecordings.length === 0) {
      return (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🎙️</Text>
          <Text className={styles.emptyText}>暂无录音记录</Text>
        </View>
      );
    }

    return (
      <View>
        {mockRecordings.map((recording) => (
          <View
            key={recording.id}
            className={styles.recordingCard}
            onClick={() => handleRecordingClick(recording.id)}
          >
            <View className={styles.recordingHeader}>
              <View className={styles.recordingInfo}>
                <View className={styles.recordingIcon}>
                  <Text>🎙️</Text>
                </View>
                <View className={styles.recordingMeta}>
                  <Text className={styles.recordingDate}>{recording.date}</Text>
                  <Text className={styles.recordingTime}>
                    {recording.startTime} - {recording.endTime || '进行中'}
                  </Text>
                </View>
              </View>
              <Text className={styles.recordingDuration}>
                {formatTime(recording.duration)}
              </Text>
            </View>

            {recording.markers.length > 0 && (
              <View className={styles.recordingMarkers}>
                {recording.markers.map((marker) => (
                  <View
                    key={marker.id}
                    className={`${styles.markerTag} ${
                      marker.type === 'pause' ? 'danger' : marker.type === 'snore' ? 'warning' : 'info'
                    }`}
                  >
                    <Text>{marker.time}</Text>
                    <Text>{marker.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderHistory = () => {
    if (mockHistoryRecords.length === 0) {
      return (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📊</Text>
          <Text className={styles.emptyText}>暂无历史记录</Text>
        </View>
      );
    }

    return (
      <View className={styles.historyList}>
        {mockHistoryRecords.map((record) => (
          <View key={record.id} className={styles.historyItem}>
            <View className={`${styles.historyDot} ${styles[record.type]}`}>
              <Text>{record.type === 'form' ? '📝' : record.type === 'recording' ? '🎙️' : '📊'}</Text>
            </View>
            <View className={styles.historyContent}>
              <Text className={styles.historyTitle}>{record.title}</Text>
              <Text className={styles.historyDesc}>{record.description}</Text>
              <Text className={styles.historyTime}>{record.date}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'my':
        return renderMyForms();
      case 'partner':
        return renderPartnerObserve();
      case 'recording':
        return renderRecordings();
      case 'history':
        return renderHistory();
      default:
        return null;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.tabBar}>
        <View
          className={`${styles.tabItem} ${activeTab === 'my' ? styles.active : ''}`}
          onClick={() => handleTabChange('my')}
        >
          <Text>我的填报</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'partner' ? styles.active : ''}`}
          onClick={() => handleTabChange('partner')}
        >
          <Text>对方观察</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'recording' ? styles.active : ''}`}
          onClick={() => handleTabChange('recording')}
        >
          <Text>录音管理</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => handleTabChange('history')}
        >
          <Text>历史记录</Text>
        </View>
      </View>

      <View className={styles.content}>
        {activeTab === 'my' && (
          <>
            <Text className={styles.sectionTitle}>数据概览</Text>
            <View className={styles.summaryCard}>
              <View className={styles.summaryGrid}>
                <View className={styles.summaryItem}>
                  <Text className={styles.summaryValue}>{myForms.length}</Text>
                  <Text className={styles.summaryLabel}>填报次数</Text>
                </View>
                <View className={styles.summaryItem}>
                  <Text className={styles.summaryValue}>{mockFormA.snoreLevel}</Text>
                  <Text className={styles.summaryLabel}>最新鼾声</Text>
                </View>
                <View className={styles.summaryItem}>
                  <Text className={styles.summaryValue}>{mockFormA.wakeUpChoked}</Text>
                  <Text className={styles.summaryLabel}>憋醒次数</Text>
                </View>
                <View className={styles.summaryItem}>
                  <Text className={styles.summaryValue}>{mockFormA.sleepQuality}</Text>
                  <Text className={styles.summaryLabel}>睡眠质量</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {renderContent()}
      </View>

      <View className={styles.fabBtn} onClick={handleAddRecord}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default ObservePage;
