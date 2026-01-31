# Claude Code（クロードコード）ガイド

## 概要

Claude Codeは、Anthropicが提供する**AI駆動型のコード補助ツール**です。ターミナル、VS Code、JetBrains IDE、デスクトップアプリなど、複数のインターフェースで利用できます。

### 主な特徴

- AIアシスタント（Claude）とペアプログラミングが可能
- コード分析、バグ修正、新機能実装などを自然言語で指示
- ファイル編集前に常に確認を求める（許可ベースのセキュリティ）
- Git統合で版管理を会話的に処理
- Gitの変更追跡と巻き戻し機能（チェックポイント）

---

## 主な機能

### コア機能

| 機能 | 説明 |
|------|------|
| コードの理解と分析 | プロジェクトの構造や機能を説明 |
| コード生成と編集 | 自然言語から自動コード生成 |
| バグ修正 | エラーを特定して修正提案 |
| リファクタリング | コード品質改善 |
| テスト作成 | ユニットテストやテストケース生成 |
| ドキュメント作成 | READMEやコメント自動生成 |
| Git操作 | コミット、ブランチ作成、PR生成 |
| PRレビュー | コード品質検証とレビューアシスト |

### 拡張機能

- **MCP（Model Context Protocol）統合**：外部ツール・データベース・API連携
- **カスタムスキル**：自分用コマンド作成
- **フック**：コマンド実行前後の自動処理
- **Plan Mode**：変更を実行する前にClaudeの計画をレビュー
- **Extended Thinking**：複雑な問題解決に時間をかけた推論

---

## インストール方法

### macOS / Linux / WSL

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Windows PowerShell

```powershell
irm https://claude.ai/install.ps1 | iex
```

### Windows CMD

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

### 代替方法

**Homebrew (macOS):**
```bash
brew install --cask claude-code
```

**WinGet (Windows):**
```powershell
winget install Anthropic.ClaudeCode
```

### システム要件

- OS：macOS 13.0+、Ubuntu 20.04+/Debian 10+、Windows 10 1809以降
- メモリ：4GB以上
- インターネット接続必須
- シェル：Bash または Zsh推奨

---

## 基本的な使い方

### セッション開始

```bash
cd /path/to/your/project
claude
```

### ワンショット実行

```bash
claude "プロジェクトについて説明して"
claude -p "この関数を説明して"  # 出力後に終了
```

### 前のセッション継続

```bash
claude -c              # 最近のセッション続行
claude -r "session-id" # 特定セッションを再開
```

### 基本的なワークフロー

1. **プロジェクト理解**：
   ```
   このプロジェクトは何をしていますか？
   ```

2. **コード変更**：
   ```
   helloworld関数をメインファイルに追加してください
   ```

3. **Git操作**：
   ```
   変更内容について説明的なメッセージでコミットしてください
   ```

---

## 主要コマンド

### CLIコマンド

| コマンド | 説明 |
|---------|------|
| `claude` | インタラクティブモード開始 |
| `claude "task"` | ワンショットタスク実行 |
| `claude -c` | 最近の会話継続 |
| `claude -r` | 特定セッション再開 |
| `claude commit` | コミット作成 |
| `claude --model opus` | モデル指定 |
| `claude --version` | バージョン表示 |

### スラッシュコマンド

| コマンド | 説明 |
|---------|------|
| `/help` | ヘルプ表示 |
| `/clear` | 会話履歴クリア |
| `/model` | モデル選択 |
| `/cost` | トークン使用量表示 |
| `/plan` | Plan Modeに移行 |
| `/resume` | セッション再開 |
| `/rewind` | コード/会話を巻き戻し |
| `/config` | 設定インターフェース開く |
| `/mcp` | MCP サーバー管理 |
| `/memory` | CLAUDE.md編集 |
| `/permissions` | 許可設定表示・更新 |
| `/theme` | 色テーマ変更 |
| `/vim` | Vim編集モード有効化 |

### キーボードショートカット

| ショートカット | 説明 |
|--------------|------|
| `Ctrl+C` | キャンセル |
| `Ctrl+L` | スクリーンクリア |
| `Ctrl+R` | コマンド履歴検索 |
| `Ctrl+V` | 画像を貼り付け |
| `Shift+Tab` | 許可モード切替 |
| `Esc+Esc` | 巻き戻し |
| `Shift+Enter` | 複数行入力 |
| `/` | コマンド補完表示 |
| `@` | ファイル参照 |

---

## 設定

### 設定ファイル構造

| ファイル | 説明 |
|---------|------|
| `~/.claude/settings.json` | ユーザー設定（全プロジェクト） |
| `.claude/settings.json` | プロジェクト設定（共有） |
| `.claude/settings.local.json` | プロジェクト設定（個人用） |
| `CLAUDE.md` | プロジェクトメモリ/命令 |
| `.mcp.json` | MCP サーバー設定 |

### 許可ルール設定例

```json
{
  "permissions": {
    "allow": ["Bash(npm run build)", "Bash(git commit *)"],
    "deny": ["Bash(curl *)", "Read(.env)"],
    "ask": ["Bash(git push *)"]
  }
}
```

---

## IDE統合

### VS Code

1. Extensions パネルを開く（`Cmd+Shift+X` / `Ctrl+Shift+X`）
2. "Claude Code" 検索してインストール
3. VS Code再起動

**主要ショートカット：**
- `Cmd+Esc` / `Ctrl+Esc`：フォーカス切り替え
- `Option+K` / `Alt+K`：ファイル参照挿入

### JetBrains IDE

対応IDE：IntelliJ IDEA、PyCharm、Android Studio、WebStorm、PhpStorm、GoLand など

1. Plugin Marketplace から "Claude Code" を検索
2. インストール → IDE再起動

---

## 便利な機能

### CLAUDE.md（プロジェクトメモリ）

プロジェクトルートに `CLAUDE.md` を作成してプロジェクト情報を記載すると、Claudeが自動的に参照します。

### カスタムスキル

`.claude/skills/` に YAML ファイルを配置してカスタムコマンドを作成できます。

### MCP サーバー追加

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

---

## 認証方法

1. **Claude Pro/Max** または **Claude Teams/Enterprise**（推奨）
2. **Anthropic Console**（API キー認証）
3. **AWS Bedrock、Google Vertex AI**（クラウドプロバイダー経由）

---

## 参考リンク

- 公式ドキュメント：https://code.claude.com/docs/
- `/help` コマンドでビルトインヘルプを参照
