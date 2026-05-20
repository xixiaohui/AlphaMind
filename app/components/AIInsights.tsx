export interface AIInsight {
  title: string;
  content: string;
  type: 'bullish' | 'bearish' | 'neutral';
}

interface AIInsightsProps {
  insights: AIInsight[];
}

export default function AIInsights({ insights }: AIInsightsProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-linear-to-b from-blue-500 to-cyan-500"></div>
        <h2 className="text-xs uppercase tracking-widest text-white/50">AI 投资观察</h2>
      </div>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`p-5 border rounded-lg ${
              insight.type === 'bullish'
                ? 'border-green-400/30 bg-green-400/5'
                : insight.type === 'bearish'
                ? 'border-red-400/30 bg-red-400/5'
                : 'border-blue-400/30 bg-blue-400/5'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${
                insight.type === 'bullish' ? 'bg-green-400' : insight.type === 'bearish' ? 'bg-red-400' : 'bg-blue-400'
              }`}></span>
              <h3 className="font-bold">{insight.title}</h3>
            </div>
            <p className="text-sm text-white/70">{insight.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
