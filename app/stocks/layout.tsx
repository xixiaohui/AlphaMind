import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 股票分析",
  description:
    "基于混元大模型的 AI 股票分析工具。支持 A 股、港股、美股实时行情查询，财报分析、基本面分析、技术面分析、估值分析、风险识别与 AI 综合观点。覆盖热门股票与指数研究。",
};

export default function StocksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
