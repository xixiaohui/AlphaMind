export interface StockData {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: string;
  marketCap?: string;
  pe?: number;
  dividend?: number;
}

interface StockCardProps {
  stock: StockData;
  selected?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
}

export default function StockCard({ stock, selected = false, onClick, showDetails = false }: StockCardProps) {
  const content = (
    <div
      className={`p-4 border rounded-lg transition-all ${
        selected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold">{stock.name}</span>
            <span className="text-xs text-white/40">{stock.code}</span>
          </div>
          {showDetails && (
            <div className="flex items-center gap-4 text-xs text-white/50">
              {stock.marketCap && <span>市值 {stock.marketCap}</span>}
              {stock.pe && <span>PE {stock.pe}</span>}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">¥{stock.price.toFixed(2)}</p>
          <p className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}
