'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ============== 类型 ==============

export interface AccountInfo {
  userId?: number;
  balance?: number;
  budget?: number;
  cost?: number;
  dayBudget?: number;
  payment?: number;
  budgetType?: number;
  accountType?: number;
  regionTarget?: number[];
  userStat?: number;
  excludeIp?: string[];
  openDomains?: string;
  [key: string]: unknown;
}

export interface CampaignInfo {
  campaignId: number;
  campaignName: string;
  budget: number;
  status: number;
  pause: boolean;
  bidType: number;
  device: number;
  regionTarget?: number[];
  negativeWords?: string[];
  exactNegativeWords?: string[];
  [key: string]: unknown;
}

export interface CreativeInfo {
  creativeId: number;
  creativeName: string;
  adgroupId?: number;
  title: string;
  description1: string;
  description2: string;
  status: number;
  pause: boolean;
  [key: string]: unknown;
}

// ============== 常量 ==============

export const TABS = [
  { key: 'strategy', label: '策略概览', path: '/baidu', icon: 'M3 3h18v4H3V3zm0 7h18v4H3v-4zm0 7h18v4H3v-4z' },
  { key: 'campaign', label: '投放管理', path: '/baidu/campaign', icon: 'M5 3h14l2 6H3l2-6zm1 8h12v10H6V11z' },
  { key: 'creative', label: '创意监控', path: '/baidu/creative', icon: 'M4 5h16v2H4V5zm0 6h10v8H4v-8zm14 0h-4v8h4v-8z' },
  { key: 'report', label: '数据分析', path: '/baidu/report', icon: 'M3 19h18v2H3v-2zm6-8h2v6H9v-6zm4-3h2v9h-2V8zm4-2h2v11h-2V6z' },
  { key: 'agent', label: '智能助手', path: '/baidu/agent', icon: 'M12 2a4 4 0 014 4c0 1.1-.45 2.1-1.17 2.83A9.96 9.96 0 0120 17.32V18H4v-.68a9.96 9.96 0 015.17-8.49A3.99 3.99 0 018 6a4 4 0 014-4zm0 2a2 2 0 00-2 2c0 .73.39 1.36.97 1.71l.5.32-.43.41A7.97 7.97 0 006.34 16h11.32a7.97 7.97 0 00-4.7-7.56l-.43-.41.5-.32c.58-.35.97-.98.97-1.71a2 2 0 00-2-2zm-1.5 14h3v2h-3v-2z' },
];

export const STATUS_MAP: Record<number, string> = {
  1: '有效', 2: '暂停', 3: '删除', 11: '审核中',
  12: '审核通过', 13: '审核拒绝', 21: '预算不足',
};

export function statusLabel(s: number): string { return STATUS_MAP[s] || `状态${s}`; }
export function statusColor(s: number): string {
  if (s === 1 || s === 12) return 'text-green-400 bg-green-500/10';
  if (s === 2 || s === 21) return 'text-yellow-400 bg-yellow-500/10';
  if (s === 3 || s === 13) return 'text-red-400 bg-red-500/10';
  return 'text-white/50 bg-white/5';
}

export const METRICS = [
  { value: 'cost', label: '消费' },
  { value: 'cpc', label: '点击均价' },
  { value: 'click', label: '点击量' },
  { value: 'impression', label: '展现量' },
  { value: 'ctr', label: '点击率' },
  { value: 'cpm', label: '千次展现消费' },
  { value: 'conversion', label: '转化数' },
];

export const LEVELS = [
  { value: 2, label: '账户' },
  { value: 3, label: '计划' },
  { value: 5, label: '单元' },
  { value: 7, label: '创意' },
];

export const REPORT_TYPES = [
  { value: 10, label: '账户报告' },
  { value: 11, label: '计划报告' },
];

export const UNITS = [
  { value: 5, label: '按日' },
  { value: 7, label: '按小时' },
  { value: 8, label: '汇总' },
];

// ============== 工具 ==============

