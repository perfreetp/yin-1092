import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import {
  mockUserA,
  mockUserB,
  mockReport,
  mockReports,
} from '@/data/mockData';
import UserAvatar from '@/components/UserAvatar';
import DataChart from '@/components/DataChart';
import {
  getSnoreLevelText,
  getSleepPositionText,
  getEnergyLevelText,
} from '@/utils/analysis';
import { RiskTip, Suggestion, MergeReport } from '@/types/sleep';
import styles from './index.module.scss';

type TimeRange = 'today' | 'week' | 'month';

const ReportPage: React.FC = () => {
  const { state } = useSleep();
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  const currentUser = state.currentUser || mockUserA;
  const partner = state.partner || mockUserB;

  const allReports = useMemo<MergeReport[]>(() => {
    if (state.reports.length > 0) {
      return [...state.reports].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : new Date(a.date).getTime();
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : new Date(b.date).getTime();
        return bTime - aTime;
      });
    }
    return mockReports;
  }, [state.reports]);

  const latestReport: MergeReport = useMemo(() => {
    return allReports[0] || mockReport;
  }, [allReports]);

  const historyReports = useMemo<MergeReport[]>(() => {
    return allReports.slice(1);
  }, [allReports]);

  const formsReady = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayForms = state.forms.filter((f) => f.date === today);
    return {
      userA: todayForms.some((f) => f.userId === currentUser.id),
      userB: todayForms.some((f) => f.userId === partner.id),
    };
  }, [state.forms, currentUser.id, partner.id]);

  const handleTimeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  const handleViewDetail = (reportId: string) => {
    Taro.navigateTo({ url: '/pages/report-detail/index?id=' + reportId });
  };

  const handleViewAllSuggestions = () => {
    Taro.switchTab({ url: '/pages/advice/index' });
  };

  const handleGoFillForm = () => {
    Taro.navigateTo({ url: '/pages/form/index' });
  };

  const riskLevelText = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
  };

  const highPrioritySuggestions = latestReport.suggestions
    .filter((s) => s.priority === 'high')
    .slice(0, 3);

  const renderRiskIcon = (level: string) => {
    switch (level) {
      case 'danger':
        return '🚨';
      case 'warning':
        return '⚡';
      case 'info':
        return '💡';
      default:
        return 'ℹ️';
    }
  };

  const renderSuggestionIcon = (category: string) => {
    switch (category) {
      case 'medical':
        return '🏥';
      case 'lifestyle':
        return '🏃';
      case 'environment':
        return '🏠';
      case 'routine':
        return '📅';
      default:
        return '💡';
    }
  };

  const getSourceText = (source: string) => {
    switch (source) {
      case 'userA':
        return `来自 ${currentUser.name}`;
      case 'userB':
        return `来自 ${partner.name}`;
      case 'both':
        return '双方数据';
      case 'analysis':
        return '系统分析';
      default:
        return '';
    }
  };

  const chartData = [
    { label: '鼾声', value: latestReport.userAForm.snoreLevel, maxValue: 5, color: '#4A90D9' },
    { label: '憋醒', value: Math.min(latestReport.userAForm.wakeUpChoked, 5), maxValue: 5, color: '#4A90D9' },
    { label: '起夜', value: Math.min(latestReport.userAForm.nightWakeCount, 5), maxValue: 5, color: '#4A90D9' },
    { label: '质量', value: latestReport.userAForm.sleepQuality, maxValue: 5, color: '#4A90D9' },
    { label: '精神', value: latestReport.userAForm.energyLevel, maxValue: 5, color: '#4A90D9' },
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.timeTabs}>
        <View
          className={`${styles.timeTab} ${timeRange === 'today' ? styles.active : ''}`}
          onClick={() => handleTimeChange('today')}
        >
          <Text>今日</Text>
        </View>
        <View
          className={`${styles.timeTab} ${timeRange === 'week' ? styles.active : ''}`}
          onClick={() => handleTimeChange('week')}
        >
          <Text>本周</Text>
        </View>
        <View
          className={`${styles.timeTab} ${timeRange === 'month' ? styles.active : ''}`}
          onClick={() => handleTimeChange('month')}
        >
          <Text>本月</Text>
        </View>
      </View>

      <View className={styles.content}>
        {(!formsReady.userA || !formsReady.userB) && (
          <View className={styles.pendingBanner}>
            <Text className={styles.pendingIcon}>⏳</Text>
            <View className={styles.pendingContent}>
              <Text className={styles.pendingTitle}>等待双方完成今日填报</Text>
              <Text className={styles.pendingDesc}>
                {!formsReady.userA && `${currentUser.name} 还未填写 · `}
                {!formsReady.userB && `${partner.name} 还未填写`}
              </Text>
            </View>
            <View className={styles.pendingBtn} onClick={handleGoFillForm}>
              去填写
            </View>
          </View>
        )}

        <View className={styles.latestReport} onClick={() => handleViewDetail(latestReport.id)}>
          <View className={styles.reportHeader}>
            <View className={styles.reportScoreSection}>
              <Text className={styles.reportDate}>{latestReport.date} 睡眠报告</Text>
              <View className={styles.scoreRow}>
                <View className={styles.scoreCircle}>
                  <Text className={styles.scoreValue}>{latestReport.analysis.overallScore}</Text>
                </View>
                <View>
                  <Text className={styles.scoreLabel}>综合睡眠评分</Text>
                  <Text className={styles.scoreDesc}>基于双人双视角分析</Text>
                </View>
              </View>
            </View>
            <View
              className={`${styles.riskBadge} ${styles[latestReport.analysis.riskLevel]}`}
            >
              <Text>{riskLevelText[latestReport.analysis.riskLevel]}</Text>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>双视角对比</Text>
            <View className={styles.comparisonGrid}>
              <View className={`${styles.comparisonColumn} ${styles.userA}`}>
                <View className={styles.columnHeader}>
                  <UserAvatar
                    src={currentUser.avatar}
                    name={currentUser.name}
                    role={currentUser.role || 'userA'}
                    size="sm"
                  />
                  <Text className={styles.columnName}>{currentUser.name}</Text>
                  <Text className={styles.columnRole}>自我</Text>
                </View>
                <View className={styles.comparisonData}>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>鼾声</Text>
                    <Text className={styles.comparisonValue}>
                      {getSnoreLevelText(latestReport.userAForm.snoreLevel)}
                    </Text>
                  </View>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>憋醒</Text>
                    <Text className={styles.comparisonValue}>
                      {latestReport.userAForm.wakeUpChoked} 次
                    </Text>
                  </View>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>睡姿</Text>
                    <Text className={styles.comparisonValue}>
                      {getSleepPositionText(latestReport.userAForm.sleepPosition)}
                    </Text>
                  </View>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>起夜</Text>
                    <Text className={styles.comparisonValue}>
                      {latestReport.userAForm.nightWakeCount} 次
                    </Text>
                  </View>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>精神</Text>
                    <Text className={styles.comparisonValue}>
                      {getEnergyLevelText(latestReport.userAForm.energyLevel)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className={`${styles.comparisonColumn} ${styles.userB}`}>
                <View className={styles.columnHeader}>
                  <UserAvatar
                    src={partner.avatar}
                    name={partner.name}
                    role={partner.role || 'userB'}
                    size="sm"
                  />
                  <Text className={styles.columnName}>{partner.name}</Text>
                  <Text className={styles.columnRole}>观察</Text>
                </View>
                <View className={styles.comparisonData}>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>观察鼾声</Text>
                    <Text className={styles.comparisonValue}>
                      {latestReport.userBForm.observeSnoreLevel
                        ? getSnoreLevelText(latestReport.userBForm.observeSnoreLevel)
                        : '-'}
                    </Text>
                  </View>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>观察憋醒</Text>
                    <Text className={styles.comparisonValue}>
                      {latestReport.userBForm.observeWakeUpChoked ?? 0} 次
                    </Text>
                  </View>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>自我鼾声</Text>
                    <Text className={styles.comparisonValue}>
                      {getSnoreLevelText(latestReport.userBForm.snoreLevel)}
                    </Text>
                  </View>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>起夜</Text>
                    <Text className={styles.comparisonValue}>
                      {latestReport.userBForm.nightWakeCount} 次
                    </Text>
                  </View>
                  <View className={styles.comparisonItem}>
                    <Text className={styles.comparisonLabel}>精神</Text>
                    <Text className={styles.comparisonValue}>
                      {getEnergyLevelText(latestReport.userBForm.energyLevel)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>数据趋势</Text>
            <DataChart title={`${currentUser.name}的睡眠指标（满分5分）`} dataPoints={chartData} />
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>差异分析</Text>
            <View className={styles.differenceCard}>
              <Text className={styles.differenceTitle}>
                <Text className={styles.differenceIcon}>🔍</Text>
                认知差异提示
              </Text>
              <Text className={styles.differenceText}>
                {latestReport.analysis.differences.notes}
              </Text>
              <View className={styles.differenceStats}>
                <View className={styles.differenceStat}>
                  <Text className={styles.differenceStatLabel}>鼾声认知差异</Text>
                  <Text className={styles.differenceStatValue}>
                    {latestReport.analysis.differences.snoreDiff} 级
                  </Text>
                </View>
                <View className={styles.differenceStat}>
                  <Text className={styles.differenceStatLabel}>憋醒认知差异</Text>
                  <Text className={styles.differenceStatValue}>
                    {latestReport.analysis.differences.wakeDiff} 次
                  </Text>
                </View>
                <View className={styles.differenceStat}>
                  <Text className={styles.differenceStatLabel}>数据一致性</Text>
                  <Text className={styles.differenceStatValue}>
                    {latestReport.analysis.snoreConsistency}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>风险提示</Text>
            <View className={styles.risksList}>
              {latestReport.risks.map((risk: RiskTip) => (
                <View
                  key={risk.id}
                  className={`${styles.riskItem} ${styles[risk.level]}`}
                >
                  <View className={`${styles.riskIcon} ${styles[risk.level]}`}>
                    <Text>{renderRiskIcon(risk.level)}</Text>
                  </View>
                  <View className={styles.riskContent}>
                    <Text className={styles.riskTitle}>{risk.title}</Text>
                    <Text className={styles.riskDesc}>{risk.description}</Text>
                    <Text className={styles.riskSource}>{getSourceText(risk.source)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>关键建议</Text>
            <View className={styles.suggestionsPreview}>
              {highPrioritySuggestions.map((suggestion: Suggestion) => (
                <View key={suggestion.id} className={styles.suggestionItem}>
                  <View
                    className={`${styles.suggestionIcon} ${styles[suggestion.priority]}`}
                  >
                    <Text>{renderSuggestionIcon(suggestion.category)}</Text>
                  </View>
                  <View className={styles.suggestionContent}>
                    <Text className={styles.suggestionTitle}>{suggestion.title}</Text>
                    <Text className={styles.suggestionDesc}>{suggestion.description}</Text>
                  </View>
                  <View className={`${styles.priorityBadge} ${styles[suggestion.priority]}`}>
                    <Text>{suggestion.priority === 'high' ? '高优' : suggestion.priority === 'medium' ? '中优' : '低优'}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View className={styles.viewAllBtn} onClick={handleViewAllSuggestions}>
              <Text>查看全部建议</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>历史报告</Text>
          <View className={styles.historyReports}>
            {historyReports.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📊</Text>
                <Text className={styles.emptyText}>暂无历史报告</Text>
              </View>
            ) : (
              historyReports.map((report) => (
                <View
                  key={report.id}
                  className={styles.historyCard}
                  onClick={() => handleViewDetail(report.id)}
                >
                  <View className={styles.historyScore}>
                    <Text>{report.analysis.overallScore}</Text>
                  </View>
                  <View className={styles.historyInfo}>
                    <Text className={styles.historyDate}>{report.date}</Text>
                    <Text className={styles.historyDesc}>
                      {riskLevelText[report.analysis.riskLevel]} · {report.risks.length} 个风险提示
                    </Text>
                  </View>
                  <Text style={{ color: '#86909C' }}>›</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
