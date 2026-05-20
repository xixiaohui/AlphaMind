'use client';

import { useState, useEffect, use } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

// 资产数据（模拟）
const assetData: Record<string, {
  symbol: string;
  name: string;
  market: string;
  price: string;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  high52w: string;
  low52w: string;
  pe: number | null;
  pb: number | null;
  dividend: number | null;
  description: string;
}> = {
  '600519': {
    symbol: '600519',
    name: '贵州茅台',
    market: 'A 股',
    price: '1,688.00',
    change: 25.50,
    changePercent: 1.53,
    volume: '2.35亿',
    marketCap: '2.12万亿',
    high52w: '1,850.00',
    low52w: '1,450.00',
    pe: 35.2,
    pb: 12.5,
    dividend: 1.96,
    description: '贵州茅台酒股份有限公司是中国白酒行业的龙头企业，主要生产和销售茅台酒及相关产品。',
  },
  'NVDA': {
    symbol: 'NVDA',
    name: '英伟达 (NVIDIA)',
    market: '美 股',
    price: '1,025.80',
    change: 32.15,
    changePercent: 3.24,
    volume: '45.2M',
    marketCap: '2.52万亿',
    high52w: '1,050.00',
    low52w: '450.00',
    pe: 65.8,
    pb: 45.2,
    dividend: 0.16,
    description: '英伟达是全球领先的 GPU 制造商，在 AI 芯片、数据中心、游戏等领域处于领先地位。',
  },
  'BTC': {
    symbol: 'BTC',
    name: '比特币 (Bitcoin)',
    market: 'Crypto',
    price: '$68,450',
    change: 1450,
    changePercent: 2.15,
    volume: '$28.5B',
    marketCap: '$1.34万亿',
    high52w: '$73,000',
    low52w: '$42,000',
    pe: null,
    pb: null,
    dividend: null,
    description: '比特币是第一个去中心化的加密货币，也是市值最大的数字资产，被视为"数字黄金"。',
  },
};

