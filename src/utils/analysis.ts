import {
  SleepForm,
  MergeReport,
  ReportAnalysis,
  RiskTip,
  Suggestion,
  SnoreLevel,
} from '@/types/sleep';
import { generateId } from './date';

export const calculateSnoreConsistency = (
  userAForm: SleepForm,
  userBForm: SleepForm
): number => {
  const aSnore = Number(userAForm?.snoreLevel) || 1;
  const bObserveA = Number(userBForm?.observeSnoreLevel) || aSnore;
  const diff = Math.abs(aSnore - bObserveA);
  return Math.max(0, 100 - diff * 20);
};

export const analyzeRisk = (form: SleepForm): 'low' | 'medium' | 'high' => {
  if (!form) return 'low';
  let score = 0;
  const snoreLevel = Number(form.snoreLevel) || 1;
  const wakeUpChoked = Number(form.wakeUpChoked) || 0;
  const nightWakeCount = Number(form.nightWakeCount) || 0;
  const energyLevel = Number(form.energyLevel) || 3;
  const sleepQuality = Number(form.sleepQuality) || 3;
  if (snoreLevel >= 4) score += 2;
  if (wakeUpChoked >= 2) score += 3;
  if (nightWakeCount >= 3) score += 1;
  if (energyLevel <= 2) score += 1;
  if (sleepQuality <= 2) score += 2;

  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
};

export const generateReport = (
  userAForm: SleepForm,
  userBForm: SleepForm
): MergeReport => {
  const analysis = generateAnalysis(userAForm, userBForm);
  const risks = generateRisks(userAForm, userBForm, analysis);
  const suggestions = generateSuggestions(analysis, risks);

  return {
    id: generateId(),
    date: userAForm.date,
    userAId: userAForm.userId,
    userBId: userBForm.userId,
    userAForm,
    userBForm,
    analysis,
    risks,
    suggestions,
    createdAt: new Date().toISOString(),
  };
};

export const generateAnalysis = (
  userAForm: SleepForm,
  userBForm: SleepForm
): ReportAnalysis => {
  if (!userAForm) userAForm = {} as SleepForm;
  if (!userBForm) userBForm = {} as SleepForm;

  const snoreConsistency = calculateSnoreConsistency(userAForm, userBForm);
  const sleepQualityAvg = (
    (Number(userAForm.sleepQuality) || 3) + (Number(userBForm.sleepQuality) || 3)
  ) / 2;
  const totalWakeEvents =
    (Number(userAForm.wakeUpChoked) || 0) +
    (Number(userBForm.wakeUpChoked) || 0) +
    (Number(userAForm.nightWakeCount) || 0) +
    (Number(userBForm.nightWakeCount) || 0);
  const abnormalEventsCount =
    (userAForm.abnormalMarkers?.length || 0) +
    (userBForm.abnormalMarkers?.length || 0);

  const riskA = analyzeRisk(userAForm);
  const riskB = analyzeRisk(userBForm);
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskA === 'high' || riskB === 'high') riskLevel = 'high';
  else if (riskA === 'medium' || riskB === 'medium') riskLevel = 'medium';

  const snoreA = Number(userAForm.snoreLevel) || 1;
  const snoreB = Number(userBForm.snoreLevel) || 1;
  const observeSnoreB = Number(userBForm.observeSnoreLevel) || snoreA;
  const chokedA = Number(userAForm.wakeUpChoked) || 0;
  const chokedB = Number(userBForm.wakeUpChoked) || 0;
  const observeChokedB = Number(userBForm.observeWakeUpChoked) || chokedA;

  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        sleepQualityAvg * 15 +
          Math.max(0, 5 - (chokedA + chokedB)) * 10 +
          snoreConsistency * 0.3 +
          Math.max(0, 5 - (snoreA + snoreB) / 2) * 10
      )
    )
  );

  const snoreDiff = Math.abs(snoreA - observeSnoreB);
  const wakeDiff = Math.abs(chokedA - observeChokedB);

  let notes = '';
  if (snoreDiff >= 2) notes += '双方对鼾声的感知存在较大差异，建议参考录音数据。';
  if (wakeDiff >= 2) notes += '对夜间憋醒次数的认知存在差异，需关注睡眠呼吸问题。';
  if (!notes) notes = '双方数据一致性较好，可作为参考依据。';

  return {
    snoreConsistency,
    sleepQualityAvg,
    totalWakeEvents,
    abnormalEventsCount,
    riskLevel,
    overallScore: Number.isFinite(overallScore) ? overallScore : 60,
    differences: {
      snoreDiff,
      wakeDiff,
      notes,
    },
  };
};

