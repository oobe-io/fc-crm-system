// FC-CRM System モックデータ（GitHub Pages動作確認用）

/**
 * モックAPIクライアント
 * 本番API未接続時の動作確認用
 */
class MockApiClient {
    constructor() {
        this.isEnabled = false; // 自動判定で設定
        this.delay = 500; // 疑似レスポンス時間
        this.mockData = this.initializeMockData();

        // GitHub Pagesまたは本番API未接続時はモック有効
        this.checkMockMode();
    }

    /**
     * モックモードの判定
     */
    async checkMockMode() {
        if (window.location.hostname.includes('github.io')) {
            this.isEnabled = true;
            console.log('🔧 Mock API enabled for GitHub Pages');
            return;
        }

        // 本番APIの疎通確認
        try {
            const response = await fetch(`${ENV.getApiBaseUrl()}/health`, {
                method: 'GET',
                timeout: 3000
            });

            if (!response.ok) {
                throw new Error('API not available');
            }

            console.log('✅ Real API available');
            this.isEnabled = false;
        } catch (error) {
            console.log('🔧 Real API not available, enabling Mock API');
            this.isEnabled = true;
        }
    }

    /**
     * モックデータの初期化
     */
    initializeMockData() {
        return {
            companies: [
                {
                    id: 1,
                    company_name: "株式会社テックイノベーション",
                    domain: "tech-innovation.co.jp",
                    industry: "IT・システム開発",
                    contact_form_url: "https://tech-innovation.co.jp/contact",
                    category: "メイン",
                    priority: 1,
                    has_recaptcha: false,
                    last_contact_date: "2024-01-15",
                    notes: "優先顧客、月次フォロー必須",
                    status: "active",
                    created_at: "2024-01-01T10:00:00",
                    updated_at: "2024-01-15T14:30:00"
                },
                {
                    id: 2,
                    company_name: "デジタルソリューションズ",
                    domain: "digital-solutions.com",
                    industry: "コンサルティング",
                    contact_form_url: "https://digital-solutions.com/inquiry",
                    category: "サブ",
                    priority: 2,
                    has_recaptcha: true,
                    last_contact_date: null,
                    notes: "reCAPTCHA有りのため手動送信のみ",
                    status: "active",
                    created_at: "2024-01-05T09:15:00",
                    updated_at: "2024-01-05T09:15:00"
                },
                {
                    id: 3,
                    company_name: "サンプル商事",
                    domain: "sample-trading.co.jp",
                    industry: "商社・貿易",
                    contact_form_url: "https://sample-trading.co.jp/contact-us",
                    category: "テスト",
                    priority: 3,
                    has_recaptcha: false,
                    last_contact_date: "2024-01-10",
                    notes: "テスト送信用",
                    status: "inactive",
                    created_at: "2024-01-03T16:45:00",
                    updated_at: "2024-01-10T11:20:00"
                },
                {
                    id: 4,
                    company_name: "グローバルマニュファクチャリング",
                    domain: "global-mfg.jp",
                    industry: "製造業",
                    contact_form_url: "https://global-mfg.jp/contact",
                    category: "メイン",
                    priority: 2,
                    has_recaptcha: false,
                    last_contact_date: "2024-01-12",
                    notes: "大手製造業、四半期レビュー対象",
                    status: "active",
                    created_at: "2024-01-02T08:30:00",
                    updated_at: "2024-01-12T13:45:00"
                },
                {
                    id: 5,
                    company_name: "ブロックチェーンスタートアップ",
                    domain: "blockchain-startup.io",
                    industry: "フィンテック",
                    contact_form_url: "https://blockchain-startup.io/contact",
                    category: "サブ",
                    priority: 4,
                    has_recaptcha: false,
                    last_contact_date: null,
                    notes: "新興企業、慎重なアプローチ必要",
                    status: "active",
                    created_at: "2024-01-08T14:20:00",
                    updated_at: "2024-01-08T14:20:00"
                }
            ],
            stats: {
                total_companies: 5,
                today_sends: 12,
                success_rate: 85,
                chatgpt_tokens: 15420
            },
            systemHealth: {
                database: true,
                api: true,
                chatgpt: false // APIキー未設定想定
            },
            sendHistory: [
                {
                    id: 1,
                    company_name: "株式会社テックイノベーション",
                    message_subject: "業務効率化ソリューションのご提案",
                    response_status: "success",
                    created_at: "2024-01-17T10:30:00"
                },
                {
                    id: 2,
                    company_name: "グローバルマニュファクチャリング",
                    message_subject: "製造業向けDXソリューション",
                    response_status: "success",
                    created_at: "2024-01-17T09:15:00"
                },
                {
                    id: 3,
                    company_name: "デジタルソリューションズ",
                    message_subject: "パートナーシップのご提案",
                    response_status: "failed",
                    created_at: "2024-01-17T08:45:00"
                }
            ],
            schedule: [
                {
                    id: 1,
                    company_name: "ブロックチェーンスタートアップ",
                    message_subject: "フィンテック分野での協業提案",
                    scheduled_at: "2024-01-17T15:00:00"
                },
                {
                    id: 2,
                    company_name: "サンプル商事",
                    message_subject: "商社向けシステム導入提案",
                    scheduled_at: "2024-01-17T16:30:00"
                }
            ]
        };
    }

