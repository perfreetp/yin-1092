import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import { mockRecordings, mockUserA } from '@/data/mockData';
import { generateId } from '@/utils/date';
import { formatDate } from '@/utils/date';
import { Recording, AbnormalMarker } from '@/types/sleep';
import styles from './index.module.scss';

const waveformBars = Array.from({ length: 40 }, (_, i) => {
  const baseHeight = 10 + Math.random() * 40;
  const isMarker = i === 12 || i === 25 || i === 33;
  return { height: baseHeight, isMarker };
});

const typeOptions = [
  { value: 'snore', emoji: '💤', text: '鼾声' },
  { value: 'pause', emoji: '⏸️', text: '呼吸暂停' },
  { value: 'other', emoji: '❓', text: '其他' },
];

const RecordPage: React.FC = () => {
  const { state, dispatch } = useSleep();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [markerType, setMarkerType] = useState<'snore' | 'pause' | 'other'>('snore');
  const [markerDesc, setMarkerDesc] = useState('');
  const [markerTime, setMarkerTime] = useState('00:05:30');

  const recordings = state.recordings.length > 0 ? state.recordings : mockRecordings;
  const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0);
  const totalMarkers = recordings.reduce((sum, r) => sum + r.markers.length, 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}分${secs}秒`;
  };

  const formatTimeFull = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartRecord = () => {
    console.log('[RecordPage] Starting recording');
    setIsRecording(true);
    setRecordingTime(0);
    Taro.showToast({
      title: '开始录音',
      icon: 'none',
    });
  };

  const handleStopRecord = useCallback(() => {
    console.log('[RecordPage] Stopping recording, duration:', recordingTime);
    setIsRecording(false);

    const newRecording: Recording = {
      id: generateId(),
      userId: (state.currentUser || mockUserA).id,
      date: formatDate(new Date(), 'YYYY-MM-DD'),
      startTime: formatDate(new Date(Date.now() - recordingTime * 1000), 'HH:mm'),
      endTime: formatDate(new Date(), 'HH:mm'),
      duration: recordingTime,
      url: 'mock://recording/' + generateId(),
      markers: [],
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_RECORDING', payload: newRecording });

    Taro.showToast({
      title: '录音已保存',
      icon: 'success',
    });
  }, [recordingTime, dispatch, state.currentUser]);

  const handlePlay = (id: string) => {
    console.log('[RecordPage] Play recording:', id);
    setPlayingId(playingId === id ? null : id);
  };

  const handleAddMarker = (recordingId: string) => {
    console.log('[RecordPage] Adding marker to recording:', recordingId);
    setSelectedRecordingId(recordingId);
    setMarkerType('snore');
    setMarkerDesc('');
    setMarkerTime('00:05:30');
    setShowMarkerModal(true);
  };

  const handleSaveMarker = () => {
    console.log('[RecordPage] Saving marker:', { markerType, markerDesc, markerTime });

    if (!selectedRecordingId) return;

    const newMarker: AbnormalMarker = {
      id: generateId(),
      formId: selectedRecordingId,
      time: markerTime,
      duration: 10,
      type: markerType,
      description: markerDesc || getDefaultMarkerDesc(markerType),
      timestamp: Date.now(),
    };

    const updatedRecordings = recordings.map(r => {
      if (r.id === selectedRecordingId) {
        return { ...r, markers: [...r.markers, newMarker] };
      }
      return r;
    });

    dispatch({ type: 'SET_RECORDINGS', payload: updatedRecordings });

    setShowMarkerModal(false);
    Taro.showToast({
      title: '标记已保存',
      icon: 'success',
    });
  };

  const getDefaultMarkerDesc = (type: string) => {
    switch (type) {
      case 'snore': return '持续的大声打鼾';
      case 'pause': return '呼吸暂停后突然恢复';
      default: return '异常声音或动作';
    }
  };

  const getMarkerTypeText = (type: string) => {
    switch (type) {
      case 'snore': return '鼾声';
      case 'pause': return '呼吸暂停';
      default: return '其他';
    }
  };

  const handleAssociateForm = (recordingId: string) => {
    console.log('[RecordPage] Associate recording to form:', recordingId);
    Taro.showModal({
      title: '关联到睡眠报告',
      content: '确定要将这段录音关联到今天的睡眠报告吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '已关联到报告',
            icon: 'success',
          });
        }
      },
    });
  };

  const handleDeleteRecording = (recordingId: string) => {
    console.log('[RecordPage] Delete recording:', recordingId);
    Taro.showModal({
      title: '删除录音',
      content: '确定要删除这段录音吗？删除后无法恢复。',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          const updated = recordings.filter(r => r.id !== recordingId);
          dispatch({ type: 'SET_RECORDINGS', payload: updated });
          Taro.showToast({
            title: '已删除',
            icon: 'success',
          });
        }
      },
    });
  };

  const handleShare = () => {
    console.log('[RecordPage] Share recordings');
    Taro.showActionSheet({
      itemList: ['分享给伴侣', '分享给医生', '导出音频文件'],
      success: (res) => {
        const actions = ['分享给伴侣成功', '已发送给医生', '开始导出...'];
        Taro.showToast({
          title: actions[res.tapIndex],
          icon: 'success',
        });
      },
    });
  };

  const handleGoToForm = () => {
    Taro.navigateTo({ url: '/pages/form/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>夜间录音管理</Text>
        <Text className={styles.subtitle}>记录睡眠声音，发现潜在健康问题</Text>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.value}>{recordings.length}</Text>
            <Text className={styles.label}>段录音</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.value}>{formatDuration(totalDuration)}</Text>
            <Text className={styles.label}>总时长</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.value}>{totalMarkers}</Text>
            <Text className={styles.label}>个标记</Text>
          </View>
        </View>
      </View>

      <View className={styles.recordButton}>
        <View className={styles.info}>
          <Text className={styles.title}>
            {isRecording ? '正在录音中...' : '开始夜间录音'}
          </Text>
          <Text className={styles.desc}>
            {isRecording
              ? '请将手机放在床边，保持屏幕朝下'
              : '建议睡觉时开启，记录整晚的睡眠声音'}
          </Text>
        </View>
        <View
          className={`${styles.btn} ${isRecording ? styles.recording : ''}`}
          onClick={isRecording ? handleStopRecord : handleStartRecord}
        >
          <Text className={styles.icon}>{isRecording ? '⏹' : '🎙️'}</Text>
        </View>
      </View>

      {isRecording && (
        <View className={styles.recordingIndicator}>
          <View className={styles.dot}></View>
          <View className={styles.info}>
            <Text className={styles.status}>正在录音</Text>
            <Text className={styles.time}>{formatTimeFull(recordingTime)}</Text>
          </View>
          <View className={styles.stopBtn} onClick={handleStopRecord}>
            停止
          </View>
        </View>
      )}

      <Text className={styles.sectionHeader}>历史录音</Text>

      <ScrollView scrollY className={styles.recordingList}>
        {recordings.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emoji}>🎙️</Text>
            <Text className={styles.title}>暂无录音记录</Text>
            <Text className={styles.desc}>点击上方按钮开始录制夜间睡眠声音，帮助更准确地分析睡眠健康状况</Text>
          </View>
        ) : (
          recordings.map((recording) => (
            <View key={recording.id} className={styles.recordingCard}>
              <View className={styles.cardHeader}>
                <View className={styles.left}>
                  <Text className={styles.date}>
                    {formatDate(recording.date, 'YYYY年MM月DD日')}
                  </Text>
                  <Text className={styles.timeRange}>
                    {recording.startTime} - {recording.endTime || '进行中'}
                  </Text>
                </View>
                <View className={styles.right}>
                  <Text className={styles.duration}>
                    {formatDuration(recording.duration)}
                  </Text>
                  <Text className={styles.moreBtn}>⋯</Text>
                </View>
              </View>

              <View className={styles.waveform}>
                {waveformBars.map((bar, i) => (
                  <View
                    key={i}
                    className={`${styles.bar} ${bar.isMarker ? styles.marker : ''} ${playingId === recording.id && i < 15 ? styles.active : ''}`}
                    style={{ height: `${bar.height}%` }}
                  />
                ))}
              </View>

              <View className={styles.controls}>
                <View className={styles.playBtn} onClick={() => handlePlay(recording.id)}>
                  {playingId === recording.id ? '⏸' : '▶'}
                </View>
                <View className={styles.progress}>
                  <View className={styles.bar}>
                    <View className={styles.fill} style={{ width: playingId === recording.id ? '35%' : '0%' }} />
                  </View>
                  <View className={styles.time}>
                    <Text>{playingId === recording.id ? '00:05:30' : '00:00:00'}</Text>
                    <Text>{formatTimeFull(recording.duration)}</Text>
                  </View>
                </View>
                <View className={styles.speedBtn}>1.0x</View>
              </View>

              {recording.markers.length > 0 && (
                <View className={styles.markers}>
                  <Text className={styles.markersTitle}>
                    异常标记 ({recording.markers.length})
                    <Text className={styles.addBtn} onClick={() => handleAddMarker(recording.id)}>
                      + 添加
                    </Text>
                  </Text>
                  <View className={styles.markerList}>
                    {recording.markers.map((marker) => (
                      <View key={marker.id} className={styles.markerItem}>
                        <Text className={styles.timeBadge}>{marker.time}</Text>
                        <Text className={`${styles.typeTag} ${styles[marker.type]}`}>
                          {getMarkerTypeText(marker.type)}
                        </Text>
                        <Text className={styles.desc}>{marker.description}</Text>
                        <View className={styles.playMarkerBtn}>▶</View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View className={styles.actions}>
                <View
                  className={`${styles.actionBtn} ${styles.primary}`}
                  onClick={() => handleAddMarker(recording.id)}
                >
                  + 添加标记
                </View>
                <View
                  className={styles.actionBtn}
                  onClick={() => handleAssociateForm(recording.id)}
                >
                  关联报告
                </View>
                <View
                  className={`${styles.actionBtn} ${styles.danger}`}
                  onClick={() => handleDeleteRecording(recording.id)}
                >
                  删除
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View className={styles.footer}>
        <View className={`${styles.btn} ${styles.secondary}`} onClick={handleShare}>
          分享录音
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleGoToForm}>
          填写睡眠报告
        </View>
      </View>

      {showMarkerModal && (
        <View className={styles.markerModal} onClick={() => setShowMarkerModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>添加异常标记</Text>

            <View className={styles.timeInput}>
              <Text className={styles.label}>发生时间点</Text>
              <Text className={styles.timeValue}>{markerTime}</Text>
            </View>

            <View className={styles.typeSelector}>
              <Text className={styles.label}>异常类型</Text>
              <View className={styles.typeOptions}>
                {typeOptions.map((opt) => (
                  <View
                    key={opt.value}
                    className={`${styles.typeOption} ${markerType === opt.value ? styles.active : ''}`}
                    onClick={() => setMarkerType(opt.value as any)}
                  >
                    <Text className={styles.emoji}>{opt.emoji}</Text>
                    <Text className={styles.text}>{opt.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.descInput}>
              <Text className={styles.label}>详细描述（选填）</Text>
              <Textarea
                className={styles.input}
                placeholder="请描述你听到的异常声音或看到的异常行为..."
                value={markerDesc}
                onInput={(e) => setMarkerDesc(e.detail.value)}
                maxlength={200}
              />
            </View>

            <View className={styles.modalActions}>
              <View className={`${styles.btn} ${styles.cancel}`} onClick={() => setShowMarkerModal(false)}>
                取消
              </View>
              <View className={`${styles.btn} ${styles.confirm}`} onClick={handleSaveMarker}>
                保存标记
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RecordPage;
