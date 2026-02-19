# Notion メモ - Android Daily Notes App

日付・時刻付きのメモをNotionデータベースに保存するシンプルなAndroidアプリです。

## 機能

- テキストメモを日付・時刻付きでNotionに保存
- 最近のメモ一覧を表示（タップで内容展開）
- プルダウンで一覧リフレッシュ

## セットアップ

### 1. Notion側の準備

1. [Notion Integrations](https://www.notion.so/my-integrations) で新しいIntegrationを作成
2. 「Internal Integration Token」をコピー（APIキーとして使用）
3. Notionでデータベースを新規作成し、以下のプロパティを設定:
   - **Name** (タイトル型) — デフォルトで存在
   - **Date** (日付型) — 新規追加
4. データベースの「…」メニュー → 「コネクトを追加」→ 作成したIntegrationを選択
5. データベースのURLから ID をコピー:
   ```
   https://www.notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                         ← この32文字がデータベースID
   ```

### 2. アプリのビルド・実行

```bash
# 依存パッケージのインストール
cd notion-daily-notes
npm install

# 開発サーバー起動
npm start

# Androidで実行
npm run android
```

### 3. アプリ内の設定

1. アプリ起動後「設定を開く」または右上の「設定」ボタンをタップ
2. Notion APIキーとデータベースIDを入力して保存

## 技術スタック

- [Expo](https://expo.dev/) (React Native)
- [Notion API](https://developers.notion.com/)
- AsyncStorage (設定の永続化)
