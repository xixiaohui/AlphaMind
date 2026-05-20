'use client';

import { useState, useEffect, use } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

// 报告数据
const reportData: Record<string, {
  id: string;
  title: string;
  symbol: string;
  name: string;
  type: string;
  summary: string;
  stance: string;
  date: string;
  views: number;
  content: string[];
}> = {
  '1': {
    id: '1',
    title: '英伟达 (NVDA) 投资价值分析',
    symbol: 'NVDA',
    name: '英伟达',
    type: 'stock',
    summary: 'AI芯片需求持续爆发，公司业绩增长强劲，但估值偏高需注意风险。数据中心业务成为核心驱动力。',
    stance: '中性',
    date: '2026-05-20',
    views: 1256,
    content: [
      '【核心观点】英伟达作为全球 AI 芯片领导者，受益于生成式 AI 热潮，业绩持续超预期。但当前估值偏高，建议投资者关注回调机会。',
      '【基本面】数据中心业务收入同比增长 400%+，成为公司最大收入来源。游戏业务稳健增长，汽车业务快速放量。',
      '【技术面】股价处于上升趋势，但近期有回调压力。关键支撑位在 900 美元附近。',
      '【风险因素】估值偏高、半导体行业周期波动、竞争加剧、政策监管风险。',
    ],
  },
};

// 默认报告
const defaultReport = {
  id: '1',
  title: '英伟达 (NVDA) 投资价值分析',
  symbol: 'NVDA',
  name: '英伟达',
  type: 'stock',
  summary: 'AI芯片需求持续爆发，公司业绩增长强劲，但估值偏高需注意风险。',
  stance: '中性',
  date: '2026-05-20',
  views: 1256,
  content: [
    '【核心观点】英伟达作为全球 AI 芯片领导者，受益于生成式 AI 热潮，业绩持续超预期。',
    '【基本面】数据中心业务收入同比增长 400%+，成为公司最大收入来源。',
    '【风险因素】估值偏高、半导体行业周期波动、竞争加剧。',
  ],
};

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const report = reportData[id] || { ...defaultReport, id };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>/</span>
            <Link href="/reports" className="hover:text-white transition-colors">报告中心</Link>
            <span>/</span>
            <span className="text-white truncate">{report.title}</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-2 py-1 rounded ${
              report.stance === '偏乐观' ? 'bg-green-400/10 text-green-400' :
              report.stance === '谨慎' ? 'bg-orange-400/10 text-orange-400' :
              'bg-white/10 text-white/60'
            }`}>
              {report.stance}
            </span>
            <span className="text-sm text-white/40">{report.date}</span>
            <span className="text-sm text-white/40">·</span>
            <span className="text-sm text-white/40">{report.views} 阅读</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4">{report.title}</h1>
          <p className="text-white/60">{report.summary}</p>
        </div>
      </section>

      {/* Report Content */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8">
            <div className="space-y-6">
              {report.content.map((section, i) => (
                <div key={i} className="border-b border-white/5 pb-6 last:border-0">
                  <p className="text-white/80 leading-relaxed whitespace-pre-line">{section}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-white/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-white/40 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-white/40 leading-relaxed">
                <p className="mb-2">
                  <strong className="text-white/60">免责声明：</strong>
                  本报告由 AI 生成，仅供研究参考，不构成投资建议。
                </p>
                <p>
                  投资有风险，决策需谨慎。任何 AI 生成的分析结论都必须结合真实市场环境、公开数据和用户自身判断综合理解。
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/asset/${report.symbol}`}
              className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-colors"
            >
              查看资产详情
            </Link>
            <Link
              href="/reports"
              className="px-5 py-2.5 bg-white/5 border border-white/20 text-white text-sm rounded-full hover:bg-white/10 transition-colors"
            >
              返回报告列表
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        body { background: #000; }
      `}</style>
    </div>
  );
}