    /**
     * 疑似的な遅延処理
     */
    async delay(ms = this.delay) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 企業一覧の取得（モック）
     */
    async getCompanies(params = {}) {
        await this.delay();

        let companies = [...this.mockData.companies];

        // フィルタリング
        if (params.category) {
            companies = companies.filter(c => c.category === params.category);
        }
        if (params.status) {
            companies = companies.filter(c => c.status === params.status);
        }
        if (params.search) {
            const searchLower = params.search.toLowerCase();
            companies = companies.filter(c =>
                c.company_name.toLowerCase().includes(searchLower) ||
                c.domain.toLowerCase().includes(searchLower)
            );
        }

        // ページネーション
        const page = parseInt(params.page) || 1;
        const perPage = parseInt(params.per_page) || 20;
        const total = companies.length;
        const offset = (page - 1) * perPage;
        const paginatedCompanies = companies.slice(offset, offset + perPage);

        return {
            success: true,
            status_code: 200,
            message: "企業一覧を取得しました",
            data: {
                data: paginatedCompanies,
                meta: {
                    total: total,
                    per_page: perPage,
                    current_page: page,
                    last_page: Math.ceil(total / perPage),
                    from: offset + 1,
                    to: Math.min(offset + perPage, total)
                }
            }
        };
    }

    /**
     * 企業詳細の取得（モック）
     */
    async getCompany(id) {
        await this.delay();

        const company = this.mockData.companies.find(c => c.id === parseInt(id));

        if (!company) {
            return {
                success: false,
                status_code: 404,
                message: "企業が見つかりません"
            };
        }

        return {
            success: true,
            status_code: 200,
            message: "企業詳細を取得しました",
            data: company
        };
    }

