#!/bin/bash
DOWNLOADS="$HOME/Downloads"
ZIP="$DOWNLOADS/PAIDEGUA_RAILWAY_MOBILE_STABLE_FINAL_V14.zip"
GITHUB="https://github.com/Gerrard013/Cardapio_premium_Pai_D-Egua.git"
STAMP="$(date +%Y%m%d_%H%M%S)"
TMP="$DOWNLOADS/PAIDEGUA_TMP_V14_$STAMP"
REPO="$DOWNLOADS/PAIDEGUA_GIT_V14_$STAMP"

echo
echo "=============================================="
echo "PAI D'EGUA — MOBILE STABLE FINAL V14"
echo "=============================================="

if [ -f "$ZIP" ]; then
  mkdir -p "$TMP"
  unzip -q -o "$ZIP" -d "$TMP"
  VERIFY="$(find "$TMP" -type f -path '*/scripts/verify_project.py' -print | head -n 1)"

  if [ -n "$VERIFY" ]; then
    SRC="$(dirname "$(dirname "$VERIFY")")"

    echo "=== 1. VALIDANDO V14 ==="
    python3 "$SRC/scripts/verify_project.py"
    node --check "$SRC/server.js"
    node --check "$SRC/js/app.js"
    node --check "$SRC/js/menu.js"
    node --check "$SRC/sw.js"

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
      echo "=== 4. COMMIT ==="
      git status --short
      git add -A

      if git diff --cached --quiet; then
        git commit --allow-empty -m "chore: forca deploy Mobile Stable V14"
      else
        git commit -m "perf: estabiliza mobile e preserva qualidade V14"
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
        echo "OK — GITHUB MAIN ATUALIZADO COM V14"
        echo "RAILWAY RECEBEU O NOVO COMMIT"
        echo "MOBILE STABLE + QUALIDADE V14 PRONTA"
        echo "=============================================="
        git log -1 --oneline
        open "https://github.com/Gerrard013/Cardapio_premium_Pai_D-Egua/commits/main"
      else
        echo "ATENCAO: hashes local/remoto não coincidem."
      fi
    else
      echo "ERRO: clone do GitHub falhou."
    fi
  else
    echo "ERRO: projeto V14 não encontrado dentro do ZIP."
  fi
else
  echo "ERRO: PAIDEGUA_RAILWAY_MOBILE_STABLE_FINAL_V14.zip não está em Downloads."
fi

echo
echo "Terminal continua aberto."
