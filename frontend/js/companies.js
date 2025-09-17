// FC-CRM System 企業管理画面

// グローバル変数
let currentPage = 1;
let currentFilters = {
    category: '',
    status: '',
    search: ''
};
let totalPages = 0;
let currentEditingId = null;
let searchTimeout = null;

/**
 * 企業一覧の読み込み
 */
async function loadCompanies(page = 1) {
    const tableBody = document.getElementById('companies-table-body');
    const pagination = document.getElementById('pagination');
    const companyCount = document.getElementById('company-count');

    // ローディング表示
    showLoadingState(tableBody);

    try {
        const perPage = parseInt(document.getElementById('perPage').value) || 20;

        const params = {
            page: page,
            per_page: perPage,
            ...currentFilters
        };

        // 空の値を除去
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null || params[key] === undefined) {
                delete params[key];
            }
        });

        const response = await CompanyApi.getList(params);

        if (response.success && response.data) {
            renderCompaniesTable(response.data.data);
            renderPagination(response.data.meta);

            if (companyCount) {
                companyCount.textContent = response.data.meta.total;
            }

            currentPage = page;
        } else {
            showEmptyState(tableBody, 'データの取得に失敗しました');
        }

    } catch (error) {
        UTILS.log('error', '企業一覧の読み込みに失敗:', error);
        showErrorState(tableBody, '企業一覧の読み込みに失敗しました');
        ApiErrorHandler.showError(error, '企業一覧の読み込みに失敗しました');
    }
}

/**
 * 企業テーブルのレンダリング
 */
