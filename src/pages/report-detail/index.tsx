import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import {
  mockReport,
  mockUserA,
  mockUserB,
  mockFormA,
  mockFormB,
} from '@/data/mockData';
import { formatDate, generateId } from '@/utils/date';
import {
  getSnoreLevelText,
  getSleepPositionText,
  getEnergyLevelText,
} from '@/utils/analysis';
import { MergeReport, Suggestion, RetestReminder } from '@/types/sleep';
import styles from './index.module.scss';

const ReportDetailPage: React.FC = () => {
  const { state, dispatch } = useSleep();
  const [suggestions, setSuggestions] = useState<Suggestion[]>(
    mockReport.suggestions || []
  );

  const report = useMemo((): MergeReport => {
    return state.reports.length > 0 ? state.reports[0] : mockReport;
  }, [state.reports]);

  const userA = state.currentUser || mockUserA;
  const userB = state.partner || mockUserB;
  const formA = report.userAForm || mockFormA;
  const formB = report.userBForm || mockFormB;

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { text: '睡眠状况良好', color: '#52C41A' };
    if (score >= 60) return { text: '需要关注', color: '#FAAD14' };
    return { text: '建议就医检查', color: '#FF4D4F' };
  };

  const scoreLevel = getScoreLevel(report.analysis.overallScore);

  const handleToggleSuggestion = (id: string) => {
    const updated = suggestions.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    setSuggestions(updated);
    dispatch({ type: 'SET_SUGGESTIONS', payload: updated });
  };

  const handleShare = () => {
    console.log('[ReportDetail] Sharing report');
    Taro.showActionSheet({
      itemList: ['分享给伴侣', '分享给家人', '分享给医生', '导出PDF'],
      success: (res) => {
        const actions = [
          '已分享给伴侣',
          '已分享给家人',
          '已发送给医生',
          '开始导出PDF...',
        ];
        Taro.showToast({
          title: actions[res.tapIndex],
          icon: 'success',
        });
      },
    });
  };

  const handleRetest = () => {
    console.log('[ReportDetail] Starting retest');
    Taro.showModal({
      title: '设置复测提醒',
      content: '建议在1-2周后进行复测，跟踪睡眠变化情况。是否为你创建一条复测提醒？',
      success: (res) => {
        if (res.confirm) {
          const retestDate = new Date();
          retestDate.setDate(retestDate.getDate() + 14);
          const reminder: RetestReminder = {
            id: generateId(),
            title: '睡眠复测提醒',
            description: `根据 ${report.date} 的报告结果，建议今天重新进行睡眠观察，跟踪睡眠改善情况`,
            date: formatDate(retestDate, 'YYYY-MM-DD'),
            time: '09:00',
            enabled: true,
            repeat: 'once',
            createdAt: new Date().toISOString(),
          };
          dispatch({ type: 'ADD_REMINDER', payload: reminder });

          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem('advice_active_tab', 'reminder');
              window.localStorage.setItem('advice_new_reminder_id', reminder.id);
            }
          } catch (e) {}

          Taro.showToast({
            title: '已创建复测提醒',
            icon: 'success',
          });
          setTimeout(() => {
            Taro.switchTab({ url: '/pages/advice/index' });
          }, 800);
        }
      },
    });
  };

  const handleViewRecording = () => {
    Taro.navigateTo({ url: '/pages/record/index' });
  };

  const handleGoToAdvice = () => {
    Taro.switchTab({ url: '/pages/advice/index' });
  };

  const getSourceText = (source: string) => {
    switch (source) {
      case 'userA':
        return `来自 ${userA.name} 的报告`;
      case 'userB':
        return `来自 ${userB.name} 的报告`;
      case 'both':
        return '双方共同观察';
      case 'analysis':
        return '系统分析结果';
      default:
        return '';
    }
  };

  const historyData = [
    { date: '12/10', scoreA: 75, scoreB: 82 },
    { date: '12/11', scoreA: 72, scoreB: 78 },
    { date: '12/12', scoreA: 68, scoreB: 75 },
    { date: '12/13', scoreA: 70, scoreB: 80 },
    { date: '今天', scoreA: report.analysis.overallScore, scoreB: report.analysis.overallScore - 5 },
  ];

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.date}>
          {formatDate(report.date, 'YYYY年MM月DD日')}
        </Text>
        <Text className={styles.title}>双人睡眠观察报告</Text>
        <View className={styles.scoreCard}>
          <Text className={styles.scoreLabel}>综合睡眠评分</Text>
          <Text className={styles.scoreValue}>{report.analysis.overallScore}</Text>
          <Text
            className={styles.scoreLevel}
            style={{ color: '#fff' }}
          >
            {scoreLevel.text}
          </Text>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <View className={styles.icon}>👥</View>
            报告参与人
          </Text>
          <View className={styles.userCompare}>
            <View className={`${styles.userCard} ${styles.userA}`}>
              <View className={`${styles.avatar} ${styles.userA}`}>
                {userA.avatar}
              </View>
              <Text className={styles.name}>{userA.name}</Text>
              <Text className={styles.role}>{userA.role === 'userA' ? '用户A' : '用户B'}</Text>
            </View>
            <View className={`${styles.userCard} ${styles.userB}`}>
              <View className={`${styles.avatar} ${styles.userB}`}>
                {userB.avatar}
              </View>
              <Text className={styles.name}>{userB.name}</Text>
              <Text className={styles.role}>{userB.role === 'userA' ? '用户A' : '用户B'}</Text>
            </View>
          </View>

          <View className={styles.dataGrid}>
            <View className={`${styles.dataItem} ${styles.userA}`}>
              <Text className={styles.label}>睡眠时长</Text>
              <Text className={styles.value}>{formA.sleepHours}h</Text>
              <Text className={styles.subValue}>{userA.name}</Text>
            </View>
            <View className={`${styles.dataItem} ${styles.userB}`}>
              <Text className={styles.label}>睡眠时长</Text>
              <Text className={styles.value}>{formB.sleepHours}h</Text>
              <Text className={styles.subValue}>{userB.name}</Text>
            </View>
            <View className={`${styles.dataItem} ${styles.userA}`}>
              <Text className={styles.label}>睡眠质量</Text>
              <Text className={styles.value}>{formA.sleepQuality}/5</Text>
              <Text className={styles.subValue}>{userA.name}</Text>
            </View>
            <View className={`${styles.dataItem} ${styles.userB}`}>
              <Text className={styles.label}>睡眠质量</Text>
              <Text className={styles.value}>{formB.sleepQuality}/5</Text>
              <Text className={styles.subValue}>{userB.name}</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <View className={styles.icon}>📊</View>
            详细数据对比
          </Text>
          <View className={styles.compareTable}>
            <View className={styles.row}>
              <Text className={styles.label}>鼾声自评</Text>
              <Text className={styles.valueA}>
                {getSnoreLevelText(formA.snoreLevel)}
              </Text>
              <Text className={styles.valueB}>
                {getSnoreLevelText(formB.snoreLevel)}
              </Text>
            </View>
            <View className={styles.row}>
              <Text className={styles.label}>观察鼾声</Text>
              <Text className={styles.valueA}>
                {getSnoreLevelText(formA.observeSnoreLevel || 3)}
              </Text>
              <Text className={styles.valueB}>
                {getSnoreLevelText(formB.observeSnoreLevel || 3)}
              </Text>
            </View>
            <View className={styles.row}>
              <Text className={styles.label}>憋醒次数</Text>
              <Text className={styles.valueA}>{formA.wakeUpChoked} 次</Text>
              <Text className={styles.valueB}>{formB.wakeUpChoked} 次</Text>
            </View>
            <View className={styles.row}>
              <Text className={styles.label}>夜间起床</Text>
              <Text className={styles.valueA}>{formA.nightWakeCount} 次</Text>
              <Text className={styles.valueB}>{formB.nightWakeCount} 次</Text>
            </View>
            <View className={styles.row}>
              <Text className={styles.label}>主要睡姿</Text>
              <Text className={styles.valueA}>
                {getSleepPositionText(formA.sleepPosition)}
              </Text>
              <Text className={styles.valueB}>
                {getSleepPositionText(formB.sleepPosition)}
              </Text>
            </View>
            <View className={styles.row}>
              <Text className={styles.label}>白天精神</Text>
              <Text className={styles.valueA}>
                {getEnergyLevelText(formA.energyLevel)}
              </Text>
              <Text className={styles.valueB}>
                {getEnergyLevelText(formB.energyLevel)}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <View className={styles.icon}>🔍</View>
            认知差异分析
          </Text>

          <View className={styles.differenceCard}>
            <Text className={styles.diffTitle}>
              <Text>⚠️</Text> 鼾声认知差异
            </Text>
            <Text className={styles.diffDesc}>
              {userA.name}自评鼾声为{getSnoreLevelText(formA.snoreLevel)}，
              但{userB.name}观察到的是{getSnoreLevelText(formA.observeSnoreLevel || 3)}。
              这种差异可能表明{userA.name}对自己的鼾声缺乏意识。
            </Text>
            <Text className={styles.diffValue}>
              差异程度：<Text className={styles.highlight}>{report.analysis.differences.snoreDiff}%</Text>
            </Text>
          </View>

          <View className={styles.differenceCard}>
            <Text className={styles.diffTitle}>
              <Text>⚠️</Text> 醒觉认知差异
            </Text>
            <Text className={styles.diffDesc}>
              {userB.name}自评夜间憋醒{formB.wakeUpChoked}次，
              但{userA.name}观察到{formB.observeWakeUpChoked || 0}次呼吸暂停。
              建议关注{userB.name}是否有睡眠呼吸暂停的风险。
            </Text>
            <Text className={styles.diffValue}>
              差异程度：<Text className={styles.highlight}>{report.analysis.differences.wakeDiff}%</Text>
            </Text>
          </View>

          <View className={styles.differenceCard}>
            <Text className={styles.diffTitle}>
              <Text>💡</Text> 分析说明
            </Text>
            <Text className={styles.diffDesc}>
              {report.analysis.differences.notes}
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <View className={styles.icon}>⚠️</View>
            风险提示
          </Text>
          <View className={styles.riskList}>
            {report.risks.map((risk) => (
              <View key={risk.id} className={`${styles.riskItem} ${styles[risk.level]}`}>
                <Text className={styles.icon}>
                  {risk.level === 'danger' ? '🚨' : risk.level === 'warning' ? '⚠️' : 'ℹ️'}
                </Text>
                <View className={styles.content}>
                  <Text className={styles.title}>{risk.title}</Text>
                  <Text className={styles.desc}>{risk.description}</Text>
                  <Text className={styles.source}>{getSourceText(risk.source)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <View className={styles.icon}>💡</View>
            改善建议
          </Text>
          <View className={styles.suggestionList}>
            {suggestions.map((s) => (
              <View key={s.id} className={styles.suggestionItem}>
                <View
                  className={`${styles.checkbox} ${s.completed ? styles.checked : ''}`}
                  onClick={() => handleToggleSuggestion(s.id)}
                >
                  {s.completed ? '✓' : ''}
                </View>
                <View className={styles.content}>
                  <Text className={styles.title}>
                    {s.title}
                    <Text className={`${styles.priority} ${styles[s.priority]}`}>
                      {s.priority === 'high' ? '高优先级' : s.priority === 'medium' ? '中优先级' : '低优先级'}
                    </Text>
                  </Text>
                  <Text className={styles.desc}>{s.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <View className={styles.icon}>📈</View>
            历史趋势对比
          </Text>
          <View className={styles.historyCompare}>
            <View className={styles.chartContainer}>
              {historyData.map((item, index) => (
                <View key={index} className={styles.barGroup}>
                  <View className={styles.bars}>
                    <View
                      className={`${styles.bar} ${styles.userA}`}
                      style={{ height: `${(item.scoreA / 100) * 100}%` }}
                    />
                    <View
                      className={`${styles.bar} ${styles.userB}`}
                      style={{ height: `${(item.scoreB / 100) * 100}%` }}
                    />
                  </View>
                  <Text className={styles.label}>{item.date}</Text>
                </View>
              ))}
            </View>
            <View className={styles.legend}>
              <View className={styles.legendItem}>
                <View className={`${styles.dot} ${styles.userA}`} />
                <Text>{userA.name}</Text>
              </View>
              <View className={styles.legendItem}>
                <View className={`${styles.dot} ${styles.userB}`} />
                <Text>{userB.name}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <View className={styles.icon}>🎙️</View>
            关联夜间录音
          </Text>
          <View className={styles.recordingLink} onClick={handleViewRecording}>
            <View className={styles.info}>
              <Text className={styles.title}>
                {formA.hasRecording ? '已关联 2 段夜间录音' : '暂未关联录音'}
              </Text>
              <Text className={styles.desc}>
                {formA.hasRecording
                  ? '录音中发现 3 处异常标记，点击查看详情'
                  : '录制夜间睡眠声音，辅助医生更准确判断'}
              </Text>
            </View>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <View className={styles.icon}>📝</View>
            观察时间线
          </Text>
          <View className={styles.timeline}>
            <View className={styles.timelineItem}>
              <View className={styles.dot} />
              <Text className={styles.time}>23:30</Text>
              <Text className={styles.title}>入睡</Text>
              <Text className={styles.desc}>{userA.name} 和 {userB.name} 先后入睡</Text>
            </View>
            <View className={styles.timelineItem}>
              <View className={styles.dot} />
              <Text className={styles.time}>00:15</Text>
              <Text className={styles.title}>鼾声开始</Text>
              <Text className={styles.desc}>{userA.name} 开始出现明显鼾声</Text>
            </View>
            <View className={styles.timelineItem}>
              <View className={styles.dot} />
              <Text className={styles.time}>02:30</Text>
              <Text className={styles.title}>呼吸暂停</Text>
              <Text className={styles.desc}>观察到 {userA.name} 约 10 秒呼吸暂停</Text>
            </View>
            <View className={styles.timelineItem}>
              <View className={styles.dot} />
              <Text className={styles.time}>04:15</Text>
              <Text className={styles.title}>夜间起床</Text>
              <Text className={styles.desc}>{userB.name} 起床上厕所</Text>
            </View>
            <View className={styles.timelineItem}>
              <View className={styles.dot} />
              <Text className={styles.time}>07:00</Text>
              <Text className={styles.title}>醒来</Text>
              <Text className={styles.desc}>两人先后醒来，开始填写观察报告</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <View className={`${styles.btn} ${styles.outline}`} onClick={handleRetest}>
          设置复测
        </View>
        <View className={`${styles.btn} ${styles.secondary}`} onClick={handleShare}>
          分享报告
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleGoToAdvice}>
          查看建议
        </View>
      </View>
    </View>
  );
};

export default ReportDetailPage;
