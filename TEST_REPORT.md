# Relatório de testes — Ultra Final Groq 7.0

Data de preparação: 15/07/2026.

## Verificações executadas

- Sintaxe do front-end validada com `node --check`.
- Sintaxe da Netlify Function Groq validada com `node --check`.
- Entrada inválida bloqueada pela função.
- Ausência de `GROQ_API_KEY` retorna `AI_NOT_CONFIGURED` sem revelar segredo.
- Catálogo da IA usa IDs controlados e impede produtos arbitrários.
- A chave não aparece em nenhum arquivo público; somente `.env.example` contém um valor fictício.
- HTML verificado sem IDs duplicados.
- Arquivos locais referenciados por imagens, scripts e folhas de estilo conferidos.
- Estrutura Netlify, PWA, duas unidades e links oficiais preservados.

## Teste externo pendente

Uma chamada real ao Groq depende da chave privada do projeto e do modelo habilitado na conta. Depois de cadastrar as variáveis na Netlify, execute o teste final descrito em `DEPLOY_HOJE.md`.

## Comportamento de segurança

Se o Groq estiver sem chave, indisponível, fora do limite ou demorar além do tempo configurado, o front-end informa que usou a recomendação local. O cardápio e os botões continuam funcionando.