export default function AssetPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const asset = assetData[symbol] || assetData['600519']; // 默认显示茅台
  const isPositive = asset.change >= 0;

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

      {/* Asset Header */}
      <section className="pt-20 px-4 py-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link href="/" className="hover:text-white transition-colors">首页</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-white transition-colors">搜索</Link>
            <span>/</span>
            <span className="text-white">{asset.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{asset.name}</h1>
                <span className={`text-sm px-2 py-0.5 rounded ${
                  asset.market === 'A 股' ? 'bg-red-500/10 text-red-400' :
                  asset.market === '美 股' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-purple-500/10 text-purple-400'
                }`}>
                  {asset.market}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
                <span>{asset.symbol}</span>
              </div>
              <p className="text-sm text-white/60 max-w-2xl">{asset.description}</p>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-3xl md:text-4xl font-bold mb-1">{asset.price}</div>
              <div className={`flex items-center gap-2 text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <span>{isPositive ? '+' : ''}{asset.change.toFixed(2)}</span>
                <span className="text-sm">({isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%)</span>
              </div>
              <button
                onClick={() => setIsWatching(!isWatching)}
                className={`mt-3 px-4 py-2 text-sm rounded-full border transition-colors ${
                  isWatching
                    ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
                    : 'bg-white/5 border-white/20 text-white/70 hover:border-white/40'
                }`}
              >
                {isWatching ? '★ 已自选' : '☆ 添加自选'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-4 py-3 border-b border-white/10 sticky top-16 bg-black/90 backdrop-blur-md z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: '概览' },
              { id: 'analysis', label: 'AI 分析' },
              { id: 'financial', label: '财务' },
              { id: 'news', label: '新闻' },
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
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="font-bold mb-4">关键指标</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-white/40 mb-1">成交量</div>
                      <div className="font-bold">{asset.volume}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">总市值</div>
                      <div className="font-bold">{asset.marketCap}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">52周高</div>
                      <div className="font-bold text-green-400">{asset.high52w}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">52周低</div>
                      <div className="font-bold text-red-400">{asset.low52w}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="font-bold mb-4">估值指标</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {asset.pe && (
                      <div>
                        <div className="text-xs text-white/40 mb-1">市盈率 (PE)</div>
                        <div className="font-bold">{asset.pe}</div>
                      </div>
                    )}
                    {asset.pb && (
                      <div>
                        <div className="text-xs text-white/40 mb-1">市净率 (PB)</div>
                        <div className="font-bold">{asset.pb}</div>
                      </div>
                    )}
                    {asset.dividend && (
                      <div>
                        <div className="text-xs text-white/40 mb-1">股息率</div>
                        <div className="font-bold">{asset.dividend}%</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-white/40 mb-1">涨跌幅</div>
                      <div className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Chart Placeholder */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="font-bold mb-4">价格走势</h3>
                  <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="text-white/30">价格图表区域</span>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="font-bold mb-4">快速操作</h3>
                  <div className="space-y-3">
                    <button className="w-full py-2 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors">
                      AI 生成分析
                    </button>
                    <button className="w-full py-2 bg-white/10 border border-white/20 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
                      加入自选
                    </button>
                    <button className="w-full py-2 bg-white/10 border border-white/20 text-white text-sm rounded-lg hover:bg-white/20 transition-colors">
                      生成报告
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="font-bold mb-4">相关标的</h3>
                  <div className="space-y-3">
                    <Link href="/asset/000858" className="flex items-center justify-between text-sm hover:text-blue-400 transition-colors">
                      <span>五粮液</span>
                      <span className="text-white/40">+1.2%</span>
                    </Link>
                    <Link href="/asset/601318" className="flex items-center justify-between text-sm hover:text-blue-400 transition-colors">
                      <span>中国平安</span>
                      <span className="text-white/40">+0.8%</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="max-w-3xl">
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">🤖</span>
                  <h3 className="font-bold">AI 分析</h3>
                </div>
                <p className="text-white/60 text-sm mb-6">
                  点击下方按钮，让 AI 为您深度分析 {asset.name} 的投资价值
                </p>
                <button className="px-6 py-3 bg-white text-black font-bold text-sm rounded-full hover:bg-white/90 transition-colors">
                  开始 AI 分析
                </button>
              </div>

              {/* Sample Analysis Preview */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">分析结论</h3>
                  <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded">中性</span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-white/70 text-sm leading-relaxed">
                    {asset.name} 目前处于...（AI 分析内容将显示在这里）
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                <h3 className="font-bold mb-4">财务摘要</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-white/50">指标</th>
                        <th className="text-right py-2 text-white/50">2025</th>
                        <th className="text-right py-2 text-white/50">2024</th>
                        <th className="text-right py-2 text-white/50">2023</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2">营收</td>
                        <td className="text-right">1,535亿</td>
                        <td className="text-right">1,503亿</td>
                        <td className="text-right">1,287亿</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2">净利润</td>
                        <td className="text-right">747亿</td>
                        <td className="text-right">720亿</td>
                        <td className="text-right">627亿</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2">毛利率</td>
                        <td className="text-right">91.9%</td>
                        <td className="text-right">91.5%</td>
                        <td className="text-right">90.5%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              {[
                { title: '茅台集团召开年度股东大会，部署2026年工作重点', time: '2小时前', source: '公司公告' },
                { title: '白酒行业景气度回升，头部酒企业绩增长可期', time: '1天前', source: '行业研究' },
                { title: '机构持仓报告显示，多家QFII增持茅台股份', time: '3天前', source: '机构动向' },
              ].map((news, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-white/30 mb-2">
                    <span>{news.time}</span>
                    <span>·</span>
                    <span>{news.source}</span>
                  </div>
                  <h4 className="font-medium mb-1">{news.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 py-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 rounded-lg p-4 text-xs text-white/40">
            <strong className="text-white/60">免责声明：</strong>
            本页面提供的数据和分析仅供研究参考，不构成投资建议。投资有风险，决策需谨慎。
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
