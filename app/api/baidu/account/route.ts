import { NextRequest, NextResponse } from 'next/server';
import { getBaiduClient, BaiduApiError } from '@/app/lib/baidu/client';

/**
 * GET /api/baidu/account?fields=balance,budget,cost
 * 获取百度推广账户信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fieldsParam = searchParams.get('fields');

    const fields = fieldsParam
      ? fieldsParam.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const client = getBaiduClient();
    const info = await client.getAccountInfo(fields);

    return NextResponse.json({ success: true, data: info });
  } catch (err) {
    if (err instanceof BaiduApiError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 502 });
    }
    console.error('获取账户信息失败:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误' },
      { status: 500 },
    );
  }
}
