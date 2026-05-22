/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import cloudbase from '@/app/utils/cloudbase';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    // 使用 SDK 的 ai.bot.sendMessage
    const ai: any = cloudbase.ai();

    const res: any = await ai.bot.sendMessage({
      botId: 'agent-zhibandeep-0fbxz4uca513811',
      threadId: '550e8400-e29b-41d4-a716-446655440000',
      messages: [
        {
          id: 'msg_001',
          role: 'user',
          content: message,
        },
      ],
      tools: [],
      context: [],
      state: {},
      forwardedProps: {},
    });

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (res?.dataStream) {
            for await (const data of res.dataStream) {
              if (data?.delta) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: data.delta })}\n\n`));
              } else if (data?.type === 'TEXT_MESSAGE_END') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                break;
              }
            }
          } else if (res?.textStream) {
            for await (const str of res.textStream) {
              if (str) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: str })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          }
        } catch (e) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '流式读取失败' })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('Agent调用失败:', err);
    return NextResponse.json(
      { error: err?.message || err?.code || '未知错误' },
      { status: 500 }
    );
  }
}
