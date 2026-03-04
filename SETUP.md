# HubSpot 新規コンタクト監視 → Google Chat 通知

当日の新規コンタクト獲得数が **10件ごと** に Google Chat へ通知を送信するスクリプトです。

## 仕組み

```
[cron 5分おき] → hubspot_contacts_notifier.py → HubSpot API で当日コンタクト数取得
                                                → 10件の閾値を超えたら Google Chat Webhook で通知
                                                → .notifier_state.json に状態保存（二重通知防止）
```

## セットアップ手順

### 1. HubSpot API トークンを取得

1. [HubSpot](https://app.hubspot.com/) にログイン
2. **設定 → 連携 → プライベートアプリ** に移動
3. **プライベートアプリを作成** をクリック
4. 以下のスコープを付与:
   - `crm.objects.contacts.read`
   - `analytics.read` (Analytics API を使う場合)
5. アクセストークンをコピー

### 2. Google Chat Webhook URL を取得

1. 通知を送りたい **Google Chat スペース** を開く
2. スペース名をクリック → **アプリと統合** → **Webhook を管理**
3. **Webhook を追加** をクリック
4. 名前（例: "HubSpot通知"）を入力して作成
5. 生成された Webhook URL をコピー

### 3. 設定ファイルを作成

```bash
cp config.example.json config.json
```

`config.json` を編集:

```json
{
  "hubspot_access_token": "取得したHubSpotトークン",
  "google_chat_webhook_url": "取得したGoogle Chat Webhook URL",
  "notification_threshold": 10,
  "api_version": "analytics"
}
```

| 設定項目 | 説明 |
|---------|------|
| `hubspot_access_token` | HubSpot プライベートアプリのアクセストークン |
| `google_chat_webhook_url` | Google Chat の Incoming Webhook URL |
| `notification_threshold` | 通知を送る間隔（デフォルト: 10件ごと） |
| `api_version` | `analytics`（Analytics API）または `crm`（CRM Search API） |

### 4. 動作確認

```bash
python3 hubspot_contacts_notifier.py
```

正常に動作すれば、当日のコンタクト数がコンソールに表示されます。

### 5. cron に登録（5分おきに実行）

```bash
crontab -e
```

以下を追加:

```cron
*/5 * * * * cd /path/to/this/directory && python3 hubspot_contacts_notifier.py >> /var/log/hubspot_notifier.log 2>&1
```

## 通知の例

Google Chat に以下のような通知が届きます:

> 🎉 **新規コンタクト 10件達成!**
> 📅 2025-06-18
>
> *ソース内訳:*
>   - organic: 5件
>   - direct: 3件
>   - social: 2件
>
> [HubSpot レポートを開く](https://app.hubspot.com/reports-list/...)

20件、30件 ... と10件ごとに追加で通知が届きます。

## API バージョンについて

- **`analytics`**（デフォルト）: HubSpot Analytics API v2 を使用。レポートと同じソース別データが取れる。
- **`crm`**: HubSpot CRM Search API v3 を使用。Analytics API が使えない場合のフォールバック。コンタクトの `createdate` で当日分をカウント。

## トラブルシューティング

| 問題 | 対処 |
|------|------|
| `config.json が見つかりません` | `config.example.json` を `config.json` にコピーして設定 |
| `HubSpot API エラー (HTTP 401)` | アクセストークンを確認。期限切れの場合は再生成 |
| `HubSpot API エラー (HTTP 403)` | プライベートアプリのスコープを確認 |
| 通知が来ない | `.notifier_state.json` を削除してリトライ |
| 同じ通知が何度も来る | `.notifier_state.json` の内容を確認 |
