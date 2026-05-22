// ============== 百度营销 API 客户端 ==============

// 百度营销 API 基础地址
const BAIDU_API_BASE = 'https://api.baidu.com/json/sms/service';

// ============== 类型定义 ==============

interface BaiduAuthHeader {
  username?: string;
  password?: string;
  token?: string;
  accessToken?: string;
}

interface BaiduApiHeader {
  userName?: string;
  password?: string;
  token?: string;
  accessToken?: string;
}

interface BaiduApiRequestBody {
  header: BaiduApiHeader;
  body: Record<string, unknown>;
}

/** 实时数据请求参数 */
export interface RealTimeReportRequest {
  /** 开始日期 yyyy-MM-dd */
  startDate: string;
  /** 结束日期 yyyy-MM-dd */
  endDate: string;
  /** 指标列表 */
  performanceData: string[];
  /** 数据层级: 2=账户, 3=计划, 5=单元 */
  levelOfDetails: 2 | 3 | 5;
  /** 报告类型 */
  reportType: number;
  /** 统计范围: 2=账户范围 */
  statRange?: number;
  /** 统计对象ID列表 */
  statIds?: number[];
  /** 时间粒度: 5=日, 7=小时, 8=汇总 */
  unitOfTime?: number;
  /** 设备: 0=全部, 1=PC, 2=移动 */
  device?: 0 | 1 | 2;
  /** 每页条数 (默认1000, 最大10000) */
  number?: number;
  /** 页码 (从1开始) */
  pageIndex?: number;
  /** 是否倒序 */
  order?: boolean;
}

/** 专业报告请求参数 */
export interface ProfessionalReportRequest {
  /** 开始日期 yyyy-MM-dd */
  startDate: string;
  /** 结束日期 yyyy-MM-dd */
  endDate: string;
  /** 指标列表 */
  performanceData: string[];
  /** 报告类型 */
  reportType: number;
  /** 数据层级: 2=账户, 3=计划, 5=单元, 7=创意 */
  levelOfDetails: number;
  /** 统计范围 */
  statRange?: number;
  /** 统计对象ID列表 */
  statIds?: number[];
  /** 时间粒度 */
  unitOfTime?: number;
  /** 设备 */
  device?: number;
  /** 过滤条件 */
  filter?: Record<string, unknown>[];
  /** 排序规则 */
  order?: Record<string, unknown>;
  /** 是否需要设备信息 */
  needDevice?: boolean;
}

/** 实时数据单条记录 */
export interface ReportDataItem {
  id: number;
  name: string[];
  date: string;
  kpis: string[];
}

/** 实时数据响应 */
export interface RealTimeReportResponse {
  data: ReportDataItem[];
  totalCount?: number;
}

/** 专业报告状态 */
export interface ProfessionalReportStatus {
  reportId: string;
  status: number; // 0=处理中, 1=等待中, 2=处理中, 3=生成成功, 4=生成失败
  fileUrl?: string;
}

// ============== 账户 / 计划 / 单元 / 创意 类型 ==============

/** 账户信息 */
export interface AccountInfo {
  userId: number;
  balance: number;
  budget: number;
  budgetOfflineTime: string;
  cost: number;
  dayBudget: number;
  payment: number;
  regionTarget: number[];
  userStat: number;
  excludeIp: string[];
  /** 开放式预算 1=开 0=关 */
  openDomains: string;
  /** 预算类型 0=不限定 1=日预算 */
  budgetType: number;
  /** 资金类型 0=预付款 1=后付款 */
  accountType: number;
  [key: string]: unknown;
}

/** 推广计划 */
export interface CampaignInfo {
  campaignId: number;
  campaignName: string;
  budget: number;
  regionTarget: number[];
  status: number;
  pause: boolean;
  negativeWords: string[];
  exactNegativeWords: string[];
  /** 出价模式 1=点击 2=展现 3=转化 */
  bidType: number;
  /** 投放设备 0=全部 1=PC 2=移动 */
  device: number;
  [key: string]: unknown;
}

/** 推广单元 */
export interface AdgroupInfo {
  adgroupId: number;
  adgroupName: string;
  campaignId: number;
  maxPrice: number;
  pause: boolean;
  status: number;
  negativeWords: string[];
  exactNegativeWords: string[];
  [key: string]: unknown;
}

/** 创意 */
export interface CreativeInfo {
  creativeId: number;
  creativeName: string;
  adgroupId: number;
  title: string;
  description1: string;
  description2: string;
  status: number;
  pause: boolean;
  [key: string]: unknown;
}

// ============== 客户端实现 ==============

export class BaiduApiError extends Error {
  code: number;
  requestId: string;

