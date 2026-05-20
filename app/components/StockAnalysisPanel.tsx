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

interface StockAnalysisPanelProps {
  stock: StockData;
}

export default function StockAnalysisPanel({ stock }: StockAnalysisPanelProps) {
  return (
    <div className="border border-white/10 rounded-lg bg-white/5 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">{stock.name}</h3>
          <span className="text-sm text-white/40">{stock.code}</span>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">¥{stock.price.toFixed(2)}</p>
          <p className={`text-lg ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-white/10">
        <div className="text-center">
          <p className="text-xs text-white/40 mb-1">市盈率</p>
          <p className="font-bold">{stock.pe || '--'}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/40 mb-1">股息率</p>
          <p className="font-bold">{stock.dividend ? `${stock.dividend}%` : '--'}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/40 mb-1">成交量</p>
          <p className="font-bold">{stock.volume || '--'}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="p-4 bg-green-400/5 border border-green-400/20 rounded-lg">
          <h4 className="text-sm font-bold text-green-400 mb-2">基本面分析</h4>
          <p className="text-sm text-white/70">
            {stock.name}作为行业龙头，基本面稳健。营收保持稳定增长，现金流充裕，资产负债率处于合理水平。
          </p>
        </div>
        <div className="p-4 bg-blue-400/5 border border-blue-400/20 rounded-lg">
          <h4 className="text-sm font-bold text-blue-400 mb-2">技术面分析</h4>
          <p className="text-sm text-white/70">
            股价处于{stock.change >= 0 ? '上升通道' : '回调趋势'}，{stock.change >= 0 ? '均线多头排列，短期强势' : '建议关注支撑位'}。
          </p>
        </div>
        <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-lg">
          <h4 className="text-sm font-bold text-yellow-400 mb-2">风险提示</h4>
          <p className="text-sm text-white/70">
            行业竞争加剧、政策调控不确定性、市场情绪波动等因素可能影响股价表现。
          </p>
        </div>
      </div>

      <a
        href={`/ai?prompt=详细分析${stock.name}（${stock.code}）的投资价值，包括基本面、技术面和市场情绪`}
        className="w-full px-6 py-3 bg-white text-black font-bold text-sm rounded-full text-center block hover:bg-white/90 transition-colors"
      >
        让 AI 深度分析
      </a>
    </div>
  );
}