    /**
     * 企業作成（モック）
     */
    async createCompany(data) {
        await this.delay();

        // 重複チェック
        const existing = this.mockData.companies.find(c => c.domain === data.domain);
        if (existing) {
            return {
                success: false,
                status_code: 409,
                message: "このドメインは既に登録されています"
            };
        }

        const newCompany = {
            id: Math.max(...this.mockData.companies.map(c => c.id)) + 1,
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        this.mockData.companies.push(newCompany);

        return {
            success: true,
            status_code: 201,
            message: "企業を登録しました",
            data: { id: newCompany.id }
        };
    }

    /**
     * 企業更新（モック）
     */
    async updateCompany(id, data) {
        await this.delay();

        const index = this.mockData.companies.findIndex(c => c.id === parseInt(id));
        if (index === -1) {
            return {
                success: false,
                status_code: 404,
                message: "企業が見つかりません"
            };
        }

        this.mockData.companies[index] = {
            ...this.mockData.companies[index],
            ...data,
            updated_at: new Date().toISOString()
        };

        return {
            success: true,
            status_code: 200,
            message: "企業情報を更新しました"
        };
    }

    /**
     * 企業削除（モック）
     */
    async deleteCompany(id) {
        await this.delay();

        const index = this.mockData.companies.findIndex(c => c.id === parseInt(id));
        if (index === -1) {
            return {
                success: false,
                status_code: 404,
                message: "企業が見つかりません"
            };
        }

        this.mockData.companies.splice(index, 1);

        return {
            success: true,
            status_code: 200,
            message: "企業を削除しました"
        };
    }

    /**
     * ヘルスチェック（モック）
     */
    async healthCheck() {
        await this.delay(200);

        return {
            success: true,
            status_code: 200,
            message: "システムは正常です（モックモード）",
            data: {
                status: "healthy",
                ...this.mockData.systemHealth,
                timestamp: new Date().toISOString(),
                version: "1.0.0-mock"
            }
        };
    }

    /**
     * 統計情報（モック）
     */
    async getStats(params = {}) {
        await this.delay();

        return {
            success: true,
            status_code: 200,
            message: "統計情報を取得しました",
            data: this.mockData.stats
        };
    }

    /**
     * 送信履歴（モック）
     */
    async getSendHistory(params = {}) {
        await this.delay();

        return {
            success: true,
            status_code: 200,
            message: "送信履歴を取得しました",
            data: {
                data: this.mockData.sendHistory.slice(0, 5)
            }
        };
    }
}

// モックAPIクライアントの初期化
const mockApi = new MockApiClient();

// 既存のAPIクライアントをモックで拡張
const originalCompanyApi = { ...CompanyApi };
const originalSystemApi = { ...SystemApi };
const originalSendHistoryApi = { ...SendHistoryApi };

// CompanyApi のモック対応
CompanyApi.getList = async function(params) {
    if (mockApi.isEnabled) {
        return mockApi.getCompanies(params);
    }
    return originalCompanyApi.getList(params);
};

CompanyApi.get = async function(id) {
    if (mockApi.isEnabled) {
        return mockApi.getCompany(id);
    }
    return originalCompanyApi.get(id);
};

CompanyApi.create = async function(data) {
    if (mockApi.isEnabled) {
        return mockApi.createCompany(data);
    }
    return originalCompanyApi.create(data);
};

CompanyApi.update = async function(id, data) {
    if (mockApi.isEnabled) {
        return mockApi.updateCompany(id, data);
    }
    return originalCompanyApi.update(id, data);
};

CompanyApi.delete = async function(id) {
    if (mockApi.isEnabled) {
        return mockApi.deleteCompany(id);
    }
    return originalCompanyApi.delete(id);
};

// SystemApi のモック対応
SystemApi.healthCheck = async function() {
    if (mockApi.isEnabled) {
        return mockApi.healthCheck();
    }
    return originalSystemApi.healthCheck();
};

SystemApi.getStats = async function(params) {
    if (mockApi.isEnabled) {
        return mockApi.getStats(params);
    }
    return originalSystemApi.getStats(params);
};

// SendHistoryApi のモック対応
SendHistoryApi.getList = async function(params) {
    if (mockApi.isEnabled) {
        return mockApi.getSendHistory(params);
    }
    return originalSendHistoryApi.getList(params);
};

// モック状態の表示
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (mockApi.isEnabled) {
            const indicator = document.createElement('div');
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #17a2b8;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 9999;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;
            indicator.innerHTML = '<i class="bi bi-wrench"></i> Mock Mode';
            document.body.appendChild(indicator);
        }
    }, 1000);
});

console.log('🔧 Mock Data initialized');
window.mockApi = mockApi;