export const generateRisks = (
  userAForm: SleepForm,
  userBForm: SleepForm,
  analysis: ReportAnalysis
): RiskTip[] => {
  const risks: RiskTip[] = [];

  const aSnore = Number(userAForm?.snoreLevel) || 1;
  const aChoked = Number(userAForm?.wakeUpChoked) || 0;
  const bSnore = Number(userBForm?.snoreLevel) || 1;
  const bChoked = Number(userBForm?.wakeUpChoked) || 0;

  if (aSnore >= 4) {
    risks.push({
      id: generateId(),
      level: 'warning',
      title: '鼾声较大',
      description: `自我评估鼾声程度为 ${aSnore}/5，建议关注睡眠呼吸状况。`,
      source: 'userA',
    });
  }

  if (aChoked >= 2) {
    risks.push({
      id: generateId(),
      level: 'danger',
      title: '夜间憋醒频繁',
      description: `报告夜间憋醒 ${aChoked} 次，可能存在睡眠呼吸暂停风险。`,
      source: 'userA',
    });
  }

  if (bSnore >= 4) {
    risks.push({
      id: generateId(),
      level: 'warning',
      title: '鼾声较大',
      description: `自我评估鼾声程度为 ${bSnore}/5，建议关注睡眠呼吸状况。`,
      source: 'userB',
    });
  }

  if (bChoked >= 2) {
    risks.push({
      id: generateId(),
      level: 'danger',
      title: '夜间憋醒频繁',
      description: `报告夜间憋醒 ${bChoked} 次，可能存在睡眠呼吸暂停风险。`,
      source: 'userB',
    });
  }

  // 差异分析风险
  if (analysis.differences.snoreDiff >= 2) {
    risks.push({
      id: generateId(),
      level: 'info',
      title: '鼾声认知差异',
      description: `自我评估与伴侣观察的鼾声程度相差 ${analysis.differences.snoreDiff} 级，建议参考录音。`,
      source: 'analysis',
    });
  }

  // 异常事件风险
  if (analysis.abnormalEventsCount > 0) {
    risks.push({
      id: generateId(),
      level: 'warning',
      title: '存在异常事件标记',
      description: `录音中共标记了 ${analysis.abnormalEventsCount} 个异常时段，建议重点关注。`,
      source: 'analysis',
    });
  }

  return risks;
};

export const generateSuggestions = (
  analysis: ReportAnalysis,
  _risks: RiskTip[]
): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  // 基础建议
  suggestions.push({
    id: generateId(),
    category: 'routine',
    title: '保持规律作息',
    description: '每天固定时间上床睡觉和起床，即使周末也保持一致。',
    priority: 'high',
    completed: false,
  });

  suggestions.push({
    id: generateId(),
    title: '睡前避免刺激',
    category: 'lifestyle',
    description: '睡前1小时避免使用电子设备，避免摄入咖啡因和酒精。',
    priority: 'high',
    completed: false,
  });

  // 根据风险等级添加建议
  if (analysis.riskLevel === 'high') {
    suggestions.push({
      id: generateId(),
      category: 'medical',
      title: '建议就医检查',
      description: '根据评估结果，建议尽快到医院睡眠中心进行专业检查。',
      priority: 'high',
      completed: false,
    });
  }

  if (analysis.riskLevel === 'medium' || analysis.riskLevel === 'high') {
    suggestions.push({
      id: generateId(),
      category: 'environment',
      title: '调整睡眠姿势',
      description: '尝试侧卧位睡眠，避免仰卧时舌后坠阻塞气道。',
      priority: 'medium',
      completed: false,
    });

    suggestions.push({
      id: generateId(),
      category: 'lifestyle',
      title: '控制体重',
      description: '保持健康体重，减轻颈部脂肪堆积对气道的压迫。',
      priority: 'medium',
      completed: false,
    });
  }

  // 环境建议
  suggestions.push({
    id: generateId(),
    category: 'environment',
    title: '优化睡眠环境',
    description: '保持卧室安静、黑暗、凉爽（18-22°C），使用舒适的床品。',
    priority: 'medium',
    completed: false,
  });

  suggestions.push({
    id: generateId(),
    category: 'routine',
    title: '定期复测',
    description: '建议每周进行一次睡眠评估，跟踪改善情况。',
    priority: 'low',
    completed: false,
  });

  return suggestions;
};

export const getSnoreLevelText = (level: SnoreLevel): string => {
  const texts: Record<SnoreLevel, string> = {
    1: '几乎没有',
    2: '轻微',
    3: '中等',
    4: '较大',
    5: '严重',
  };
  return texts[level];
};

export const getSleepPositionText = (position: string): string => {
  const texts: Record<string, string> = {
    back: '仰卧',
    left: '左侧卧',
    right: '右侧卧',
    stomach: '俯卧',
    mixed: '多变',
  };
  return texts[position] || position;
};

export const getEnergyLevelText = (level: number): string => {
  const texts: Record<number, string> = {
    1: '非常疲惫',
    2: '比较累',
    3: '一般',
    4: '比较精神',
    5: '精力充沛',
  };
  return texts[level] || '一般';
};
