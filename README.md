# Pizzaria Pai D'Égua — Cardápio Premium Ultra Final

Versão final 6.0 preparada pela G Tech | Innovation & Solutions.

## O que está pronto

- Experiências separadas em **Delivery**, **Pizza Express** e **Salão**.
- Área própria para **promoções exclusivas do delivery**, de segunda a sexta.
- Destaque estratégico para a pizza **Sabor de Boteco** com link direto de produto.
- Seção **Pizza Express** com retirada estimada em cerca de 5 minutos e confirmação pelo WhatsApp.
- Vitrine com **10 mais pedidas**.
- **Kit Festa — Seu rodízio em casa** para eventos e confraternizações.
- **Ajuda inteligente guiada**, oferecida como cortesia G Tech. Não é chatbot livre nem faz pedidos automaticamente.
- Duas unidades no seletor, WhatsApp oficial, Google Maps, rota e Anota AI.
- Homenagem e apresentação de **Rute e Cley**, usando o material oficial fornecido.
- Cardápio visual completo com 12 páginas atualizadas pelas imagens enviadas.
- Busca, filtros, PWA, funcionamento responsivo e microinterações para toque.

## Arquivos principais

- `index.html`: estrutura da página.
- `assets/js/store-config.js`: produtos, unidades, links e configurações gerais.
- `assets/js/ultra-data.js`: promoções, experiências, Kit Festa, história e Ajuda Inteligente.
- `assets/css/ultra-final.css`: camada visual Ultra Final.
- `assets/js/ultra-final.js`: interações das novas seções.
- `DEPLOY_HOJE.md`: comandos de teste e publicação.
- `ESCOPO_FINAL_E_ADICIONAIS.md`: limites do projeto e itens cobrados à parte.

## Ponto importante sobre WhatsApp

O único número oficial fornecido no projeto foi `(91) 98248-6925`. Para não inventar contato, ele está configurado como canal central das duas unidades, com mensagem identificando a unidade selecionada. Quando a Pai D'Égua fornecer um número exclusivo da segunda unidade, basta trocar o campo `whatsapp` dela em `assets/js/store-config.js`.

## Ponto importante sobre iFood

O iFood não aparece como botão direto porque nenhum link oficial da loja foi fornecido. O pedido principal permanece no Anota AI. Assim que o link oficial do iFood for aprovado, ele pode ser incluído sem alterar o layout.


## IA Groq real

A Ajuda Inteligente agora chama o Groq por uma Netlify Function segura. A chave nunca fica no navegador. Configure `GROQ_API_KEY` e `GROQ_MODEL` nas variáveis de ambiente da Netlify. Consulte `CONFIGURAR_GROQ_E_DEPLOY.md`.

Quando a API estiver indisponível, o cardápio mantém uma recomendação local de emergência e continua funcional.
