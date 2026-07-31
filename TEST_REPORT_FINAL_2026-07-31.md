# Relatório de testes — versão final

## Testes concluídos neste ambiente

- 12 arquivos JSON validados sem erro.
- 71 produtos únicos confirmados no catálogo.
- 71 PNGs mestres e 220 WebPs responsivos verificados.
- 75 imagens de origem auditadas: 71 produtos, 2 heros e 2 alternativas duplicadas excluídas da exibição.
- Zero IDs, masters ou imagens principais duplicadas no catálogo.
- Todas as referências locais do HTML e do catálogo existem.
- Todas as âncoras internas apontam para IDs válidos.
- Sintaxe validada para `app.js`, `intro-3d.js`, `product-motion.js`, `assistant.js` e `sw.js`.
- Nenhuma `GROQ_API_KEY`, chave `gsk_`, `.env`, `node_modules`, `__MACOSX`, `.DS_Store` ou arquivo `._*` presente.

O relatório automatizado completo está em `qa/QA_FINAL_STATIC.json`.

## Limitação do ambiente de execução

A navegação local por Chromium e por HTTP foi bloqueada pela política administrativa do ambiente (`ERR_BLOCKED_BY_ADMINISTRATOR` / resposta HTTP local indisponível). Por isso, não registro falsamente um teste visual de navegador como concluído aqui.

## Validação obrigatória após o deploy

1. Abrir o domínio em janela anônima.
2. Testar a introdução e o botão **Pular introdução**.
3. Testar em 390 px e desktop.
4. Abrir um produto e fechar o modal pelo X e pelo Escape.
5. Validar WhatsApp, Instagram, Maps e Anota AI.
6. Configurar `GROQ_API_KEY` no Netlify e testar o assistente.
7. Limpar o cache antigo ou recarregar duas vezes para ativar o novo service worker.
8. Gerar o QR Code definitivo somente depois da confirmação do domínio publicado.
