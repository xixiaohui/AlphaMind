import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "研究报告中心",
  description:
    "AI 驱动的金融研究报告生成与存储中心。支持股票、ETF、数字货币等多资产类型研究。报告包含市场概况、核心数据、基本面分析、风险因素与 AI 综合观点，支持 Markdown 渲染与历史查看。",
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
