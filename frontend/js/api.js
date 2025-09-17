// FC-CRM System API通信ライブラリ

class ApiClient {
    constructor() {
        this.baseUrl = ENV.getApiBaseUrl();
        this.timeout = API_CONFIG.TIMEOUT;
        this.retryCount = API_CONFIG.RETRY_COUNT;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
    }

    /**
     * HTTPリクエストの実行
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            timeout: this.timeout,
            headers: {
                ...API_CONFIG.HEADERS,
                ...options.headers
            },
            ...options
        };

        UTILS.log('debug', `API Request: ${options.method || 'GET'} ${url}`, options.body);

        for (let attempt = 0; attempt <= this.retryCount; attempt++) {
            try {
                const response = await this.fetchWithTimeout(url, config);
                const data = await this.handleResponse(response);

                UTILS.log('debug', `API Response: ${response.status}`, data);
                return data;

            } catch (error) {
                UTILS.log('error', `API Request failed (attempt ${attempt + 1}):`, error);

                // 最後の試行でない場合はリトライ
                if (attempt < this.retryCount && this.shouldRetry(error)) {
                    await this.delay(this.retryDelay * (attempt + 1));
                    continue;
                }

                throw this.createApiError(error);
            }
        }
    }

    /**
     * タイムアウト付きfetch
     */
    async fetchWithTimeout(url, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * レスポンスの処理
     */
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Invalid content type: ${contentType}`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    }

    /**
     * リトライ判定
     */
    shouldRetry(error) {
        // ネットワークエラーやタイムアウトの場合はリトライ
        return error.name === 'AbortError' ||
               error.name === 'TypeError' ||
               error.message.includes('fetch');
    }

    /**
     * APIエラーオブジェクトの作成
     */
    createApiError(error) {
        const apiError = new Error(UTILS.getErrorMessage(error));
        apiError.originalError = error;
        return apiError;
    }

    /**
     * 遅延処理
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * GETリクエスト
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POSTリクエスト
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUTリクエスト
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETEリクエスト
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// API クライアントのインスタンス
const api = new ApiClient();

// 企業管理 API
const CompanyApi = {
    /**
     * 企業一覧取得
     */
    async getList(params = {}) {
        return api.get('/companies', params);
    },

    /**
     * 企業詳細取得
     */
    async get(id) {
        return api.get(`/companies/${id}`);
    },

    /**
     * 企業登録
     */
    async create(data) {
        return api.post('/companies', data);
    },

    /**
     * 企業更新
     */
    async update(id, data) {
        return api.put(`/companies/${id}`, data);
    },

    /**
     * 企業削除
     */
    async delete(id) {
        return api.delete(`/companies/${id}`);
    }
};

// NGリスト管理 API
const NgListApi = {
    /**
     * NGリスト一覧取得
     */
    async getList(params = {}) {
        return api.get('/ng-list', params);
    },

    /**
     * NGリスト登録
     */
    async create(data) {
        return api.post('/ng-list', data);
    },

    /**
     * NGリスト更新
     */
    async update(id, data) {
        return api.put(`/ng-list/${id}`, data);
    },

    /**
     * NGリスト削除
     */
    async delete(id) {
        return api.delete(`/ng-list/${id}`);
    }
};

// 送信履歴 API
const SendHistoryApi = {
    /**
     * 送信履歴一覧取得
     */
    async getList(params = {}) {
        return api.get('/send-history', params);
    },

    /**
     * 送信履歴詳細取得
     */
    async get(id) {
        return api.get(`/send-history/${id}`);
    }
};

// メッセージテンプレート API
const TemplateApi = {
    /**
     * テンプレート一覧取得
     */
    async getList(params = {}) {
        return api.get('/templates', params);
    },

    /**
     * テンプレート詳細取得
     */
    async get(id) {
        return api.get(`/templates/${id}`);
    },

    /**
     * テンプレート登録
     */
    async create(data) {
        return api.post('/templates', data);
    },

    /**
     * テンプレート更新
     */
    async update(id, data) {
        return api.put(`/templates/${id}`, data);
    },

    /**
     * テンプレート削除
     */
    async delete(id) {
        return api.delete(`/templates/${id}`);
    }
};

// ChatGPT API
const ChatGptApi = {
    /**
     * メッセージ生成
     */
    async generateMessage(data) {
        return api.post('/chatgpt/generate', data);
    }
};

// システム管理 API
const SystemApi = {
    /**
     * ヘルスチェック
     */
    async healthCheck() {
        return api.get('/health');
    },

    /**
     * 設定取得
     */
    async getSettings() {
        return api.get('/settings');
    },

    /**
     * 設定更新
     */
    async updateSettings(data) {
        return api.put('/settings', data);
    },

    /**
     * 統計情報取得
     */
    async getStats(params = {}) {
        return api.get('/stats', params);
    }
};

// ログ API
const LogApi = {
    /**
     * APIログ取得
     */
    async getApiLogs(params = {}) {
        return api.get('/logs/api', params);
    },

    /**
     * ChatGPTログ取得
     */
    async getChatGptLogs(params = {}) {
        return api.get('/logs/chatgpt', params);
    }
};

// エラーハンドリングヘルパー
const ApiErrorHandler = {
    /**
     * エラーの表示
     */
    showError(error, defaultMessage = 'エラーが発生しました') {
        const message = UTILS.getErrorMessage(error) || defaultMessage;
        this.showToast(message, 'error');
        UTILS.log('error', 'API Error:', error);
    },

    /**
     * 成功メッセージの表示
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    },

    /**
     * トースト通知の表示
     */
    showToast(message, type = 'info') {
        // Bootstrap Toast またはカスタムトースト実装
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            // フォールバック: alert
            if (type === 'error') {
                alert(`エラー: ${message}`);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        }
    }
};

// グローバル公開
window.CompanyApi = CompanyApi;
window.NgListApi = NgListApi;
window.SendHistoryApi = SendHistoryApi;
window.TemplateApi = TemplateApi;
window.ChatGptApi = ChatGptApi;
window.SystemApi = SystemApi;
window.LogApi = LogApi;
window.ApiErrorHandler = ApiErrorHandler;