'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import Link from 'next/link';

// ============== 数据层（便于后期接入真实 API） ==============

// 市场指数数据
const marketIndices = [
  { name: '上证指数', code: '000001', value: '3,268.52', change: 15.32, changePercent: 0.47, market: 'A股' },
  { name: '深证成指', code: '399001', value: '10,456.78', change: -23.18, changePercent: -0.22, market: 'A股' },
  { name: '创业板指', code: '399006', value: '2,156.34', change: 8.45, changePercent: 0.39, market: 'A股' },
  { name: '沪深300', code: '000300', value: '3,845.67', change: 5.67, changePercent: 0.15, market: 'A股' },
  { name: '恒生指数', code: 'HSI', value: '19,234.12', change: 125.30, changePercent: 0.66, market: '港股' },
  { name: '纳斯达克', code: 'IXIC', value: '16,548.78', change: -45.23, changePercent: -0.27, market: '美股' },
];

// 热门研究标的
const hotAssets = [
  { symbol: '600519', name: '贵州茅台', type: 'stock', market: 'A股', change: 1.53, reason: '白酒龙头，业绩稳健' },
  { symbol: 'NVDA', name: '英伟达', type: 'stock', market: '美股', change: 3.24, reason: 'AI芯片领导者' },
  { symbol: 'BTC', name: '比特币', type: 'crypto', market: 'Crypto', change: 2.18, reason: '数字货币龙头' },
  { symbol: '300750', name: '宁德时代', type: 'stock', market: 'A股', change: 2.74, reason: '新能源电池龙头' },
];

// 快捷研究入口
const quickResearch = [
  { 
    icon: '📈', 
    title: '股票研究', 
    desc: 'A股、港股、美股全覆盖',
    href: '/search?type=stock',
    color: 'blue'
  },
  { 
    icon: '📊', 
    title: 'ETF 分析', 
    desc: '指数基金、行业ETF',
    href: '/search?type=etf',
    color: 'green'
  },
  { 
    icon: '🌐', 
    title: '宏观研究', 
    desc: '利率、CPI、美联储动态',
    href: '/search?type=macro',
    color: 'purple'
  },
  { 
    icon: '₿', 
    title: 'Crypto 研究', 
    desc: 'BTC、ETH、主流代币',
    href: '/search?type=crypto',
    color: 'orange'
  },
];

// 示例研究报告
const sampleReports = [
  {
    id: '1',
    title: '英伟达 (NVDA) 投资价值分析',
    summary: 'AI芯片需求持续爆发，公司业绩增长强劲，但估值偏高需注意风险',
    stance: '中性',
    date: '2026-05-20',
  },
  {
    id: '2',
    title: '贵州茅台 2026 年一季度财报解读',
    summary: '营收利润双增长，现金流优异，高端白酒龙头地位稳固',
    stance: '偏乐观',
    date: '2026-05-19',
  },
  {
    id: '3',
    title: '比特币近期走势分析',
    summary: 'ETF资金持续流入，但警惕宏观政策变化带来的波动风险',
    stance: '谨慎',
    date: '2026-05-18',
  },
];

// ============== 组件 ==============

function MarketIndexCard({ index }: { index: typeof marketIndices[0] }) {
  const isPositive = index.change >= 0;
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50">{index.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${
          index.market === 'A股' ? 'bg-red-500/10 text-red-400' :
          index.market === '港股' ? 'bg-orange-500/10 text-orange-400' :
          'bg-blue-500/10 text-blue-400'
        }`}>
          {index.market}
        </span>
      </div>
      <div className="text-xl font-bold mb-1">{index.value}</div>
      <div className={`flex items-center gap-2 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        <span>{isPositive ? '+' : ''}{index.change.toFixed(2)}</span>
        <span className="text-xs opacity-70">{isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%</span>
      </div>
    </div>
  );
}

