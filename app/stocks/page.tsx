'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StockCard, { StockData } from '../components/StockCard';
import StockAnalysisPanel from '../components/StockAnalysisPanel';

// 统一的数据源，便于后期接入真实 API
const popularStocks: StockData[] = [
  { code: '600519', name: '贵州茅台', price: 1688.00, change: 25.50, changePercent: 1.53, volume: '2.35亿', marketCap: '2.12万亿', pe: 35.2, dividend: 1.96 },
  { code: '000858', name: '五粮液', price: 142.35, change: -1.23, changePercent: -0.86, volume: '1.82亿', marketCap: '5528亿', pe: 22.8, dividend: 2.45 },
  { code: '601318', name: '中国平安', price: 45.67, change: 0.89, changePercent: 1.99, volume: '3.21亿', marketCap: '8342亿', pe: 8.5, dividend: 4.12 },
  { code: '600036', name: '招商银行', price: 35.42, change: -0.45, changePercent: -1.25, volume: '2.67亿', marketCap: '8945亿', pe: 7.2, dividend: 4.85 },
  { code: '300750', name: '宁德时代', price: 198.50, change: 5.30, changePercent: 2.74, volume: '4.12亿', marketCap: '8720亿', pe: 28.5, dividend: 0.52 },
  { code: '688981', name: '中芯国际', price: 48.25, change: 1.15, changePercent: 2.45, volume: '5.68亿', marketCap: '3820亿', pe: 65.3, dividend: 0.08 },
];

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredStocks = popularStocks.filter(
    (stock) =>
      stock.name.includes(searchQuery) ||
      stock.code.includes(searchQuery)
  );

  const handleStockSelect = (stock: StockData) => {
    setSelectedStock(stock);
    setShowAnalysis(true);
  };

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
            <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs uppercase tracking-widest opacity-70">AI 股票分析</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider md:tracking-widest mb-2 md:mb-4">股票深度分析</h1>
          <p className="text-white/50 max-w-xl mx-auto text-sm md:text-base">AI 驱动的多维度股票分析，涵盖基本面、技术面、市场情绪与风险评估</p>
        </div>
      </section>

      {/* Search */}
      <section className="px-4 md:px-6 py-6 md:py-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="搜索股票代码或名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 md:py-3 pl-10 md:pl-12 bg-white/5 border border-white/10 rounded-full text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <svg className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Stock List & Analysis */}
      <section className="px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Mobile: Show analysis inline, Desktop: Two columns */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-6">
            {/* Stock List */}
            <div className="mb-6 lg:mb-0">
              <h2 className="text-xs uppercase tracking-widest text-white/50 mb-4 md:mb-6">热门股票</h2>
              <div className="space-y-2 md:space-y-3">
                {filteredStocks.map((stock) => (
                  <StockCard
                    key={stock.code}
                    stock={stock}
                    selected={selectedStock?.code === stock.code}
                    onClick={() => handleStockSelect(stock)}
                    showDetails
                  />
                ))}
              </div>
            </div>

            {/* Analysis Panel - Desktop always visible, Mobile toggleable */}
            <div>
              <div className="hidden md:flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xs uppercase tracking-widest text-white/50">AI 分析</h2>
                {selectedStock && (
                  <button
                    onClick={() => setSelectedStock(null)}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    清除选择
                  </button>
                )}
              </div>
              
              {/* Mobile Analysis Toggle */}
              {selectedStock && (
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="lg:hidden w-full flex items-center justify-between p-4 border border-white/10 bg-white/5 rounded-lg mb-4"
                >
                  <span className="text-sm font-medium">{selectedStock.name} AI分析</span>
                  <svg className={`w-5 h-5 transition-transform ${showAnalysis ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {showAnalysis && (
                <div className={selectedStock ? '' : 'hidden lg:block'}>
                  <h2 className="md:hidden text-xs uppercase tracking-widest text-white/50 mb-4">AI 分析</h2>
                  {selectedStock ? (
                    <StockAnalysisPanel stock={selectedStock} />
                  ) : (
                    <div className="border border-white/10 rounded-lg bg-white/5 p-8 md:p-12 text-center">
                      <svg className="w-10 h-10 md:w-12 md:h-12 text-white/20 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <p className="text-white/50 text-sm">选择一只股票查看 AI 分析</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
