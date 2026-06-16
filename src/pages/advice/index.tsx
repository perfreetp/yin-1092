import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import {
  mockUserA,
  mockUserB,
  mockSuggestions,
  mockMedicalChecklist,
  mockEnvironmentChecklist,
  mockReminders,
} from '@/data/mockData';
import {
  Suggestion,
  MedicalChecklist,
  EnvironmentChecklist,
  RetestReminder,
} from '@/types/sleep';
import styles from './index.module.scss';

type TabType = 'lifestyle' | 'environment' | 'medical' | 'reminder';

const AdvicePage: React.FC = () => {
  const { state, dispatch } = useSleep();
  const [activeTab, setActiveTab] = useState<TabType>('lifestyle');
  const [suggestions, setSuggestions] = useState<Suggestion[]>(mockSuggestions);
  const [medicalChecklist, setMedicalChecklist] = useState<MedicalChecklist[]>(mockMedicalChecklist);
  const [environmentChecklist, setEnvironmentChecklist] = useState<EnvironmentChecklist[]>(mockEnvironmentChecklist);
  const [reminders, setReminders] = useState<RetestReminder[]>(mockReminders);

  useEffect(() => {
    console.log('[AdvicePage] Component mounted, activeTab:', activeTab);
    if (!state.currentUser) {
      dispatch({ type: 'SET_USER', payload: mockUserA });
      dispatch({ type: 'SET_PARTNER', payload: mockUserB });
      dispatch({ type: 'SET_SUGGESTIONS', payload: mockSuggestions });
      dispatch({ type: 'SET_MEDICAL_CHECKLIST', payload: mockMedicalChecklist });
      dispatch({ type: 'SET_ENVIRONMENT_CHECKLIST', payload: mockEnvironmentChecklist });
    }
  }, [dispatch, state.currentUser, activeTab]);

  const handleTabChange = (tab: TabType) => {
    console.log('[AdvicePage] Switch tab to:', tab);
    setActiveTab(tab);
  };

  const handleToggleSuggestion = (suggestion: Suggestion) => {
    console.log('[AdvicePage] Toggle suggestion:', suggestion.id);
    const updated = suggestions.map((s) =>
      s.id === suggestion.id ? { ...s, completed: !s.completed } : s
    );
    setSuggestions(updated);
    dispatch({
      type: 'UPDATE_SUGGESTION',
      payload: { ...suggestion, completed: !suggestion.completed },
    });

    if (!suggestion.completed) {
      Taro.showToast({
        title: '太棒了！继续保持',
        icon: 'success',
      });
    }
  };

  const handleToggleMedical = (item: MedicalChecklist) => {
    console.log('[AdvicePage] Toggle medical item:', item.id);
    const updated = medicalChecklist.map((m) =>
      m.id === item.id ? { ...m, checked: !m.checked } : m
    );
    setMedicalChecklist(updated);
    dispatch({
      type: 'UPDATE_MEDICAL_CHECKLIST',
      payload: { ...item, checked: !item.checked },
    });
  };

  const handleToggleEnvironment = (item: EnvironmentChecklist) => {
    console.log('[AdvicePage] Toggle environment item:', item.id);
    const updated = environmentChecklist.map((e) =>
      e.id === item.id ? { ...e, checked: !e.checked } : e
    );
    setEnvironmentChecklist(updated);
    dispatch({
      type: 'UPDATE_ENVIRONMENT_CHECKLIST',
      payload: { ...item, checked: !item.checked },
    });
  };

  const handleToggleReminder = (reminder: RetestReminder) => {
    console.log('[AdvicePage] Toggle reminder:', reminder.id);
    const updated = reminders.map((r) =>
      r.id === reminder.id ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updated);

    Taro.showToast({
      title: reminder.enabled ? '已关闭提醒' : '已开启提醒',
      icon: 'none',
    });
  };

  const handleAddReminder = () => {
    console.log('[AdvicePage] Add new reminder');
    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    });
  };

  const handleShare = () => {
    console.log('[AdvicePage] Share report');
    Taro.showActionSheet({
      itemList: ['分享给家人', '分享给医生', '生成图片', '复制报告链接'],
      success: (res) => {
        const actions = ['家人', '医生', '图片', '链接'];
        Taro.showToast({
          title: `已${res.tapIndex === 2 ? '生成' : '分享给'}${actions[res.tapIndex]}`,
          icon: 'success',
        });
      },
    });
  };

  const handleExportReport = () => {
    console.log('[AdvicePage] Export report');
    Taro.showModal({
      title: '导出报告',
      content: '将生成包含所有睡眠数据和建议的PDF报告，是否继续？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '报告生成中...',
            icon: 'loading',
            duration: 2000,
          });
          setTimeout(() => {
            Taro.showToast({
              title: '报告已生成',
              icon: 'success',
            });
          }, 2000);
        }
      },
    });
  };

  const completedCount = suggestions.filter((s) => s.completed).length;
  const totalCount = suggestions.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categoryNames: Record<string, string> = {
    lifestyle: '生活习惯',
    environment: '睡眠环境',
    medical: '就医准备',
    routine: '日常作息',
  };

  const medicalCategories = ['symptom', 'exam', 'question', 'document'];
  const medicalCategoryNames: Record<string, string> = {
    symptom: '📋 症状记录',
    exam: '🏥 检查项目',
    question: '❓ 问题清单',
    document: '📄 资料准备',
  };

  const environmentCategories = ['light', 'sound', 'temperature', 'bedding', 'other'];
  const environmentCategoryNames: Record<string, string> = {
    light: '💡 光线控制',
    sound: '🔇 噪音控制',
    temperature: '🌡️ 温度湿度',
    bedding: '🛏️ 床品选择',
    other: '✨ 其他优化',
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      medical: '🏥',
      lifestyle: '🏃',
      environment: '🏠',
      routine: '📅',
    };
    return icons[category] || '💡';
  };

  const renderLifestyle = () => (
    <View>
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>改善进度</Text>
          <Text className={styles.sectionSubtitle}>
            已完成 {completedCount}/{totalCount} · {completionRate}%
          </Text>
        </View>
        <View className={styles.completionStats}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{completionRate}%</Text>
            <Text className={styles.statLabel}>完成率</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{completedCount}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{totalCount - completedCount}</Text>
            <Text className={styles.statLabel}>待完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.suggestionList}>
        {suggestions.map((suggestion) => (
          <View key={suggestion.id} className={styles.suggestionCard}>
            <View className={styles.suggestionHeader}>
              <View
                className={`${styles.checkbox} ${suggestion.completed ? styles.checked : ''}`}
                onClick={() => handleToggleSuggestion(suggestion)}
              >
                {suggestion.completed && <Text className={styles.checkIcon}>✓</Text>}
              </View>
              <View className={styles.suggestionContent}>
                <Text className={styles.suggestionTitle}>
                  <Text>{getCategoryIcon(suggestion.category)}</Text>
                  {suggestion.title}
                  <View className={`${styles.priorityBadge} ${styles[suggestion.priority]}`}>
                    <Text>
                      {suggestion.priority === 'high'
                        ? '高优先级'
                        : suggestion.priority === 'medium'
                        ? '中优先级'
                        : '低优先级'}
                    </Text>
                  </View>
                </Text>
                <Text className={styles.suggestionDesc}>{suggestion.description}</Text>
                <Text style={{ fontSize: 20, color: '#86909C', marginTop: 8 }}>
                  分类：{categoryNames[suggestion.category]}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderEnvironment = () => (
    <View>
      {environmentCategories.map((cat) => {
        const items = environmentChecklist.filter((e) => e.category === cat);
        if (items.length === 0) return null;
        return (
          <View key={cat} className={styles.categoryGroup}>
            <Text className={styles.categoryTitle}>
              <Text className={styles.categoryIcon}>
                {environmentCategoryNames[cat].split(' ')[0]}
              </Text>
              {environmentCategoryNames[cat].split(' ')[1]}
            </Text>
            {items.map((item) => (
              <View key={item.id} className={styles.checklistItem}>
                <View
                  className={`${styles.checkbox} ${item.checked ? styles.checked : ''}`}
                  onClick={() => handleToggleEnvironment(item)}
                >
                  {item.checked && <Text className={styles.checkIcon}>✓</Text>}
                </View>
                <View className={styles.checklistContent}>
                  <Text className={styles.checklistTitle}>
                    {item.title}
                    <View
                      className={`${styles.priorityBadge} ${styles[item.priority]}`}
                      style={{ marginLeft: 8 }}
                    >
                      <Text>
                        {item.priority === 'high'
                          ? '高'
                          : item.priority === 'medium'
                          ? '中'
                          : '低'}
                      </Text>
                    </View>
                  </Text>
                  <Text className={styles.checklistDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );

  const renderMedical = () => (
    <View>
      {medicalCategories.map((cat) => {
        const items = medicalChecklist.filter((m) => m.category === cat);
        if (items.length === 0) return null;
        const checkedCount = items.filter((i) => i.checked).length;
        return (
          <View key={cat} className={styles.categoryGroup}>
            <Text className={styles.categoryTitle}>
              <Text className={styles.categoryIcon}>
                {medicalCategoryNames[cat].split(' ')[0]}
              </Text>
              {medicalCategoryNames[cat].split(' ')[1]}
              <Text style={{ fontSize: 20, color: '#86909C', fontWeight: 'normal' }}>
                {' '}
                ({checkedCount}/{items.length})
              </Text>
            </Text>
            {items.map((item) => (
              <View key={item.id} className={styles.checklistItem}>
                <View
                  className={`${styles.checkbox} ${item.checked ? styles.checked : ''}`}
                  onClick={() => handleToggleMedical(item)}
                >
                  {item.checked && <Text className={styles.checkIcon}>✓</Text>}
                </View>
                <View className={styles.checklistContent}>
                  <Text className={styles.checklistTitle}>{item.title}</Text>
                  <Text className={styles.checklistDesc}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );

  const renderReminder = () => (
    <View>
      {reminders.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>⏰</Text>
          <Text className={styles.emptyText}>暂无提醒设置</Text>
        </View>
      ) : (
        reminders.map((reminder) => (
          <View key={reminder.id} className={styles.reminderCard}>
            <View className={styles.reminderHeader}>
              <View>
                <Text className={styles.reminderTitle}>{reminder.title}</Text>
              </View>
              <View
                className={`${styles.switch} ${reminder.enabled ? styles.active : ''}`}
                onClick={() => handleToggleReminder(reminder)}
              />
            </View>
            <Text className={styles.reminderTime}>
              {reminder.time}
            </Text>
            <View className={styles.reminderMeta}>
              <Text>📅 {reminder.date}</Text>
              <Text>
                🔄 {reminder.repeat === 'once' ? '仅一次' : reminder.repeat === 'daily' ? '每天' : '每周'}
              </Text>
            </View>
            <Text className={styles.reminderDesc}>{reminder.description}</Text>
          </View>
        ))
      )}

      <View className={styles.addReminderBtn} onClick={handleAddReminder}>
        <Text className={styles.addReminderIcon}>+</Text>
        <Text>添加新提醒</Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'lifestyle':
        return renderLifestyle();
      case 'environment':
        return renderEnvironment();
      case 'medical':
        return renderMedical();
      case 'reminder':
        return renderReminder();
      default:
        return null;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.tabBar}>
        <View
          className={`${styles.tabItem} ${activeTab === 'lifestyle' ? styles.active : ''}`}
          onClick={() => handleTabChange('lifestyle')}
        >
          <Text>生活建议</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'environment' ? styles.active : ''}`}
          onClick={() => handleTabChange('environment')}
        >
          <Text>环境调整</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'medical' ? styles.active : ''}`}
          onClick={() => handleTabChange('medical')}
        >
          <Text>就医准备</Text>
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'reminder' ? styles.active : ''}`}
          onClick={() => handleTabChange('reminder')}
        >
          <Text>提醒设置</Text>
        </View>
      </View>

      <View className={styles.content}>{renderContent()}</View>

      <View className={styles.bottomActions}>
        <View className={`${styles.actionBtn} ${styles.secondary}`} onClick={handleShare}>
          <Text className={styles.actionIcon}>📤</Text>
          <Text>分享家人</Text>
        </View>
        <View className={`${styles.actionBtn} ${styles.primary}`} onClick={handleExportReport}>
          <Text className={styles.actionIcon}>📄</Text>
          <Text>导出报告</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AdvicePage;
