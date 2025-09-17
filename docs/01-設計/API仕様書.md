# API仕様書

## 基本情報

- **ベースURL**: `https://your-domain.com/api`
- **認証方式**: なし（内部システム用）
- **レスポンス形式**: JSON
- **文字エンコーディング**: UTF-8

## 共通レスポンス形式

### 成功時
```json
{
  "success": true,
  "status_code": 200,
  "message": "成功メッセージ",
  "data": {
    // レスポンスデータ
  }
}
```

### エラー時
```json
{
  "success": false,
  "status_code": 400,
  "message": "エラーメッセージ",
  "errors": {
    "field_name": "フィールド固有のエラー"
  }
}
```

### ページネーション付きレスポンス
```json
{
  "success": true,
  "status_code": 200,
  "message": "データ取得成功",
  "data": {
    "data": [...],
    "meta": {
      "total": 100,
      "per_page": 20,
      "current_page": 1,
      "last_page": 5,
      "from": 1,
      "to": 20
    }
  }
}
```

## エンドポイント一覧

### 企業管理

#### 企業一覧取得
- **URL**: `/companies`
- **Method**: `GET`
- **パラメータ**:
  - `page` (integer, optional): ページ番号（デフォルト: 1）
  - `per_page` (integer, optional): 1ページあたりの件数（デフォルト: 20、最大: 100）
  - `category` (string, optional): カテゴリフィルタ（メイン/サブ/テスト/停止中）
  - `status` (string, optional): ステータスフィルタ（active/inactive/blocked）
  - `search` (string, optional): 企業名またはドメインの部分検索

**レスポンス例**:
```json
{
  "success": true,
  "status_code": 200,
  "message": "企業一覧を取得しました",
  "data": {
    "data": [
      {
        "id": 1,
        "company_name": "サンプル株式会社",
        "domain": "sample-corp.co.jp",
        "industry": "IT・システム開発",
        "contact_form_url": "https://sample-corp.co.jp/contact",
        "category": "メイン",
        "priority": 1,
        "has_recaptcha": false,
        "last_contact_date": null,
        "notes": "重要顧客",
        "status": "active",
        "created_at": "2024-01-01T10:00:00",
        "updated_at": "2024-01-01T10:00:00"
      }
    ],
    "meta": {
      "total": 1,
      "per_page": 20,
      "current_page": 1,
      "last_page": 1,
      "from": 1,
      "to": 1
    }
  }
}
```

#### 企業詳細取得
- **URL**: `/companies/{id}`
- **Method**: `GET`
- **パラメータ**:
  - `id` (integer, required): 企業ID

#### 企業登録
- **URL**: `/companies`
- **Method**: `POST`
- **リクエストボディ**:
```json
{
  "company_name": "企業名",
  "domain": "example.com",
  "industry": "業界",
  "contact_form_url": "https://example.com/contact",
  "category": "メイン",
  "priority": 1,
  "has_recaptcha": false,
  "notes": "備考"
}
```

**必須フィールド**:
- `company_name`: 企業名
- `domain`: ドメイン（ユニーク）

#### 企業更新
- **URL**: `/companies/{id}`
- **Method**: `PUT`
- **パラメータ**:
  - `id` (integer, required): 企業ID
- **リクエストボディ**: 更新したいフィールドのみ

#### 企業削除
- **URL**: `/companies/{id}`
- **Method**: `DELETE`
- **パラメータ**:
  - `id` (integer, required): 企業ID

**注意**: 送信履歴がある企業は物理削除ではなく無効化（status = 'inactive'）されます。

### NGリスト管理

#### NGリスト一覧取得
- **URL**: `/ng-list`
- **Method**: `GET`
- **パラメータ**:
  - `type` (string, optional): NGタイプフィルタ（domain/keyword/email）
  - `status` (string, optional): ステータスフィルタ（active/inactive）

#### NGリスト登録
- **URL**: `/ng-list`
- **Method**: `POST`
- **リクエストボディ**:
```json
{
  "type": "domain",
  "value": "spam-domain.com",
  "reason": "スパムドメイン"
}
```

### 送信履歴管理

