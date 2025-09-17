-- データベース作成
CREATE DATABASE IF NOT EXISTS fc_crm_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE fc_crm_system;

-- 企業情報テーブル
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL COMMENT '企業名',
    domain VARCHAR(255) NOT NULL COMMENT 'ドメイン',
    industry VARCHAR(100) COMMENT '業界',
    contact_form_url TEXT COMMENT '問い合わせフォームURL',
    form_fields JSON COMMENT 'フォームフィールド情報',
    category ENUM('メイン', 'サブ', 'テスト', '停止中') DEFAULT 'メイン' COMMENT 'カテゴリ',
    priority INT DEFAULT 1 COMMENT '優先度（1-5）',
    has_recaptcha BOOLEAN DEFAULT FALSE COMMENT 'reCAPTCHA有無',
    last_contact_date DATE COMMENT '最終コンタクト日',
    notes TEXT COMMENT '備考',
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active' COMMENT 'ステータス',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_domain (domain),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_last_contact (last_contact_date)
) COMMENT='企業情報';

-- NGリストテーブル
CREATE TABLE ng_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('domain', 'keyword', 'email') NOT NULL COMMENT 'NGタイプ',
    value VARCHAR(255) NOT NULL COMMENT 'NG値',
    reason TEXT COMMENT 'NG理由',
    added_date DATE NOT NULL COMMENT '追加日',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'ステータス',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ng_value (type, value),
    INDEX idx_type (type),
    INDEX idx_status (status)
) COMMENT='NGリスト';

-- 送信履歴テーブル
CREATE TABLE send_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    message_subject VARCHAR(255) COMMENT '件名',
    message_content TEXT COMMENT 'メッセージ内容',
    sender_name VARCHAR(100) COMMENT '送信者名',
    sender_email VARCHAR(255) COMMENT '送信者メールアドレス',
    sender_company VARCHAR(255) COMMENT '送信者企業名',
    sender_phone VARCHAR(50) COMMENT '送信者電話番号',
    response_status ENUM('pending', 'success', 'failed', 'blocked') DEFAULT 'pending' COMMENT '送信ステータス',
    response_message TEXT COMMENT 'レスポンスメッセージ',
    http_status_code INT COMMENT 'HTTPステータスコード',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '送信日時',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_response_status (response_status),
    INDEX idx_sent_at (sent_at)
) COMMENT='送信履歴';

-- 設定テーブル
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL COMMENT '設定キー',
    setting_value TEXT COMMENT '設定値',
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT '設定タイプ',
    description TEXT COMMENT '説明',
    is_encrypted BOOLEAN DEFAULT FALSE COMMENT '暗号化フラグ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting_key (setting_key)
) COMMENT='システム設定';

-- メッセージテンプレートテーブル
CREATE TABLE message_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL COMMENT 'テンプレート名',
    subject_template TEXT COMMENT '件名テンプレート',
    body_template TEXT NOT NULL COMMENT '本文テンプレート',
    industry VARCHAR(100) COMMENT '対象業界',
    variables JSON COMMENT '使用可能変数',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'アクティブフラグ',
    usage_count INT DEFAULT 0 COMMENT '使用回数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_industry (industry)
) COMMENT='メッセージテンプレート';

-- APIログテーブル
CREATE TABLE api_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL COMMENT 'エンドポイント',
    http_method ENUM('GET', 'POST', 'PUT', 'DELETE') NOT NULL COMMENT 'HTTPメソッド',
    request_data JSON COMMENT 'リクエストデータ',
    response_data JSON COMMENT 'レスポンスデータ',
    response_status INT COMMENT 'レスポンスステータス',
    execution_time DECIMAL(8,3) COMMENT '実行時間（秒）',
    user_agent TEXT COMMENT 'ユーザーエージェント',
    ip_address VARCHAR(45) COMMENT 'IPアドレス',
    error_message TEXT COMMENT 'エラーメッセージ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_endpoint (endpoint),
    INDEX idx_http_method (http_method),
    INDEX idx_response_status (response_status),
    INDEX idx_created_at (created_at)
) COMMENT='APIアクセスログ';

-- ChatGPT使用ログテーブル
CREATE TABLE chatgpt_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    template_id INT,
    prompt_text TEXT NOT NULL COMMENT 'プロンプト',
    response_text TEXT COMMENT 'ChatGPTレスポンス',
    tokens_used INT COMMENT '使用トークン数',
    model_version VARCHAR(50) COMMENT 'モデルバージョン',
    cost_usd DECIMAL(10,6) COMMENT 'コスト（USD）',
    response_time DECIMAL(8,3) COMMENT 'レスポンス時間（秒）',
    status ENUM('success', 'error', 'timeout') DEFAULT 'success' COMMENT 'ステータス',
    error_message TEXT COMMENT 'エラーメッセージ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (template_id) REFERENCES message_templates(id) ON DELETE SET NULL,
    INDEX idx_company_id (company_id),
    INDEX idx_template_id (template_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT='ChatGPT使用ログ';