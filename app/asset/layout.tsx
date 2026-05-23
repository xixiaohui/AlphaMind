import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "资产研究",
  description:
    "查看任意资产的 AI 深度研究报告：当前价格、K 线走势、核心财务指标、AI 结构化分析、新闻时间线、风险因素识别与相关资产比较。支持股票、ETF、数字货币等多资产类型。",
};

export default function AssetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