#### 送信履歴一覧取得
- **URL**: `/send-history`
- **Method**: `GET`
- **パラメータ**:
  - `company_id` (integer, optional): 企業IDフィルタ
  - `response_status` (string, optional): 送信ステータスフィルタ
  - `date_from` (date, optional): 送信日FROM（YYYY-MM-DD）
  - `date_to` (date, optional): 送信日TO（YYYY-MM-DD）

#### 送信履歴詳細取得
- **URL**: `/send-history/{id}`
- **Method**: `GET`

### メッセージテンプレート管理

#### テンプレート一覧取得
- **URL**: `/templates`
- **Method**: `GET`
- **パラメータ**:
  - `industry` (string, optional): 対象業界フィルタ
  - `is_active` (boolean, optional): アクティブフラグフィルタ

#### テンプレート登録
- **URL**: `/templates`
- **Method**: `POST`
- **リクエストボディ**:
```json
{
  "template_name": "IT企業向け",
  "subject_template": "{{company_name}}様へのご提案",
  "body_template": "{{company_name}}様\n\n{{custom_message}}\n\n{{sender_name}}",
  "industry": "IT・システム開発",
  "variables": ["company_name", "custom_message", "sender_name"]
}
```

### システム管理

#### ヘルスチェック
- **URL**: `/health`
- **Method**: `GET`

**レスポンス例**:
```json
{
  "success": true,
  "status_code": 200,
  "message": "システムは正常です",
  "data": {
    "status": "healthy",
    "database": true,
    "timestamp": "2024-01-01 10:00:00",
    "version": "1.0.0"
  }
}
```

#### 設定取得
- **URL**: `/settings`
- **Method**: `GET`

#### 設定更新
- **URL**: `/settings`
- **Method**: `PUT`

### ChatGPT API連携

#### メッセージ生成
- **URL**: `/chatgpt/generate`
- **Method**: `POST`
- **リクエストボディ**:
```json
{
  "company_id": 1,
  "template_id": 1,
  "custom_variables": {
    "custom_message": "貴社の成長を支援したく..."
  }
}
```

### ログ・分析

#### APIログ取得
- **URL**: `/logs/api`
- **Method**: `GET`
- **パラメータ**:
  - `date_from` (date, optional): 日付FROM
  - `date_to` (date, optional): 日付TO
  - `endpoint` (string, optional): エンドポイントフィルタ
  - `status` (integer, optional): HTTPステータスフィルタ

#### ChatGPTログ取得
- **URL**: `/logs/chatgpt`
- **Method**: `GET`

#### 統計情報取得
- **URL**: `/stats`
- **Method**: `GET`
- **パラメータ**:
  - `period` (string): 集計期間（daily/weekly/monthly）
  - `date_from` (date): 開始日
  - `date_to` (date): 終了日

## エラーコード

| HTTPステータス | 説明 |
|----------------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | リクエストエラー |
| 401 | 認証エラー |
| 403 | 権限エラー |
| 404 | リソース未発見 |
| 409 | 競合エラー（重複など） |
| 422 | バリデーションエラー |
| 500 | サーバー内部エラー |
| 503 | サービス利用不可 |

## セキュリティ対策

### 入力値検証
- 全ての入力データに対してバリデーション実施
- SQLインジェクション対策（プリペアドステートメント使用）
- XSS対策（出力時のエスケープ処理）

### レート制限
- API呼び出し頻度の制限（実装予定）
- 同一IPからの大量リクエスト制御

### ログ監視
- 全てのAPIアクセスをログ記録
- 異常なアクセスパターンの検知

## CORS設定

GitHub Pagesからのアクセスを許可するため、以下のCORSヘッダーを設定：

```
Access-Control-Allow-Origin: https://your-username.github.io
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 利用制限

### 送信制限
- 1日あたりの送信上限: 50件（設定で変更可能）
- 送信間隔: 60分（設定で変更可能）
- リトライ回数: 3回まで

### データ保持
- APIログ: 30日間
- ChatGPTログ: 90日間
- 送信履歴: 無期限（アーカイブ対象）

## 関連ドキュメント
- [[データベース設計]] - データベーススキーマ詳細
- [[システム設計書#API設計]] - アーキテクチャ概要
- [[技術メモ#API実装]] - 実装時の注意事項