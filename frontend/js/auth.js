// FC-CRM System 認証管理

/**
 * 認証管理クラス
 */
class AuthManager {
    constructor() {
        this.storageKey = 'fc_crm_auth_token';
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8時間
        this.credentials = this.getCredentials();
        this.init();
    }

    /**
     * 認証情報の設定（実際の運用では環境変数等で管理）
     */
    getCredentials() {
        // GitHub Pages用のBasic認証情報
        // 実際の運用では、より安全な方法で管理すること
        return {
            // 複数ユーザー対応
            users: [
                {
                    username: 'admin',
                    password: 'fc-crm-2024!', // 強力なパスワード
                    role: 'admin',
                    name: '管理者'
                },
                {
                    username: 'demo',
                    password: 'demo123',
                    role: 'viewer',
                    name: 'デモユーザー'
                }
            ]
        };
    }

    /**
     * 初期化
     */
    init() {
        // ページロード時の認証チェック
        if (this.isAuthPage()) {
            return; // 認証ページでは認証チェックをスキップ
        }

        if (!this.isAuthenticated()) {
            this.redirectToLogin();
        } else {
            this.refreshSession();
        }
    }

    /**
     * 現在のページが認証ページかどうか
     */
    isAuthPage() {
        return window.location.pathname.includes('login.html') ||
               window.location.pathname.includes('auth.html');
    }

    /**
     * 認証状態の確認
     */
    isAuthenticated() {
        const authData = this.getAuthData();

        if (!authData) {
            return false;
        }

        // セッション有効期限チェック
        const now = new Date().getTime();
        if (now > authData.expiresAt) {
            this.logout();
            return false;
        }

        return true;
    }

    /**
     * ログイン処理
     */
    login(username, password) {
        const user = this.credentials.users.find(u =>
            u.username === username && u.password === password
        );

        if (!user) {
            throw new Error('ユーザー名またはパスワードが正しくありません');
        }

        const authData = {
            user: {
                username: user.username,
                role: user.role,
                name: user.name
            },
            loginAt: new Date().getTime(),
            expiresAt: new Date().getTime() + this.sessionTimeout,
            token: this.generateToken(user.username)
        };

        this.saveAuthData(authData);
        this.logActivity('login', user.username);

        return authData;
    }

    /**
     * ログアウト処理
     */
    logout() {
        const authData = this.getAuthData();
        if (authData) {
            this.logActivity('logout', authData.user.username);
        }

        this.clearAuthData();
        this.redirectToLogin();
    }

    /**
     * セッション更新
     */
    refreshSession() {
        const authData = this.getAuthData();
        if (authData) {
            authData.expiresAt = new Date().getTime() + this.sessionTimeout;
            this.saveAuthData(authData);
        }
    }