  constructor(message: string, code: number, requestId: string) {
    super(message);
    this.name = 'BaiduApiError';
    this.code = code;
    this.requestId = requestId;
  }
}

export class BaiduClient {
  private auth: BaiduAuthHeader;
  private baseUrl: string;

  constructor(auth?: Partial<BaiduAuthHeader>, baseUrl?: string) {
    this.baseUrl = baseUrl || BAIDU_API_BASE;

    this.auth = {
      username: auth?.username || process.env.BAIDU_USERNAME,
      password: auth?.password || process.env.BAIDU_PASSWORD,
      token: auth?.token || process.env.BAIDU_API_TOKEN,
      accessToken: auth?.accessToken || process.env.BAIDU_ACCESS_TOKEN,
    };
  }

  /** 构建请求头 */
  private buildAuthHeader(): BaiduApiHeader {
    // 收集所有可用认证字段
    const header: BaiduApiHeader = {};

    if (this.auth.username) header.userName = this.auth.username;
    if (this.auth.password) header.password = this.auth.password;
    if (this.auth.token) header.token = this.auth.token;
    if (this.auth.accessToken) header.accessToken = this.auth.accessToken;

    const hasOAuth = !!header.accessToken;
    const hasPasswordAuth = !!(header.userName && header.password && header.token);

    if (!hasOAuth && !hasPasswordAuth) {
      throw new Error('百度营销 API 认证信息未配置，请设置 BAIDU_ACCESS_TOKEN 或 BAIDU_USERNAME/PASSWORD/TOKEN');
    }

    return header;
  }

