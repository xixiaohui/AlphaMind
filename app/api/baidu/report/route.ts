import { NextRequest, NextResponse } from 'next/server';
import {
  getBaiduClient,
  BaiduApiError,
  RealTimeReportRequest,
  ProfessionalReportRequest,
} from '@/app/lib/baidu/client';

/**
 * POST /api/baidu/report
 *
 * 请求体:
 * {
 *   type: "realtime" | "professional",   // 报告类型
 *   startDate: "2026-05-01",              // 开始日期
 *   endDate: "2026-05-20",                // 结束日期
 *   performanceData: ["cost", "click"],   // 指标列表
 *   levelOfDetails: 2,                    // 数据层级
 *   reportType: 10,                       // 报告类型
 *   statIds: [1234567],                   // 可选，统计对象ID
 *   unitOfTime: 5,                        // 可选，时间粒度
 *   device: 0,                            // 可选，设备
 *   pageIndex: 1,                         // 可选，分页页码
 *   number: 1000,                         // 可选，每页条数
 *   order: true,                          // 可选，是否倒序
 *
 *   // 专业报告额外参数
 *   filter: [],                           // 可选，过滤条件
 *   needDevice: false                     // 可选，是否需要设备信息
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type = 'realtime',
      startDate,
      endDate,
      performanceData,
      levelOfDetails,
      reportType,
      statIds,
      unitOfTime,
      device,
      pageIndex,
      number: pageSize,
      order,
      filter,
      needDevice,
    } = body;

    // 参数校验
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '请提供 startDate 和 endDate' },
        { status: 400 },
      );
    }

    if (!performanceData || !Array.isArray(performanceData) || performanceData.length === 0) {
      return NextResponse.json(
        { error: '请提供 performanceData 指标列表' },
        { status: 400 },
      );
    }

    if (!levelOfDetails) {
      return NextResponse.json(
        { error: '请提供 levelOfDetails 数据层级' },
        { status: 400 },
      );
    }

    const client = getBaiduClient();

    if (type === 'professional') {
      // ===== 异步专业报告 =====
      if (!reportType) {
        return NextResponse.json(
          { error: '专业报告需要提供 reportType' },
          { status: 400 },
        );
      }

      const params: ProfessionalReportRequest = {
        startDate,
        endDate,
        performanceData,
        reportType,
        levelOfDetails,
        statRange: 2,
        statIds,
        unitOfTime,
        device,
        filter,
        order,
        needDevice,
      };

      const reportId = await client.getProfessionalReportId(params);

      return NextResponse.json({
        success: true,
        type: 'professional',
        reportId,
        message: '报告任务已创建，请查询状态获取结果',
      });
    }

    // ===== 实时数据报告 =====
    const params: RealTimeReportRequest = {
      startDate,
      endDate,
      performanceData,
      levelOfDetails,
      reportType: reportType || 10,
      statRange: 2,
      statIds,
      unitOfTime,
      device: device ?? 0,
      pageIndex: pageIndex ?? 1,
      number: pageSize ?? 1000,
      order,
    };

    const data = await client.getRealTimeData(params);

    return NextResponse.json({
      success: true,
      type: 'realtime',
      data: data.data,
      totalCount: data.data?.length || 0,
      performanceData,
    });
  } catch (err) {
    if (err instanceof BaiduApiError) {
      console.error('百度 API 错误:', err.message, 'code:', err.code);
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          requestId: err.requestId,
        },
        { status: 502 },
      );
    }

    console.error('报告获取失败:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/baidu/report?reportId=xxx
 *
 * 查询专业报告状态或下载地址
 * - 传 reportId 查询状态
 * - 传 reportId&action=download 获取下载链接和内容
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    const action = searchParams.get('action');

    if (!reportId) {
      return NextResponse.json(
        { error: '请提供 reportId' },
        { status: 400 },
      );
    }

    const client = getBaiduClient();

    if (action === 'download') {
      const fileUrl = await client.getReportFileUrl(reportId);
      const content = await client.downloadReportFile(fileUrl);

      return NextResponse.json({
        success: true,
        reportId,
        fileUrl,
        content,
      });
    }

    // 查询状态
    const status = await client.getReportState(reportId);

    return NextResponse.json({
      success: true,
      reportId: status.reportId,
      status: status.status,
      statusText:
        status.status === 0 ? '处理中' :
        status.status === 1 ? '等待中' :
        status.status === 2 ? '处理中' :
        status.status === 3 ? '生成成功' :
        status.status === 4 ? '生成失败' : '未知',
      fileUrl: status.status === 3 ? await client.getReportFileUrl(reportId).catch(() => undefined) : undefined,
    });
  } catch (err) {
    if (err instanceof BaiduApiError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 502 },
      );
    }

    console.error('报告状态查询失败:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '未知错误' },
      { status: 500 },
    );
  }
}
