#!/bin/bash
# Claude Codeのローカルログを集計し、変化があればリポジトリにコミット&pushする。
# push先のmainブランチはGitHub Actions(.github/workflows/deploy.yml)で自動的に
# ビルド&デプロイされるので、このスクリプトはpushするところまでで完結する。
# LaunchAgent(com.claudecode-tracker.sync)から1時間ごとに呼ばれる想定。
set -euo pipefail
cd "$(dirname "$0")/.."

# nvmのnodeを使う（LaunchAgent実行時はログインシェルのPATHが通っていないため明示指定）
NODE_BIN="$HOME/.nvm/versions/node/v25.8.0/bin"
export PATH="$NODE_BIN:$PATH"

node scripts/export-usage.mjs --out=data/usage.json --days=90

git add data/usage.json
if git diff --cached --quiet -- data/usage.json; then
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) no change, skip push"
  exit 0
fi

git commit -m "chore: sync usage data $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push origin main
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) pushed usage data update"
