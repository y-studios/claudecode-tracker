# Claudecodeの使い手（Master of Claude Code）

毎日の5時間枠・トークン消費上限をパンパンまで使い倒すヘビーユーザーのための、
Claude Code 日次消費量・稼働時間・推定トークン推移を可視化するダッシュボード。

- 公開URL（暫定）: https://y-studios.github.io/claudecode-tracker/
- 公開URL（カスタムサブドメイン）: https://claudecode.shindan.biz/ （DNS設定後に有効化）
- 技術: Next.js 16 (App Router / `output: "export"`) + TypeScript + Tailwind CSS v4 + Framer Motion + Recharts 3 + lucide-react
- データ: ブラウザの LocalStorage のみ（`claudecode-tracker:v1`）。サーバー送信なし・アカウント不要・完全無料
- 非公式のファンメイドツール。Anthropic社とは無関係
- **手入力（ダミー/自己申告）と、実データ取り込み（`scripts/export-usage.mjs`）の2系統に対応**。何も操作しなければ手入力の初期サンプルログが入っているだけなので、実際の消費量と連動させたい場合は下記「実データを取り込む」を実行すること

## 機能

| セクション | 内容 |
| --- | --- |
| ヒーロー | Claudeキャラの応援吹き出し、クイックステータス（連続上限到達 / 今月総稼働 / 推定総トークン / 使い手ランク） |
| Today (Card A) | 270°の5時間リミットゲージ、稼働時間・トークンのスライダー、作業タグ、メモ、ワンタップ保存 |
| Dashboard (Card B) | 日別稼働時間の棒グラフ（5h上限の赤点線・到達日ハイライト）＋推定トークンのエリアチャート。14日/30日切替 |
| Card C | GitHub草風の活動ヒートマップ（直近16週、オレンジ濃淡） |
| Card D | 使い手ランク（見習い→修行中→熟練プロンプター→Claudeの右腕→特級術師→神）＋実績バッジ8種 |
| Card E | X（Twitter）ワンタップシェア（intent URL）・コピー |
| 過去ログ | 一覧編集・削除・過去日追加・JSONエクスポート/インポート・サンプルログの削除/復元 |

スライダーを動かすとゲージ・グラフ・ヒートマップ・ランクが**保存前でも即時連動**する（Linear風のライブプレビュー）。

## 実データを取り込む（あなたのClaude Code利用状況と連携）

ブラウザは `~/.claude/` を直接読めない（静的サイトからローカルファイルへ自動アクセスはできない）ため、
「ローカルでJSON書き出し → サイトのインポートボタンで取り込み」という2ステップ方式になっている。
外部送信は一切なく、書き出したJSONにも会話内容やコードは含まれない（日付・稼働時間・トークン数・触ったプロジェクト名のみ）。

```bash
cd claudecode-tracker
npm run export-usage                 # 直近90日分を usage-export.json に書き出し
npm run export-usage -- --days=30    # 期間を変える場合
```

書き出したら、サイトの「過去ログの編集」→「インポート」ボタンで `usage-export.json` を選択する。
既存のログは日付単位で上書きされる（インポートしなかった日はそのまま残る）。

**集計方法**:
- 稼働時間: `~/.claude/projects/**/*.jsonl` の全メッセージのタイムスタンプを時系列に並べ、間隔15分以内を1つの活動区間として連結（WakaTime等と同じアイドル閾値の考え方）。並行して走らせた複数セッションの時間も区間統合してから計算するので二重計上しない
- トークン: 各アシスタント発言の `usage`（input + output + cache_creation + cache_read の実測合計）を日別に集計。キャッシュ読み込みを含むため、手入力の目安値（1日数M）より一桁以上大きくなるのが正常
- 5時間の枠を大きく超える日があるのは想定通り（このツールの「稼働時間」は日次の実働時間で、Anthropicのローリング5時間ウィンドウそのものではない）

定期的に実行して再インポートすれば、そのつど最新の実績に更新できる（自動連携ではなく手動同期）。

## 開発

```bash
npm install
npm run dev                 # http://localhost:3000
npm run build               # out/ に静的書き出し（basePath なし）
NEXT_PUBLIC_BASE_PATH=/claudecode-tracker npm run build   # GitHub Pages 暫定URL向け
node scripts/gen-icons.mjs  # ファビコン / OGP 再生成
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

## LocalStorage スキーマ

```ts
{ version: 1, seeded: boolean, logs: { "YYYY-MM-DD": { date, hours(0-24), tokensM, tags[], memo?, sample?, updatedAt } } }
```

手入力フォーム（Today カード）は 0〜5.0h のスライダーだが、インポート経由のログは実測値をそのまま保持する（5時間を超えてもよい）。
