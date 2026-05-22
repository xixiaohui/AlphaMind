import { NextRequest, NextResponse } from 'next/server';
import { getBaiduClient, BaiduApiError } from '@/app/lib/baidu/client';

/**
 * GET /api/baidu/campaign?ids=123,456&fields=campaignName,status
 * 获取推广计划列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    const fieldsParam = searchParams.get('fields');

    const fields = fieldsParam
      ? fieldsParam.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const client = getBaiduClient();

    let campaigns;
    if (idsParam) {
      const ids = idsParam.split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
      campaigns = await client.getCampaign(ids, fields);
    } else {
      campaigns = await client.getAllCampaigns(fields);
    }

    return NextResponse.json({ success: true, data: campaigns, total: campaigns.length });
  } catch (err) {
    if (err instanceof BaiduApiError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 502 });
    }
    console.error('获取推广计划失败:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误' },
      { status: 500 },
    );
  }
}
