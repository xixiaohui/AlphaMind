'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

// 模拟自选数据
const watchlistData = [
  { id: '1', symbol: '600519', name: '贵州茅台', market: 'A股', price: '1,688.00', change: 1.53, reason: '白酒龙头' },
  { id: '2', symbol: 'NVDA', name: '英伟达', market: '美股', price: '1,025.80', change: 3.24, reason: 'AI芯片' },
  { id: '3', symbol: 'BTC', name: '比特币', market: 'Crypto', price: '$68,450', change: 2.15, reason: '数字黄金' },
  { id: '4', symbol: '300750', name: '宁德时代', market: 'A股', price: '198.50', change: 2.74, reason: '新能源电池' },
  { id: '5', symbol: 'AAPL', name: '苹果', market: '美股', price: '189.45', change: 0.82, reason: '科技巨头' },
];

export default function WatchlistPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [watchlist, setWatchlist] = useState(watchlistData);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const removeFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-wider mb-2">我的自选</h1>
              <p className="text-white/50 text-sm">持续跟踪您关心的资产</p>
            </div>
            <Link
              href="/search"
              className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-white/90 transition-colors"
            >
              + 添加自选
            </Link>
          </div>
        </div>
      </section>

      {/* Watchlist */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {watchlist.length > 0 ? (
            <div className="space-y-3">
              {watchlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Link href={`/asset/${item.symbol}`} className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-xl">
                        {item.market === 'Crypto' ? '₿' : '📈'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{item.name}</span>
                          <span className="text-sm text-white/40">{item.symbol}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            item.market === 'A股' ? 'bg-red-500/10 text-red-400' :
                            item.market === '美股' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>
                            {item.market}
                          </span>
                        </div>
                        <div className="text-xs text-white/40">{item.reason}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg mb-1">{item.price}</div>
                        <div className={`text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => removeFromWatchlist(item.id)}
                      className="ml-4 p-2 text-white/30 hover:text-red-400 transition-colors"
                      title="移除自选"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">暂无自选</h3>
              <p className="text-white/50 text-sm mb-6">添加您关心的资产到自选列表</p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-white/90 transition-colors"
              >
                搜索添加
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      {watchlist.length > 0 && (
        <section className="px-4 py-8 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold mb-1">{watchlist.length}</div>
                <div className="text-xs text-white/50">关注标的</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold mb-1 text-green-400">
                  {watchlist.filter(w => w.change >= 0).length}
                </div>
                <div className="text-xs text-white/50">上涨</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold mb-1 text-red-400">
                  {watchlist.filter(w => w.change < 0).length}
                </div>
                <div className="text-xs text-white/50">下跌</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />

      <style jsx global>{`
        body { background: #000; }
      `}</style>
    </div>
  );
}
