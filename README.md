# EO Japan メンバーデータベース

EO（Entrepreneurs' Organization / 起業家機構）日本リージョンに所属する全チャプターとメンバーの情報をまとめたデータベースです。

## EO Japan 概要

- **設立**: 1995年10月（アジア初のEOチャプター）
- **総メンバー数**: 約1,385名（2025年4月時点）
- **チャプター数**: 20チャプター
- **FY25-26 Regional Chair**: 他力野 淳（EO Kyoto）

## ファイル構成

| ファイル | 内容 |
|---------|------|
| `chapters.csv` | 全20チャプターの基本情報（名前、設立年、会員数、会長、URL等） |
| `members.csv` | 各チャプターの公開メンバー情報（氏名、企業、役職、EO内役割等） |

## CSVファイルの開き方

### Excel で開く場合
1. Excelを起動
2. 「ファイル」→「開く」でCSVファイルを選択
3. 文字コードが化ける場合は「データ」→「テキストまたはCSVから」で**UTF-8**を指定

### Google スプレッドシート で開く場合
1. Google ドライブにCSVファイルをアップロード
2. アップロードしたファイルをダブルクリック
3. 「Google スプレッドシートで開く」を選択

### Numbers（Mac）で開く場合
1. CSVファイルをダブルクリックするだけで開けます

## データ項目の説明

### chapters.csv（チャプター情報）

| 項目名 | 説明 |
|--------|------|
| chapter_id | チャプターの識別番号 |
| chapter_name | チャプター名（英語） |
| chapter_name_ja | チャプター名（日本語） |
| region | 地域 |
| established_year | 設立年 |
| member_count | 会員数 |
| member_count_as_of | 会員数の時点 |
| president_name | 会長名 |
| president_name_en | 会長名（英語） |
| president_company | 会長の所属企業 |
| website | 公式サイトURL |
| description | チャプターの特徴・説明 |

### members.csv（メンバー情報）

| 項目名 | 説明 |
|--------|------|
| member_id | メンバーの識別番号 |
| chapter_id | 所属チャプターの識別番号（chapters.csvと紐づく） |
| chapter_name | 所属チャプター名 |
| name_ja | 氏名（日本語） |
| name_en | 氏名（英語） |
| company | 所属企業名 |
| company_url | 企業URL |
| position | 企業での役職 |
| role_in_eo | EO内の役割（会長、理事、会員など） |
| role_detail | 役割の詳細 |
| data_source | 情報の出典（公式サイト、プレスリリース等） |
| notes | 備考 |

## メンバーの追加方法

members.csv をExcelやスプレッドシートで開き、最終行の下に新しい行を追加してください。

**例**: 新しいメンバーを追加する場合
```
64,4,EO Tokyo Central,田中太郎,Taro Tanaka,株式会社サンプル,https://sample.co.jp,代表取締役,会員,,手動追加,
```

- `member_id` は既存の最大値+1を使用
- `chapter_id` は chapters.csv の該当チャプターのIDを指定
- 不明な項目は空欄のままで構いません

## チャプター一覧（20チャプター）

| # | チャプター | 地域 | 設立年 | 会員数 |
|---|-----------|------|--------|--------|
| 1 | EO Hokkaido | 北海道 | 2022 | 100+ |
| 2 | EO North Japan | 東北 | 2011 | 61 |
| 3 | EO Ibaraki | 茨城 | 2023 | - |
| 4 | EO Tokyo Central | 東京 | 1995 | 412 |
| 5 | EO Tokyo West | 東京 | 2018 | ~100 |
| 6 | EO Tokyo Platinum | 東京 | 2020 | - |
| 7 | EO Tokyo Metropolitan | 東京 | 2020 | 50+ |
| 8 | EO Tokyo East | 東京 | 2025 | - |
| 9 | EO Kanagawa | 神奈川 | 2024 | - |
| 10 | EO Beyond Japan | - | 2025 | - |
| 11 | EO Hokuriku | 北陸 | 2022 | 32+ |
| 12 | EO Nagoya | 東海 | 2017 | 63 |
| 13 | EO Kyoto | 京都 | - | 71 |
| 14 | EO Osaka | 大阪 | 2010 | 93 |
| 15 | EO Kobe | 兵庫 | 2022 | - |
| 16 | EO Setouchi | 中国・四国 | 2021 | 52 |
| 17 | EO Kyushu | 九州 | 2017 | 75 |
| 18 | EO Okinawa | 沖縄 | 2021 | 40 |
| 19 | EO JRKC | - | - | - |
| 20 | EO Kansai Metropolitan | 関西 | - | - |

## 現在のデータ収集状況

Web上で公開されている情報を元に、以下のデータを収集しています：

- **理事・役員情報**: 各チャプターの会長・理事の情報
- **公開メンバー**: 公式サイトで公開されているメンバー情報
- **EO Japan Region役員**: リージョンレベルの役職者

**注意**: EOは守秘義務を重視する組織であり、会員の完全な名簿は一般公開されていません。このデータベースは公開情報のみで構成されています。データの追加・更新は手動で行ってください。

## 情報源

- [EO Japan Region 公式サイト](https://eoalljp.org/about.html)
- [EO Tokyo Central](https://eotokyo.org/)
- [EO Tokyo West](https://eotokyowest.org/)
- [EO Osaka](https://www.eoosaka.org/)
- [EO Kyoto](https://eokyoto.org/)
- [EO Kobe](https://eokobe.org/)
- [EO Hokkaido](https://eohokkaido.org/)
- [EO North Japan](https://eonorthjapan.org/)
- [EO Ibaraki](https://eoibaraki.org/)
- [EO Nagoya](https://eonagoya.org/)
- [EO Hokuriku](https://eohokuriku.org/)
- [EO Setouchi](https://www.eosetouchi.org/)
- [EO Kyushu](https://eokyushu.org/)
- [EO Okinawa](https://eookinawa.org/)
- [EO Kanagawa](https://eokanagawa.org/)
- [EO Tokyo Platinum](https://www.eotokyoplatinum.org/)
- [EO Tokyo Metropolitan](https://www.eotokyometropolitan.org/)

## 最終更新日

2026年2月18日
