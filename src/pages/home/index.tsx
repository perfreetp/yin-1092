import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import {
  mockUserA,
  mockUserB,
  mockFormA,
  mockFormB,
  mockReport,
  mockHistoryRecords,
} from '@/data/mockData';
import UserAvatar from '@/components/UserAvatar';
import TagBadge from '@/components/TagBadge';
import { getSnoreLevelText } from '@/utils/analysis';
import { formatDate } from '@/utils/date';
import { RiskTip } from '@/types/sleep';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { state, dispatch } = useSleep();
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    console.log('[HomePage] Component mounted');
    setTodayDate(formatDate(new Date(), 'YYYY年MM月DD日'));

    if (!state.currentUser) {
      dispatch({ type: 'SET_USER', payload: mockUserA });
      dispatch({ type: 'SET_PARTNER', payload: mockUserB });
      dispatch({ type: 'SET_FORMS', payload: [mockFormA, mockFormB] });
      dispatch({ type: 'SET_REPORTS', payload: [mockReport] });
    }
  }, [dispatch, state.currentUser]);

  const handleStartReport = () => {
    console.log('[HomePage] Navigate to form page');
    Taro.navigateTo({ url: '/pages/form/index' });
  };

  const handleStartRecord = () => {
    console.log('[HomePage] Navigate to record page');
    Taro.navigateTo({ url: '/pages/record/index' });
  };

  const handleViewReport = () => {
    console.log('[HomePage] Navigate to report detail');
    Taro.navigateTo({ url: '/pages/report-detail/index?id=' + mockReport.id });
  };

  const handlePullDownRefresh = () => {
    console.log('[HomePage] Pull down refresh');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  useEffect(() => {
    const taro = Taro as any;
    if (typeof taro.onPullDownRefresh === 'function') {
      taro.onPullDownRefresh(handlePullDownRefresh);
      return () => {
        if (typeof taro.offPullDownRefresh === 'function') {
          taro.offPullDownRefresh(handlePullDownRefresh);
        }
      };
    }
  }, []);

  const risks: RiskTip[] = mockReport.risks.slice(0, 3);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.dateText}>{todayDate}</Text>
          <View className={styles.bindStatus}>
            <View className={styles.statusDot} />
            <Text className={styles.statusText}>已绑定</Text>
          </View>
        </View>

        <View className={styles.usersRow}>
          <View className={styles.userCard}>
            <UserAvatar
              src={mockUserA.avatar}
              name={mockUserA.name}
              role="userA"
              size="lg"
            />
            <View className={styles.userInfo}>
              <Text className={styles.userName}>{mockUserA.name}</Text>
              <Text className={styles.userStatus}>已填报 ✓</Text>
            </View>
          </View>

          <View className={styles.connectLine}>
            <Text className={styles.heartIcon}>💑</Text>
            <Text className={styles.bindText}>共眠伴侣</Text>
          </View>

          <View className={styles.userCard}>
            <UserAvatar
              src={mockUserB.avatar}
              name={mockUserB.name}
              role="userB"
              size="lg"
            />
            <View className={styles.userInfo}>
              <Text className={styles.userName}>{mockUserB.name}</Text>
              <Text className={styles.userStatus}>已填报 ✓</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.quickActions}>
          <View className={styles.quickBtn} onClick={handleStartReport}>
            <View className={`${styles.quickBtnIcon} ${styles.primary}`}>
              <Text>📝</Text>
            </View>
            <Text className={styles.quickBtnText}>立即填报</Text>
            <Text className={styles.quickBtnDesc}>记录昨晚睡眠情况</Text>
          </View>
          <View className={styles.quickBtn} onClick={handleStartRecord}>
            <View className={`${styles.quickBtnIcon} ${styles.secondary}`}>
              <Text>🎙️</Text>
            </View>
            <Text className={styles.quickBtnText}>夜间录音</Text>
            <Text className={styles.quickBtnDesc}>记录鼾声与异常</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>今日概览</Text>
          </View>

          <View className={styles.todayOverview}>
            <View className={styles.overviewGrid}>
              <View className={`${styles.overviewColumn} ${styles.userA}`}>
                <View className={styles.overviewHeader}>
                  <Text className={styles.overviewName}>{mockUserA.name}</Text>
                  <Text className={`${styles.overviewStatus} ${styles.done}`}>已完成</Text>
                </View>
                <View className={styles.overviewData}>
                  <View className={styles.overviewItem}>
                    <Text className={styles.overviewLabel}>鼾声</Text>
                    <Text className={styles.overviewValue}>{getSnoreLevelText(mockFormA.snoreLevel)}</Text>
                  </View>
                  <View className={styles.overviewItem}>
                    <Text className={styles.overviewLabel}>憋醒</Text>
                    <Text className={styles.overviewValue}>{mockFormA.wakeUpChoked} 次</Text>
                  </View>
                  <View className={styles.overviewItem}>
                    <Text className={styles.overviewLabel}>睡眠质量</Text>
                    <Text className={styles.overviewValue}>{mockFormA.sleepQuality} 分</Text>
                  </View>
                </View>
              </View>

              <View className={`${styles.overviewColumn} ${styles.userB}`}>
                <View className={styles.overviewHeader}>
                  <Text className={styles.overviewName}>{mockUserB.name}</Text>
                  <Text className={`${styles.overviewStatus} ${styles.done}`}>已完成</Text>
                </View>
                <View className={styles.overviewData}>
                  <View className={styles.overviewItem}>
                    <Text className={styles.overviewLabel}>鼾声</Text>
                    <Text className={styles.overviewValue}>{getSnoreLevelText(mockFormB.snoreLevel)}</Text>
                  </View>
                  <View className={styles.overviewItem}>
                    <Text className={styles.overviewLabel}>憋醒</Text>
                    <Text className={styles.overviewValue}>{mockFormB.wakeUpChoked} 次</Text>
                  </View>
                  <View className={styles.overviewItem}>
                    <Text className={styles.overviewLabel}>睡眠质量</Text>
                    <Text className={styles.overviewValue}>{mockFormB.sleepQuality} 分</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>最新报告</Text>
            <Text className={styles.sectionMore} onClick={handleViewReport}>查看详情</Text>
          </View>

          <View className={styles.reportCard} onClick={handleViewReport}>
            <View className={styles.reportHeader}>
              <View className={styles.reportScore}>
                <View className={styles.scoreCircle}>
                  <Text className={styles.scoreValue}>{mockReport.analysis.overallScore}</Text>
                </View>
                <View>
                  <Text className={styles.reportTitle}>综合睡眠评分</Text>
                  <Text className={styles.scoreLabel}>基于双人数据分析</Text>
                </View>
              </View>
              <TagBadge
                text={mockReport.analysis.riskLevel === 'high' ? '高风险' : mockReport.analysis.riskLevel === 'medium' ? '中风险' : '低风险'}
                type={mockReport.analysis.riskLevel === 'high' ? 'error' : mockReport.analysis.riskLevel === 'medium' ? 'warning' : 'green'}
              />
            </View>

            <View className={styles.reportMetrics}>
              <View className={styles.metricItem}>
                <Text className={styles.metricValue}>{mockReport.analysis.snoreConsistency}%</Text>
                <Text className={styles.metricLabel}>数据一致性</Text>
              </View>
              <View className={styles.metricItem}>
                <Text className={styles.metricValue}>{mockReport.analysis.totalWakeEvents}</Text>
                <Text className={styles.metricLabel}>醒觉事件</Text>
              </View>
              <View className={styles.metricItem}>
                <Text className={styles.metricValue}>{mockReport.analysis.abnormalEventsCount}</Text>
                <Text className={styles.metricLabel}>异常标记</Text>
              </View>
              <View className={styles.metricItem}>
                <Text className={styles.metricValue}>{mockReport.risks.length}</Text>
                <Text className={styles.metricLabel}>风险提示</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>健康提示</Text>
          </View>

          <View className={styles.riskList}>
            {risks.map((risk) => (
              <View key={risk.id} className={styles.riskItem}>
                <View className={`${styles.riskIcon} ${risk.level}`}>
                  <Text>{risk.level === 'danger' ? '⚠️' : risk.level === 'warning' ? '⚡' : '💡'}</Text>
                </View>
                <View className={styles.riskContent}>
                  <Text className={styles.riskTitle}>{risk.title}</Text>
                  <Text className={styles.riskDesc}>{risk.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>最近动态</Text>
            <Text className={styles.sectionMore}>查看全部</Text>
          </View>

          <View className={styles.timeline}>
            {mockHistoryRecords.slice(0, 4).map((record) => (
              <View key={record.id} className={styles.timelineItem}>
                <View className={`${styles.timelineDot} ${record.hasRisk ? 'hasRisk' : 'normal'}`}>
                  <Text>{record.type === 'report' ? '📊' : record.type === 'form' ? '📝' : '🎙️'}</Text>
                </View>
                <View className={styles.timelineContent}>
                  <Text className={styles.timelineTitle}>{record.title}</Text>
                  <Text className={styles.timelineDesc}>{record.description}</Text>
                  <Text className={styles.timelineTime}>{record.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
