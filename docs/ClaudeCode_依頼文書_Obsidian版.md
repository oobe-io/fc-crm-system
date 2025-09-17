# Claude Code 開発依頼書 - FC-CRM System

## プロジェクト概要

特定電子メール法に準拠した営業支援システム（Form Contact CRM System）を開発してください。このシステムは、複数企業の問い合わせフォームに対して、ChatGPT APIでパーソナライズされたメッセージを生成し、自動送信する機能を持ちます。

**プロジェクトディレクトリ:**
```
/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system
```

**重要な制約事項:**
- 本番環境: ConoHa WING（PHP 8.x, MySQL 5.7+）
- 検証環境: GitHub Pages（静的ファイルのみ）
- ドキュメント管理: Obsidian（docs/フォルダ内にMarkdown形式）
- バージョン管理: GitHub Desktop
- reCAPTCHAがあるフォームはスキップ
- 個人情報は暗号化して保存

---

## 🔴 重要：開発環境について

このプロジェクトはObsidian Vault内で管理されています。以下の点に注意してください：

1. **メインディレクトリ**: `/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system`
2. **ドキュメントは全て**: `docs/`フォルダ内にMarkdown形式で作成
3. **Obsidianの内部リンク記法**: `[[ファイル名]]`を使用可能
4. **絵文字の使用**: フォルダ名に絵文字（🚀）が含まれているため、パス指定時は注意

---

## 開発の進め方

各タスクを**順番通り**に実行してください。次のタスクに進む前に、必ず動作確認を行ってください。

---

## 📦 Task 1: プロジェクト初期設定（最初に必ず実行）

### 実行内容
```
1. GitHubリポジトリ用のプロジェクト構造を作成
2. Obsidian用ドキュメント構造を作成
3. 必要な設定ファイルの生成
4. READMEの作成
```

### 具体的な指示
```bash
# 以下のディレクトリ構造を /Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system 内に作成

fc-crm-system/
├── docs/                        # Obsidian用ドキュメント
│   ├── 00-index.md             # ドキュメントインデックス
│   ├── 01-設計/
│   │   ├── システム設計書.md
│   │   ├── データベース設計.md
│   │   ├── API仕様書.md
│   │   └── 画面設計書.md
│   ├── 02-開発/
│   │   ├── 開発タスクリスト.md
│   │   ├── コーディング規約.md
│   │   ├── 技術メモ.md
│   │   └── ClaudeCode依頼文書.md
│   ├── 03-運用/
│   │   ├── デプロイ手順.md
│   │   ├── 運用マニュアル.md
│   │   └── トラブルシューティング.md
│   ├── 04-会議録/
│   │   └── .gitkeep
│   ├── 05-参考資料/
│   │   ├── 外部API仕様.md
│   │   └── 法令関連.md
│   └── templates/               # Obsidianテンプレート
│       ├── task-template.md
│       ├── bug-report.md
│       └── meeting-note.md
├── frontend/                    # 管理画面（静的ファイル）
│   ├── index.html              # ダッシュボード
│   ├── companies.html          # 企業管理
│   ├── send.html              # 送信管理
│   ├── ng-list.html           # NGリスト
│   ├── logs.html              # ログ閲覧
│   ├── settings.html          # 設定画面
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js            # メインJS
│   │   ├── api.js            # API通信
│   │   └── config.js         # 設定
│   └── assets/
│       └── images/
├── backend/                    # PHPバックエンド
│   ├── api/
│   │   └── index.php         # APIエントリーポイント
│   ├── lib/
│   ├── config/
│   │   └── .env.example      # 環境変数サンプル
│   ├── cron/
│   └── .htaccess             # アクセス制御
├── database/
│   ├── schema.sql            # DB構造定義
│   ├── seed.sql              # 初期データ
│   └── migrations/
├── tests/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml  # GitHub Pages自動デプロイ
├── .gitignore
├── composer.json             # PHP依存関係
└── README.md
```

### 生成するファイル

**1. `/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/.gitignore`:**
```gitignore
# 環境設定
.env
config/config.php

# 依存関係
vendor/
node_modules/

# ログ・キャッシュ
*.log
cache/
tmp/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Obsidian
.obsidian/workspace.json
.obsidian/workspace-mobile.json

# 機密情報
*.key
*.pem
```

