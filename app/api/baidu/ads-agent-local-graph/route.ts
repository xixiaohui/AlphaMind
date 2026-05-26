/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { Client } from "@langchain/langgraph-sdk";

const client = new Client({
  apiUrl: process.env.LANGGRAPH_API_URL!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [], threadId } = body;

    let currentThreadId = threadId;
    if (!currentThreadId) {
      const thread = await client.threads.create();
      currentThreadId = thread.thread_id;
    }

    const messages = [...history, { role: "user", content: message }];

    // 非流式调用：创建 run 并等待完成
    const run = await client.runs.create(
      currentThreadId,
      "agent",
      { input: { messages } }
    );

    const result = await client.runs.join(
      currentThreadId,
      run.run_id
    );

    // 从结果中提取最后一条 AI 消息
    const allMessages: any[] =
      (result as any)?.messages ??
      (result as any)?.output?.messages ??
      [];

    const lastAI = [...allMessages]
      .reverse()
      .find((m: any) => m.type === "ai" || m.type === "AIMessage");

    const content = lastAI?.content ?? "";

    return Response.json({ content, threadId: currentThreadId });

  } catch (error: any) {
    console.error("LangGraph Error:", error);
    return Response.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
