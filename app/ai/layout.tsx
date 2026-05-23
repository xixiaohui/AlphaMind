import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 对话研究",
  description:
    "与混元大模型驱动的 AI 金融研究助手自由对话。使用自然语言提问，获取市场解读、个股分析、宏观研判、风险识别与结构化研究报告。支持多轮追问与深度研究。",
};

export default function AILayout({ children }: { children: React.ReactNode }) {
  return children;
}