export function fmtMoney(v?: number): string {
  if (v == null || isNaN(v)) return '—';
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`;
  return v.toFixed(2);
}

export function fmtNum(v?: number): string {
  if (v == null || isNaN(v)) return '—';
  if (v >= 10000) return `${(v / 10000).toFixed(1)}万`;
  return v.toLocaleString();
}

export function fmtPct(v?: number): string {
  if (v == null || isNaN(v)) return '—';
  return `${(v * 100).toFixed(2)}%`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN');
}

/** 计算预算消耗进度百分比 */
export function budgetUsage(cost?: number, budget?: number): number {
  if (!cost || !budget || budget <= 0) return 0;
  return Math.min((cost / budget) * 100, 100);
}

/** 预算消耗进度颜色 */
export function usageColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-yellow-500';
  return 'bg-blue-500';
}

// ============== 共享组件 ==============

/** Tab 导航 */
export function TabNav() {
  const pathname = usePathname();
  const getActiveKey = () => {
    if (pathname === '/baidu/campaign') return 'campaign';
    if (pathname === '/baidu/creative') return 'creative';
    if (pathname === '/baidu/report') return 'report';
    if (pathname === '/baidu/agent') return 'agent';
    return 'strategy';
  };
  const activeKey = getActiveKey();
  return (
    <div className="flex gap-1 mb-8 p-1 bg-white/5 rounded-xl border border-white/10">
      {TABS.map(t => (
        <Link key={t.key} href={t.path}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all flex-1 justify-center no-underline ${
            activeKey === t.key ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={t.icon} />
          </svg>
          {t.label}
        </Link>
      ))}
    </div>
  );
}

/** 加载状态 */
function Loading({ text = '加载数据...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-24 text-white/40 flex-col gap-3">
      <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-sm">{text}</span>
    </div>
  );
}

/** 错误状态 */
function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-2xl text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-red-400 text-sm">{message}</p>
      <button onClick={onRetry} className="px-5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors">重新加载</button>
    </div>
  );
}

/** 刷新时间戳 */
function RefreshBadge({ time, onRefresh }: { time: Date; onRefresh: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/20">{time.toLocaleTimeString('zh-CN')} 更新</span>
      <button onClick={onRefresh} className="p-1 hover:bg-white/10 rounded transition-colors" title="刷新">
        <svg className="w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}

/** 进度条 */
function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className={`w-full h-1.5 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-700 ${usageColor(pct)}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Macro Metric 卡片 */
function MacroCard({ label, value, sub, icon, color, highlight }: {
  label: string; value: string; sub?: string; icon: string; color: string; highlight?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden border rounded-2xl p-5 group transition-all ${
      highlight ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'
    }`}>
      <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full bg-linear-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-start justify-between">
        <svg className="w-7 h-7 text-white/25 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d={icon} /></svg>
        {highlight && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">核心</span>}
      </div>
      <p className="text-[11px] text-white/35 mt-3 mb-1 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

/** Section 标题 */
function SectionTitle({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h3 className="text-sm font-semibold text-white/70 tracking-wide">{title}</h3>
      {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">{badge}</span>}
    </div>
  );
}

// ============== 策略概览 ==============

interface StrategyAdvice {
  id: number;
  title: string;
  icon: string;
  color: string;
  urgency: 'high' | 'medium' | 'low';
  description: string;
  action: string;
  metrics: string[];
}

export function StrategyPanel() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/baidu/account');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '请求失败');
      setAccount(data.data);
      setRefreshedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccount(); }, [fetchAccount]);

  if (loading) return <Loading text="加载账户数据..." />;
  if (error) return <ErrorBlock message={error} onRetry={fetchAccount} />;
  if (!account) return null;

  const usage = budgetUsage(account.cost, account.dayBudget);
  const isBudgetExceeded = usage >= 90;
  const accountHealthy = account.balance != null && account.balance > 0;
  const costExceedingRevenue = account.cost != null && account.payment != null && account.cost > account.payment * 0.8;

  // ------ 生成3个运营策略 ------
  const strategies: StrategyAdvice[] = [
    {
      id: 1,
      title: '预算效能优化策略',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-amber-500 to-orange-600',
      urgency: 'high',
      description: usage >= 70
        ? `当前日预算消耗已达 ${usage.toFixed(1)}%，接近预算上限。建议立即评估各计划ROI，将预算向高转化计划倾斜，对低效计划设置分时段投放或降低出价。`
        : '当前预算消耗处于健康区间。建议维持现状的同时，每周review各计划边际ROI，将节省的预算分配至高潜力计划。',
      action: usage >= 70 ? '立即前往投放管理优化预算分配' : '持续监控各计划CPA趋势',
      metrics: ['预算消耗率', '计划ROI排名', 'CPA趋势'],
    },
    {
      id: 2,
      title: '账户健康度保障策略',
      icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      color: 'from-rose-500 to-pink-600',
      urgency: accountHealthy ? 'low' : 'high',
      description: accountHealthy
        ? `账户余额充足（¥${fmtMoney(account.balance)}），资金状态良好。建议关注账户有效状态、IP排除规则及开放域名配置，确保广告全天候正常展现。`
        : '账户余额偏低或存在异常，请尽快充值或排查账户状态。余额不足将导致广告停投，直接影响曝光和转化。',
      action: accountHealthy ? '设置余额告警阈值，定期检查域名配置' : '立即充值或联系账户管理员',
      metrics: ['账户余额', '有效状态', 'IP排除规则'],
    },
    {
      id: 3,
      title: '投放矩阵扩展策略',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      color: 'from-violet-500 to-purple-600',
      urgency: 'medium',
      description: '建议基于现有投放数据，扩展设备覆盖（移动端+PC端）、拓展新地域定向，并增加创意素材的A/B测试频次。多元化投放矩阵可以有效降低单一渠道波动风险，提升整体ROI稳定性。',
      action: '新增2-3个地域定向计划，开启移动端投放',
      metrics: ['设备覆盖度', '地域分布', '创意CTR对比'],
    },
  ];

  // ------ 快速健康指标 ------
  const healthIndicators = [
    { label: '账户状态', ok: accountHealthy, okText: '正常', failText: '异常' },
    { label: '预算状态', ok: !isBudgetExceeded, okText: '正常', failText: `消耗${usage.toFixed(0)}%` },
    { label: '成本预算比', ok: !costExceedingRevenue, okText: '正常', failText: '接近上限' },
  ];

  return (
    <div className="space-y-8">
      {/* ---- 账户健康状态栏 ---- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          {healthIndicators.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${h.ok ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              <span className="text-xs text-white/40">{h.label}</span>
              <span className={`text-xs font-medium ${h.ok ? 'text-green-300' : 'text-red-300'}`}>{h.ok ? h.okText : h.failText}</span>
            </div>
          ))}
        </div>
        <RefreshBadge time={refreshedAt} onRefresh={fetchAccount} />
      </div>

      {/* ---- 核心指标卡片 ---- */}
      <div>
        <SectionTitle title="核心指标" badge="实时" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MacroCard label="账户余额" value={`¥${fmtMoney(account.balance)}`}
            sub={account.balance != null && account.balance > 0 ? '资金充足' : '需关注'}
            icon="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"
            color="from-emerald-500 to-teal-500" highlight={false} />
          <MacroCard label="今日消费" value={`¥${fmtMoney(account.cost)}`}
            sub={`日预算 ¥${fmtMoney(account.dayBudget)}`}
            icon="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
            color="from-orange-500 to-red-500" highlight={isBudgetExceeded} />
          <MacroCard label="预算消耗率" value={`${usage.toFixed(1)}%`}
            sub={usage >= 90 ? '接近预算上限' : usage >= 70 ? '需关注消耗速度' : '消耗正常'}
            icon="M13 2.05V2h-2v.05C7.35 2.56 4.56 5.35 4.05 9H4v2h.05C4.56 14.65 7.35 17.44 11 17.95V18h2v-.05c3.65-.51 6.44-3.3 6.95-6.95H20v-2h-.05C19.44 5.35 16.65 2.56 13 2.05z"
            color="from-blue-500 to-indigo-500" highlight={isBudgetExceeded} />
          <MacroCard label="账户预算" value={account.budgetType === 0 ? '不限' : `¥${fmtMoney(account.budget)}`}
            sub={account.budgetType === 0 ? '不限定预算' : `${account.accountType === 0 ? '预付款' : '后付款'}`}
            icon="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"
            color="from-purple-500 to-pink-500" />
        </div>
        {/* 预算消耗进度条 */}
        {account.dayBudget != null && account.dayBudget > 0 && (
          <div className="mt-3 px-1">
            <div className="flex justify-between text-[10px] text-white/25 mb-1">
              <span>¥0</span><span>今日预算 ¥{fmtMoney(account.dayBudget)}</span>
            </div>
            <ProgressBar value={usage} />
          </div>
        )}
      </div>

      {/* ---- 运营策略建议（3个） ---- */}
      <div>
        <SectionTitle title="运营策略建议" badge="AI 推荐" />
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          {strategies.map(s => (
            <div key={s.id} className="relative border border-white/10 bg-white/3 hover:bg-white/6 hover:border-white/20 rounded-2xl p-5 transition-all group">
              {/* Urgency tag */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${s.color} flex items-center justify-center`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                  </svg>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  s.urgency === 'high' ? 'bg-red-500/20 text-red-300' :
                  s.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {s.urgency === 'high' ? '紧急' : s.urgency === 'medium' ? '建议' : '优化'}
                </span>
              </div>
              <h4 className="text-sm font-semibold mb-2">{s.title}</h4>
              <p className="text-xs text-white/45 leading-relaxed mb-4">{s.description}</p>
              {/* Action */}
              <div className="flex items-start gap-2 mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs text-blue-300">{s.action}</span>
              </div>
              {/* Related metrics */}
              <div className="flex flex-wrap gap-1.5">
                {s.metrics.map(m => (
                  <span key={m} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30">{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- 账户详情 & 快捷入口 ---- */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 账户详情 */}
        <div className="border border-white/10 bg-white/5 rounded-2xl p-6">
          <SectionTitle title="账户详情" />
          <div className="grid grid-cols-2 gap-3">
              {account && Object.entries(account).filter(([k]) => k !== 'userId' && k !== 'regionTarget' && k !== 'excludeIp').map(([k, v]) => (
              <div key={k} className="p-3 bg-white/4 rounded-lg">
                <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">{k}</p>
                <p className="text-sm font-mono text-white/70 break-all">
                  {typeof v === 'number' && (k.includes('udget') || k.includes('balance') || k.includes('cost') || k.includes('payment'))
                    ? `¥${fmtMoney(v)}`
                    : typeof v === 'boolean' ? (v ? '是' : '否') : String(v ?? '—')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="border border-white/10 bg-white/5 rounded-2xl p-6">
          <SectionTitle title="快捷操作" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '投放管理', desc: '查看和优化推广计划', href: '/baidu/campaign', icon: 'M5 3h14l2 6H3l2-6zm1 8h12v10H6V11z' },
              { label: '创意素材', desc: '监控创意审核与表现', href: '/baidu/creative', icon: 'M4 5h16v2H4V5zm0 6h10v8H4v-8zm14 0h-4v8h4v-8z' },
              { label: '数据分析', desc: '多维度数据报告', href: '/baidu/report', icon: 'M3 19h18v2H3v-2zm6-8h2v6H9v-6zm4-3h2v9h-2V8zm4-2h2v11h-2V6z' },
              { label: '刷新数据', desc: '重新拉取最新数据', href: '#', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', onClick: fetchAccount },
            ].map((op, i) => {
              const Inner = () => (
                <>
                  <svg className="w-5 h-5 text-white/30 mb-3 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={op.icon} />
                  </svg>
                  <p className="text-sm font-medium group-hover:text-blue-400 transition-colors">{op.label}</p>
                  <p className="text-[11px] text-white/35 mt-1">{op.desc}</p>
                </>
              );
              if (op.onClick) {
                return (
                  <button key={i} onClick={op.onClick}
                    className="p-4 bg-white/4 border border-white/5 rounded-xl text-left hover:border-white/20 hover:bg-white/7 transition-colors group">
                    <Inner />
                  </button>
                );
              }
              return (
                <Link key={i} href={op.href}
                  className="p-4 bg-white/4 border border-white/5 rounded-xl text-left hover:border-white/20 hover:bg-white/7 transition-colors group no-underline block">
                  <Inner />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== 投放管理 ==============

type CampaignSortKey = 'campaignId' | 'campaignName' | 'budget' | 'status' | 'bidType';

export function CampaignPanel() {
  const [campaigns, setCampaigns] = useState<CampaignInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<CampaignSortKey>('campaignId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/baidu/campaign');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '请求失败');
      setCampaigns(data.data || []);
      setRefreshedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleSort = (key: CampaignSortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = [...campaigns]
    .filter(c => {
      if (filter === 'active' && c.status !== 1) return false;
      if (filter === 'paused' && c.status !== 2) return false;
      if (filter === 'budgetExhausted' && c.status !== 21) return false;
      if (search && !c.campaignName?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      if (typeof aVal === 'string' && typeof bVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return 0;
    });

  const activeCount = campaigns.filter(c => c.status === 1).length;
  const pausedCount = campaigns.filter(c => c.status === 2).length;
  const budgetExhaustedCount = campaigns.filter(c => c.status === 21).length;
  const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0);

  if (loading) return <Loading text="加载推广计划..." />;
  if (error) return <ErrorBlock message={error} onRetry={loadData} />;

  const SortIcon = ({ k }: { k: CampaignSortKey }) => (
    <span className="inline-block ml-1 text-white/20">
      {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* ---- 计划概览统计 ---- */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
          {[
            { label: '计划总数', value: campaigns.length, color: 'text-blue-400', sub: '个' },
            { label: '投放中', value: activeCount, color: 'text-green-400', sub: '正常' },
            { label: '已暂停', value: pausedCount, color: 'text-yellow-400', sub: '需关注' },
            { label: '预算不足', value: budgetExhaustedCount, color: 'text-red-400', sub: '急需处理' },
            { label: '总预算', value: `¥${fmtMoney(totalBudget)}`, color: 'text-white/60', sub: '总和' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <p className="text-[10px] text-white/35 uppercase tracking-wider">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/25">{s.sub}</p>
            </div>
          ))}
        </div>
        <RefreshBadge time={refreshedAt} onRefresh={loadData} />
      </div>

      {/* ---- 筛选与搜索 ---- */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          {[
            { value: 'all', label: '全部' },
            { value: 'active', label: '投放中' },
            { value: 'paused', label: '已暂停' },
            { value: 'budgetExhausted', label: '预算不足' },
          ].map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${filter === opt.value ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white/80'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="搜索计划名称..."
          className="flex-1 max-w-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500" />
        <span className="text-xs text-white/25 ml-auto">{filtered.length} / {campaigns.length} 个计划</span>
      </div>

      {/* ---- 计划列表 ---- */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/35 text-xs">
                {([
                  { key: 'campaignId', label: 'ID', cls: 'w-16' },
                  { key: 'campaignName', label: '计划名称', cls: '' },
                  { key: 'budget', label: '预算', cls: '' },
                  { key: 'bidType', label: '出价模式', cls: '' },
                  { key: 'status', label: '状态', cls: '' },
                ] as { key: CampaignSortKey; label: string; cls: string }[]).map(h => (
                  <th key={h.key} onClick={() => toggleSort(h.key)}
                    className={`cursor-pointer hover:text-white/60 transition-colors py-3 px-4 text-left ${h.cls}`}>
                    {h.label}<SortIcon k={h.key} />
                  </th>
                ))}
                <th className="text-left py-3 px-4">设备</th>
                <th className="text-right py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-white/20 text-sm">
                  {campaigns.length === 0 ? '暂无推广计划，请前往百度后台创建' : '没有匹配的计划'}
                </td></tr>
              ) : (
                filtered.map(c => {
                  const isActive = c.status === 1;
                  return (
                    <tr key={c.campaignId} className={`border-b border-white/5 hover:bg-white/4 transition-colors ${!isActive ? 'opacity-60' : ''}`}>
                      <td className="py-3 px-4 font-mono text-xs text-white/40">{c.campaignId}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm">{c.campaignName || '—'}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-white/70 text-xs">¥{fmtMoney(c.budget)}</td>
                      <td className="py-3 px-4 text-white/50 text-xs">
                        {c.bidType === 1 ? 'CPC' : c.bidType === 2 ? 'CPM' : c.bidType === 3 ? 'CPA' : `类型${c.bidType}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>
                          {statusLabel(c.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/40 text-xs">
                        {c.device === 0 ? '全部' : c.device === 1 ? 'PC' : c.device === 2 ? '移动' : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href="/baidu/report" className="text-xs text-blue-400 hover:text-blue-300 no-underline transition-colors">
                          数据报表
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============== 创意监控 ==============

export function CreativePanel() {
  const [creatives, setCreatives] = useState<CreativeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/baidu/creative');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '请求失败');
      setCreatives(data.data || []);
      setRefreshedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = creatives.filter(c => {
    if (filter === 'approved' && c.status !== 12) return false;
    if (filter === 'pending' && c.status !== 11) return false;
    if (filter === 'rejected' && c.status !== 13) return false;
    return true;
  });

  const approved = creatives.filter(c => c.status === 12).length;
  const pending = creatives.filter(c => c.status === 11).length;
  const rejected = creatives.filter(c => c.status === 13).length;
  const approvalRate = creatives.length > 0 ? (approved / creatives.length * 100) : 0;

  if (loading) return <Loading text="加载创意数据..." />;
  if (error) return <ErrorBlock message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* ---- 创意统计概览 ---- */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
          {[
            { label: '创意总数', value: creatives.length, color: 'text-blue-400', icon: 'M4 5h16v2H4V5zm0 6h10v8H4v-8zm14 0h-4v8h4v-8z' },
            { label: '审核通过', value: approved, color: 'text-green-400', icon: 'M5 13l4 4L19 7' },
            { label: '审核中', value: pending, color: 'text-yellow-400', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: '审核拒绝', value: rejected, color: 'text-red-400', icon: 'M6 18L18 6M6 6l12 12' },
            { label: '通过率', value: `${approvalRate.toFixed(1)}%`, color: approvalRate >= 80 ? 'text-green-400' : approvalRate >= 50 ? 'text-yellow-400' : 'text-red-400', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
              <svg className="w-4 h-4 mx-auto mb-1 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
              </svg>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/35">{s.label}</p>
            </div>
          ))}
        </div>
        <RefreshBadge time={refreshedAt} onRefresh={loadData} />
      </div>

      {/* ---- 审核管道可视化 ---- */}
      {creatives.length > 0 && (
        <div className="border border-white/10 bg-white/5 rounded-2xl p-6">
          <SectionTitle title="审核管道" badge={`${creatives.length} 个创意`} />
          <div className="flex items-center gap-0 h-8 rounded-full overflow-hidden">
            {approved > 0 && <div className="h-full bg-green-500/60 transition-all" style={{ width: `${(approved / creatives.length) * 100}%` }} />}
            {pending > 0 && <div className="h-full bg-yellow-500/60 transition-all" style={{ width: `${(pending / creatives.length) * 100}%` }} />}
            {rejected > 0 && <div className="h-full bg-red-500/60 transition-all" style={{ width: `${(rejected / creatives.length) * 100}%` }} />}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-white/30">
            <span>已通过 {approved}</span>
            <span>审核中 {pending}</span>
            <span>已拒绝 {rejected}</span>
          </div>
        </div>
      )}

      {/* ---- 筛选 ---- */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10 w-fit">
        {[
          { value: 'all', label: `全部 (${creatives.length})` },
          { value: 'approved', label: `已通过 (${approved})` },
          { value: 'pending', label: `审核中 (${pending})` },
          { value: 'rejected', label: `已拒绝 (${rejected})` },
        ].map(opt => (
          <button key={opt.value} onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-md text-xs transition-colors ${filter === opt.value ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white/80'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* ---- 创意卡片列表 ---- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-white/20 text-sm">
            {creatives.length === 0 ? '暂无创意数据，请前往百度后台创建创意素材' : '没有匹配的创意'}
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.creativeId} className="border border-white/10 bg-white/5 rounded-2xl p-5 hover:border-white/20 hover:bg-white/[0.07] transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/25 font-mono">#{c.creativeId}</span>
                  {c.status === 12 && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                  {c.status === 11 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />}
                  {c.status === 13 && <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>
                  {statusLabel(c.status)}
                </span>
              </div>
              {c.title && <p className="text-sm font-semibold leading-snug mb-2 line-clamp-2 text-white/90">{c.title}</p>}
              {c.description1 && <p className="text-xs text-white/40 mb-1 line-clamp-2 leading-relaxed">{c.description1}</p>}
              {c.description2 && <p className="text-xs text-white/25 line-clamp-2 leading-relaxed">{c.description2}</p>}
              {!c.title && !c.description1 && <p className="text-sm text-white/35">{c.creativeName || '未命名创意'}</p>}
              {/* 拒绝时给出提示 */}
              {c.status === 13 && (
                <div className="mt-3 pt-3 border-t border-red-500/10">
                  <p className="text-[11px] text-red-400/70">审核未通过，请检查创意内容是否符合规范后重新提交</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============== 数据分析 ==============

interface ReportResult {
  data?: Array<{ date: string; name: string[]; kpis: string[] }>;
  performanceData?: string[];
  totalCount?: number;
}

export function ReportPanel() {
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; });
  const [endDate, setEndDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; });
  const [metrics, setMetrics] = useState<string[]>(['impression', 'click', 'cost', 'ctr', 'cpc', 'conversion']);
  const [level, setLevel] = useState(2);
  const [reportType, setReportType] = useState(10);
  const [unit, setUnit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleMetric = (v: string) => {
    setMetrics(prev => prev.includes(v) ? prev.filter(m => m !== v) : [...prev, v]);
  };

  // 预设快速选择
  const quickSelect = (days: number) => {
    const end = new Date(); end.setDate(end.getDate() - 1);
    const start = new Date(); start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const submit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/baidu/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'realtime', startDate, endDate,
          performanceData: metrics, levelOfDetails: level,
          reportType, unitOfTime: unit, device: 0,
          pageIndex: 1, number: 500,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || data.message || `HTTP ${res.status}`); return; }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, metrics, level, reportType, unit]);

  const rows = result?.data || [];
  const perfData = result?.performanceData || [];

  // 摘要统计
  const summaryTotal = perfData.reduce((acc, k, i) => {
    const sum = rows.reduce((s, r) => s + (parseFloat(r.kpis[i]) || 0), 0);
    acc[k] = sum;
    return acc;
  }, {} as Record<string, number>);
  const avgCTR = rows.length > 0 && summaryTotal['click'] != null && summaryTotal['impression'] != null
    ? (summaryTotal['click'] / summaryTotal['impression'] * 100) : null;

  return (
    <div className="space-y-6">
      {/* ---- 查询表单 ---- */}
      <form onSubmit={submit} className="border border-white/10 bg-white/5 rounded-2xl p-6 space-y-5">
        {/* 日期 + 快速选择 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-white/60">时间范围</label>
            <div className="flex gap-1">
              {[
                { days: 3, label: '近3天' },
                { days: 7, label: '近7天' },
                { days: 15, label: '近15天' },
                { days: 30, label: '近30天' },
              ].map(o => (
                <button key={o.days} type="button" onClick={() => quickSelect(o.days)}
                  className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors">
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* 指标选择 */}
        <div>
          <label className="block text-sm text-white/60 mb-2">绩效指标（多选）</label>
          <div className="flex flex-wrap gap-2">
            {METRICS.map(m => (
              <button key={m.value} type="button" onClick={() => toggleMetric(m.value)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${metrics.includes(m.value) ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 层级 / 报告类型 / 时间粒度 */}
        <div className="grid grid-cols-3 gap-4">
          {([
            { label: '数据层级', value: level, set: setLevel, opts: LEVELS },
            { label: '报告类型', value: reportType, set: (v: number) => { setReportType(v); if (v === 10) setLevel(2); },
              opts: REPORT_TYPES },
            { label: '时间粒度', value: unit, set: setUnit, opts: UNITS },
          ] as const).map(f => (
            <div key={f.label}>
              <label className="block text-sm text-white/60 mb-2">{f.label}</label>
              <select value={f.value} onChange={e => f.set(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                {f.opts.map(o => <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading || metrics.length === 0}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 text-white font-medium text-sm rounded-xl transition-all disabled:cursor-not-allowed shadow-lg shadow-blue-600/10">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              查询中...
            </span>
          ) : '查询数据报表'}
        </button>
      </form>

      {/* ---- 错误 ---- */}
      {error && (
        <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div><p className="text-red-400 text-sm font-medium">查询失败</p><p className="text-red-400/60 text-xs mt-0.5">{error}</p></div>
        </div>
      )}

      {/* ---- 摘要卡片 ---- */}
      {result && rows.length > 0 && Object.keys(summaryTotal).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(summaryTotal).map(([k, v]) => (
            <div key={k} className="border border-white/10 bg-white/5 rounded-xl p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{k}</p>
              <p className="text-lg font-bold font-mono">
                {['cost', 'cpc', 'cpm'].includes(k.toLowerCase()) ? `¥${fmtMoney(v)}`
                  : k.toLowerCase() === 'ctr' ? fmtPct(v)
                  : fmtNum(v)}
              </p>
            </div>
          ))}
          {avgCTR != null && (
            <div className="border border-white/10 bg-white/5 rounded-xl p-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">平均CTR</p>
              <p className="text-lg font-bold font-mono">{avgCTR.toFixed(2)}%</p>
            </div>
          )}
        </div>
      )}

      {/* ---- 结果表格 ---- */}
      {result && rows.length > 0 && (
        <div className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/70">数据明细</h3>
            <span className="text-xs text-white/30">{rows.length} 条记录</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/30 text-[11px]">
                  <th className="text-left py-3 px-4">日期</th>
                  {rows[0]?.name?.length > 0 && <th className="text-left py-3 px-4">名称</th>}
                  {perfData.map(m => (
                    <th key={m} className="text-right py-3 px-3 font-mono">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-2.5 px-4 text-white/40 text-xs whitespace-nowrap">{fmtDate(row.date)}</td>
                    {row.name?.length > 0 && <td className="py-2.5 px-4 text-xs text-white/70">{row.name.join(' > ')}</td>}
                    {row.kpis.map((v, j) => (
                      <td key={j} className="py-2.5 px-3 text-right font-mono text-xs text-white/70">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 50 && (
            <div className="p-3 text-center text-white/20 text-xs border-t border-white/10">
              仅显示前50条，共 {rows.length} 条 — 缩小日期范围获取完整数据
            </div>
          )}
        </div>
      )}

      {/* ---- 空结果 ---- */}
      {result && rows.length === 0 && !error && (
        <div className="border border-white/10 bg-white/5 rounded-2xl p-12 text-center">
          <svg className="w-10 h-10 text-white/10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-white/25 text-sm">所选时间范围内暂无数据</p>
          <p className="text-white/15 text-xs mt-1">请尝试扩大查询日期范围或调整指标选择</p>
        </div>
      )}
    </div>
  );
}
