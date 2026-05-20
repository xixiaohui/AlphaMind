'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

// 市场数据
const globalIndices = [
  { name: '上证指数', code: '000001', value: '3,268.52', change: 15.32, changePercent: 0.47, market: 'A股' },
  { name: '深证成指', code: '399001', value: '10,456.78', change: -23.18, changePercent: -0.22, market: 'A股' },
  { name: '创业板指', code: '399006', value: '2,156.34', change: 8.45, changePercent: 0.39, market: 'A股' },
  { name: '沪深300', code: '000300', value: '3,845.67', change: 5.67, changePercent: 0.15, market: 'A股' },
  { name: '科创50', code: '000688', value: '1,028.45', change: 12.34, changePercent: 1.21, market: 'A股' },
  { name: '恒生指数', code: 'HSI', value: '19,234.12', change: 125.30, changePercent: 0.66, market: '港股' },
  { name: '恒生科技', code: 'HSTECH', value: '4,128.56', change: -35.78, changePercent: -0.86, market: '港股' },
  { name: '道琼斯', code: 'DJI', value: '39,512.84', change: 125.45, changePercent: 0.32, market: '美股' },
  { name: '纳斯达克', code: 'IXIC', value: '16,548.78', change: -45.23, changePercent: -0.27, market: '美股' },
  { name: '标普500', code: 'SPX', value: '5,234.18', change: 15.67, changePercent: 0.30, market: '美股' },
  { name: '日经225', code: 'N225', value: '38,876.42', change: 245.89, changePercent: 0.64, market: '日经' },
  { name: '英国富时', code: 'FTSE', value: '8,456.23', change: -12.34, changePercent: -0.15, market: '欧股' },
];

const etfData = [
  { name: '沪深300ETF', code: '510300', price: '3.845', change: 0.15, changePercent: 0.15 },
  { name: '纳指ETF', code: '513100', price: '1.823', change: -0.02, changePercent: -1.09 },
  { name: '中概互联网ETF', code: '513050', price: '0.956', change: 0.02, changePercent: 2.14 },
  { name: '芯片ETF', code: '512760', price: '0.892', change: 0.03, changePercent: 3.48 },
  { name: '新能源车ETF', code: '515030', price: '1.456', change: 0.04, changePercent: 2.82 },
  { name: '医疗ETF', code: '512010', price: '0.523', change: -0.01, changePercent: -1.88 },
];

const commodities = [
  { name: '黄金', code: 'XAU', price: '2,380.50', change: 12.30, changePercent: 0.52, unit: '美元/盎司' },
  { name: '白银', code: 'XAG', price: '28.45', change: 0.35, changePercent: 1.24, unit: '美元/盎司' },
  { name: '原油(WTI)', code: 'CL', price: '78.45', change: -0.85, changePercent: -1.07, unit: '美元/桶' },
  { name: '铜', code: 'HG', price: '4.52', change: 0.08, changePercent: 1.80, unit: '美元/磅' },
];

const macroData = [
  { name: '美元指数', value: '104.52', change: 0.12 },
  { name: '10年期美债', value: '4.35%', change: -0.02 },
  { name: 'BTC', value: '$68,450', change: 2.15 },
  { name: 'ETH', value: '$3,850', change: 1.85 },
];

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('indices');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider mb-2">市场总览</h1>
          <p className="text-white/50 text-sm">全球主要市场指数、ETF、资金流向与宏观指标</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-4 py-4 border-b border-white/10 sticky top-16 bg-black/90 backdrop-blur-md z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'indices', label: '全球指数' },
              { id: 'etf', label: 'ETF 基金' },
              { id: 'commodities', label: '大宗商品' },
              { id: 'macro', label: '宏观指标' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Global Indices */}
          {activeTab === 'indices' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">A 股</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {globalIndices.filter(i => i.market === 'A股').map((index) => (
                    <div key={index.code} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/50">{index.name}</span>
                        <span className="text-xs text-white/30">{index.code}</span>
                      </div>
                      <div className="text-xl font-bold mb-1">{index.value}</div>
                      <div className={`text-sm ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">港股</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {globalIndices.filter(i => i.market === '港股').map((index) => (
                    <div key={index.code} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/50">{index.name}</span>
                        <span className="text-xs text-white/30">{index.code}</span>
                      </div>
                      <div className="text-xl font-bold mb-1">{index.value}</div>
                      <div className={`text-sm ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">美股</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {globalIndices.filter(i => i.market === '美股').map((index) => (
                    <div key={index.code} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/50">{index.name}</span>
                        <span className="text-xs text-white/30">{index.code}</span>
                      </div>
                      <div className="text-xl font-bold mb-1">{index.value}</div>
                      <div className={`text-sm ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ETF */}
          {activeTab === 'etf' && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">热门 ETF</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {etfData.map((etf) => (
                  <Link
                    key={etf.code}
                    href={`/search?symbol=${etf.code}`}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{etf.name}</span>
                      <span className="text-xs text-white/30">{etf.code}</span>
                    </div>
                    <div className="text-lg font-bold mb-1">{etf.price}</div>
                    <div className={`text-sm ${etf.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {etf.change >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Commodities */}
          {activeTab === 'commodities' && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">大宗商品</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {commodities.map((item) => (
                  <div key={item.code} className="bg-white/5 border border-white/10 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{item.name}</span>
                      <span className="text-xs text-white/30">{item.unit}</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{item.price}</div>
                    <div className={`text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Macro */}
          {activeTab === 'macro' && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">宏观指标</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {macroData.map((item) => (
                  <div key={item.name} className="bg-white/5 border border-white/10 rounded-lg p-5">
                    <span className="text-sm text-white/50 mb-2 block">{item.name}</span>
                    <div className="text-2xl font-bold mb-1">{item.value}</div>
                    <div className={`text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI Research CTA */}
      <section className="px-4 py-12 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">AI 深度市场分析</h3>
            <p className="text-white/60 text-sm mb-6">让 AI 为您解读市场动态，把握投资机会</p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-white/90 transition-colors"
            >
              开始研究
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