  /** 通用 API 请求 */
  private async request<T>(service: string, method: string, bodyParams: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/${service}/${method}`;

    const payload: BaiduApiRequestBody = {
      header: this.buildAuthHeader(),
      body: bodyParams,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: 百度 API 请求失败`);
    }

    const result = await response.json();

    if (result.header?.failures?.length > 0) {
      const failure = result.header.failures[0];
      throw new BaiduApiError(
        failure.message || '百度 API 返回错误',
        failure.code || -1,
        result.header.rquid || '',
      );
    }

    return result.body as T;
  }

  /**
   * 获取实时数据报告
   * POST /json/sms/service/ReportService/getRealTimeData
   */
  async getRealTimeData(params: RealTimeReportRequest): Promise<RealTimeReportResponse> {
    const requestType: Record<string, unknown> = {
      performanceData: params.performanceData,
      startDate: params.startDate,
      endDate: params.endDate,
      levelOfDetails: params.levelOfDetails,
      reportType: params.reportType,
      statRange: params.statRange ?? 2,
    };

    if (params.statIds) requestType.statIds = params.statIds;
    if (params.unitOfTime !== undefined) requestType.unitOfTime = params.unitOfTime;
    if (params.device !== undefined) requestType.device = params.device;
    if (params.number !== undefined) requestType.number = params.number;
    if (params.pageIndex !== undefined) requestType.pageIndex = params.pageIndex;
    if (params.order !== undefined) requestType.order = params.order;

    const body = await this.request<{ data: ReportDataItem[] }>(
      'ReportService',
      'getRealTimeData',
      { realTimeRequestType: requestType },
    );

    return {
      data: body.data || [],
      totalCount: body.data?.length,
    };
  }

  /**
   * 创建专业报告（异步）
   * POST /json/sms/service/ReportService/getProfessionalReportId
   */
  async getProfessionalReportId(params: ProfessionalReportRequest): Promise<string> {
    const requestType: Record<string, unknown> = {
      reportType: params.reportType,
      levelOfDetails: params.levelOfDetails,
      startDate: params.startDate,
      endDate: params.endDate,
      performanceData: params.performanceData,
      statRange: params.statRange ?? 2,
    };

    if (params.statIds) requestType.statIds = params.statIds;
    if (params.unitOfTime !== undefined) requestType.unitOfTime = params.unitOfTime;
    if (params.device !== undefined) requestType.device = params.device;
    if (params.filter) requestType.filter = params.filter;
    if (params.order) requestType.order = params.order;
    if (params.needDevice !== undefined) requestType.needDevice = params.needDevice;

    const body = await this.request<{ reportId: string }>(
      'ReportService',
      'getProfessionalReportId',
      { reportRequestType: requestType },
    );

    if (!body.reportId) {
      throw new Error('获取报告ID失败');
    }

    return body.reportId;
  }

  /**
   * 查询专业报告状态
   * POST /json/sms/service/ReportService/getReportState
   */
  async getReportState(reportId: string): Promise<ProfessionalReportStatus> {
    const body = await this.request<{ status: number }>(
      'ReportService',
      'getReportState',
      { reportId },
    );

    return {
      reportId,
      status: body.status,
    };
  }

  /**
   * 获取专业报告下载地址
   * POST /json/sms/service/ReportService/getReportFileUrl
   */
  async getReportFileUrl(reportId: string): Promise<string> {
    const body = await this.request<{ fileUrl: string }>(
      'ReportService',
      'getReportFileUrl',
      { reportId },
    );

    return body.fileUrl;
  }

  /**
   * 创建并等待专业报告完成
   * 自动轮询直到报告生成成功
   */
  async fetchProfessionalReport(
    params: ProfessionalReportRequest,
    maxRetries = 30,
    intervalMs = 2000,
  ): Promise<string> {
    const reportId = await this.getProfessionalReportId(params);

    for (let i = 0; i < maxRetries; i++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      const status = await this.getReportState(reportId);

      if (status.status === 3) {
        const fileUrl = await this.getReportFileUrl(reportId);
        return fileUrl;
      }

      if (status.status === 4) {
        throw new Error(`报告生成失败 (reportId: ${reportId})`);
      }
    }

    throw new Error(`报告生成超时 (reportId: ${reportId}, 等待 ${maxRetries * intervalMs / 1000}s)`);
  }

  /**
   * 下载报告文件内容
   */
  async downloadReportFile(fileUrl: string): Promise<string> {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`下载报告文件失败: HTTP ${response.status}`);
    }
    return response.text();
  }

  // ============== 账户服务 ==============

  /**
   * 获取账户信息
   * POST /json/sms/service/AccountService/getAccountInfo
   */
  async getAccountInfo(fields: string[] = ['balance', 'budget', 'cost', 'userId', 'dayBudget']): Promise<AccountInfo> {
    const body = await this.request<{ accountInfo: AccountInfo }>(
      'AccountService',
      'getAccountInfo',
      { accountFields: fields },
    );
    return body.accountInfo;
  }

  // ============== 计划服务 ==============

  /**
   * 获取所有推广计划
   * POST /json/sms/service/CampaignService/getAllCampaign
   */
  async getAllCampaigns(fields?: string[]): Promise<CampaignInfo[]> {
    const params: Record<string, unknown> = {};
    if (fields && fields.length > 0) {
      params.campaignFields = fields;
    }
    const body = await this.request<{ data: { campaignTypes: CampaignInfo[] } }>(
      'CampaignService',
      'getAllCampaign',
      params,
    );
    return body.data?.campaignTypes || [];
  }

  /**
   * 获取指定推广计划
   * POST /json/sms/service/CampaignService/getCampaign
   */
  async getCampaign(ids: number[], fields?: string[]): Promise<CampaignInfo[]> {
    const params: Record<string, unknown> = { ids };
    if (fields && fields.length > 0) {
      params.campaignFields = fields;
    }
    const body = await this.request<{ data: { campaignTypes: CampaignInfo[] } }>(
      'CampaignService',
      'getCampaign',
      params,
    );
    return body.data?.campaignTypes || [];
  }

  // ============== 单元服务 ==============

  /**
   * 获取所有推广单元
   * POST /json/sms/service/AdgroupService/getAllAdgroup
   */
  async getAllAdgroups(campaignId?: number, fields?: string[]): Promise<AdgroupInfo[]> {
    const params: Record<string, unknown> = {};
    if (campaignId) params.campaignId = campaignId;
    if (fields && fields.length > 0) {
      params.adgroupFields = fields;
    }
    const body = await this.request<{ data: { adgroupTypes: AdgroupInfo[] } }>(
      'AdgroupService',
      'getAllAdgroup',
      params,
    );
    return body.data?.adgroupTypes || [];
  }

  // ============== 创意服务 ==============

  /**
   * 获取所有创意
   * POST /json/sms/service/CreativeService/getAllCreative
   */
  async getAllCreatives(adgroupId?: number, fields?: string[]): Promise<CreativeInfo[]> {
    const params: Record<string, unknown> = {};
    if (adgroupId) params.adgroupId = adgroupId;
    if (fields && fields.length > 0) {
      params.creativeFields = fields;
    }
    const body = await this.request<{ data: { creativeTypes: CreativeInfo[] } }>(
      'CreativeService',
      'getAllCreative',
      params,
    );
    return body.data?.creativeTypes || [];
  }
}

/** 默认客户端实例 */
let defaultClient: BaiduClient | null = null;

export function getBaiduClient(): BaiduClient {
  if (!defaultClient) {
    defaultClient = new BaiduClient();
  }
  return defaultClient;
}
