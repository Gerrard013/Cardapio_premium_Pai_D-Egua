# Pai D’Égua — Cardápio Premium G Tech

Versão de produção final de 31/07/2026. Projeto estático em HTML, CSS e JavaScript, com Netlify Functions para o assistente Groq.

## Executar localmente

```bash
npm install
npm run serve
```

Abra `http://localhost:8000`. Para testar a função serverless:

```bash
npx netlify dev
```

## Variável segura da IA

Configure `GROQ_API_KEY` somente no painel do Netlify: **Site configuration → Environment variables**. Nunca coloque a chave no GitHub ou em `.env` enviado ao repositório. O site possui fallback local sem a chave.

## Estrutura principal

- `index.html`: experiência e marcação semântica.
- `content/catalogo-final.json`: 71 produtos exibidos.
- `content/burger-produtos.json`: burgers confirmados.
- `assets/img/products/`: PNGs mestres.
- `assets/img/optimized/`: WebP responsivos.
- `assets/js/intro-3d.js`: abertura cinematográfica.
- `assets/js/product-motion.js`: movimento e profundidade dos cards.
- `sw.js`: PWA e cache versão `paidegua-ultra-final-2026-07-31-v1`.

## Deploy pelo GitHub

```bash
git add .
git commit -m "Finaliza Cardápio Premium Pai D'Égua"
git push origin main
```

Se o Netlify estiver conectado ao repositório `Gerrard013/Cardapio_premium_Pai_D-Egua`, o push inicia o deploy automaticamente.

## Rollback

No Netlify, abra **Deploys**, escolha o deploy anterior estável e use **Publish deploy**. No Git, também é possível reverter o commit final com `git revert <hash>` e enviar novamente.
