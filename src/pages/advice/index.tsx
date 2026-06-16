import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import {
  mockUserA,
  mockUserB,
  mockSuggestions,
  mockMedicalChecklist,
  mockEnvironmentChecklist,
  mockReminders,
} from '@/data/mockData';
import { generateId } from '@/utils/date';
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('lifestyle');

  const suggestions = useMemo<Suggestion[]>(() => {
    return state.suggestions.length > 0 ? state.suggestions : mockSuggestions;
  }, [state.suggestions]);

  const medicalChecklist = useMemo<MedicalChecklist[]>(() => {
    return state.medicalChecklist.length > 0 ? state.medicalChecklist : mockMedicalChecklist;
  }, [state.medicalChecklist]);

  const environmentChecklist = useMemo<EnvironmentChecklist[]>(() => {
    return state.environmentChecklist.length > 0 ? state.environmentChecklist : mockEnvironmentChecklist;
  }, [state.environmentChecklist]);

  const [newReminderId, setNewReminderId] = useState<string | null>(null);

  const reminders = useMemo<RetestReminder[]>(() => {
    const list = state.reminders.length > 0 ? state.reminders : mockReminders;
    return [...list].sort((a, b) => {
      const aTime = (a as any).createdAt ? new Date((a as any).createdAt).getTime() : 0;
      const bTime = (b as any).createdAt ? new Date((b as any).createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [state.reminders]);

  useDidShow(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTab = window.localStorage.getItem('advice_active_tab');
        const savedNewId = window.localStorage.getItem('advice_new_reminder_id');
        if (savedTab === 'reminder') {
          setActiveTab('reminder');
          window.localStorage.removeItem('advice_active_tab');
        }
        if (savedNewId) {
          setNewReminderId(savedNewId);
          window.localStorage.removeItem('advice_new_reminder_id');
          setTimeout(() => setNewReminderId(null), 3000);
        }
      }
    } catch (e) {}

    const tab = router.params?.tab;
    if (tab === '3' || tab === 'reminder') {
      setActiveTab('reminder');
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTab = window.localStorage.getItem('advice_active_tab');
        const savedNewId = window.localStorage.getItem('advice_new_reminder_id');
        if (savedTab === 'reminder') {
          setActiveTab('reminder');
          window.localStorage.removeItem('advice_active_tab');
        }
        if (savedNewId) {
          setNewReminderId(savedNewId);
          window.localStorage.removeItem('advice_new_reminder_id');
          setTimeout(() => setNewReminderId(null), 3000);
        }
      }
    } catch (e) {}

    const tab = router.params?.tab;
    if (tab === '3' || tab === 'reminder') {
      setActiveTab('reminder');
    }
    if (!state.currentUser) {
      dispatch({ type: 'SET_USER', payload: mockUserA });
      dispatch({ type: 'SET_PARTNER', payload: mockUserB });
    }
    if (state.suggestions.length === 0) {
      dispatch({ type: 'SET_SUGGESTIONS', payload: mockSuggestions });
    }
    if (state.medicalChecklist.length === 0) {
      dispatch({ type: 'SET_MEDICAL_CHECKLIST', payload: mockMedicalChecklist });
    }
    if (state.environmentChecklist.length === 0) {
      dispatch({ type: 'SET_ENVIRONMENT_CHECKLIST', payload: mockEnvironmentChecklist });
    }
  }, [dispatch, state.currentUser, state.suggestions.length, state.medicalChecklist.length, state.environmentChecklist.length, router.params?.tab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleToggleSuggestion = (suggestion: Suggestion) => {
    const updated = { ...suggestion, completed: !suggestion.completed };
    dispatch({
      type: 'UPDATE_SUGGESTION',
      payload: updated,
    });

    if (!suggestion.completed) {
      Taro.showToast({
        title: '太棒了！继续保持',
        icon: 'success',
      });
    }
  };

  const handleToggleMedical = (item: MedicalChecklist) => {
    const updated = { ...item, checked: !item.checked };
    dispatch({
      type: 'UPDATE_MEDICAL_CHECKLIST',
      payload: updated,
    });
  };

  const handleToggleEnvironment = (item: EnvironmentChecklist) => {
    const updated = { ...item, checked: !item.checked };
    dispatch({
      type: 'UPDATE_ENVIRONMENT_CHECKLIST',
      payload: updated,
    });
  };

  const handleToggleReminder = (reminder: RetestReminder) => {
    const updated = { ...reminder, enabled: !reminder.enabled };
    dispatch({
      type: 'UPDATE_REMINDER',
      payload: updated,
    });

    Taro.showToast({
      title: reminder.enabled ? '已关闭提醒' : '已开启提醒',
      icon: 'none',
    });
  };

  const handleAddReminder = () => {
    const retestDate = new Date();
    retestDate.setDate(retestDate.getDate() + 7);
    const reminder: RetestReminder = {
      id: generateId(),
      title: '睡眠观察提醒',
      description: '记录今天的睡眠观察数据，持续跟踪睡眠健康',
      date: retestDate.toISOString().split('T')[0],
      time: '08:30',
      enabled: true,
      repeat: 'weekly',
    };
    dispatch({ type: 'ADD_REMINDER', payload: reminder });
    Taro.showToast({
      title: '已添加新提醒',
      icon: 'success',
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
          <View
            key={reminder.id}
            className={`${styles.reminderCard} ${newReminderId === reminder.id ? styles.newReminder : ''}`}
          >
            <View className={styles.reminderHeader}>
              <View>
                <Text className={styles.reminderTitle}>
                  {reminder.title}
                  {newReminderId === reminder.id && (
                    <Text className={styles.newBadge}> 新</Text>
                  )}
                </Text>
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
