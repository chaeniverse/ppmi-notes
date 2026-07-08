#!/bin/bash
# =========================================================
#  ppmi-notes 발행 버튼
#  더블클릭하면, 지금 repo에 바뀐 내용을 GitHub로 push 합니다.
#  push되면 Vercel이 자동으로 감지해 사이트를 재배포합니다.
# =========================================================
cd "$(dirname "$0")" || exit 1

export PATH="/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "🧠 ppmi-notes 발행 시작..."
echo "위치: $(pwd)"
echo

[ -f .git/index.lock ] && rm -f .git/index.lock

git add -A

if git diff --cached --quiet; then
  echo "✅ 바뀐 내용이 없습니다. (push할 게 없어요)"
  echo
  read -n 1 -s -r -p "아무 키나 누르면 창이 닫힙니다..."
  exit 0
fi

echo "▼ 이번에 발행할 변경:"
git diff --cached --stat
echo

git commit -m "publish: 업데이트 ($(date '+%Y-%m-%d %H:%M'))"

for i in 1 2 3; do
  if git push origin main; then
    echo
    echo "🚀 발행 완료! Vercel이 곧 자동 배포합니다."
    echo
    read -n 1 -s -r -p "아무 키나 누르면 창이 닫힙니다..."
    exit 0
  fi
  echo "↻ push 거부됨 — 원격 변경 반영 후 재시도 ($i/3)"
  git pull --rebase origin main
done

echo
echo "❌ push에 실패했습니다 (3회 시도). 인터넷/깃허브 인증을 확인하세요."
echo
read -n 1 -s -r -p "아무 키나 누르면 창이 닫힙니다..."
exit 1
