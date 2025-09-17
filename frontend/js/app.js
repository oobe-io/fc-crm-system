// FC-CRM System メインアプリケーション

// ダッシュボード関連の変数
let dashboardData = {
    totalCompanies: 0,
    todaySends: 0,
    successRate: 0,
    chatgptUsage: 0
};

let systemHealth = {
    database: false,
    api: false,
    chatgpt: false
};

/**
 * ダッシュボードデータの読み込み
 */
async function loadDashboardData() {
    try {
        // 企業数の取得
        const companiesResponse = await CompanyApi.getList({ status: 'active' });
        if (companiesResponse.success && companiesResponse.data.meta) {
            dashboardData.totalCompanies = companiesResponse.data.meta.total;
        }

        // 統計情報の取得
        const today = new Date().toISOString().split('T')[0];
        const statsResponse = await SystemApi.getStats({
            period: 'daily',
            date_from: today,
            date_to: today
        });

        if (statsResponse.success) {
            dashboardData.todaySends = statsResponse.data.today_sends || 0;
            dashboardData.successRate = statsResponse.data.success_rate || 0;
            dashboardData.chatgptUsage = statsResponse.data.chatgpt_tokens || 0;
        }

        // UIの更新
        updateDashboardUI();

        // 最近の送信履歴とスケジュールの読み込み
        await Promise.all([
            loadRecentHistory(),
            loadSchedule()
        ]);

    } catch (error) {
        UTILS.log('error', 'ダッシュボードデータの読み込みに失敗:', error);
        // エラー時はデフォルト値を表示
        updateDashboardUI();
    }
}

/**
 * ダッシュボードUIの更新
 */
function updateDashboardUI() {
    // 統計カードの更新
    const totalCompaniesEl = document.getElementById('total-companies');
    const todaySendsEl = document.getElementById('today-sends');
    const successRateEl = document.getElementById('success-rate');
    const chatgptUsageEl = document.getElementById('chatgpt-usage');

    if (totalCompaniesEl) {
        totalCompaniesEl.textContent = dashboardData.totalCompanies.toLocaleString();
    }

    if (todaySendsEl) {
        todaySendsEl.textContent = dashboardData.todaySends.toLocaleString();
    }

    if (successRateEl) {
        successRateEl.textContent = `${dashboardData.successRate}%`;
    }

    if (chatgptUsageEl) {
        const usage = dashboardData.chatgptUsage;
        if (usage > 1000) {
            chatgptUsageEl.textContent = `${(usage / 1000).toFixed(1)}K`;
        } else {
            chatgptUsageEl.textContent = usage.toLocaleString();
        }
    }
}

/**
 * 最近の送信履歴の読み込み
 */
async function loadRecentHistory() {
    const container = document.getElementById('recent-history');
    if (!container) return;

    try {
        const response = await SendHistoryApi.getList({
            per_page: 5,
            sort: 'created_at',
            order: 'desc'
        });

        if (response.success && response.data.data) {
            renderRecentHistory(response.data.data);
        } else {
            showEmptyState(container, '送信履歴がありません');
        }

    } catch (error) {
        UTILS.log('error', '送信履歴の読み込みに失敗:', error);
        showErrorState(container, '送信履歴の読み込みに失敗しました');
    }
}

/**
 * 送信スケジュールの読み込み
 */
async function loadSchedule() {
    const container = document.getElementById('schedule-list');
    if (!container) return;

    try {
        // 今日のスケジュール（仮実装）
        const today = new Date().toISOString().split('T')[0];
        const response = await SendHistoryApi.getList({
            date_from: today,
            date_to: today,
            status: 'pending',
            per_page: 10
        });

        if (response.success && response.data.data) {
            renderSchedule(response.data.data);
        } else {
            showEmptyState(container, '今日の送信予定はありません');
        }

    } catch (error) {
        UTILS.log('error', 'スケジュールの読み込みに失敗:', error);
        showErrorState(container, 'スケジュールの読み込みに失敗しました');
    }
}

/**
 * 最近の送信履歴のレンダリング
 */