function HotAssetCard({ asset }: { asset: typeof hotAssets[0] }) {
  const isPositive = asset.change >= 0;
  return (
    <Link 
      href={`/search?symbol=${asset.symbol}`}
      className="block bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">{asset.name}</span>
          <span className="text-xs text-white/40">{asset.symbol}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${
          asset.market === 'A股' ? 'bg-red-500/10 text-red-400' :
          asset.market === '美股' ? 'bg-blue-500/10 text-blue-400' :
          'bg-orange-500/10 text-orange-400'
        }`}>
          {asset.market}
        </span>
      </div>
      <p className="text-xs text-white/50 mb-2">{asset.reason}</p>
      <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{asset.change.toFixed(2)}%
      </div>
    </Link>
  );
}

function ResearchCard({ report }: { report: typeof sampleReports[0] }) {
  const stanceColor = {
    '中性': 'text-white/60',
    '偏乐观': 'text-green-400',
    '偏空': 'text-red-400',
    '谨慎': 'text-orange-400',
  }[report.stance] || 'text-white/60';

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium ${stanceColor}`}>{report.stance}</span>
        <span className="text-xs text-white/30">{report.date}</span>
      </div>
      <h3 className="font-bold mb-2 line-clamp-2">{report.title}</h3>
      <p className="text-sm text-white/60 line-clamp-2 mb-3">{report.summary}</p>
      <Link 
        href={`/reports/${report.id}`}
        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        查看详情 →
      </Link>
    </div>
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 粒子动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles.length = 0;
      const count = window.innerWidth < 768 ? 30 : 60;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.05,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();

    window.addEventListener('resize', () => { resize(); initParticles(); });
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.3 }}
      />

      <Header />

      {/* Hero Section with Global Search */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center pt-20 px-4">
        <div className="text-center max-w-3xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-white/70">AI 金融研究助手</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider mb-4">
            混元智投
          </h1>
          <p className="text-base md:text-lg text-white/60 mb-8 leading-relaxed">
            面向全球市场的 AI 金融研究平台<br />
            搜索 · 研究 · 报告 · 跟踪
          </p>

          {/* Global Search Form */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索股票代码、名称或研究主题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Quick Market Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['all', 'A', 'HK', 'US', 'Crypto'].map((market) => (
              <button
                key={market}
                onClick={() => setSelectedMarket(market)}
                className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                  selectedMarket === market
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 border-white/20 text-white/70 hover:border-white/40'
                }`}
              >
                {market === 'all' ? '全部市场' : market === 'A' ? 'A股' : market === 'HK' ? '港股' : market === 'US' ? '美股' : 'Crypto'}
              </button>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="text-white/40">热门:</span>
            {['贵州茅台', '英伟达', '特斯拉', '比特币'].map((item) => (
              <Link
                key={item}
                href={`/search?q=${item}`}
                className="text-white/60 hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="relative px-4 py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600"></div>
              <h2 className="text-sm uppercase tracking-widest text-white/50">今日市场</h2>
            </div>
            <Link href="/market" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              市场总览 →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {marketIndices.map((index) => (
              <MarketIndexCard key={index.code} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Research */}
      <section className="relative px-4 py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-cyan-600"></div>
              <h2 className="text-sm uppercase tracking-widest text-white/50">开始研究</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickResearch.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`p-6 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all group ${
                  item.color === 'blue' ? 'hover:border-blue-500/50' :
                  item.color === 'green' ? 'hover:border-green-500/50' :
                  item.color === 'purple' ? 'hover:border-purple-500/50' :
                  'hover:border-orange-500/50'
                }`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-xs text-white/50">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Assets */}
      <section className="relative px-4 py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600"></div>
              <h2 className="text-sm uppercase tracking-widest text-white/50">热门标的</h2>
            </div>
            <Link href="/search" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              查看更多 →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {hotAssets.map((asset) => (
              <HotAssetCard key={asset.symbol} asset={asset} />
            ))}
          </div>
        </div>
      </section>

      {/* Sample Reports */}
      <section className="relative px-4 py-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600"></div>
              <h2 className="text-sm uppercase tracking-widest text-white/50">研究报告</h2>
            </div>
            <Link href="/reports" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              报告中心 →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {sampleReports.map((report) => (
              <ResearchCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 py-12 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs uppercase tracking-widest text-white/30">风险提示</span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed">
            混元智投提供的数据和分析仅供研究参考，不构成投资建议。<br />
            投资有风险，决策需谨慎。
          </p>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        body {
          background: #000;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
}