function renderCompaniesTable(companies) {
    const tableBody = document.getElementById('companies-table-body');

    if (!companies || companies.length === 0) {
        showEmptyState(tableBody, '該当する企業が見つかりません');
        return;
    }

    const html = companies.map(company => {
        const statusClass = UTILS.getStatusClass(company.status, 'COMPANY_STATUS');
        const statusLabel = UTILS.getStatusLabel(company.status, 'COMPANY_STATUS');
        const categoryClass = UTILS.getStatusClass(company.category, 'CATEGORY');
        const priorityClass = `priority-${company.priority}`;
        const lastContact = UTILS.formatDate(company.last_contact_date) || '-';
        const recaptchaIcon = company.has_recaptcha ? '<i class="bi bi-shield-check text-warning" title="reCAPTCHA有り"></i>' : '';

        return `
            <tr>
                <td>
                    <div class="fw-bold">${escapeHtml(company.company_name)}</div>
                    <small class="text-muted">${escapeHtml(company.industry || '')}</small>
                </td>
                <td>
                    <span class="text-monospace">${escapeHtml(company.domain)}</span>
                    ${recaptchaIcon}
                </td>
                <td>${escapeHtml(company.industry || '-')}</td>
                <td>
                    <span class="badge ${categoryClass}">${escapeHtml(company.category)}</span>
                </td>
                <td>
                    <span class="${priorityClass}">${company.priority}</span>
                </td>
                <td>
                    <span class="badge ${statusClass}">${statusLabel}</span>
                </td>
                <td>${lastContact}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="editCompany(${company.id})" title="編集">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-info" onclick="viewCompanyDetail(${company.id})" title="詳細">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="confirmDeleteCompany(${company.id}, '${escapeHtml(company.company_name)}')" title="削除">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = html;
}

/**
 * ページネーションのレンダリング
 */
function renderPagination(meta) {
    const pagination = document.getElementById('pagination');
    if (!pagination || !meta) return;

    totalPages = meta.last_page;
    const currentPage = meta.current_page;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // 前へ
    if (currentPage > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="loadCompanies(${currentPage - 1})" aria-label="前へ">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
    } else {
        html += `
            <li class="page-item disabled">
                <span class="page-link">&laquo;</span>
            </li>
        `;
    }

    // ページ番号
    const visiblePages = PAGINATION_CONFIG.VISIBLE_PAGES;
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage + 1 < visiblePages) {
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
        const isActive = page === currentPage;
        html += `
            <li class="page-item ${isActive ? 'active' : ''}">
                <a class="page-link" href="#" onclick="loadCompanies(${page})">${page}</a>
            </li>
        `;
    }

    // 次へ
    if (currentPage < totalPages) {
        html += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="loadCompanies(${currentPage + 1})" aria-label="次へ">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
    } else {
        html += `
            <li class="page-item disabled">
                <span class="page-link">&raquo;</span>
            </li>
        `;
    }

    pagination.innerHTML = html;
}

/**
 * フィルター実行
 */
function filterCompanies() {
    currentFilters.category = document.getElementById('filterCategory').value;
    currentFilters.status = document.getElementById('filterStatus').value;
    currentFilters.search = document.getElementById('searchKeyword').value.trim();

    // 1ページ目から読み込み
    loadCompanies(1);
}

/**
 * 検索のデバウンス処理
 */
function debounceSearch() {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
        filterCompanies();
    }, UI_CONFIG.SEARCH_DEBOUNCE);
}

/**
 * フィルターリセット
 */
function resetFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('searchKeyword').value = '';

    currentFilters = {
        category: '',
        status: '',
        search: ''
    };

    loadCompanies(1);
}

/**
 * 企業登録モーダルを開く
 */
function openCompanyModal(id = null) {
    currentEditingId = id;
    const modal = new bootstrap.Modal(document.getElementById('companyModal'));
    const modalTitle = document.getElementById('companyModalLabel');
    const form = document.getElementById('companyForm');

    // フォームリセット
    form.reset();
    clearValidationErrors();

    if (id) {
        // 編集モード
        modalTitle.textContent = '企業編集';
        loadCompanyForEdit(id);
    } else {
        // 新規登録モード
        modalTitle.textContent = '企業登録';
        // デフォルト値設定
        document.getElementById('category').value = 'メイン';
        document.getElementById('priority').value = '3';
        document.getElementById('status').value = 'active';
    }

    modal.show();
}

/**
 * 編集用企業データの読み込み
 */
async function loadCompanyForEdit(id) {
    try {
        const response = await CompanyApi.get(id);

        if (response.success && response.data) {
            const company = response.data;

            // フォームに値を設定
            document.getElementById('companyName').value = company.company_name || '';
            document.getElementById('domain').value = company.domain || '';
            document.getElementById('industry').value = company.industry || '';
            document.getElementById('contactFormUrl').value = company.contact_form_url || '';
            document.getElementById('category').value = company.category || 'メイン';
            document.getElementById('priority').value = company.priority || 3;
            document.getElementById('status').value = company.status || 'active';
            document.getElementById('hasRecaptcha').checked = company.has_recaptcha || false;
            document.getElementById('notes').value = company.notes || '';
        }

    } catch (error) {
        UTILS.log('error', '企業データの読み込みに失敗:', error);
        ApiErrorHandler.showError(error, '企業データの読み込みに失敗しました');
    }
}

/**
 * 企業データの保存
 */
async function saveCompany() {
    if (!validateForm()) {
        return;
    }

    const data = getFormData();
    const saveButton = document.querySelector('#companyModal .btn-primary');
    const originalText = saveButton.innerHTML;

    // ボタン無効化
    saveButton.innerHTML = '<i class="bi bi-hourglass-split"></i> 保存中...';
    saveButton.disabled = true;

    try {
        let response;

        if (currentEditingId) {
            // 更新
            response = await CompanyApi.update(currentEditingId, data);
        } else {
            // 新規登録
            response = await CompanyApi.create(data);
        }

        if (response.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('companyModal'));
            modal.hide();

            const message = currentEditingId ? '企業情報を更新しました' : '企業を登録しました';
            ApiErrorHandler.showSuccess(message);

            // 一覧を再読み込み
            await loadCompanies(currentPage);
        }

    } catch (error) {
        UTILS.log('error', '企業の保存に失敗:', error);

        if (error.message && error.message.includes('validation')) {
            // バリデーションエラーの場合は詳細表示
            showValidationErrors(error.errors || {});
        } else {
            ApiErrorHandler.showError(error, '企業の保存に失敗しました');
        }

    } finally {
        // ボタン復元
        saveButton.innerHTML = originalText;
        saveButton.disabled = false;
    }
}

/**
 * フォームデータの取得
 */
function getFormData() {
    return {
        company_name: document.getElementById('companyName').value.trim(),
        domain: document.getElementById('domain').value.trim(),
        industry: document.getElementById('industry').value.trim() || null,
        contact_form_url: document.getElementById('contactFormUrl').value.trim() || null,
        category: document.getElementById('category').value,
        priority: parseInt(document.getElementById('priority').value),
        status: document.getElementById('status').value,
        has_recaptcha: document.getElementById('hasRecaptcha').checked,
        notes: document.getElementById('notes').value.trim() || null
    };
}

/**
 * フォームバリデーション
 */
function validateForm() {
    clearValidationErrors();

    const data = getFormData();
    const errors = {};

    // 必須チェック
    if (!data.company_name) {
        errors.companyName = '企業名は必須です';
    } else if (data.company_name.length > SYSTEM_CONFIG.VALIDATION.COMPANY_NAME_MAX_LENGTH) {
        errors.companyName = `企業名は${SYSTEM_CONFIG.VALIDATION.COMPANY_NAME_MAX_LENGTH}文字以内で入力してください`;
    }

    if (!data.domain) {
        errors.domain = 'ドメインは必須です';
    } else if (!UTILS.validateDomain(data.domain)) {
        errors.domain = '有効なドメイン形式で入力してください';
    } else if (data.domain.length > SYSTEM_CONFIG.VALIDATION.DOMAIN_MAX_LENGTH) {
        errors.domain = `ドメインは${SYSTEM_CONFIG.VALIDATION.DOMAIN_MAX_LENGTH}文字以内で入力してください`;
    }

    // URL形式チェック
    if (data.contact_form_url && !UTILS.validateUrl(data.contact_form_url)) {
        errors.contactFormUrl = '有効なURL形式で入力してください';
    }

    // 文字数チェック
    if (data.notes && data.notes.length > SYSTEM_CONFIG.VALIDATION.NOTES_MAX_LENGTH) {
        errors.notes = `備考は${SYSTEM_CONFIG.VALIDATION.NOTES_MAX_LENGTH}文字以内で入力してください`;
    }

    if (Object.keys(errors).length > 0) {
        showValidationErrors(errors);
        return false;
    }

    return true;
}

/**
 * バリデーションエラーの表示
 */
function showValidationErrors(errors) {
    Object.keys(errors).forEach(field => {
        const element = document.getElementById(field);
        const errorElement = document.getElementById(field + 'Error');

        if (element && errorElement) {
            element.classList.add('is-invalid');
            errorElement.textContent = errors[field];
        }
    });
}

/**
 * バリデーションエラーのクリア
 */
function clearValidationErrors() {
    const form = document.getElementById('companyForm');
    const invalidElements = form.querySelectorAll('.is-invalid');
    const errorElements = form.querySelectorAll('.invalid-feedback');

    invalidElements.forEach(el => el.classList.remove('is-invalid'));
    errorElements.forEach(el => el.textContent = '');
}

/**
 * 企業編集
 */
function editCompany(id) {
    openCompanyModal(id);
}

/**
 * 企業詳細表示
 */
function viewCompanyDetail(id) {
    // 詳細モーダルまたは専用ページへ遷移
    // 今回は簡易実装として編集モーダルを読み取り専用で表示
    openCompanyModal(id);

    // モーダル内のフォーム要素を無効化
    setTimeout(() => {
        const form = document.getElementById('companyForm');
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = true;
        });

        // モーダルタイトル変更
        document.getElementById('companyModalLabel').textContent = '企業詳細';

        // 保存ボタンを非表示
        const saveButton = document.querySelector('#companyModal .btn-primary');
        saveButton.style.display = 'none';
    }, 100);
}

/**
 * 削除確認モーダル表示
 */
function confirmDeleteCompany(id, companyName) {
    currentEditingId = id;
    document.getElementById('deleteCompanyName').textContent = companyName;

    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

/**
 * 企業削除実行
 */
async function deleteCompany() {
    if (!currentEditingId) return;

    const deleteButton = document.querySelector('#deleteModal .btn-danger');
    const originalText = deleteButton.innerHTML;

    // ボタン無効化
    deleteButton.innerHTML = '<i class="bi bi-hourglass-split"></i> 削除中...';
    deleteButton.disabled = true;

    try {
        const response = await CompanyApi.delete(currentEditingId);

        if (response.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            modal.hide();

            ApiErrorHandler.showSuccess(response.message || '企業を削除しました');

            // 一覧を再読み込み
            await loadCompanies(currentPage);
        }

    } catch (error) {
        UTILS.log('error', '企業の削除に失敗:', error);
        ApiErrorHandler.showError(error, '企業の削除に失敗しました');

    } finally {
        // ボタン復元
        deleteButton.innerHTML = originalText;
        deleteButton.disabled = false;
    }
}

/**
 * ローディング状態表示
 */
function showLoadingState(container) {
    container.innerHTML = `
        <tr>
            <td colspan="8" class="text-center text-muted py-4">
                <i class="bi bi-hourglass-split loading"></i>
                <div class="mt-2">読み込み中...</div>
            </td>
        </tr>
    `;
}

/**
 * 空の状態表示
 */
function showEmptyState(container, message) {
    container.innerHTML = `
        <tr>
            <td colspan="8" class="text-center text-muted py-4">
                <i class="bi bi-inbox fs-1"></i>
                <div class="mt-2">${escapeHtml(message)}</div>
            </td>
        </tr>
    `;
}

/**
 * エラー状態表示
 */
function showErrorState(container, message) {
    container.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4">
                <i class="bi bi-exclamation-triangle text-warning fs-1"></i>
                <div class="mt-2 text-muted">${escapeHtml(message)}</div>
            </td>
        </tr>
    `;
}

/**
 * HTMLエスケープ（app.jsと重複だが、独立性のため再定義）
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

// モーダルイベントリスナー
document.addEventListener('DOMContentLoaded', function() {
    // モーダルが閉じられた時の処理
    const companyModal = document.getElementById('companyModal');
    if (companyModal) {
        companyModal.addEventListener('hidden.bs.modal', function() {
            currentEditingId = null;
            clearValidationErrors();

            // 詳細表示で無効化された要素を復元
            const form = document.getElementById('companyForm');
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.disabled = false;
            });

            // 保存ボタンを表示
            const saveButton = document.querySelector('#companyModal .btn-primary');
            saveButton.style.display = '';
        });
    }

    // 削除モーダルが閉じられた時の処理
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('hidden.bs.modal', function() {
            currentEditingId = null;
        });
    }
});

// グローバル関数の公開
window.loadCompanies = loadCompanies;
window.filterCompanies = filterCompanies;
window.debounceSearch = debounceSearch;
window.resetFilters = resetFilters;
window.openCompanyModal = openCompanyModal;
window.saveCompany = saveCompany;
window.editCompany = editCompany;
window.viewCompanyDetail = viewCompanyDetail;
window.confirmDeleteCompany = confirmDeleteCompany;
window.deleteCompany = deleteCompany;