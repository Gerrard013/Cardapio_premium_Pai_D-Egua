# CONFIGURAR A IA GROQ E PUBLICAR

## O que já está pronto

- Front-end completo e responsivo.
- Assistente de sabores em três etapas.
- Campo opcional para o cliente explicar preferências.
- Função segura em `netlify/functions/ai-recommendation.js`.
- Chave do Groq protegida no servidor.
- Catálogo controlado em `data/ai-catalog.json` para a IA não inventar produtos.
- Recomendação local de emergência caso o Groq esteja temporariamente indisponível.

## Regra de segurança

Nunca cole `GROQ_API_KEY` em `index.html`, `store-config.js` ou qualquer arquivo dentro de `assets/`. A chave deve ficar somente nas variáveis de ambiente da Netlify.

## Testar no Mac com a IA

Abra o Terminal dentro da pasta do projeto e execute:

```bash
cd "$HOME/Desktop/Pai_DEgua_Cardapio_Premium_GTech_ULTRA_FINAL_GROQ_DEPLOY"
npm run dev
```

O Netlify CLI informará o endereço local, normalmente `http://localhost:8888`.

Para usar o Groq localmente, crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Depois abra `.env` e substitua apenas o valor de `GROQ_API_KEY`.

## Publicar na Netlify

No Terminal:

```bash
cd "$HOME/Desktop/Pai_DEgua_Cardapio_Premium_GTech_ULTRA_FINAL_GROQ_DEPLOY"
npx netlify login
npx netlify link
```

No painel da Netlify, abra as variáveis de ambiente do projeto e cadastre:

```text
GROQ_API_KEY = sua chave secreta do Groq
GROQ_MODEL = modelo disponível na sua conta Groq
```

O projeto inclui um modelo padrão configurável. Caso a Groq altere a disponibilidade de modelos, basta mudar `GROQ_MODEL` na Netlify; não é necessário editar o site.

Depois publique:

```bash
npm run deploy:prod
```

## Teste final obrigatório

1. Abra o site publicado em uma janela anônima.
2. Vá até **Assistente de sabores com IA**.
3. Responda as três etapas e escreva um detalhe opcional.
4. Confirme se aparece o selo **Recomendação gerada com Groq**.
5. Teste o botão de pedido na unidade Coqueiro.
6. Troque para Batista Campos e confirme o WhatsApp `+55 91 98842-4248`.
7. Teste Grupo VIP, Maps, Anota AI, Instagram e Bio Site.

## Diagnóstico rápido

- `AI_NOT_CONFIGURED`: falta cadastrar `GROQ_API_KEY`.
- `AI_PROVIDER_ERROR`: chave inválida, limite atingido ou modelo indisponível.
- `AI_TIMEOUT`: resposta do provedor demorou além do limite.
- Em qualquer falha, o site mantém uma recomendação local e continua funcionando.
