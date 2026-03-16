#!/usr/bin/env python3
"""
HubSpot 新規コンタクト監視 & Google Chat 通知スクリプト

当日の新規コンタクト数を HubSpot API で取得し、
10件獲得するごとに Google Chat へ通知を送信する。

使い方:
  1. config.json に HubSpot API キーと Google Chat Webhook URL を設定
  2. cron 等で定期実行（例: */5 * * * * python3 hubspot_contacts_notifier.py）
"""

import json
import os
import sys
import urllib.request
import urllib.error
import msvcrt
from datetime import datetime, timezone, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
STATE_PATH = os.path.join(SCRIPT_DIR, ".notifier_state.json")
LOCK_PATH = os.path.join(SCRIPT_DIR, ".notifier.lock")

# HubSpot レポートで使用しているソースフィルタ
SOURCES = [
    "direct",
    "organic",
    "paid",
    "social",
    "paid-social",
    "other",
    "referrals",
    "email",
]


def load_config():
    """config.json から設定を読み込む"""
    if not os.path.exists(CONFIG_PATH):
        print(f"エラー: {CONFIG_PATH} が見つかりません。config.example.json を参考に作成してください。")
        sys.exit(1)

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    required = ["hubspot_access_token", "google_chat_webhook_url"]
    for key in required:
        if not config.get(key):
            print(f"エラー: config.json に '{key}' が設定されていません。")
            sys.exit(1)

    return config


def load_state():
    """前回の通知状態を読み込む"""
    if not os.path.exists(STATE_PATH):
        return {"date": None, "last_notified_threshold": 0}

    with open(STATE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_state(state):
    """通知状態を保存する"""
    with open(STATE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)


def get_today_contacts_count(access_token):
    """
    HubSpot Analytics API を使って当日の新規コンタクト数を取得する。
    レポートと同じソースフィルタを適用。
    """
    jst = timezone(timedelta(hours=9))
    today = datetime.now(jst).strftime("%Y-%m-%d")

    # HubSpot Analytics API v2 - Sources エンドポイント
    # 当日のデータをソース別に取得し、合計する
    url = (
        "https://api.hubapi.com/analytics/v2/reports/sources/summary"
        f"?start={today}&end={today}"
    )

    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {access_token}")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        print(f"HubSpot API エラー (HTTP {e.code}): {body}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"HubSpot API 接続エラー: {e.reason}")
        sys.exit(1)

    total_contacts = 0
    source_breakdown = {}

    # レスポンスからソース別コンタクト数を集計
    for source_data in data:
        source_type = source_data.get("sourceType", "").lower()
        if source_type in SOURCES:
            contacts = source_data.get("contacts", 0)
            total_contacts += contacts
            if contacts > 0:
                source_breakdown[source_type] = contacts

    return total_contacts, source_breakdown, today


def get_today_contacts_count_v3(access_token):
    """
    HubSpot CRM Search API (v3) を使って当日作成されたコンタクト数を取得する。
    必要なスコープ: crm.objects.contacts.read のみ（全プランで利用可能）
    ソース内訳も hs_analytics_source プロパティから取得する。
    """
    jst = timezone(timedelta(hours=9))
    now = datetime.now(jst)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_ms = int(today_start.timestamp() * 1000)

    url = "https://api.hubapi.com/crm/v3/objects/contacts/search"
    total_contacts = 0
    source_breakdown = {}
    after = None

    # HubSpot ソース名をレポートのフィルタ名にマッピング
    source_map = {
        "organic_search": "organic",
        "paid_search": "paid",
        "paid_social": "paid-social",
        "social_media": "social",
        "direct_traffic": "direct",
        "referrals": "referrals",
        "email_marketing": "email",
        "other_campaigns": "other",
    }

    # ページネーションで全件取得（1回100件まで）
    while True:
        payload = {
            "filterGroups": [
                {
                    "filters": [
                        {
                            "propertyName": "createdate",
                            "operator": "GTE",
                            "value": str(start_ms),
                        }
                    ]
                }
            ],
            "properties": ["createdate", "hs_analytics_source"],
            "limit": 100,
        }
        if after:
            payload["after"] = after

        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Authorization", f"Bearer {access_token}")
        req.add_header("Content-Type", "application/json")

        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8") if e.fp else ""
            print(f"HubSpot CRM API エラー (HTTP {e.code}): {err_body}")
            sys.exit(1)
        except urllib.error.URLError as e:
            print(f"HubSpot CRM API 接続エラー: {e.reason}")
            sys.exit(1)

        results = data.get("results", [])

        # ソース内訳を集計（レポートと同じソースのみカウント）
        for contact in results:
            source = (
                contact.get("properties", {}).get("hs_analytics_source", "")
                or ""
            ).lower()
            mapped = source_map.get(source, source)
            # レポートと同じソースフィルタに含まれるもののみカウント
            if mapped in SOURCES:
                total_contacts += 1
                source_breakdown[mapped] = source_breakdown.get(mapped, 0) + 1

        # 次のページがあるか確認
        paging = data.get("paging", {})
        next_page = paging.get("next", {})
        after = next_page.get("after")
        if not after:
            break

    today = now.strftime("%Y-%m-%d")
    return total_contacts, source_breakdown, today


