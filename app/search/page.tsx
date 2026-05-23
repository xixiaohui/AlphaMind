'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

// 搜索结果数据（模拟）
const searchResults = {
  stock: [
    { symbol: '600519', name: '贵州茅台', market: 'A股', price: '1,688.00', change: 1.53, type: '股票' },
    { symbol: '000858', name: '五粮液', market: 'A股', price: '142.35', change: -0.86, type: '股票' },
    { symbol: '601318', name: '中国平安', market: 'A股', price: '45.67', change: 1.99, type: '股票' },
    { symbol: 'NVDA', name: '英伟达', market: '美股', price: '1,025.80', change: 3.24, type: '股票' },
    { symbol: 'AAPL', name: '苹果', market: '美股', price: '189.45', change: 0.82, type: '股票' },
    { symbol: 'TSLA', name: '特斯拉', market: '美股', price: '178.25', change: -2.15, type: '股票' },
    { symbol: '00700', name: '腾讯控股', market: '港股', price: '378.20', change: 1.25, type: '股票' },
    { symbol: '09988', name: '阿里巴巴', market: '港股', price: '72.45', change: 2.85, type: '股票' },
  ],
  etf: [
    { symbol: '510300', name: '沪深300ETF', market: 'A股', price: '3.845', change: 0.15, type: 'ETF' },
    { symbol: '513100', name: '纳指ETF', market: 'A股', price: '1.823', change: -1.09, type: 'ETF' },
    { symbol: 'SPY', name: '标普500ETF', market: '美股', price: '523.45', change: 0.30, type: 'ETF' },
    { symbol: 'QQQ', name: '纳指100ETF', market: '美股', price: '445.80', change: -0.27, type: 'ETF' },
  ],
  crypto: [
    { symbol: 'BTC', name: '比特币', market: 'Crypto', price: '$68,450', change: 2.15, type: 'Crypto' },
    { symbol: 'ETH', name: '以太坊', market: 'Crypto', price: '$3,850', change: 1.85, type: 'Crypto' },
    { symbol: 'SOL', name: 'Solana', market: 'Crypto', price: '$168.50', change: 5.24, type: 'Crypto' },
    { symbol: 'BNB', name: '币安币', market: 'Crypto', price: '$598.20', change: 1.12, type: 'Crypto' },
  ],
  macro: [
    { symbol: 'FED', name: '美联储利率', market: '宏观', price: '5.25-5.50%', change: 0, type: '宏观' },
    { symbol: 'CPI', name: '美国CPI', market: '宏观', price: '3.4%', change: -0.2, type: '宏观' },
    { symbol: 'US10Y', name: '10年期美债收益率', market: '宏观', price: '4.35%', change: -0.02, type: '宏观' },
    { symbol: 'DXY', name: '美元指数', market: '宏观', price: '104.52', change: 0.12, type: '宏观' },
  ],
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeType, setActiveType] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const allResults = Object.values(searchResults).flat();
  const filteredResults = activeType === 'all'
    ? allResults
    : (searchResults[activeType as keyof typeof searchResults] || []);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider mb-6">搜索</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="输入股票代码、名称或研究主题..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-5 py-4 pl-14 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors text-base"
              />
              <svg 
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-white text-black font-bold text-sm rounded-full hover:bg-white/90 transition-colors"
              >
                搜索
              </button>
            </div>
          </form>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: '全部' },
              { id: 'stock', label: '股票' },
              { id: 'etf', label: 'ETF' },
              { id: 'crypto', label: 'Crypto' },
              { id: 'macro', label: '宏观' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  activeType === type.id
                    ? 'bg-white text-black'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {query && (
            <div className="text-sm text-white/50 mb-6">
              搜索 &ldquo;{query}&rdquo;，找到 {filteredResults.length} 个结果
            </div>
          )}

          {filteredResults.length > 0 ? (
            <div className="space-y-3">
              {filteredResults.map((result, index) => (
                <Link
                  key={`${result.symbol}-${index}`}
                  href={`/asset/${result.symbol}`}
                  className="block bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                        {result.type === '股票' ? '📈' : result.type === 'ETF' ? '📊' : result.type === 'Crypto' ? '₿' : '🌐'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{result.name}</span>
                          <span className="text-xs text-white/40">{result.symbol}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            result.market === 'A股' ? 'bg-red-500/10 text-red-400' :
                            result.market === '美股' ? 'bg-blue-500/10 text-blue-400' :
                            result.market === '港股' ? 'bg-orange-500/10 text-orange-400' :
                            result.market === 'Crypto' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-green-500/10 text-green-400'
                          }`}>
                            {result.market}
                          </span>
                        </div>
                        <div className="text-xs text-white/40">{result.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold mb-1">{result.price}</div>
                      <div className={`text-sm ${result.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {result.change >= 0 ? '+' : ''}{result.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">未找到结果</h3>
              <p className="text-white/50 text-sm">尝试其他关键词或浏览类别</p>
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        body { background: #000; }
      `}</style>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
