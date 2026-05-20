interface NewsItem {
  title: string;
  summary?: string;
  time: string;
  type: string;
  impact?: 'positive' | 'negative' | 'neutral';
}

interface NewsFeedProps {
  data: NewsItem[];
  showAllLink?: boolean;
  compact?: boolean;
}

export default function NewsFeed({ data, showAllLink = true, compact = false }: NewsFeedProps) {
  if (compact) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8 px-2 md:px-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-1 h-5 md:h-6 bg-linear-to-b from-yellow-500 to-orange-500"></div>
            <h2 className="text-xs uppercase tracking-widest text-white/50">财经快讯</h2>
          </div>
          {showAllLink && (
            <a href="/summary" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              查看更多
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 px-2 md:px-0">
          {data.map((item, index) => (
            <a
              key={index}
              href="/summary"
              className="flex items-start gap-3 md:gap-4 p-3 md:p-4 border border-white/10 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/5 flex items-center justify-center">
                <span className="text-xs font-medium text-white/40">{item.type}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1 truncate">{item.title}</h4>
                <span className="text-xs text-white/40">{item.time}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 md:gap-3 mb-6 px-2 md:px-0">
        <div className="w-1 h-5 md:h-6 bg-linear-to-b from-yellow-500 to-orange-500"></div>
        <h2 className="text-xs uppercase tracking-widest text-white/50">财经快讯</h2>
      </div>

      <div className="space-y-3 md:space-y-4 px-2 md:px-0">
        {data.map((item, index) => (
          <a
            key={index}
            href="/summary"
            className="block p-4 md:p-5 border border-white/10 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3 md:gap-4">
              {item.impact && (
                <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${
                  item.impact === 'positive'
                    ? 'bg-green-400/10 text-green-400'
                    : item.impact === 'negative'
                    ? 'bg-red-400/10 text-red-400'
                    : 'bg-blue-400/10 text-blue-400'
                }`}>
                  {item.impact === 'positive' ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : item.impact === 'negative' ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 md:mb-2 flex-wrap">
                  <span className="px-2 py-0.5 text-xs bg-white/10 rounded">{item.type}</span>
                  <span className="text-xs text-white/40">{item.time}</span>
                </div>
                <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">{item.title}</h3>
                {item.summary && (
                  <p className="text-xs md:text-sm text-white/60 line-clamp-2">{item.summary}</p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
