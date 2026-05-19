'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MarketOverview {
  index: string;
  change: number;
  changePercent: number;
}

export default function Home() {
  const [marketData, setMarketData] = useState<MarketOverview[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 模拟市场数据
    setMarketData([
      { index: '上证指数', change: 15.32, changePercent: 0.45 },
      { index: '深证成指', change: -23.18, changePercent: -0.22 },
      { index: '创业板', change: 8.45, changePercent: 0.38 },
      { index: '沪深300', change: 5.67, changePercent: 0.15 },
    ]);
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-lg font-bold tracking-tight">AI</span>
          </div>
          <span className="text-lg font-bold uppercase tracking-widest" style={{ letterSpacing: '1.6px' }}>
            混元智投
          </span>
        </div>
        <div className="flex items-center gap-8">
          <a href="/ai" className="text-sm font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity" style={{ letterSpacing: '1.17px' }}>
            AI对话
          </a>
          <a href="/history" className="text-sm font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity" style={{ letterSpacing: '1.17px' }}>
            历史记录
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-50 mb-6" style={{ letterSpacing: '0.96px' }}>
            AI 金融研究助手
          </p>
          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-widest leading-none mb-8" style={{ letterSpacing: '1.6px', lineHeight: 0.95 }}>
            混元智投
          </h1>
          <p className="text-lg md:text-xl opacity-60 max-w-2xl mx-auto mb-12 leading-relaxed" style={{ letterSpacing: '0.32px' }}>
            基于混元大模型的智能金融研究平台<br />
            帮助您快速理解复杂金融信息
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/ai"
              className="px-8 py-4 border border-white text-white text-sm font-bold uppercase rounded-full hover:bg-white hover:text-black transition-colors"
              style={{ letterSpacing: '1.17px' }}
            >
              开始对话
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-xs uppercase tracking-widest" style={{ letterSpacing: '0.96px' }}>滚动探索</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Market Overview */}
      <section className="px-8 py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-50 mb-8" style={{ letterSpacing: '0.96px' }}>
            市场概况
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
            {marketData.map((item, index) => (
              <div key={index} className="bg-black p-8">
                <p className="text-sm opacity-60 mb-2">{item.index}</p>
                <p className="text-3xl font-bold mb-1">
                  {(item.changePercent > 0 ? '+' : '') + item.changePercent.toFixed(2)}%
                </p>
                <p className={`text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-50 mb-16" style={{ letterSpacing: '0.96px' }}>
            核心能力
          </p>
          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            <div className="bg-black p-12">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-8">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-wide mb-4" style={{ letterSpacing: '0.96px' }}>
                股票分析
              </h3>
              <p className="text-sm opacity-60 leading-relaxed">
                AI 驱动的股票分析，涵盖基本面、技术面、市场情绪等多维度研究
              </p>
            </div>
            <div className="bg-black p-12">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-8">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-wide mb-4" style={{ letterSpacing: '0.96px' }}>
                财报解读
              </h3>
              <p className="text-sm opacity-60 leading-relaxed">
                智能解读财报数据，提取关键财务指标，发现潜在风险与机会
              </p>
            </div>
            <div className="bg-black p-12">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-8">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-wide mb-4" style={{ letterSpacing: '0.96px' }}>
                行业研究
              </h3>
              <p className="text-sm opacity-60 leading-relaxed">
                深入分析行业趋势、竞争格局、政策影响，把握投资机遇
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-8 py-16 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest opacity-30 mb-4" style={{ letterSpacing: '0.96px' }}>
            风险提示
          </p>
          <p className="text-sm opacity-40 leading-relaxed max-w-2xl mx-auto">
            混元智投提供的数据和分析仅供研究参考，不构成投资建议。投资有风险，决策需谨慎。请根据自身风险承受能力做出理性判断。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-white/10 flex items-center justify-between text-xs opacity-50">
        <span>© 2024 混元智投</span>
        <span>Powered by 混元大模型</span>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #000;
          color: #fff;
        }
        
        .font-sans {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
    </div>
  );
}
