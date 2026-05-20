interface HotSector {
  name: string;
  change: number;
  reason: string;
}

interface HotSectorsProps {
  data: HotSector[];
  showAllLink?: boolean;
}

export default function HotSectors({ data, showAllLink = true }: HotSectorsProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
        <div className="w-1 h-5 md:h-6 bg-linear-to-b from-orange-500 to-red-500"></div>
        <h2 className="text-xs uppercase tracking-widest text-white/50">热门板块</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {data.map((sector, index) => (
          <div
            key={index}
            className="p-4 md:p-6 border border-white/10 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <h3 className="text-base md:text-lg font-bold">{sector.name}</h3>
              <span className="text-green-400 font-bold text-sm md:text-base">+{sector.change.toFixed(2)}%</span>
            </div>
            <p className="text-xs md:text-sm text-white/50 mb-3 md:mb-4">{sector.reason}</p>
            {showAllLink && (
              <a
                href={`/ai?prompt=分析${sector.name}板块的投资机会`}
                className="inline-flex items-center gap-1 md:gap-2 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                深度分析
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
