# FC-CRM System

特定電子メール法に準拠した営業支援システム（Form Contact CRM System）

## 概要

複数企業の問い合わせフォームに対して、ChatGPT APIでパーソナライズされたメッセージを生成し、自動送信する機能を持つCRMシステムです。

## 技術スタック

- **バックエンド**: PHP 8.x, MySQL 5.7+
- **フロントエンド**: HTML5, CSS3, JavaScript (Bootstrap 5)
- **本番環境**: ConoHa WING
- **検証環境**: GitHub Pages
- **ドキュメント**: Obsidian (Markdown)

## ディレクトリ構造

```
fc-crm-system/
├── docs/                    # Obsidian用ドキュメント
├── frontend/               # 管理画面（静的ファイル）
├── backend/                # PHPバックエンド
├── database/               # DB関連ファイル
├── tests/                  # テストコード
└── .github/               # GitHub Actions
```

## セットアップ

1. 依存関係のインストール
```bash
composer install
```

2. 環境設定
```bash
cp backend/config/.env.example backend/config/.env
# .envファイルを編集
```

3. データベース構築
```bash
# MySQL接続後、以下を実行
source database/schema.sql
source database/seed.sql
```

## ドキュメント

詳細な技術仕様や開発ガイドラインは `docs/` フォルダ内のMarkdownファイルを参照してください。

- [ドキュメントインデックス](docs/00-index.md)
- [システム設計書](docs/01-設計/システム設計書.md)
- [データベース設計](docs/01-設計/データベース設計.md)
- [API仕様書](docs/01-設計/API仕様書.md)

## ライセンス

このプロジェクトは特定電子メール法に準拠した営業支援用途に限定されます。

## 開発者向け

開発タスクの進捗は[開発タスクリスト](docs/02-開発/開発タスクリスト.md)で管理されています。

