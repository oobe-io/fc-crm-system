// FC-CRM System 設定ファイル

// API設定
const API_CONFIG = {
    // 本番環境のAPIベースURL（ConoHa WING）
    BASE_URL: 'https://your-domain.com/api',

    // 開発環境用（ローカル）
    // BASE_URL: 'http://localhost/fc-crm-system/backend/api',

    // タイムアウト設定（ミリ秒）
    TIMEOUT: 30000,

    // リトライ設定
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,

    // レスポンスヘッダー
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// ページネーション設定
const PAGINATION_CONFIG = {
    DEFAULT_PER_PAGE: 20,
    MAX_PER_PAGE: 100,
    VISIBLE_PAGES: 5
};

// UI設定
const UI_CONFIG = {
    // データ更新間隔（ミリ秒）
    REFRESH_INTERVAL: 60000, // 1分

    // 検索デバウンス時間（ミリ秒）
    SEARCH_DEBOUNCE: 500,

    // トースト表示時間（ミリ秒）
    TOAST_DURATION: 3000,

    // アニメーション時間（ミリ秒）
    ANIMATION_DURATION: 300,

    // 日付フォーマット
    DATE_FORMAT: 'YYYY-MM-DD',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss'
};

// システム設定
const SYSTEM_CONFIG = {
    // ログレベル
    LOG_LEVEL: 'info', // debug, info, warning, error

    // ローカルストレージキー
    STORAGE_KEYS: {
        USER_PREFERENCES: 'fc_crm_user_prefs',
        FILTER_STATE: 'fc_crm_filters',
        LAST_UPDATE: 'fc_crm_last_update'
    },

    // バリデーション設定
    VALIDATION: {
        COMPANY_NAME_MAX_LENGTH: 255,
        DOMAIN_MAX_LENGTH: 255,
        EMAIL_MAX_LENGTH: 255,
        PHONE_MAX_LENGTH: 50,
        NOTES_MAX_LENGTH: 1000
    }
};

// ステータス設定
const STATUS_CONFIG = {
    COMPANY_STATUS: {
        'active': { label: 'アクティブ', class: 'status-active' },
        'inactive': { label: '非アクティブ', class: 'status-inactive' },
        'blocked': { label: 'ブロック', class: 'status-blocked' }
    },

    SEND_STATUS: {
        'pending': { label: '送信待ち', class: 'status-pending' },
        'success': { label: '送信成功', class: 'status-success' },
        'failed': { label: '送信失敗', class: 'status-failed' },
        'blocked': { label: 'ブロック', class: 'status-blocked' }
    },

    CATEGORY: {
        'メイン': { label: 'メイン', class: 'category-メイン' },
        'サブ': { label: 'サブ', class: 'category-サブ' },
        'テスト': { label: 'テスト', class: 'category-テスト' },
        '停止中': { label: '停止中', class: 'category-停止中' }
    },

    PRIORITY: {
        1: { label: '最高', class: 'priority-1' },
        2: { label: '高', class: 'priority-2' },
        3: { label: '中', class: 'priority-3' },
        4: { label: '低', class: 'priority-4' },
        5: { label: '最低', class: 'priority-5' }
    }
};

// 環境判定
const ENV = {
    isDevelopment: () => {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('github.io');
    },

    isProduction: () => {
        return !ENV.isDevelopment();
    },

    getApiBaseUrl: () => {
        if (ENV.isDevelopment()) {
            // GitHub Pagesの場合は本番APIを使用
            if (window.location.hostname.includes('github.io')) {
                return API_CONFIG.BASE_URL;
            }
            // ローカル開発環境
            return 'http://localhost/fc-crm-system/backend/api';
        }
        return API_CONFIG.BASE_URL;
    }
};

// ユーティリティ関数
const UTILS = {
    // 日付フォーマット
    formatDate: (date, format = UI_CONFIG.DATE_FORMAT) => {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    // エラーメッセージの取得
    getErrorMessage: (error) => {
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        if (error.response && error.response.message) return error.response.message;
        return '予期しないエラーが発生しました';
    },

    // ステータスラベルの取得
    getStatusLabel: (status, type = 'COMPANY_STATUS') => {
        const config = STATUS_CONFIG[type];
        return config[status] ? config[status].label : status;
    },

    // ステータスクラスの取得
    getStatusClass: (status, type = 'COMPANY_STATUS') => {
        const config = STATUS_CONFIG[type];
        return config[status] ? config[status].class : '';
    },

    // バリデーション
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validateUrl: (url) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    },

    validateDomain: (domain) => {
        const re = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return re.test(domain);
    },

    // ローカルストレージ操作
    saveToStorage: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('ローカルストレージへの保存に失敗:', e);
            return false;
        }
    },

    loadFromStorage: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('ローカルストレージからの読み込みに失敗:', e);
            return defaultValue;
        }
    },

    removeFromStorage: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('ローカルストレージからの削除に失敗:', e);
            return false;
        }
    },

    // デバウンス関数
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // ログ出力
    log: (level, message, data = null) => {
        const levels = { debug: 0, info: 1, warning: 2, error: 3 };
        const currentLevel = levels[SYSTEM_CONFIG.LOG_LEVEL] || 1;

        if (levels[level] >= currentLevel) {
            const timestamp = UTILS.formatDate(new Date(), UI_CONFIG.DATETIME_FORMAT);
            const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

            if (data) {
                console[level === 'error' ? 'error' : 'log'](logMessage, data);
            } else {
                console[level === 'error' ? 'error' : 'log'](logMessage);
            }
        }
    }
};

// グローバル設定の適用
window.FC_CRM_CONFIG = {
    API: API_CONFIG,
    PAGINATION: PAGINATION_CONFIG,
    UI: UI_CONFIG,
    SYSTEM: SYSTEM_CONFIG,
    STATUS: STATUS_CONFIG,
    ENV: ENV,
    UTILS: UTILS
};