    /**
     * トークン生成
     */
    generateToken(username) {
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36).substring(2);
        return btoa(`${username}:${timestamp}:${random}`);
    }

    /**
     * 認証データの保存
     */
    saveAuthData(authData) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(authData));
        } catch (e) {
            console.error('認証データの保存に失敗:', e);
        }
    }

    /**
     * 認証データの取得
     */
    getAuthData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('認証データの読み込みに失敗:', e);
            this.clearAuthData();
            return null;
        }
    }

    /**
     * 認証データのクリア
     */
    clearAuthData() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('認証データのクリアに失敗:', e);
        }
    }

    /**
     * ログインページへリダイレクト
     */
    redirectToLogin() {
        const currentPath = window.location.pathname;
        const returnUrl = encodeURIComponent(currentPath + window.location.search);
        window.location.href = `login.html?return=${returnUrl}`;
    }

    /**
     * メインページへリダイレクト
     */
    redirectToMain(returnUrl) {
        if (returnUrl && returnUrl !== '/login.html') {
            window.location.href = decodeURIComponent(returnUrl);
        } else {
            window.location.href = 'index.html';
        }
    }

    /**
     * 現在のユーザー情報取得
     */
    getCurrentUser() {
        const authData = this.getAuthData();
        return authData ? authData.user : null;
    }

    /**
     * 権限チェック
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;

        // 管理者は全権限
        if (user.role === 'admin') return true;

        // 権限別チェック（今後拡張予定）
        const permissions = {
            viewer: ['read'],
            admin: ['read', 'write', 'delete']
        };

        return permissions[user.role]?.includes(permission) || false;
    }

    /**
     * アクティビティログ
     */
    logActivity(action, username) {
        const log = {
            action,
            username,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: 'client-side' // クライアントサイドでは取得不可
        };

        // コンソールログ（開発用）
        console.log('Auth Activity:', log);

        // ローカルストレージに活動ログ保存（最大100件）
        try {
            const logs = JSON.parse(localStorage.getItem('fc_crm_auth_logs') || '[]');
            logs.unshift(log);
            if (logs.length > 100) logs.length = 100;
            localStorage.setItem('fc_crm_auth_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('アクティビティログの保存に失敗:', e);
        }
    }

    /**
     * セッション情報表示
     */
    getSessionInfo() {
        const authData = this.getAuthData();
        if (!authData) return null;

        const remainingTime = authData.expiresAt - new Date().getTime();
        const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));

        return {
            user: authData.user,
            loginAt: new Date(authData.loginAt),
            expiresAt: new Date(authData.expiresAt),
            remainingTime: `${remainingHours}時間${remainingMinutes}分`,
            isExpiringSoon: remainingTime < 30 * 60 * 1000 // 30分未満
        };
    }

    /**
     * パスワード強度チェック
     */
    checkPasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;

        return {
            score,
            strength: score < 3 ? 'weak' : score < 4 ? 'medium' : 'strong',
            checks
        };
    }
}

// グローバルインスタンス
const authManager = new AuthManager();

// ページ全体の認証ガード（認証ページ以外）
document.addEventListener('DOMContentLoaded', function() {
    if (!authManager.isAuthPage()) {
        // ユーザー情報の表示更新
        updateUserDisplay();

        // セッション期限警告
        checkSessionExpiration();

        // 30分ごとにセッション更新
        setInterval(() => {
            if (authManager.isAuthenticated()) {
                authManager.refreshSession();
            }
        }, 30 * 60 * 1000);
    }
});

/**
 * ユーザー表示の更新
 */
function updateUserDisplay() {
    const user = authManager.getCurrentUser();
    if (user) {
        // ナビゲーションバーのユーザー名更新
        const userDisplays = document.querySelectorAll('.navbar-text, .user-display');
        userDisplays.forEach(element => {
            element.innerHTML = `<i class="bi bi-person-circle"></i> ${user.name}`;
        });

        // ログアウトボタンの追加
        addLogoutButton();
    }
}

/**
 * ログアウトボタンの追加
 */
function addLogoutButton() {
    const navbar = document.querySelector('.navbar-nav');
    if (navbar && !document.getElementById('logout-btn')) {
        const logoutLi = document.createElement('li');
        logoutLi.className = 'nav-item';
        logoutLi.innerHTML = `
            <a class="nav-link" href="#" id="logout-btn" onclick="authManager.logout()">
                <i class="bi bi-box-arrow-right"></i> ログアウト
            </a>
        `;
        navbar.appendChild(logoutLi);
    }
}

/**
 * セッション期限警告
 */
function checkSessionExpiration() {
    const sessionInfo = authManager.getSessionInfo();
    if (sessionInfo && sessionInfo.isExpiringSoon) {
        showSessionWarning(sessionInfo.remainingTime);
    }
}

/**
 * セッション警告表示
 */
function showSessionWarning(remainingTime) {
    if (typeof showToast === 'function') {
        showToast(
            `セッションの有効期限まで残り${remainingTime}です。継続する場合はページを更新してください。`,
            'warning'
        );
    } else {
        alert(`セッションの有効期限まで残り${remainingTime}です。`);
    }
}

// グローバル公開
window.authManager = authManager;
window.updateUserDisplay = updateUserDisplay;