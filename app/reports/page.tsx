'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

// 模拟报告数据
const reportsData = [
  {
    id: '1',
    title: '英伟达 (NVDA) 投资价值分析',
    symbol: 'NVDA',
    type: 'stock',
    summary: 'AI芯片需求持续爆发，公司业绩增长强劲，但估值偏高需注意风险。数据中心业务成为核心驱动力。',
    stance: '中性',
    date: '2026-05-20',
    views: 1256,
  },
  {
    id: '2',
    title: '贵州茅台 2026 年一季度财报解读',
    symbol: '600519',
    type: 'stock',
    summary: '营收利润双增长，现金流优异，高端白酒龙头地位稳固。盈利能力持续提升。',
    stance: '偏乐观',
    date: '2026-05-19',
    views: 2341,
  },
  {
    id: '3',
    title: '比特币近期走势分析',
    symbol: 'BTC',
    type: 'crypto',
    summary: 'ETF资金持续流入，但警惕宏观政策变化带来的波动风险。技术面显示震荡整理。',
    stance: '谨慎',
    date: '2026-05-18',
    views: 3562,
  },
  {
    id: '4',
    title: '新能源汽车行业深度研究',
    symbol: '行业',
    type: 'sector',
    summary: '渗透率持续提升，竞争格局演变，龙头企业优势明显。政策支持与技术进步双轮驱动。',
    stance: '偏乐观',
    date: '2026-05-17',
    views: 1823,
  },
  {
    id: '5',
    title: '美联储货币政策影响分析',
    symbol: '宏观',
    type: 'macro',
    summary: '维持高利率预期，通胀回落放缓。关注点阵图变化与经济数据走势。',
    stance: '中性',
    date: '2026-05-16',
    views: 987,
  },
  {
    id: '6',
    title: '宁德时代业绩与前景展望',
    symbol: '300750',
    type: 'stock',
    summary: '全球动力电池龙头，产能扩张与技术创新并进。海外市场拓展加速。',
    stance: '偏乐观',
    date: '2026-05-15',
    views: 1542,
  },
];

export default function ReportsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredReports = reportsData.filter((report) => {
    const matchesType = activeType === 'all' || report.type === activeType;
    const matchesSearch = !searchQuery || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStanceColor = (stance: string) => {
    switch (stance) {
      case '偏乐观': return 'text-green-400 bg-green-400/10';
      case '偏空': return 'text-red-400 bg-red-400/10';
      case '谨慎': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-white/60 bg-white/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock': return '📈';
      case 'crypto': return '₿';
      case 'macro': return '🌐';
      case 'sector': return '📊';
      default: return '📄';
    }
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider mb-6">报告中心</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="搜索报告..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors text-sm"
            />
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: '全部' },
              { id: 'stock', label: '股票' },
              { id: 'crypto', label: 'Crypto' },
              { id: 'macro', label: '宏观' },
              { id: 'sector', label: '行业' },
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

      {/* Reports List */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="block bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                      {getTypeIcon(report.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${getStanceColor(report.stance)}`}>
                          {report.stance}
                        </span>
                        <span className="text-xs text-white/30">{report.date}</span>
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-xs text-white/30">{report.views} 阅读</span>
                      </div>
                      <h3 className="font-bold mb-2 line-clamp-1">{report.title}</h3>
                      <p className="text-sm text-white/60 line-clamp-2">{report.summary}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-2">未找到报告</h3>
              <p className="text-white/50 text-sm">尝试其他搜索词或筛选条件</p>
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
