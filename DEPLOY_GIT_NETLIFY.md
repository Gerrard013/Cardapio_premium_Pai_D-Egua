# Deploy final pelo GitHub e Netlify

Depois de baixar `PAIDEGUA_CARDAPIO_PREMIUM_FINAL_00.zip` para `Downloads`, execute no terminal do VS Code:

```bash
cd "$HOME/Downloads"

rm -rf PAIDEGUA_FINAL_00_EXTRAIDO
mkdir -p PAIDEGUA_FINAL_00_EXTRAIDO

unzip -o PAIDEGUA_CARDAPIO_PREMIUM_FINAL_00.zip -d PAIDEGUA_FINAL_00_EXTRAIDO

cd "$HOME/Downloads/PAIDEGUA_GIT_DEPLOY"
git checkout main
git pull --ff-only origin main

rsync -av --delete \
  --exclude='.git' \
  "$HOME/Downloads/PAIDEGUA_FINAL_00_EXTRAIDO/PAIDEGUA_PREMIUM_FINAL/" \
  "$HOME/Downloads/PAIDEGUA_GIT_DEPLOY/"

git add -A
git commit -m "feat: entrega final 00 Cardápio Premium Pai D'Égua"
git push origin main
```

Confirmar o commit e abrir os deploys:

```bash
git log -1 --oneline
open "https://app.netlify.com/projects/paidegua-cardapio-oficial/deploys"
```

Depois que o Netlify indicar `Published`, abra o site e atualize sem cache com `Command + Shift + R`.
