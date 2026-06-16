import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Textarea, Slider } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import { mockUserA, mockUserB, mockRecordings } from '@/data/mockData';
import { generateId } from '@/utils/date';
import { formatDate } from '@/utils/date';
import { getSnoreLevelText, getEnergyLevelText } from '@/utils/analysis';
import { SleepForm, SnoreLevel, EnergyLevel, SleepPosition } from '@/types/sleep';
import styles from './index.module.scss';

const snoreEmojis = ['😌', '🙂', '😐', '😤', '😱'];
const energyEmojis = ['😴', '😪', '😐', '🙂', '😁'];
const positionOptions: { value: SleepPosition; emoji: string; text: string }[] = [
  { value: 'back', emoji: '🛌', text: '仰卧' },
  { value: 'left', emoji: '😴', text: '左侧卧' },
  { value: 'right', emoji: '😴', text: '右侧卧' },
  { value: 'stomach', emoji: '🤕', text: '俯卧' },
  { value: 'mixed', emoji: '🔄', text: '多变' },
];

const FormPage: React.FC = () => {
  const { state, dispatch } = useSleep();
  const [activeTab, setActiveTab] = useState<'self' | 'observe'>('self');
  const [formData, setFormData] = useState<Partial<SleepForm>>({
    snoreLevel: 3,
    wakeUpChoked: 0,
    sleepPosition: 'back',
    nightWakeCount: 0,
    energyLevel: 3,
    sleepHours: 7,
    sleepQuality: 3,
    selfNotes: '',
    observeSnoreLevel: 3,
    observeWakeUpChoked: 0,
    observeAbnormalEvents: '',
    observeNotes: '',
  });

  const todayStr = useMemo(() => formatDate(new Date(), 'YYYY年MM月DD日'), []);
  const currentUser = state.currentUser || mockUserA;
  const partner = state.partner || mockUserB;

  const updateField = <K extends keyof SleepForm>(field: K, value: SleepForm[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCounter = (field: 'wakeUpChoked' | 'nightWakeCount' | 'observeWakeUpChoked', delta: number) => {
    const current = formData[field] as number;
    const newValue = Math.max(0, Math.min(20, current + delta));
    updateField(field, newValue as any);
  };

  const handleSubmit = async () => {
    console.log('[FormPage] Submitting form:', formData);

    const newForm: SleepForm = {
      id: generateId(),
      userId: currentUser.id,
      partnerId: partner.id,
      date: formatDate(new Date(), 'YYYY-MM-DD'),
      snoreLevel: formData.snoreLevel as SnoreLevel,
      wakeUpChoked: formData.wakeUpChoked as number,
      sleepPosition: formData.sleepPosition as SleepPosition,
      nightWakeCount: formData.nightWakeCount as number,
      energyLevel: formData.energyLevel as EnergyLevel,
      sleepHours: formData.sleepHours as number,
      sleepQuality: formData.sleepQuality as EnergyLevel,
      selfNotes: formData.selfNotes,
      observeSnoreLevel: formData.observeSnoreLevel as SnoreLevel,
      observeWakeUpChoked: formData.observeWakeUpChoked as number,
      observeAbnormalEvents: formData.observeAbnormalEvents,
      observeNotes: formData.observeNotes,
      hasRecording: mockRecordings.length > 0,
      abnormalMarkers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_FORM', payload: newForm });

    Taro.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 2000,
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleSaveDraft = () => {
    console.log('[FormPage] Saving draft:', formData);
    Taro.showToast({
      title: '草稿已保存',
      icon: 'success',
    });
  };

  const handleGoToRecord = () => {
    Taro.navigateTo({ url: '/pages/record/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.date}>{todayStr}</Text>
        <Text className={styles.title}>
          {activeTab === 'self' ? '我的睡眠感受' : '观察Ta的睡眠'}
        </Text>
        <Text className={styles.tip}>
          {activeTab === 'self'
            ? '如实填写昨晚的睡眠情况，越详细越准确哦'
            : `记录你观察到的${partner.name}的睡眠状态`}
        </Text>
      </View>

      <View className={styles.tabBar}>
        <View
          className={`${styles.tabItem} ${activeTab === 'self' ? styles.active : ''}`}
          onClick={() => setActiveTab('self')}
        >
          自我感受
        </View>
        <View
          className={`${styles.tabItem} ${activeTab === 'observe' ? styles.active : ''}`}
          onClick={() => setActiveTab('observe')}
        >
          观察对方
        </View>
      </View>

      <ScrollView scrollY>
        {activeTab === 'self' ? (
          <>
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <View className={styles.icon}>💤</View>
                睡眠基础数据
              </Text>

              <View className={styles.question}>
                <Text className={styles.label}>昨晚大约睡了多久？</Text>
                <View className={styles.hoursSlider}>
                  <Text className={styles.valueDisplay}>{formData.sleepHours} 小时</Text>
                  <Slider
                    min={0}
                    max={12}
                    step={0.5}
                    value={formData.sleepHours}
                    activeColor="#4A90D9"
                    backgroundColor="#F0F2F5"
                    blockColor="#4A90D9"
                    blockSize={28}
                    onChange={(e) => updateField('sleepHours', e.detail.value as any)}
                  />
                  <View className={styles.sliderLabels}>
                    <Text className={styles.labelItem}>0h</Text>
                    <Text className={styles.labelItem}>4h</Text>
                    <Text className={styles.labelItem}>8h</Text>
                    <Text className={styles.labelItem}>12h</Text>
                  </View>
                </View>
              </View>

              <View className={styles.question}>
                <Text className={styles.label}>你觉得自己的睡眠质量如何？</Text>
                <View className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      className={`${styles.star} ${formData.sleepQuality === level ? styles.active : ''}`}
                      onClick={() => updateField('sleepQuality', level as EnergyLevel)}
                    >
                      <Text className={styles.emoji}>{['😫', '😔', '😐', '😊', '🥰'][level - 1]}</Text>
                      <Text className={styles.text}>{['很差', '较差', '一般', '较好', '很好'][level - 1]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.question}>
                <Text className={styles.label}>你认为自己的鼾声程度是？</Text>
                <Text className={styles.subLabel}>如果不确定，可以问问枕边人</Text>
                <View className={styles.levelSelector}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      className={`${styles.levelItem} ${formData.snoreLevel === level ? styles.active : ''}`}
                      onClick={() => updateField('snoreLevel', level as SnoreLevel)}
                    >
                      <Text className={styles.level}>{snoreEmojis[level - 1]}</Text>
                      <Text className={styles.desc}>{getSnoreLevelText(level as SnoreLevel)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.question}>
                <Text className={styles.label}>昨晚因为憋气或呼吸困难醒来几次？</Text>
                <View className={styles.counter}>
                  <View className={styles.counterBtn} onClick={() => handleCounter('wakeUpChoked', -1)}>
                    −
                  </View>
                  <Text className={styles.counterValue}>{formData.wakeUpChoked}</Text>
                  <View className={styles.counterBtn} onClick={() => handleCounter('wakeUpChoked', 1)}>
                    +
                  </View>
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <View className={styles.icon}>🧘</View>
                睡眠行为
              </Text>

              <View className={styles.question}>
                <Text className={styles.label}>你通常的睡姿是？</Text>
                <View className={styles.positionGrid}>
                  {positionOptions.map((opt) => (
                    <View
                      key={opt.value}
                      className={`${styles.positionItem} ${formData.sleepPosition === opt.value ? styles.active : ''}`}
                      onClick={() => updateField('sleepPosition', opt.value)}
                    >
                      <Text className={styles.emoji}>{opt.emoji}</Text>
                      <Text className={styles.text}>{opt.text}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.question}>
                <Text className={styles.label}>昨晚起床（上厕所/喝水等）几次？</Text>
                <View className={styles.counter}>
                  <View className={styles.counterBtn} onClick={() => handleCounter('nightWakeCount', -1)}>
                    −
                  </View>
                  <Text className={styles.counterValue}>{formData.nightWakeCount}</Text>
                  <View className={styles.counterBtn} onClick={() => handleCounter('nightWakeCount', 1)}>
                    +
                  </View>
                </View>
              </View>

              <View className={styles.question}>
                <Text className={styles.label}>今天白天的精神状态如何？</Text>
                <View className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      className={`${styles.star} ${formData.energyLevel === level ? styles.active : ''}`}
                      onClick={() => updateField('energyLevel', level as EnergyLevel)}
                    >
                      <Text className={styles.emoji}>{energyEmojis[level - 1]}</Text>
                      <Text className={styles.text}>{getEnergyLevelText(level as EnergyLevel)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <View className={styles.icon}>🎙️</View>
                夜间录音
              </Text>
              <View className={styles.recordingCard} onClick={handleGoToRecord}>
                <View className={styles.info}>
                  <Text className={styles.title}>
                    {mockRecordings.length > 0 ? '已关联夜间录音' : '暂无夜间录音'}
                  </Text>
                  <Text className={styles.desc}>
                    {mockRecordings.length > 0
                      ? `${mockRecordings.length}段录音，共${Math.floor(mockRecordings[0].duration / 60)}分钟`
                      : '录制夜间睡眠声音，辅助分析更准确'}
                  </Text>
                </View>
                {mockRecordings.length > 0 ? (
                  <View className={styles.status}>已上传</View>
                ) : (
                  <View className={styles.action}>去录制</View>
                )}
              </View>
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <View className={styles.icon}>📝</View>
                补充备注
              </Text>
              <Textarea
                className={styles.inputArea}
                placeholder="记录其他值得注意的情况，比如饮食、运动、情绪、身体不适等..."
                value={formData.selfNotes}
                onInput={(e) => updateField('selfNotes', e.detail.value)}
                maxlength={500}
              />
            </View>
          </>
        ) : (
          <>
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <View className={styles.icon}>👀</View>
                观察记录
              </Text>

              <View className={styles.question}>
                <Text className={styles.label}>你观察到{partner.name}的鼾声程度是？</Text>
                <View className={styles.levelSelector}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      className={`${styles.levelItem} ${formData.observeSnoreLevel === level ? styles.active : ''}`}
                      onClick={() => updateField('observeSnoreLevel', level as SnoreLevel)}
                    >
                      <Text className={styles.level}>{snoreEmojis[level - 1]}</Text>
                      <Text className={styles.desc}>{getSnoreLevelText(level as SnoreLevel)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.question}>
                <Text className={styles.label}>你观察到{partner.name}憋气/呼吸暂停的次数？</Text>
                <View className={styles.counter}>
                  <View className={styles.counterBtn} onClick={() => handleCounter('observeWakeUpChoked', -1)}>
                    −
                  </View>
                  <Text className={styles.counterValue}>{formData.observeWakeUpChoked}</Text>
                  <View className={styles.counterBtn} onClick={() => handleCounter('observeWakeUpChoked', 1)}>
                    +
                  </View>
                </View>
              </View>

              <View className={styles.question}>
                <Text className={styles.label}>是否观察到其他异常情况？</Text>
                <Text className={styles.subLabel}>如：频繁翻身、肢体抽搐、说梦话、梦游等</Text>
                <Textarea
                  className={styles.inputArea}
                  placeholder="请详细描述你观察到的异常情况和发生时间..."
                  value={formData.observeAbnormalEvents}
                  onInput={(e) => updateField('observeAbnormalEvents', e.detail.value)}
                  maxlength={500}
                />
              </View>

              <View className={styles.question}>
                <Text className={styles.label}>其他观察备注</Text>
                <Textarea
                  className={styles.inputArea}
                  placeholder="记录其他你觉得重要的观察内容..."
                  value={formData.observeNotes}
                  onInput={(e) => updateField('observeNotes', e.detail.value)}
                  maxlength={500}
                />
              </View>
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <View className={styles.icon}>🎙️</View>
                夜间录音
              </Text>
              <View className={styles.recordingCard} onClick={handleGoToRecord}>
                <View className={styles.info}>
                  <Text className={styles.title}>
                    {mockRecordings.length > 0 ? '已关联夜间录音' : '暂无夜间录音'}
                  </Text>
                  <Text className={styles.desc}>
                    {mockRecordings.length > 0
                      ? `${mockRecordings.length}段录音，可对照异常事件`
                      : '录音可以帮助医生更准确地判断情况'}
                  </Text>
                </View>
                {mockRecordings.length > 0 ? (
                  <View className={styles.status}>已上传</View>
                ) : (
                  <View className={styles.action}>去录制</View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.saveBtn} onClick={handleSaveDraft}>
          保存草稿
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          提交观察
        </View>
      </View>
    </View>
  );
};

export default FormPage;
