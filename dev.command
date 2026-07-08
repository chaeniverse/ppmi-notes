#!/bin/bash
# =========================================================
#  ppmi-notes 로컬 미리보기 버튼
#  더블클릭하면, 내 맥에서 사이트를 띄우고 브라우저를 엽니다.
#  - 처음 한 번은 필요한 패키지를 설치합니다(1~2분).
#  - 끄려면 이 터미널 창에서 Control+C 를 누르거나 창을 닫으세요.
# =========================================================
cd "$(dirname "$0")" || exit 1

export PATH="/usr/bin:/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

echo "🧠 ppmi-notes 로컬 미리보기"
echo "위치: $(pwd)"
echo

if [ ! -x node_modules/.bin/next ]; then
  echo "📦 필요한 패키지 설치 중... (처음 한 번, 1~2분 걸려요)"
  rm -rf node_modules package-lock.json
  npm install || { echo "❌ 설치 실패. node가 설치돼 있는지 확인하세요 (https://nodejs.org)"; read -n 1 -s -r -p "아무 키나..."; exit 1; }
  echo
fi

echo "🌐 잠시 후 브라우저가 http://localhost:3000 으로 열립니다."
echo "   (비밀번호: 940202)"
echo
( sleep 4 && open "http://localhost:3000" ) &

npm run dev
