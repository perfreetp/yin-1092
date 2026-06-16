import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Textarea, Slider } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import { mockRecordings, mockUserA } from '@/data/mockData';
import { generateId, formatDate } from '@/utils/date';
import { Recording, AbnormalMarker } from '@/types/sleep';
import styles from './index.module.scss';

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
  const [playingTime, setPlayingTime] = useState(0);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [markerType, setMarkerType] = useState<'snore' | 'pause' | 'other'>('snore');
  const [markerDesc, setMarkerDesc] = useState('');
  const [markerTimeSeconds, setMarkerTimeSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<Map<string, string>>(new Map());
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeRef = useRef<number>(0);

  const recordings = state.recordings.length > 0 ? state.recordings : mockRecordings;

  const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0);
  const totalMarkers = recordings.reduce((sum, r) => sum + r.markers.length, 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      audioUrlRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      });
      audioUrlRef.current.clear();
    };
  }, []);

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

  const secondsToTimeStr = (seconds: number) => {
    return formatTimeFull(seconds);
  };

  const getAudioUrl = (recording: Recording): string | null => {
    if (audioUrlRef.current.has(recording.id)) {
      return audioUrlRef.current.get(recording.id)!;
    }
    if (recording.url && recording.url.startsWith('blob:')) {
      audioUrlRef.current.set(recording.id, recording.url);
      return recording.url;
    }
    if (recording.url && recording.url.startsWith('data:')) {
      try {
        const byteString = atob(recording.url.split(',')[1]);
        const mimeString = recording.url.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const blobUrl = URL.createObjectURL(blob);
        audioUrlRef.current.set(recording.id, blobUrl);
        return blobUrl;
      } catch (e) {
        console.error('[RecordPage] Error converting base64 to blob:', e);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    recordings.forEach((r) => {
      if (r.url && r.url.startsWith('data:') && !audioUrlRef.current.has(r.id)) {
        try {
          const byteString = atob(r.url.split(',')[1]);
          const mimeString = r.url.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const blobUrl = URL.createObjectURL(blob);
          audioUrlRef.current.set(r.id, blobUrl);
        } catch (e) {
          console.error('[RecordPage] Error preloading recording:', r.id, e);
        }
      }
    });
  }, [recordings]);

  const handleStartRecord = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        Taro.showToast({ title: '当前环境不支持录音', icon: 'none' });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      } catch (e) {
        try {
          mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/ogg' });
        } catch (e2) {
          mediaRecorder = new MediaRecorder(stream);
        }
      }

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          const duration = recordingTimeRef.current;
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const blobUrl = URL.createObjectURL(blob);

          const reader = new FileReader();
          reader.onloadend = () => {
            try {
              const base64Data = reader.result as string;
              const newRecording: Recording = {
                id: generateId(),
                userId: (state.currentUser || mockUserA).id,
                date: formatDate(new Date(), 'YYYY-MM-DD'),
                startTime: formatDate(new Date(Date.now() - duration * 1000), 'HH:mm'),
                endTime: formatDate(new Date(), 'HH:mm'),
                duration: duration,
                url: base64Data,
                markers: [],
                createdAt: new Date().toISOString(),
              };

              audioUrlRef.current.set(newRecording.id, blobUrl);
              dispatch({ type: 'ADD_RECORDING', payload: newRecording });

              if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
              }

              Taro.showToast({ title: '录音已保存', icon: 'success' });
            } catch (e) {
              console.error('[RecordPage] Error saving recording base64:', e);
              Taro.showToast({ title: '保存录音失败', icon: 'none' });
            }
          };
          reader.onerror = () => {
            console.error('[RecordPage] Error reading blob to base64');
            Taro.showToast({ title: '保存录音失败', icon: 'none' });
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.error('[RecordPage] Error saving recording:', e);
          Taro.showToast({ title: '保存录音失败', icon: 'none' });
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      Taro.showToast({ title: '开始录音', icon: 'none' });
    } catch (e) {
      console.error('[RecordPage] Error starting recording:', e);
      Taro.showModal({
        title: '无法录音',
        content: '请确保已授权麦克风权限，或在支持的浏览器中使用此功能',
        showCancel: false,
      });
    }
  };

  const handleStopRecord = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('[RecordPage] Error stopping recording:', e);
      }
    }
    setIsRecording(false);
    mediaRecorderRef.current = null;
  }, [dispatch, state.currentUser]);

  const handlePlay = async (recording: Recording) => {
    const audioUrl = getAudioUrl(recording);

    if (playingId === recording.id) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setPlayingId(null);
      setPlayingTime(0);
      return;
    }

    if (!audioUrl) {
      Taro.showToast({ title: '这是模拟录音，无法播放', icon: 'none' });
      setPlayingId(recording.id);
      let t = 0;
      const interval = setInterval(() => {
        t++;
        setPlayingTime(t);
        if (t >= recording.duration) {
          clearInterval(interval);
          setPlayingId(null);
          setPlayingTime(0);
        }
      }, 1000);
      return;
    }

    try {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      audio.ontimeupdate = () => {
        setPlayingTime(Math.floor(audio.currentTime));
      };

      audio.onended = () => {
        setPlayingId(null);
        setPlayingTime(0);
      };

      audio.onerror = () => {
        Taro.showToast({ title: '播放失败', icon: 'none' });
        setPlayingId(null);
      };

      setPlayingId(recording.id);
      setPlayingTime(0);
      await audio.play();
    } catch (e) {
      console.error('[RecordPage] Error playing audio:', e);
      Taro.showToast({ title: '播放失败', icon: 'none' });
      setPlayingId(null);
    }
  };

  const handleAddMarker = (recordingId: string) => {
    setSelectedRecordingId(recordingId);
    setMarkerType('snore');
    setMarkerDesc('');
    const currentSec = playingId === recordingId ? playingTime : 0;
    setMarkerTimeSeconds(currentSec);
    setShowMarkerModal(true);
  };

  const getDefaultMarkerDesc = (type: string) => {
    switch (type) {
      case 'snore':
        return '持续的大声打鼾';
      case 'pause':
        return '呼吸暂停后突然恢复';
      default:
        return '异常声音或动作';
    }
  };

  const getMarkerTypeText = (type: string) => {
    switch (type) {
      case 'snore':
        return '鼾声';
      case 'pause':
        return '呼吸暂停';
      default:
        return '其他';
    }
  };

  const handleSaveMarker = () => {
    if (!selectedRecordingId) return;

    const recording = recordings.find((r) => r.id === selectedRecordingId);
    if (!recording) return;

    const newMarker: AbnormalMarker = {
      id: generateId(),
      formId: selectedRecordingId,
      time: secondsToTimeStr(markerTimeSeconds),
      duration: 10,
      type: markerType,
      description: markerDesc || getDefaultMarkerDesc(markerType),
      timestamp: markerTimeSeconds,
    };

    const updatedRecording: Recording = {
      ...recording,
      markers: [...recording.markers, newMarker],
    };

    dispatch({ type: 'UPDATE_RECORDING', payload: updatedRecording });

    setShowMarkerModal(false);
    Taro.showToast({ title: '标记已保存', icon: 'success' });
  };

  const handlePlayMarker = (recording: Recording, marker: AbnormalMarker) => {
    const audioUrl = getAudioUrl(recording);
    if (!audioUrl) {
      Taro.showToast({ title: '模拟录音无法跳转', icon: 'none' });
      return;
    }

    try {
      if (playingId === recording.id && audioElementRef.current) {
        audioElementRef.current.currentTime = marker.timestamp;
        setPlayingTime(marker.timestamp);
        return;
      }

      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      setPlayingId(recording.id);
      setPlayingTime(marker.timestamp);

      audio.oncanplaythrough = () => {
        audio.currentTime = marker.timestamp;
        audio.play().catch((e) => {
          console.error('[RecordPage] Error playing from marker:', e);
        });
      };

      audio.ontimeupdate = () => {
        setPlayingTime(Math.floor(audio.currentTime));
      };

      audio.onended = () => {
        setPlayingId(null);
        setPlayingTime(0);
      };

      audio.onerror = () => {
        Taro.showToast({ title: '播放失败', icon: 'none' });
        setPlayingId(null);
      };

      audio.load();
    } catch (e) {
      console.error('[RecordPage] Error playing marker:', e);
    }
  };

  const handleDeleteRecording = (recordingId: string) => {
    Taro.showModal({
      title: '删除录音',
      content: '确定要删除这段录音吗？删除后无法恢复。',
      confirmColor: '#FF4757',
      success: (res) => {
        if (res.confirm) {
          const updated = recordings.filter((r) => r.id !== recordingId);
          dispatch({ type: 'SET_RECORDINGS', payload: updated });

          const url = audioUrlRef.current.get(recordingId);
          if (url && url.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(url);
            } catch (e) {}
            audioUrlRef.current.delete(recordingId);
          }

          if (playingId === recordingId) {
            if (audioElementRef.current) {
              audioElementRef.current.pause();
              audioElementRef.current = null;
            }
            setPlayingId(null);
            setPlayingTime(0);
          }

          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  };

  const handleShare = () => {
    Taro.showActionSheet({
      itemList: ['分享给伴侣', '分享给医生', '导出音频文件'],
      success: (res) => {
        const actions = ['分享给伴侣成功', '已发送给医生', '开始导出...'];
        Taro.showToast({ title: actions[res.tapIndex], icon: 'success' });
      },
    });
  };

  const handleGoToForm = () => {
    Taro.navigateTo({ url: '/pages/form/index' });
  };

  const getWaveformData = (recording: Recording) => {
    return Array.from({ length: 40 }, (_, i) => {
      const baseHeight = 10 + (Math.sin(i * 0.5 + recording.id.charCodeAt(0)) * 0.5 + 1) * 25;
      const isMarker = recording.markers.some(
        (m) => Math.floor((m.timestamp / recording.duration) * 40) === i
      );
      const isPlaying =
        playingId === recording.id &&
        Math.floor((playingTime / recording.duration) * 40) >= i;
      return { height: Math.max(10, Math.min(80, baseHeight)), isMarker, isPlaying };
    });
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
            <Text className={styles.desc}>
              点击上方按钮开始录制夜间睡眠声音，帮助更准确地分析睡眠健康状况
            </Text>
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
                {getWaveformData(recording).map((bar, i) => (
                  <View
                    key={i}
                    className={`${styles.bar} ${bar.isMarker ? styles.marker : ''} ${
                      bar.isPlaying ? styles.active : ''
                    }`}
                    style={{ height: `${bar.height}%` }}
                  />
                ))}
              </View>

              <View className={styles.controls}>
                <View
                  className={styles.playBtn}
                  onClick={() => handlePlay(recording)}
                >
                  {playingId === recording.id ? '⏸' : '▶'}
                </View>
                <View className={styles.progress}>
                  <Slider
                    min={0}
                    max={recording.duration}
                    step={1}
                    value={playingId === recording.id ? playingTime : 0}
                    activeColor="#4A90D9"
                    backgroundColor="#F0F2F5"
                    blockColor="#4A90D9"
                    blockSize={16}
                    onChange={(e) => {
                      if (playingId === recording.id) {
                        setPlayingTime(e.detail.value);
                        if (audioElementRef.current) {
                          audioElementRef.current.currentTime = e.detail.value;
                        }
                      }
                    }}
                  />
                  <View className={styles.time}>
                    <Text>
                      {playingId === recording.id
                        ? formatTimeFull(playingTime)
                        : '00:00:00'}
                    </Text>
                    <Text>{formatTimeFull(recording.duration)}</Text>
                  </View>
                </View>
                <View className={styles.markBtn} onClick={() => handleAddMarker(recording.id)}>
                  🏷️
                </View>
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
                        <View
                          className={styles.playMarkerBtn}
                          onClick={() => handlePlayMarker(recording, marker)}
                        >
                          ▶
                        </View>
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
                <View className={styles.actionBtn} onClick={handleGoToForm}>
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
              <View className={styles.timeSlider}>
                <Slider
                  min={0}
                  max={
                    selectedRecordingId
                      ? recordings.find((r) => r.id === selectedRecordingId)?.duration || 3600
                      : 3600
                  }
                  step={1}
                  value={markerTimeSeconds}
                  activeColor="#4A90D9"
                  backgroundColor="#F0F2F5"
                  blockColor="#4A90D9"
                  blockSize={24}
                  onChange={(e) => setMarkerTimeSeconds(e.detail.value)}
                />
              </View>
              <Text className={styles.timeValue}>{secondsToTimeStr(markerTimeSeconds)}</Text>
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
              <View
                className={`${styles.btn} ${styles.cancel}`}
                onClick={() => setShowMarkerModal(false)}
              >
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
