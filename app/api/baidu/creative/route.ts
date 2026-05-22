import { NextRequest, NextResponse } from 'next/server';
import { getBaiduClient, BaiduApiError } from '@/app/lib/baidu/client';

/**
 * GET /api/baidu/creative?adgroupId=xxx&fields=title,status
 * 获取创意列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adgroupId = searchParams.get('adgroupId');
    const fieldsParam = searchParams.get('fields');

    const fields = fieldsParam
      ? fieldsParam.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const client = getBaiduClient();
    const creatives = await client.getAllCreatives(
      adgroupId ? parseInt(adgroupId, 10) : undefined,
      fields,
    );

    return NextResponse.json({ success: true, data: creatives, total: creatives.length });
  } catch (err) {
    if (err instanceof BaiduApiError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 502 });
    }
    console.error('获取创意失败:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误' },
      { status: 500 },
    );
  }
}
