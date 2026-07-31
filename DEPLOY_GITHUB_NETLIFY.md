# Substituição do projeto no GitHub e deploy no Netlify

Repositório: `Gerrard013/Cardapio_premium_Pai_D-Egua`

## Método seguro usando o repositório já clonado

No Terminal do Mac, ajuste apenas os caminhos das duas pastas:

```bash
cd ~/Documents/Cardapio_premium_Pai_D-Egua

git checkout main
git pull origin main

git branch backup-antes-ultra-final-2026-07-31

find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

cp -R ~/Downloads/PAI_DEGUA_CARDAPIO_PREMIUM_GTECH_ULTRA_FINAL_2026-07-31/. ./

git add -A
git status
git commit -m "Finaliza Cardápio Premium Pai D'Égua"
git push origin main
```

## Caso ainda não tenha o repositório no computador

```bash
cd ~/Documents
git clone https://github.com/Gerrard013/Cardapio_premium_Pai_D-Egua.git
cd Cardapio_premium_Pai_D-Egua

git branch backup-antes-ultra-final-2026-07-31
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R ~/Downloads/PAI_DEGUA_CARDAPIO_PREMIUM_GTECH_ULTRA_FINAL_2026-07-31/. ./

git add -A
git commit -m "Finaliza Cardápio Premium Pai D'Égua"
git push origin main
```

## Netlify

Se o site `paidegua-cardapio-oficial` já estiver conectado à branch `main`, o push criará um deploy automaticamente.

No Netlify, confira:

- **Build command:** vazio
- **Publish directory:** `.`
- **Functions directory:** `netlify/functions`
- **Environment variables:** `GROQ_API_KEY` e, opcionalmente, `GROQ_MODEL`

Depois do deploy, abra **Deploys**, aguarde **Published**, acesse o domínio em janela anônima e valide a nova versão.
