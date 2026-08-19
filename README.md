# Claudecodeの使い手（Master of Claude Code）

Claude Codeのローカルログから実際の稼働時間・消費トークンを自動集計して表示する、
**個人用・読み取り専用の実績ダッシュボード**。手入力は一切なく、1時間ごとに自動更新される。

- 公開URL（暫定）: https://y-studios.github.io/claudecode-tracker/
- 公開URL（カスタムサブドメイン）: https://claudecode.shindan.biz/ （DNS設定後に有効化）
- 技術: Next.js 16 (App Router / `output: "export"`) + TypeScript + Tailwind CSS v4 + Framer Motion + Recharts 3 + lucide-react
- 非公式のファンメイドツール。Anthropic社とは無関係
- 手入力UI・LocalStorage・インポート/エクスポートUIは持たない。表示専用（他人が使うことは想定していない）

## アーキテクチャ

```
Mac (~/.claude/projects/**/*.jsonl)
   │  scripts/export-usage.mjs（15分ギャップでセッションをクラスタリングし日別集計）
   ▼
data/usage.json（リポジトリにコミット）
   │  git push
   ▼
GitHub Actions (.github/workflows/deploy.yml)
   │  next build（data/usage.json を静的にimportしてページに埋め込む）
   ▼
GitHub Pages（公開URL）
```

サイト自体はサーバーもLocalStorageも持たない完全な静的HTML。`data/usage.json` はビルド時に
`lib/data.ts` 経由でNext.jsのページに直接importされ、その瞬間のスナップショットがそのままデプロイされる。
「1時間ごとの自動更新」は **ローカルMac上のLaunchAgentが1時間ごとにログを集計してpush → その都度サイトが再ビルドされる**
という仕組みで実現している（サイト側が能動的にMacを読みに行くことはできないため）。

## 自動同期の仕組み（LaunchAgent）

- `~/Library/LaunchAgents/com.claudecode-tracker.sync.plist` が `scripts/sync-and-deploy.sh` を1時間ごとに実行
- `sync-and-deploy.sh` は `export-usage.mjs` を実行し、`data/usage.json` に変化があった場合のみ
  `data/usage.json` **だけ**をコミットしてpushする（他にステージ済みの変更があっても巻き込まない）
- push先はGitHub Actionsが検知して自動ビルド・デプロイする
- ログは `.sync.log`（gitignore済み）に出力される
- Macがスリープ/ログアウトしている間は動かない。個人のMac上で動くローカル自動化であり、クラウド上の定期実行ではない

```bash
# 状態確認
launchctl print gui/$(id -u)/com.claudecode-tracker.sync

# 手動で今すぐ同期
./scripts/sync-and-deploy.sh

# 停止したいとき
launchctl bootout gui/$(id -u)/com.claudecode-tracker.sync

# 再開したいとき
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.claudecode-tracker.sync.plist
```

## 集計ロジック（`scripts/export-usage.mjs`）

外部送信は一切なく、`data/usage.json` に書き出すのは日付・稼働時間・トークン数のみ
（会話内容やプロジェクト名は含めない）。

- **稼働時間**: `~/.claude/projects/**/*.jsonl` の全メッセージのタイムスタンプを時系列に並べ、
  間隔15分以内を1つの活動区間として連結（WakaTime等と同じアイドル閾値の考え方）。
  全ファイル横断で1本の時系列に合流させてから区間統合するため、並行して走らせた複数セッションの
  時間を二重計上しない
- **トークン**: 各アシスタント発言の `usage`（input + output + cache_creation + cache_read の実測合計）を日別に集計。
  キャッシュ読み込みを含むため数百M〜B単位になるのが正常（画面のグラフは動的スケール＋K/M/B表記で対応）
- 5時間の枠を大きく超える日があるのは想定通り（このツールの「稼働時間」は日次の実働時間の実測値で、
  Anthropicが公式に提示するローリング5時間ウィンドウそのものではない、独自の推定ロジック）
- 日付はすべて Asia/Tokyo 基準（`lib/date.ts`）。GitHub Actions(UTC)でビルドしてもズレないよう
  タイムゾーンを明示的に固定している

```bash
node scripts/export-usage.mjs                # data/usage.json に直近90日分を書き出し
node scripts/export-usage.mjs --days=30      # 期間を変える場合
node scripts/export-usage.mjs --out=foo.json # 出力先を変える場合
```

## 開発

```bash
npm install
npm run dev                 # http://localhost:3000
npm run build               # out/ に静的書き出し（basePath なし）
NEXT_PUBLIC_BASE_PATH=/claudecode-tracker npm run build   # GitHub Pages 暫定URL向け
node scripts/gen-icons.mjs  # ファビコン / OGP 再生成
node scripts/export-usage.mjs && npm run build  # 実データを最新化してからビルド
```

## デプロイ（GitHub Pages）

- `main` への push で `.github/workflows/deploy.yml` が走り、`out/` を GitHub Pages に配信する
- `basePath` は `actions/configure-pages` の `base_path` 出力で自動決定
  - Pages設定にカスタムドメインが無い間: `/claudecode-tracker`（https://y-studios.github.io/claudecode-tracker/）
  - カスタムドメイン有効化後: `""`（ルート配信）
- `public/CNAME` = `claudecode.shindan.biz`（Actionsデプロイでは参考情報。実際の有効化は Pages 設定の Custom domain）

### カスタムサブドメインの有効化手順

1. DNS（shindan.biz）に `CNAME claudecode → y-studios.github.io` を追加（A レコード方式なら 185.199.108.153 / 109.153 / 110.153 / 111.153 の4つ）
2. `dig +short claudecode.shindan.biz` で反映を確認
3. `gh api -X PUT repos/y-studios/claudecode-tracker/pages -f cname=claudecode.shindan.biz -F https_enforced=true`
4. 次回デプロイ（`workflow_dispatch` で手動起動可）から自動でルート配信に切り替わる

## data/usage.json スキーマ

```ts
{ generatedAt: string /* ISO */, logs: { "YYYY-MM-DD": { date, hours, tokensM } } }
```

このファイルはリポジトリにコミットされる（＝publicリポジトリなので誰でも閲覧できる）。
含まれるのは日付・稼働時間・トークン数のみで、会話内容やプロジェクト名は含まれない。
