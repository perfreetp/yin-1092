import React, { useState, useRef } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import { mockUserA, mockUserB } from '@/data/mockData';
import { generateId } from '@/utils/date';

import { User } from '@/types/sleep';
import styles from './index.module.scss';

const VALID_PARTNER_CODES = ['B8K3M2', 'C9N4P3', 'D2Q5R7'];

const BindPage: React.FC = () => {
  const { state, dispatch } = useSleep();
  const [activeTab, setActiveTab] = useState<'invite' | 'input'>('invite');
  const [inputCode, setInputCode] = useState<string[]>(['', '', '', '', '', '']);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPartner, setNewPartner] = useState<User | null>(null);
  const inputRefs = useRef<(any)[]>([]);

  const isBound = state.isBound;
  const currentUser = state.currentUser || mockUserA;
  const partner = state.partner || mockUserB;
  const inviteCode = currentUser.bindCode || 'A8K3M2';

  const handleCopyCode = () => {
    Taro.setClipboardData({
      data: inviteCode,
      success: () => {
        Taro.showToast({
          title: '邀请码已复制',
          icon: 'success',
        });
      },
    });
  };

  const handleShareInvite = () => {
    Taro.showActionSheet({
      itemList: ['微信分享', 'QQ分享', '复制链接'],
      success: (res) => {
        const actions = ['已分享到微信', '已分享到QQ', '链接已复制'];
        Taro.showToast({
          title: actions[res.tapIndex],
          icon: 'success',
        });
      },
    });
  };

  const focusInput = (index: number) => {
    if (index < 0 || index > 5) return;
    const ref = inputRefs.current[index];
    if (ref) {
      if (typeof ref.focus === 'function') {
        ref.focus();
      } else if (ref.$ref) {
        try {
          ref.$ref.focus();
        } catch (e) {
          // H5 fallback
          const inputs = document.querySelectorAll(`.${styles.codeInput}`);
          const target = inputs[index] as HTMLInputElement;
          if (target) target.focus();
        }
      } else {
        // H5 fallback
        const inputs = document.querySelectorAll(`.${styles.codeInput}`);
        const target = inputs[index] as HTMLInputElement;
        if (target) target.focus();
      }
    } else {
      // H5 fallback
      const inputs = document.querySelectorAll(`.${styles.codeInput}`);
      const target = inputs[index] as HTMLInputElement;
      if (target) target.focus();
    }
  };

  const handleCodeInput = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    const newCode = [...inputCode];

    if (char === '' && !inputCode[index]) {
      if (index > 0) {
        focusInput(index - 1);
      }
      return;
    }

    newCode[index] = char;
    setInputCode(newCode);

    if (char && index < 5) {
      setTimeout(() => focusInput(index + 1), 10);
    }

    if (char === '' && index > 0 && !inputCode[index]) {
      setTimeout(() => focusInput(index - 1), 10);
    }
  };

  const handleCodeKeyDown = (index: number, e: any) => {
    if (e.keyCode === 8 || e.key === 'Backspace') {
      if (!inputCode[index] && index > 0) {
        const newCode = [...inputCode];
        newCode[index - 1] = '';
        setInputCode(newCode);
        setTimeout(() => focusInput(index - 1), 10);
      }
    }
  };

  const handleSubmitCode = () => {
    const code = inputCode.join('');
    console.log('[BindPage] Submitting code:', code);

    if (code.length < 6) {
      Taro.showToast({
        title: '请输入完整的邀请码',
        icon: 'none',
      });
      return;
    }

    if (code === inviteCode || code === currentUser.bindCode) {
      Taro.showModal({
        title: '邀请码无效',
        content: '不能绑定自己的邀请码，请让伴侣分享Ta的邀请码给你',
        showCancel: false,
      });
      return;
    }

    if (VALID_PARTNER_CODES.includes(code)) {
      const partnerUser: User = {
        id: 'user-b-' + Date.now(),
        name: '亲爱的伴侣',
        avatar: '👩',
        gender: 'female',
        age: 28,
        role: 'userB',
        bindCode: code,
        bindPartnerId: currentUser.id,
        bindPartnerName: currentUser.name,
      };

      setNewPartner(partnerUser);
      setShowSuccess(true);
    } else {
      Taro.showModal({
        title: '邀请码无效',
        content: '请检查邀请码是否正确，或让对方重新生成邀请码',
        showCancel: false,
      });
    }
  };

  const handleConfirmBind = () => {
    console.log('[BindPage] Confirming bind with:', newPartner);
    if (newPartner) {
      dispatch({ type: 'SET_PARTNER', payload: newPartner });
      dispatch({ type: 'SET_BOUND', payload: true });
    }
    setShowSuccess(false);
    Taro.showToast({
      title: '绑定成功',
      icon: 'success',
    });
  };

  const handleUnbind = () => {
    console.log('[BindPage] Unbinding');
    Taro.showModal({
      title: '解除绑定',
      content: '解除绑定后，所有共享的睡眠数据将不再同步。确定要解除绑定吗？',
      confirmColor: '#FF4D4F',
      success: (res) => {
        if (res.confirm) {
          dispatch({ type: 'SET_PARTNER', payload: null });
          dispatch({ type: 'SET_BOUND', payload: false });
          Taro.showToast({
            title: '已解除绑定',
            icon: 'success',
          });
        }
      },
    });
  };

  const handleScanCode = () => {
    console.log('[BindPage] Scanning code');
    Taro.showToast({
      title: '即将打开扫码功能',
      icon: 'none',
    });
  };

  const benefits = [
    {
      icon: '📊',
      title: '双人数据对比',
      desc: '对比两人的睡眠数据，发现彼此影响因素',
    },
    {
      icon: '🎯',
      title: '双视角观察',
      desc: '自我感受 + 对方观察，数据更全面准确',
    },
    {
      icon: '💡',
      title: '共同生活建议',
      desc: '基于双方数据，生成更贴合的改善建议',
    },
    {
      icon: '👨‍👩‍👧',
      title: '分享给家人',
      desc: '一键导出报告，方便家人了解健康状况',
    },
  ];

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.icon}>💕</Text>
        <Text className={styles.title}>双人绑定</Text>
        <Text className={styles.subtitle}>
          一个人睡，两个人看
          {'\n'}
          绑定伴侣，共同关注睡眠健康
        </Text>
      </View>

      <ScrollView scrollY>
        {isBound ? (
          <View className={styles.boundSection}>
            <Text className={styles.boundTitle}>🎉 已成功绑定</Text>

            <View className={styles.partnerCard}>
              <View className={styles.avatar}>{partner.avatar}</View>
              <View className={styles.info}>
                <Text className={styles.name}>{partner.name}</Text>
                <Text className={styles.bindTime}>绑定于 2024年12月10日</Text>
                <Text className={styles.status}>● 已绑定</Text>
              </View>
              <Text className={styles.heart}>❤️</Text>
            </View>

            <View className={styles.stats}>
              <View className={styles.statItem}>
                <Text className={styles.value}>{state.reports.length || 5}</Text>
                <Text className={styles.label}>共同报告</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.value}>{state.recordings.length || 12}</Text>
                <Text className={styles.label}>录音记录</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.value}>{state.suggestions.filter(s => s.completed).length || 8}</Text>
                <Text className={styles.label}>已完成建议</Text>
              </View>
            </View>

            <View className={styles.actionBtn} onClick={handleUnbind}>
              解除绑定
            </View>
          </View>
        ) : (
          <View className={styles.unboundSection}>
            <View className={styles.tabBar}>
              <View
                className={`${styles.tabItem} ${activeTab === 'invite' ? styles.active : ''}`}
                onClick={() => setActiveTab('invite')}
              >
                我的邀请码
              </View>
              <View
                className={`${styles.tabItem} ${activeTab === 'input' ? styles.active : ''}`}
                onClick={() => setActiveTab('input')}
              >
                输入邀请码
              </View>
            </View>

            {activeTab === 'invite' ? (
              <View className={styles.inviteCodeSection}>
                <Text className={styles.sectionTitle}>分享你的邀请码</Text>
                <Text className={styles.sectionDesc}>
                  将邀请码分享给你的伴侣，{partner.name} 输入后即可完成绑定
                </Text>

                <View className={styles.codeCard}>
                  <Text className={styles.codeLabel}>我的邀请码</Text>
                  <Text className={styles.codeValue}>{inviteCode}</Text>
                  <Text className={styles.codeTip}>邀请码 24 小时内有效</Text>
                </View>

                <View className={styles.actionButtons}>
                  <View className={`${styles.btn} ${styles.secondary}`} onClick={handleCopyCode}>
                    复制邀请码
                  </View>
                  <View className={`${styles.btn} ${styles.primary}`} onClick={handleShareInvite}>
                    分享给Ta
                  </View>
                </View>

                <View className={styles.qrSection}>
                  <Text className={styles.qrTitle}>或扫码绑定</Text>
                  <View className={styles.qrCode}>
                    <View className={styles.qrPattern}>
                      <View className={styles.centerDot}>💕</View>
                    </View>
                  </View>
                  <Text className={styles.qrTip}>让伴侣扫描二维码，快速完成绑定</Text>
                  <View className={styles.scanBtn} onClick={handleScanCode}>
                    📷 我要扫码
                  </View>
                </View>

                <View className={styles.tipCard}>
                  <Text className={styles.tipTitle}>
                    <Text>💡</Text> 温馨提示
                  </Text>
                  <Text className={styles.tipContent}>
                    • 绑定后，双方可以看到彼此的睡眠观察数据{'\n'}
                    • 建议两人在同一天早上分别填写观察记录{'\n'}
                    • 系统会自动对比分析双方数据，生成共同报告{'\n'}
                    • 可以随时解除绑定，数据不会丢失
                  </Text>
                </View>
              </View>
            ) : (
              <View className={styles.inputCodeSection}>
                <Text className={styles.sectionTitle}>输入邀请码</Text>
                <Text className={styles.sectionDesc}>
                  请输入 {partner.name} 分享的 6 位邀请码，完成绑定
                </Text>

                <View className={styles.inputArea}>
                  {inputCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(node) => {
                        inputRefs.current[index] = node;
                      }}
                      className={`${styles.codeInput} ${digit ? styles.filled : ''}`}
                      type="text"
                      maxlength={1}
                      value={digit}
                      focus={index === 0 && inputCode.every((c) => !c)}
                      onInput={(e) => handleCodeInput(index, e.detail.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e as any)}
                    />
                  ))}
                </View>

                <Text className={styles.hint}>
                  找不到邀请码？
                  <Text className={styles.link} onClick={() => setActiveTab('invite')}>
                    {' '}查看我的邀请码
                  </Text>
                </Text>

                <View className={styles.submitBtn} onClick={handleSubmitCode}>
                  绑定伴侣
                </View>

                <View className={styles.qrSection}>
                  <Text className={styles.qrTitle}>或扫码绑定</Text>
                  <View className={styles.scanBtn} onClick={handleScanCode}>
                    📷 扫描二维码
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        <View className={styles.benefitsSection}>
          <Text className={styles.sectionTitle}>绑定后可以获得</Text>
          <View className={styles.benefitList}>
            {benefits.map((benefit, index) => (
              <View key={index} className={styles.benefitItem}>
                <View className={styles.icon}>{benefit.icon}</View>
                <View className={styles.content}>
                  <Text className={styles.title}>{benefit.title}</Text>
                  <Text className={styles.desc}>{benefit.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {showSuccess && newPartner && (
        <View className={styles.successModal} onClick={(e) => e.stopPropagation()}>
          <View className={styles.modalContent}>
            <View className={styles.successIcon}>🎉</View>
            <Text className={styles.title}>绑定成功！</Text>
            <Text className={styles.desc}>
              你已成功与 {newPartner.name} 绑定
              {'\n'}
              现在可以开始共同记录睡眠观察了
            </Text>
            <View className={styles.partnerInfo}>
              <View className={styles.avatar}>{newPartner.avatar}</View>
              <Text className={styles.name}>{newPartner.name}</Text>
              <Text className={styles.heart}>❤️</Text>
              <View className={styles.avatar}>{currentUser.avatar}</View>
              <Text className={styles.name}>{currentUser.name}</Text>
            </View>
            <View className={styles.btn} onClick={handleConfirmBind}>
              开始使用
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BindPage;
