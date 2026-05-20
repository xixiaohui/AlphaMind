export interface MarketIndexData {
  name: string;
  value: string;
  change: number;
  changePercent: number;
}

interface MarketIndexCardProps {
  index: MarketIndexData;
  compact?: boolean;
}

export default function MarketIndexCard({ index, compact = false }: MarketIndexCardProps) {
  if (compact) {
    return (
      <div className="bg-black p-4 hover:bg-white/5 transition-colors">
        <p className="text-xs text-white/50 mb-2">{index.name}</p>
        <p className="text-lg font-bold mb-1">{index.value}</p>
        <p className={`text-sm ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black p-6 hover:bg-white/5 transition-colors">
      <p className="text-sm text-white/50 mb-3">{index.name}</p>
      <p className="text-2xl font-bold mb-1">{index.value}</p>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${index.change >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
          {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
