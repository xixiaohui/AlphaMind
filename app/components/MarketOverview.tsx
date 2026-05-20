interface MarketIndex {
  index: string;
  value: string;
  change: number;
  changePercent: number;
}

interface MarketOverviewProps {
  data: MarketIndex[];
  showAllLink?: boolean;
  href?: string;
}

export default function MarketOverview({ data, showAllLink = false, href = '/summary' }: MarketOverviewProps) {
  const content = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-lg overflow-hidden">
      {data.map((item, index) => (
        <a
          key={index}
          href={href}
          className="bg-black p-4 md:p-6 hover:bg-white/5 transition-colors"
        >
          <p className="text-xs md:text-sm text-white/50 mb-2 md:mb-3">{item.index}</p>
          <p className="text-lg md:text-2xl font-bold mb-1">{item.value}</p>
          <div className="flex items-center gap-1 md:gap-2">
            <span className={`text-xs md:text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
            </span>
            <span className={`text-xs px-1 md:px-2 py-0.5 rounded ${item.change >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
              {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
            </span>
          </div>
        </a>
      ))}
    </div>
  );

  if (showAllLink) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-1 h-5 md:h-6 bg-linear-to-b from-blue-500 to-purple-600"></div>
            <h2 className="text-xs uppercase tracking-widest text-white/50">市场指数</h2>
          </div>
          <a href={href} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            查看更多
          </a>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
        <div className="w-1 h-5 md:h-6 bg-linear-to-b from-blue-500 to-purple-600"></div>
        <h2 className="text-xs uppercase tracking-widest text-white/50">市场概况</h2>
      </div>
      {content}
    </div>
  );
}
