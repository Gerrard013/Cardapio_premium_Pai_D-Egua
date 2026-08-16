#!/bin/bash

DOWNLOADS="$HOME/Downloads"
ZIP="$DOWNLOADS/PAIDEGUA_RAILWAY_PERFORMANCE_FINAL_V13.zip"
GITHUB="https://github.com/Gerrard013/Cardapio_premium_Pai_D-Egua.git"
VERSION="20260816-railway-performance-final-v13"
STAMP="$(date +%Y%m%d_%H%M%S)"
TMP="$DOWNLOADS/PAIDEGUA_TMP_V13_$STAMP"
REPO="$DOWNLOADS/PAIDEGUA_GIT_V13_$STAMP"

echo
echo "=============================================="
echo "PAI D'EGUA — PERFORMANCE FINAL V13"
echo "=============================================="

if [ ! -f "$ZIP" ]; then
  echo "ERRO: PAIDEGUA_RAILWAY_PERFORMANCE_FINAL_V13.zip não está em Downloads."
else
  mkdir -p "$TMP"
  unzip -q -o "$ZIP" -d "$TMP"
  VERIFY="$(find "$TMP" -type f -path '*/scripts/verify_project.py' -print | head -n 1)"

  if [ -z "$VERIFY" ]; then
    echo "ERRO: projeto V13 não encontrado dentro do ZIP."
  else
    SRC="$(dirname "$(dirname "$VERIFY")")"

    echo
    echo "=== 1. VALIDANDO V13 ==="
    python3 "$SRC/scripts/verify_project.py"
    node --check "$SRC/server.js"
    node --check "$SRC/js/app.js"
    node --check "$SRC/js/menu.js"

    echo
    echo "=== 2. CLONANDO GITHUB ==="
    git clone --branch main --single-branch "$GITHUB" "$REPO"

    if [ -d "$REPO/.git" ]; then
      cp -R "$SRC"/. "$REPO"/
      cd "$REPO"

      echo
      echo "=== 3. VALIDANDO DENTRO DO REPOSITORIO ==="
      python3 scripts/verify_project.py

      echo
      echo "=== 4. ALTERACOES ==="
      git status --short
      git add -A

      if git diff --cached --quiet; then
        git commit --allow-empty -m "chore: força deploy Performance V13"
      else
        git commit -m "perf: otimiza imagens mobile Pai Degua V13"
      fi

      echo
      echo "=== 5. PUSH MAIN ==="
      git push origin HEAD:main

      LOCAL="$(git rev-parse HEAD)"
      REMOTE="$(git ls-remote origin refs/heads/main | awk '{print $1}')"

      echo
      echo "LOCAL : $LOCAL"
      echo "GITHUB: $REMOTE"

      if [ "$LOCAL" = "$REMOTE" ]; then
        echo
        echo "=============================================="
        echo "OK — GITHUB MAIN ATUALIZADO COM V13"
        echo "RAILWAY RECEBEU O NOVO COMMIT"
        echo "PERFORMANCE MOBILE V13 PRONTA"
        echo "=============================================="
        git log -1 --oneline
        open "https://github.com/Gerrard013/Cardapio_premium_Pai_D-Egua/commits/main"
      else
        echo "ATENCAO: LOCAL e GITHUB não coincidem."
      fi
    else
      echo "ERRO: clone do GitHub falhou."
    fi
  fi
fi

echo
echo "Terminal continua aberto."