**2. `/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/composer.json`:**
```json
{
    "name": "fc-crm/system",
    "description": "Form Contact CRM System with ChatGPT Integration",
    "require": {
        "php": ">=8.0",
        "simplehtmldom/simplehtmldom": "^2.0",
        "guzzlehttp/guzzle": "^7.0",
        "vlucas/phpdotenv": "^5.0"
    },
    "autoload": {
        "psr-4": {
            "FCCRM\\": "backend/lib/"
        }
    }
}
```

**3. `/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/docs/00-index.md`:**
```markdown
# 📚 FC-CRM System ドキュメントインデックス

> プロジェクトドキュメントの中央ハブ

## 🏗️ 設計ドキュメント

- [[システム設計書]] - システム全体のアーキテクチャ
- [[データベース設計]] - テーブル定義とER図
- [[API仕様書]] - エンドポイントとレスポンス形式
- [[画面設計書]] - UI/UXとワイヤーフレーム

## 💻 開発ドキュメント

- [[開発タスクリスト]] - 16個のタスクと進捗管理
- [[コーディング規約]] - PSR-12準拠のルール
- [[技術メモ]] - 実装時のTipsとトラブルシューティング
- [[ClaudeCode依頼文書]] - AI開発の詳細指示

## 🚀 運用ドキュメント

- [[デプロイ手順]] - ConoHa WINGへのデプロイ方法
- [[運用マニュアル]] - 日次運用タスクと監視項目
- [[トラブルシューティング]] - よくある問題と解決方法

## タグ一覧
#todo #in-progress #done #bug #important #meeting #reference
```

**4. `/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/docs/templates/task-template.md`:**
```markdown
---
tags: [todo]
created: {{date}}
priority: 
status: 未着手
---

# タスク名

## 概要

## 詳細

## 完了条件

## 関連リンク
- [[関連ドキュメント]]

## 作業ログ
- {{date}}: 
```

---

## 📦 Task 2: データベース構築

### 実行内容
```
1. MySQL用のスキーマファイル作成
2. 初期データ投入用SQLファイル作成
3. 設計ドキュメントの作成
```

### 具体的な指示

**`/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/database/schema.sql`を作成:**
```sql
-- データベース作成
CREATE DATABASE IF NOT EXISTS fc_crm_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE fc_crm_system;

-- 以下のテーブルを作成
-- 各テーブルの詳細な定義を記述
```

**`/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/docs/01-設計/データベース設計.md`を作成:**
```markdown
# データベース設計

## ER図
（mermaidでER図を記述）

## テーブル定義
### companies（企業情報）
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | INT | PK, AUTO_INCREMENT | 企業ID |
| company_name | VARCHAR(255) | NOT NULL | 企業名 |
...

## インデックス設計

## 関連情報
- [[システム設計書#データベース]]
- [[API仕様書#データアクセス]]
```

---

## 📦 Task 3: バックエンドAPI基盤

### 実行内容
```
1. APIルーティングシステム構築
2. データベース接続クラス作成
3. エラーハンドリング実装
4. ドキュメント作成
```

### 具体的な指示

**`/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/backend/api/index.php`を作成:**
```php
<?php
// パス: /Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/backend/api/index.php

require_once __DIR__ . '/../vendor/autoload.php';

// CORSヘッダー設定（GitHub Pagesからのアクセス許可）
// ルーティング実装
```

**`/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/docs/01-設計/API仕様書.md`を作成:**
```markdown
# API仕様書

## エンドポイント一覧

### 企業管理
- `GET /api/companies` - 企業一覧取得
- `POST /api/companies` - 企業登録
- `PUT /api/companies/{id}` - 企業更新
- `DELETE /api/companies/{id}` - 企業削除

## レスポンス形式

## エラーコード

## 関連ドキュメント
- [[データベース設計]]
- [[システム設計書#API]]
```

---

## 📦 Task 4: フロントエンド基本画面

### 実行内容
```
1. 管理画面のHTML/CSS作成
2. Bootstrap 5の導入と基本レイアウト
3. ナビゲーション実装
4. 画面設計ドキュメント作成
```

### 具体的な指示

**各HTMLファイルを `/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/frontend/` に作成**

**`/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/docs/01-設計/画面設計書.md`を作成:**
```markdown
# 画面設計書

## 画面一覧
1. [[#ダッシュボード]]
2. [[#企業管理]]
3. [[#送信管理]]
4. [[#NGリスト]]
5. [[#ログ閲覧]]
6. [[#設定]]

## ダッシュボード
### 画面概要
### ワイヤーフレーム
### 機能説明

## 関連ドキュメント
- [[API仕様書]]
- [[システム設計書#フロントエンド]]
```

