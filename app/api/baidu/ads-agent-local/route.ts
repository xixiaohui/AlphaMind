/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';

const LOCAL_AGENT_URL = process.env.LOCAL_AGENT_URL || 'http://localhost:9000/send-message';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: '消息不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build AG-UI protocol body
    const body = {
      threadId: 'thread-001',
      runId: `run-${Date.now()}`,
      messages: [
        ...(history || []).map((m: any) => ({
          id: m.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          role: m.role,
          content: m.content,
        })),
        {
          id: `msg_${Date.now()}`,
          role: 'user',
          content: message,
        },
      ],
      tools: [],
      context: [],
      state: {},
    };

    const res = await fetch(LOCAL_AGENT_URL, {
      method: 'POST',
      headers: {
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '未知错误');
      return new Response(JSON.stringify({ error: `本地Agent调用失败 (${res.status}): ${errText}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream the SSE response directly back to the client
    const reader = res.body?.getReader();
    if (!reader) {
      return new Response(JSON.stringify({ error: '无法读取本地Agent响应流' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (e: any) {
          const errorData = JSON.stringify({ error: `流式传输中断: ${e?.message || '未知错误'}` });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
          try { reader.cancel(); } catch { /* ignore */ }
        }
      },
      cancel() {
        reader.cancel().catch(() => {});
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
    console.error('本地Agent调用失败:', err);
    return new Response(
      JSON.stringify({ error: err?.message || err?.code || '未知错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
