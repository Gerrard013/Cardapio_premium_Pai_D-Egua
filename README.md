# Pai D’Égua — Cardápio Premium Final

Projeto estático mobile-first, pronto para GitHub e Netlify.

## Publicação rápida no Netlify

1. Descompacte o ZIP.
2. No Netlify, use **Add new site → Deploy manually**.
3. Arraste a pasta `PAIDEGUA_PREMIUM_FINAL` inteira.
4. Não há comando de build: o site é HTML, CSS e JavaScript puro.

## Estrutura

- `index.html`: página completa.
- `css/styles.css`: design, responsividade, acessibilidade e animações.
- `js/menu.js`: produtos e imagens por categoria.
- `js/app.js`: navegação, intro, vitrine, modal, expansão e assistente.
- `assets/images`: imagens finais convertidas para WebP e otimizadas.

## O que foi resolvido

- Navegação por âncoras independentes e corretas.
- “Bebidas” aponta para bebidas; “Burgers” aponta para burgers.
- Intro curta, pulável e executada uma vez por sessão.
- Produtos em cards maiores, com profundidade sutil e abertura individual.
- Vinho italiano incluído na seção Vinhos & chopp.
- Assistente funcional no mobile, sem dependência de API.
- WhatsApp em CTA, botão fixo e produtos.
- Google Maps por pesquisa oficial das unidades Coqueiro e Batista Campos.
- Imagens com lazy loading e WebP, sem bibliotecas pesadas.
- `prefers-reduced-motion`, foco visível e navegação por teclado.

## Dados operacionais

O número configurado é **(91) 98206-4743**. Os arquivos recebidos não continham endereços completos nem links individuais de Maps; por isso, os botões “Como chegar” usam pesquisa direta pelo nome da unidade, sem inventar endereço.

Para trocar telefone, procure por `5591982064743` em `index.html` e `js/app.js`.
