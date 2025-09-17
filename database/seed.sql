-- 初期データ投入
USE fc_crm_system;

-- システム設定の初期データ
INSERT INTO settings (setting_key, setting_value, setting_type, description, is_encrypted) VALUES
('chatgpt_api_key', '', 'string', 'ChatGPT APIキー', TRUE),
('chatgpt_model', 'gpt-4o-mini', 'string', '使用するChatGPTモデル', FALSE),
('max_tokens', '1000', 'number', '最大トークン数', FALSE),
('temperature', '0.7', 'number', 'ChatGPT温度設定', FALSE),
('daily_send_limit', '50', 'number', '1日の送信上限', FALSE),
('send_interval_minutes', '60', 'number', '送信間隔（分）', FALSE),
('sender_name', '営業担当者', 'string', 'デフォルト送信者名', FALSE),
('sender_email', 'sales@example.com', 'string', 'デフォルト送信者メール', FALSE),
('sender_company', '株式会社サンプル', 'string', 'デフォルト送信者企業名', FALSE),
('sender_phone', '03-1234-5678', 'string', 'デフォルト送信者電話番号', FALSE),
('auto_send_enabled', 'false', 'boolean', '自動送信有効フラグ', FALSE),
('backup_enabled', 'true', 'boolean', 'バックアップ有効フラグ', FALSE);

-- メッセージテンプレートの初期データ
INSERT INTO message_templates (template_name, subject_template, body_template, industry, variables, is_active) VALUES
('一般企業向け',
'貴社の業務効率化についてご提案',
'{{company_name}}様

いつもお世話になっております。
{{sender_company}}の{{sender_name}}と申します。

この度、貴社の{{industry}}における業務効率化について、
弊社のソリューションをご提案させていただきたく、
ご連絡いたしました。

{{custom_message}}

ご検討のほど、よろしくお願いいたします。

{{sender_name}}
{{sender_company}}
{{sender_email}}
{{sender_phone}}',
'一般',
'["company_name", "industry", "sender_name", "sender_company", "sender_email", "sender_phone", "custom_message"]',
TRUE),

('IT企業向け',
'システム開発パートナーシップのご提案',
'{{company_name}}様

{{sender_company}}の{{sender_name}}です。

貴社のシステム開発における
パートナーシップについてご提案があります。

弊社は{{industry}}分野で豊富な実績があり、
貴社のプロジェクト成功に貢献できると確信しております。

{{custom_message}}

一度お時間をいただき、詳細をお話しできればと思います。

{{sender_name}}
{{sender_company}}
{{sender_email}}',
'IT・システム開発',
'["company_name", "industry", "sender_name", "sender_company", "sender_email", "custom_message"]',
TRUE),

('製造業向け',
'生産性向上ソリューションのご提案',
'{{company_name}}様

{{sender_company}}の{{sender_name}}と申します。

製造業における生産性向上について、
弊社のソリューションがお役に立てると考え、
ご連絡させていただきました。

{{custom_message}}

貴社の発展に寄与できるよう、
全力でサポートいたします。

{{sender_name}}
{{sender_company}}
{{sender_phone}}',
'製造業',
'["company_name", "sender_name", "sender_company", "sender_phone", "custom_message"]',
TRUE);

-- NGリストの初期データ（基本的なNG項目）
INSERT INTO ng_list (type, value, reason, added_date, status) VALUES
('domain', 'example.com', 'テスト用ドメイン', CURDATE(), 'active'),
('domain', 'localhost', 'ローカル環境', CURDATE(), 'active'),
('domain', '127.0.0.1', 'ローカルIP', CURDATE(), 'active'),
('keyword', 'spam', 'スパム関連', CURDATE(), 'active'),
('keyword', '詐欺', '詐欺関連', CURDATE(), 'active'),
('keyword', 'test', 'テスト関連', CURDATE(), 'active'),
('email', 'noreply@', '返信不可メール', CURDATE(), 'active'),
('email', 'no-reply@', '返信不可メール', CURDATE(), 'active');

-- サンプル企業データ
INSERT INTO companies (company_name, domain, industry, contact_form_url, category, priority, has_recaptcha, notes, status) VALUES
('サンプル株式会社', 'sample-corp.co.jp', 'IT・システム開発', 'https://sample-corp.co.jp/contact', 'テスト', 1, FALSE, 'テスト用データ', 'active'),
('テスト商事', 'test-trading.com', '商社・貿易', 'https://test-trading.com/inquiry', 'テスト', 2, FALSE, 'テスト用データ', 'active'),
('例示製作所', 'example-manufacturing.jp', '製造業', 'https://example-manufacturing.jp/contact-us', 'テスト', 3, TRUE, 'reCAPTCHA有り', 'inactive');