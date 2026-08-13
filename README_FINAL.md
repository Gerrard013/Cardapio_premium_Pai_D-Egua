# Pai D'Égua — FINAL PARA APROVAÇÃO Cley e Rute

**Data:** 13/08/2026  
**Versão técnica:** `20260813-final-cley-rute-v1`  
**Deploy esperado:** https://paidegua-cardapio-oficial.netlify.app/

## Correções desta entrega

- Corrigido o botão **Pedir no Coqueiro** para abrir o cardápio **Mult Loja da Pizzaria**, e não a página do Burger.
- Link Coqueiro: `https://pedido.anota.ai/loja/paideguapizzasartesanais?f=msa`
- Batista Campos mantido em: `https://pedido.anota.ai/loja/pai-degua-pizzas-artesanais-1?f=msa`
- Promoções de segunda a sexta atualizadas conforme o material final enviado por Cley/Rute.
- Eventos/salão atualizados com Combo Solteiro, Combo Família, Combo da Galera, Mesa do Bolo e campanha de aniversariantes.
- História de **Rute e Cley** atualizada: em dezembro a Pai D'Égua completa 10 anos.
- Imagem final de Rute e Cley preservada em `assets/images/responsaveis-pai-degua.webp`.
- Performance melhorada: imagens de cards ocultos só carregam após “Ver todos”, intro reduzida, PNGs pesados de Coca-Cola convertidos para WebP e service worker versionado.

## Validação

Execute:

```bash
python3 scripts/verify_project.py
```

Resultado esperado:

- 31 pizzas
- 5 entradas
- 5 massas
- 96 produtos
- `OK — projeto validado.`

## Publicação

Use apenas `COMANDOS_GIT_PUSH_FINAL.txt`. Não use comandos antigos de outras versões.

Após o deploy, testar em aba anônima:
1. Batata Frita -> Pedir no Coqueiro -> Mult Loja da Pizzaria.
2. Pedir em Batista Campos -> unidade correta.
3. Promoções.
4. Eventos.
5. Rute e Cley.
6. Mobile.
