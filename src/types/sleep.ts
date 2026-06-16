// 用户信息
export interface User {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  role: 'userA' | 'userB';
  bindCode: string;
  bindPartnerId?: string;
  bindPartnerName?: string;
}

// 睡眠姿势
export type SleepPosition = 'back' | 'left' | 'right' | 'stomach' | 'mixed';

// 鼾声等级 1-5
export type SnoreLevel = 1 | 2 | 3 | 4 | 5;

// 精神状态评分 1-5
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

// 睡眠数据填报
export interface SleepForm {
  id: string;
  userId: string;
  partnerId?: string;
  date: string;
  // 自我感受
  snoreLevel: SnoreLevel; // 自评鼾声程度
  wakeUpChoked: number; // 憋醒次数
  sleepPosition: SleepPosition; // 主要睡姿
  nightWakeCount: number; // 夜间起床次数
  energyLevel: EnergyLevel; // 白天精神状态
  sleepHours: number; // 睡眠时长（小时）
  sleepQuality: number; // 睡眠质量自评 1-5
  // 备注
  selfNotes?: string;
  // 观察他人
  observeSnoreLevel?: SnoreLevel; // 观察到对方鼾声
  observeWakeUpChoked?: number; // 观察到对方憋醒次数
  observeAbnormalEvents?: string; // 观察到的异常事件
  observeNotes?: string; // 观察备注
  // 录音
  hasRecording?: boolean;
  recordingUrl?: string;
  recordingDuration?: number;
  abnormalMarkers?: AbnormalMarker[];
  // 创建时间
  createdAt: string;
  updatedAt: string;
}

// 异常标记
export interface AbnormalMarker {
  id: string;
  formId: string;
  time: string; // 录音中的时间点，如 "00:15:30"
  duration: number; // 持续秒数
  type: 'snore' | 'pause' | 'other';
  description: string;
  timestamp: number;
}

// 合并报告
export interface MergeReport {
  id: string;
  date: string;
  userAId: string;
  userBId: string;
  userAForm: SleepForm;
  userBForm: SleepForm;
  // 自动分析结果
  analysis: ReportAnalysis;
  // 风险提示
  risks: RiskTip[];
  // 建议
  suggestions: Suggestion[];
  createdAt: string;
}

// 报告分析
export interface ReportAnalysis {
  snoreConsistency: number; // 鼾声自评 vs 观察一致性 0-100
  sleepQualityAvg: number; // 平均睡眠质量
  totalWakeEvents: number; // 总醒觉事件
  abnormalEventsCount: number; // 异常事件数
  riskLevel: 'low' | 'medium' | 'high';
  overallScore: number; // 综合评分 0-100
  // 差异分析
  differences: {
    snoreDiff: number; // 鼾声认知差异
    wakeDiff: number; // 醒觉认知差异
    notes: string;
  };
}

// 风险提示
export interface RiskTip {
  id: string;
  level: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
  source: 'userA' | 'userB' | 'both' | 'analysis';
}

// 建议
export interface Suggestion {
  id: string;
  category: 'lifestyle' | 'environment' | 'medical' | 'routine';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

// 就医准备清单
export interface MedicalChecklist {
  id: string;
  title: string;
  description: string;
  category: 'symptom' | 'exam' | 'question' | 'document';
  checked: boolean;
}

// 睡眠环境调整清单
export interface EnvironmentChecklist {
  id: string;
  title: string;
  description: string;
  category: 'light' | 'sound' | 'temperature' | 'bedding' | 'other';
  checked: boolean;
  priority: 'high' | 'medium' | 'low';
}

// 复测提醒
export interface RetestReminder {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  enabled: boolean;
  repeat: 'once' | 'daily' | 'weekly';
  createdAt?: string;
}

// 录音记录
export interface Recording {
  id: string;
  formId?: string;
  userId: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number; // 秒
  url: string;
  markers: AbnormalMarker[];
  createdAt: string;
}

// 历史记录
export interface HistoryRecord {
  id: string;
  date: string;
  type: 'form' | 'report' | 'recording';
  title: string;
  description: string;
  hasRisk: boolean;
}

// 全局状态
export interface SleepState {
  currentUser: User | null;
  partner: User | null;
  isBound: boolean;
  currentForm: SleepForm | null;
  forms: SleepForm[];
  reports: MergeReport[];
  recordings: Recording[];
  suggestions: Suggestion[];
  medicalChecklist: MedicalChecklist[];
  environmentChecklist: EnvironmentChecklist[];
  reminders: RetestReminder[];
  loading: boolean;
}

// 状态操作类型
export type SleepAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_PARTNER'; payload: User | null }
  | { type: 'SET_BOUND'; payload: boolean }
  | { type: 'ADD_FORM'; payload: SleepForm }
  | { type: 'UPDATE_FORM'; payload: SleepForm }
  | { type: 'SET_FORMS'; payload: SleepForm[] }
  | { type: 'ADD_REPORT'; payload: MergeReport }
  | { type: 'SET_REPORTS'; payload: MergeReport[] }
  | { type: 'ADD_RECORDING'; payload: Recording }
  | { type: 'UPDATE_RECORDING'; payload: Recording }
  | { type: 'SET_RECORDINGS'; payload: Recording[] }
  | { type: 'UPDATE_SUGGESTION'; payload: Suggestion }
  | { type: 'SET_SUGGESTIONS'; payload: Suggestion[] }
  | { type: 'UPDATE_MEDICAL_CHECKLIST'; payload: MedicalChecklist }
  | { type: 'SET_MEDICAL_CHECKLIST'; payload: MedicalChecklist[] }
  | { type: 'UPDATE_ENVIRONMENT_CHECKLIST'; payload: EnvironmentChecklist }
  | { type: 'SET_ENVIRONMENT_CHECKLIST'; payload: EnvironmentChecklist[] }
  | { type: 'ADD_REMINDER'; payload: RetestReminder }
  | { type: 'UPDATE_REMINDER'; payload: RetestReminder }
  | { type: 'SET_REMINDERS'; payload: RetestReminder[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'HYDRATE_STATE'; payload: Partial<SleepState> };