def send_google_chat_notification(webhook_url, total_contacts, source_breakdown, today):
    """Google Chat に通知を送信する。成功時 True、失敗時 False を返す。"""
    # ソース内訳テキストを生成
    breakdown_lines = ""
    if source_breakdown:
        breakdown_lines = "\n".join(
            f"  - {source}: {count}件" for source, count in sorted(
                source_breakdown.items(), key=lambda x: x[1], reverse=True
            )
        )
        breakdown_lines = f"\n\n*ソース内訳:*\n{breakdown_lines}"

    message = {
        "text": (
            f"🎉 *新規コンタクト {total_contacts}件達成!*\n"
            f"📅 {today}{breakdown_lines}\n\n"
            f"<https://app.hubspot.com/reports-list/22379720/templates/marketing/sources|HubSpot レポートを開く>"
        )
    }

    body = json.dumps(message).encode("utf-8")
    req = urllib.request.Request(webhook_url, data=body, method="POST")
    req.add_header("Content-Type", "application/json; charset=UTF-8")

    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(f"通知送信成功: {total_contacts}件")
                return True
            else:
                print(f"通知送信失敗 (HTTP {response.status})")
                return False
    except urllib.error.HTTPError as e:
        print(f"Google Chat Webhook エラー (HTTP {e.code})")
        return False
    except urllib.error.URLError as e:
        print(f"Google Chat Webhook 接続エラー: {e.reason}")
        return False


def main():
    # 多重実行防止: ロックファイルを取得できなければ終了
    try:
        lock_file = open(LOCK_PATH, "w")
        msvcrt.locking(lock_file.fileno(), msvcrt.LK_NBLCK, 1)
    except (OSError, IOError):
        print("別のインスタンスが実行中のためスキップします。")
        sys.exit(0)

    try:
        _run(lock_file)
    finally:
        try:
            msvcrt.locking(lock_file.fileno(), msvcrt.LK_UNLCK, 1)
        except OSError:
            pass
        lock_file.close()


def _run(lock_file):
    config = load_config()
    access_token = config["hubspot_access_token"]
    webhook_url = config["google_chat_webhook_url"]
    notification_threshold = config.get("notification_threshold", 10)
    api_version = config.get("api_version", "crm")

    # HubSpot から当日コンタクト数を取得
    if api_version == "crm":
        total_contacts, source_breakdown, today = get_today_contacts_count_v3(access_token)
    else:
        total_contacts, source_breakdown, today = get_today_contacts_count(access_token)

    print(f"[{datetime.now().isoformat()}] 当日新規コンタクト数: {total_contacts}件 ({today})")

    # 状態を読み込み
    state = load_state()

    # 日付が変わったらリセット
    if state.get("date") != today:
        state = {"date": today, "last_notified_threshold": 0}

    # 現在の閾値（10件ごと）
    current_threshold = (total_contacts // notification_threshold) * notification_threshold

    # 前回の通知閾値を超えたら通知
    if current_threshold > 0 and current_threshold > state["last_notified_threshold"]:
        if send_google_chat_notification(webhook_url, total_contacts, source_breakdown, today):
            state["last_notified_threshold"] = current_threshold
        else:
            print("通知送信に失敗したため、次回再試行します。")

    save_state(state)


if __name__ == "__main__":
    main()

