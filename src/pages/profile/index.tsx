import React, { useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useSleep } from '@/store/SleepContext';
import { mockUserA, mockUserB, mockForms, mockReports } from '@/data/mockData';
import UserAvatar from '@/components/UserAvatar';
import GradientButton from '@/components/GradientButton';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const { state, dispatch } = useSleep();

  useEffect(() => {
    console.log('[ProfilePage] Component mounted');
    if (!state.currentUser) {
      dispatch({ type: 'SET_USER', payload: mockUserA });
      dispatch({ type: 'SET_PARTNER', payload: mockUserB });
    }
  }, [dispatch, state.currentUser]);

  const handleShowBindCode = () => {
    console.log('[ProfilePage] Show bind code');
    Taro.showModal({
      title: '我的邀请码',
      content: `邀请码：${mockUserA.bindCode}\n\n让伴侣在绑定页面输入此邀请码即可完成绑定。`,
      showCancel: false,
      confirmText: '知道了',
    });
  };

  const handleBindPartner = () => {
    console.log('[ProfilePage] Navigate to bind page');
    Taro.navigateTo({ url: '/pages/bind/index' });
  };

  const handleEditProfile = (userId: string) => {
    console.log('[ProfilePage] Edit profile:', userId);
    Taro.showToast({
      title: '编辑功能开发中',
      icon: 'none',
    });
  };

  const handleSettingClick = (type: string) => {
    console.log('[ProfilePage] Click setting:', type);
    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    });
  };

  const totalDays = 14;
  const totalReports = mockReports.length;
  const totalRecords = mockForms.length;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.content}>
        <View className={styles.coupleCard}>
          <View className={styles.coupleUsers}>
            <View className={styles.coupleUser}>
              <UserAvatar
                src={mockUserA.avatar}
                name={mockUserA.name}
                role="userA"
                size="lg"
              />
              <Text className={styles.coupleName}>{mockUserA.name}</Text>
              <Text className={styles.coupleRole}>监测者</Text>
            </View>

            <View className={styles.coupleConnect}>
              <Text className={styles.heartBeat}>💕</Text>
              <Text className={styles.bindDays}>已绑定 {totalDays} 天</Text>
            </View>

            <View className={styles.coupleUser}>
              <UserAvatar
                src={mockUserB.avatar}
                name={mockUserB.name}
                role="userB"
                size="lg"
              />
              <Text className={styles.coupleName}>{mockUserB.name}</Text>
              <Text className={styles.coupleRole}>监测者</Text>
            </View>
          </View>

          <View className={styles.coupleInfo}>
            <Text className={styles.coupleInfoText}>共同守护睡眠健康</Text>
            <Text className={styles.coupleInfoDesc}>一个人睡，两个人看</Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>绑定管理</Text>
          </View>

          <View className={styles.bindCard}>
            <View className={styles.bindCodeRow}>
              <Text className={styles.bindCodeLabel}>我的邀请码</Text>
              <Text className={styles.bindCodeValue}>{mockUserA.bindCode}</Text>
            </View>
            <View className={styles.bindActions}>
              <View className={`${styles.bindBtn} ${styles.primary}`} onClick={handleShowBindCode}>
                <Text className={styles.bindBtnIcon}>📋</Text>
                <Text className={styles.bindBtnText}>查看二维码</Text>
              </View>
              <View className={`${styles.bindBtn} ${styles.outline}`} onClick={handleBindPartner}>
                <Text className={styles.bindBtnIcon}>🔗</Text>
                <Text className={styles.bindBtnText}>绑定新伴侣</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>个人资料</Text>
          </View>

          <View
            className={styles.profileCard}
            onClick={() => handleEditProfile(mockUserA.id)}
          >
            <View className={styles.profileHeader}>
              <UserAvatar
                src={mockUserA.avatar}
                name={mockUserA.name}
                role="userA"
                size="md"
              />
              <View className={styles.profileInfo}>
                <Text className={styles.profileName}>{mockUserA.name}</Text>
                <Text className={styles.profileMeta}>
                  {mockUserA.gender === 'male' ? '男' : '女'} · {mockUserA.age} 岁
                </Text>
              </View>
              <View className={styles.profileEditIcon}>
                <Text>✏️</Text>
              </View>
            </View>
            <View className={styles.profileFields}>
              <View className={styles.profileField}>
                <Text className={styles.profileFieldLabel}>身高</Text>
                <Text className={styles.profileFieldValue}>175 cm</Text>
              </View>
              <View className={styles.profileField}>
                <Text className={styles.profileFieldLabel}>体重</Text>
                <Text className={styles.profileFieldValue}>72 kg</Text>
              </View>
              <View className={styles.profileField}>
                <Text className={styles.profileFieldLabel}>BMI</Text>
                <Text className={styles.profileFieldValue}>23.5</Text>
              </View>
              <View className={styles.profileField}>
                <Text className={styles.profileFieldLabel}>颈围</Text>
                <Text className={styles.profileFieldValue}>40 cm</Text>
              </View>
            </View>
          </View>

          <View
            className={styles.profileCard}
            onClick={() => handleEditProfile(mockUserB.id)}
          >
            <View className={styles.profileHeader}>
              <UserAvatar
                src={mockUserB.avatar}
                name={mockUserB.name}
                role="userB"
                size="md"
              />
              <View className={styles.profileInfo}>
                <Text className={styles.profileName}>{mockUserB.name}</Text>
                <Text className={styles.profileMeta}>
                  {mockUserB.gender === 'male' ? '男' : '女'} · {mockUserB.age} 岁
                </Text>
              </View>
              <View className={styles.profileEditIcon}>
                <Text>✏️</Text>
              </View>
            </View>
            <View className={styles.profileFields}>
              <View className={styles.profileField}>
                <Text className={styles.profileFieldLabel}>身高</Text>
                <Text className={styles.profileFieldValue}>165 cm</Text>
              </View>
              <View className={styles.profileField}>
                <Text className={styles.profileFieldLabel}>体重</Text>
                <Text className={styles.profileFieldValue}>55 kg</Text>
              </View>
              <View className={styles.profileField}>
                <Text className={styles.profileFieldLabel}>BMI</Text>
                <Text className={styles.profileFieldValue}>20.2</Text>
              </View>
              <View className={styles.profileField}>
                <Text className={styles.profileFieldLabel}>颈围</Text>
                <Text className={styles.profileFieldValue}>34 cm</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>数据概览</Text>
          </View>

          <View className={styles.statsGrid}>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{totalDays}</Text>
              <Text className={styles.statLabel}>监测天数</Text>
              <Text className={styles.statSub}>共眠记录</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{totalReports}</Text>
              <Text className={styles.statLabel}>合并报告</Text>
              <Text className={styles.statSub}>双视角分析</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{totalRecords}</Text>
              <Text className={styles.statLabel}>填报记录</Text>
              <Text className={styles.statSub}>累计数据</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>设置</Text>
          </View>

          <View className={styles.settingsList}>
            <View className={styles.settingsItem} onClick={() => handleSettingClick('goal')}>
              <View className={`${styles.settingsIcon} ${styles.blue}`}>
                <Text>🎯</Text>
              </View>
              <View className={styles.settingsContent}>
                <Text className={styles.settingsTitle}>测量目标</Text>
                <Text className={styles.settingsDesc}>设置监测频率和健康目标</Text>
              </View>
              <Text className={styles.settingsArrow}>›</Text>
            </View>

            <View className={styles.settingsItem} onClick={() => handleSettingClick('reminder')}>
              <View className={`${styles.settingsIcon} ${styles.green}`}>
                <Text>⏰</Text>
              </View>
              <View className={styles.settingsContent}>
                <Text className={styles.settingsTitle}>提醒设置</Text>
                <Text className={styles.settingsDesc}>填报提醒、复测提醒</Text>
              </View>
              <Text className={styles.settingsArrow}>›</Text>
            </View>

            <View className={styles.settingsItem} onClick={() => handleSettingClick('privacy')}>
              <View className={`${styles.settingsIcon} ${styles.pink}`}>
                <Text>🔒</Text>
              </View>
              <View className={styles.settingsContent}>
                <Text className={styles.settingsTitle}>隐私设置</Text>
                <Text className={styles.settingsDesc}>数据共享权限管理</Text>
              </View>
              <Text className={styles.settingsArrow}>›</Text>
            </View>

            <View className={styles.settingsItem} onClick={() => handleSettingClick('about')}>
              <View className={`${styles.settingsIcon} ${styles.orange}`}>
                <Text>ℹ️</Text>
              </View>
              <View className={styles.settingsContent}>
                <Text className={styles.settingsTitle}>关于我们</Text>
                <Text className={styles.settingsDesc}>版本信息、帮助与反馈</Text>
              </View>
              <Text className={styles.settingsArrow}>›</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
          <GradientButton
            text="解除绑定"
            type="outline"
            size="md"
            onClick={() => {
              Taro.showModal({
                title: '确认解除绑定',
                content: '解除绑定后，双方将无法共享睡眠数据。确定要解除吗？',
                success: (res) => {
                  if (res.confirm) {
                    dispatch({ type: 'SET_BOUND', payload: false });
                    dispatch({ type: 'SET_PARTNER', payload: null });
                    Taro.showToast({
                      title: '已解除绑定',
                      icon: 'success',
                    });
                  }
                },
              });
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