function renderRecentHistory(history) {
    const container = document.getElementById('recent-history');
    if (!container) return;

    if (history.length === 0) {
        showEmptyState(container, '送信履歴がありません');
        return;
    }

    const html = history.map(item => {
        const statusClass = UTILS.getStatusClass(item.response_status, 'SEND_STATUS');
        const statusLabel = UTILS.getStatusLabel(item.response_status, 'SEND_STATUS');
        const createdAt = UTILS.formatDate(item.created_at, UI_CONFIG.DATETIME_FORMAT);

        return `
            <div class="d-flex align-items-center mb-3">
                <div class="flex-shrink-0">
                    <span class="badge ${statusClass}">${statusLabel}</span>
                </div>
                <div class="flex-grow-1 ms-3">
                    <div class="fw-bold">${escapeHtml(item.company_name || '不明な企業')}</div>
                    <small class="text-muted">${escapeHtml(item.message_subject || '件名なし')}</small>
                </div>
                <div class="flex-shrink-0">
                    <small class="text-muted">${createdAt}</small>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * スケジュールのレンダリング
 */
function renderSchedule(schedule) {
    const container = document.getElementById('schedule-list');
    if (!container) return;

    if (schedule.length === 0) {
        showEmptyState(container, '今日の送信予定はありません');
        return;
    }

    const html = schedule.map(item => {
        const scheduledTime = UTILS.formatDate(item.scheduled_at || item.created_at, 'HH:mm');

        return `
            <div class="d-flex align-items-center mb-3">
                <div class="flex-shrink-0">
                    <span class="badge bg-primary">${scheduledTime}</span>
                </div>
                <div class="flex-grow-1 ms-3">
                    <div class="fw-bold">${escapeHtml(item.company_name || '不明な企業')}</div>
                    <small class="text-muted">${escapeHtml(item.message_subject || '件名なし')}</small>
                </div>
                <div class="flex-shrink-0">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewScheduleDetail(${item.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * システムヘルスチェック
 */
async function checkSystemHealth() {
    try {
        const response = await SystemApi.healthCheck();

        if (response.success && response.data) {
            systemHealth.database = response.data.database || false;
            systemHealth.api = true; // APIが応答した場合
            systemHealth.chatgpt = response.data.chatgpt || false;
        }

        updateSystemHealthUI();

    } catch (error) {
        UTILS.log('error', 'システムヘルスチェックに失敗:', error);
        systemHealth.api = false;
        updateSystemHealthUI();
    }
}

/**
 * システム状態UIの更新
 */
function updateSystemHealthUI() {
    const updateStatus = (elementId, textId, isHealthy) => {
        const statusEl = document.getElementById(elementId);
        const textEl = document.getElementById(textId);

        if (statusEl) {
            statusEl.className = `badge ${isHealthy ? 'bg-success' : 'bg-danger'} me-2`;
        }

        if (textEl) {
            textEl.textContent = isHealthy ? '正常' : 'エラー';
        }
    };

    updateStatus('db-status', 'db-status-text', systemHealth.database);
    updateStatus('api-status', 'api-status-text', systemHealth.api);
    updateStatus('chatgpt-status', 'chatgpt-status-text', systemHealth.chatgpt);
}

/**
 * スケジュール更新
 */
async function refreshSchedule() {
    const button = event.target.closest('button');
    const originalHtml = button.innerHTML;

    // ローディング表示
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> 更新中...';
    button.disabled = true;

    try {
        await loadSchedule();
        ApiErrorHandler.showSuccess('スケジュールを更新しました');
    } catch (error) {
        ApiErrorHandler.showError(error, 'スケジュールの更新に失敗しました');
    } finally {
        // ボタンの復元
        button.innerHTML = originalHtml;
        button.disabled = false;
    }
}

/**
 * スケジュール詳細表示
 */
function viewScheduleDetail(id) {
    // モーダルまたは詳細ページへ遷移
    window.location.href = `send.html?id=${id}`;
}

/**
 * 空の状態表示
 */
function showEmptyState(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <i class="bi bi-inbox"></i>
            <p class="mb-0">${escapeHtml(message)}</p>
        </div>
    `;
}

/**
 * エラー状態表示
 */
function showErrorState(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <i class="bi bi-exclamation-triangle text-warning"></i>
            <p class="mb-0">${escapeHtml(message)}</p>
        </div>
    `;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * トースト通知表示
 */
function showToast(message, type = 'info') {
    // Bootstrap Toastの実装
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toastId = `toast-${Date.now()}`;
    const iconClass = {
        success: 'bi-check-circle-fill text-success',
        error: 'bi-exclamation-triangle-fill text-danger',
        warning: 'bi-exclamation-triangle-fill text-warning',
        info: 'bi-info-circle-fill text-info'
    }[type] || 'bi-info-circle-fill text-info';

    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="${iconClass} me-2"></i>
                <strong class="me-auto">FC-CRM System</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${escapeHtml(message)}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: UI_CONFIG.TOAST_DURATION
    });

    toast.show();

    // トースト終了後に要素を削除
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

/**
 * トーストコンテナの作成
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// グローバル関数の公開
window.loadDashboardData = loadDashboardData;
window.checkSystemHealth = checkSystemHealth;
window.refreshSchedule = refreshSchedule;
window.viewScheduleDetail = viewScheduleDetail;
window.showToast = showToast;