---

## 📦 Task 5: 企業管理機能（CRUD）

### 実行内容
```
1. 企業一覧表示機能
2. 企業登録・編集・削除機能
3. カテゴリによるフィルタリング
4. 技術メモの更新
```

### 具体的な指示

**実装後、以下のドキュメントを更新:**

**`/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/docs/02-開発/技術メモ.md`に追記:**
```markdown
# 技術メモ

## 実装済み機能
### 企業管理機能
- 実装日: {{date}}
- 使用技術: PHP 8.x, MySQL, JavaScript
- ポイント:
  - プリペアドステートメントでSQLインジェクション対策
  - ページネーション実装
  - 検索機能の最適化

## トラブルシューティング
### 問題: 
### 解決: 

## 関連
- [[開発タスクリスト#Task5]]
```

---

## 📦 Task 6-16: 残りのタスク

（Task 6-16も同様に、各タスクごとに以下を指定）
- 作成するファイルのフルパス（`/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/...`）
- 更新するドキュメント（`docs/`フォルダ内）
- Obsidianリンクの活用

---

## 📋 開発進捗管理

### Obsidianでのタスク管理

**`/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system/docs/02-開発/開発タスクリスト.md`を定期的に更新:**

```markdown
# 開発タスクリスト

## 進捗サマリー
- 全体進捗: 3/16 タスク完了
- 現在作業中: Task 4
- 次の予定: Task 5

## タスク一覧
- [x] Task 1: プロジェクト初期設定 #done
- [x] Task 2: データベース構築 #done 
- [x] Task 3: バックエンドAPI基盤 #done
- [ ] Task 4: フロントエンド基本画面 #in-progress
- [ ] Task 5: 企業管理機能 #todo
...

## 作業ログ
### 2024-01-14
- Task 1完了
- Obsidian環境設定完了
- GitHub連携確認

## 関連リンク
- [[ClaudeCode依頼文書]]
- [[システム設計書]]
```

---

## ⚠️ Obsidian環境での注意事項

### パス指定時の注意
1. **絵文字を含むパス**: `🚀dev`フォルダの絵文字は正確にコピー
2. **スペースのエスケープ**: 必要に応じて適切にエスケープ
3. **相対パスと絶対パス**: スクリプト内では適切に使い分け

### ドキュメント作成時の規則
1. **Markdownファイル**: 全て`.md`拡張子
2. **内部リンク**: `[[ファイル名]]`または`[[ファイル名#見出し]]`
3. **タグ**: `#tag-name`形式（スペース不可）
4. **日付**: `{{date}}`はYYYY-MM-DD形式

### Git管理
1. **`.obsidian/`フォルダ**: 一部のファイルは.gitignoreに追加
2. **コミットメッセージ**: 日本語可
3. **ブランチ**: `main`、`develop`、`feature/*`

---

## 🎯 最終確認項目

全タスク完了後、以下を確認してください：

### ファイル構造確認
```bash
# プロジェクトルートで実行
cd /Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system
tree -L 2
```

### ドキュメント確認
- [ ] 全ての設計ドキュメントが`docs/01-設計/`に存在
- [ ] 開発メモが`docs/02-開発/`に記録
- [ ] 運用手順が`docs/03-運用/`に文書化
- [ ] Obsidianでグラフビュー確認

### コード確認
- [ ] PHPコードがPSR-12準拠
- [ ] セキュリティ対策実装
- [ ] エラーハンドリング完備

---

## 📚 参考資料とリンク

### プロジェクト内リンク
- [[システム設計書]]
- [[データベース設計]]
- [[API仕様書]]
- [[コーディング規約]]

### 外部リンク
1. [PHP公式マニュアル](https://www.php.net/manual/ja/)
2. [Obsidian Documentation](https://obsidian.md/docs)
3. [ConoHa WING マニュアル](https://support.conoha.jp/w/)

---

## 🚀 開発開始

1. このドキュメント全体をClaude Codeに渡す
2. 「Task 1から順番に、Obsidian環境で実行してください」と指示
3. 各タスク完了後に`docs/02-開発/開発タスクリスト.md`を更新
4. Obsidianで進捗を視覚的に確認

**プロジェクトパス再確認:**
```
/Users/seitamo/Documents/ObsidianVault/🚀dev/fc-crm-system
```

このパスを基準に全ての開発を進めてください。

---

**開発頑張ってください！** 🚀
