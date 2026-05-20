'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MarketIndexCard, { MarketIndexData } from '../components/MarketIndexCard';
import NewsFeed from '../components/NewsFeed';
import AIInsights, { AIInsight } from '../components/AIInsights';

// 统一的数据源，便于后期接入真实 API
const marketIndices: MarketIndexData[] = [
  { name: '上证指数', value: '3,268.52', change: 15.32, changePercent: 0.45 },
  { name: '深证成指', value: '10,456.78', change: -23.18, changePercent: -0.22 },
  { name: '创业板指', value: '2,156.34', change: 8.45, changePercent: 0.38 },
  { name: '沪深300', value: '3,845.67', change: 5.67, changePercent: 0.15 },
  { name: '科创50', value: '1,028.45', change: 12.35, changePercent: 1.18 },
  { name: '上证50', value: '2,456.78', change: -5.23, changePercent: -0.21 },
];

const newsItems = [
  { title: '央行宣布定向降准，释放长期资金约5000亿', summary: '央行宣布下调金融机构存款准备金率0.5个百分点，预计释放长期资金约5000亿元。', time: '10:30', type: '宏观', impact: 'positive' as const },
  { title: '证监会发布资本市场改革新政策', summary: '证监会发布多项资本市场改革措施，旨在提升市场活力和保护投资者权益。', time: '09:45', type: '政策', impact: 'positive' as const },
  { title: '多家券商看好A股中长期配置价值', summary: '中信证券、国泰君安等头部券商发布研报，认为A股估值处于历史低位，中长期配置价值凸显。', time: '09:20', type: '机构', impact: 'neutral' as const },
  { title: '北向资金净流入超百亿', summary: '北向资金今日净流入112.5亿元，外资持续加码A股核心资产。', time: '08:30', type: '资金', impact: 'positive' as const },
  { title: '美股三大指数集体收跌', summary: '隔夜美股三大指数集体收跌，纳指跌逾1%，科技股普遍承压。', time: '07:00', type: '外围', impact: 'negative' as const },
];

const aiInsights: AIInsight[] = [
  { title: '市场情绪偏向谨慎乐观', content: '成交量较昨日有所萎缩，但指数表现稳健，资金面维持平衡态势。建议关注明日成交变化。', type: 'neutral' },
  { title: '科技成长板块持续强势', content: '人工智能、半导体等科技成长板块资金流入明显，或成为近期市场主线。', type: 'bullish' },
  { title: '北向资金持续流入', content: '外资持续净流入显示对A股中长期配置价值的认可，蓝筹权重股或受到关注。', type: 'bullish' },
];

export default function SummaryPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <Header />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 md:px-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-4 md:mb-6">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-xs uppercase tracking-widest opacity-70">AI 财经摘要</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider md:tracking-widest mb-2 md:mb-4">今日市场摘要</h1>
          <p className="text-white/50 text-sm md:text-base">每日自动总结市场动态、热门板块与 AI 解读</p>
        </div>
      </section>

      {/* Market Indices */}
      <section className="px-4 md:px-6 py-8 md:py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-1 h-5 md:h-6 bg-linear-to-b from-blue-500 to-purple-600"></div>
            <h2 className="text-xs uppercase tracking-widest text-white/50">市场指数</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-white/10 rounded-lg overflow-hidden">
            {marketIndices.map((index, i) => (
              <MarketIndexCard key={i} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* AI Insights */}
      <section className="px-4 md:px-6 py-8 md:py-12 border-b border-white/10">
        <AIInsights insights={aiInsights} />
      </section>

      {/* News Feed */}
      <section className="px-4 md:px-6 py-8 md:py-12 border-b border-white/10">
        <NewsFeed data={newsItems} showAllLink={false} />
      </section>

      {/* CTA */}
      <section className="px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">获取更详细的市场分析</h2>
          <p className="text-white/50 mb-6 md:mb-8 text-sm md:text-base">让 AI 为您深入解读市场动态和投资机会</p>
          <a
            href="/ai"
            className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-black font-bold text-sm rounded-full hover:bg-white/90 transition-colors"
          >
            开始对话
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        body {
          background: #000;
        }
      `}</style>
    </div>
  );
}
