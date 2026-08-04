# Pai D’Égua — Final Validado

Projeto estático pronto para publicação na raiz do Netlify.

## Verificação

```bash
node --check js/menu.js
node --check js/app.js
node scripts/verify-project.mjs
python3 -m http.server 8080
```

Abra `http://localhost:8080/`.

A publicação deve seguir `DEPLOY_SEGURO_PAIDEGUA.txt`.
