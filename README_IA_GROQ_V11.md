# Assistente IA Groq — Pai D'Égua V11

Versão: `20260815-railway-final-v12`

## O que mudou
O assistente agora tenta usar Groq no backend do Railway em:

`POST /api/assistant`

Se a IA estiver indisponível, o site continua funcionando com o fallback local.

## Ativar no Railway
No serviço do Pai D'Égua:

1. Abra **Variables**.
2. Crie `GROQ_API_KEY` com sua chave Groq.
3. Opcional: crie `GROQ_MODEL`.
4. Faça **Redeploy**.

A chave fica somente no backend. Ela não vai para HTML, JavaScript público ou GitHub.

## Teste
Abra:

`https://SEU-DOMINIO/health`

Quando estiver ativo:

```json
{"ok":true,"version":"20260815-railway-final-v12","ai":{"provider":"groq","configured":true,"model":"..."}}
```

## Comportamento
A IA recebe apenas dados do cardápio relevantes para cada pergunta, recomenda opções, compara produtos, usa preços/ingredientes confirmados e é instruída a não inventar dados.
