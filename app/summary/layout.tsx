import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "今日市场摘要",
  description:
    "AI 生成的每日市场摘要，覆盖全球主要指数表现、ETF 资金流向、美联储动态、大宗商品波动、数字货币热点与市场风险情绪。一站式获取市场日报与核心动态。",
};

export default function SummaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
