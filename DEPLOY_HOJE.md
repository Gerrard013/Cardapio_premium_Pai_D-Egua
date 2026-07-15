# DEPLOY FINAL COM IA GROQ

## 1. Colocar a pasta no Desktop

Depois de extrair o ZIP, deixe a pasta com este nome:

```text
Pai_DEgua_Cardapio_Premium_GTech_ULTRA_FINAL_GROQ_DEPLOY
```

## 2. Configurar a chave localmente

No Terminal:

```bash
cd "$HOME/Desktop/Pai_DEgua_Cardapio_Premium_GTech_ULTRA_FINAL_GROQ_DEPLOY"
cp .env.example .env
open -e .env
```

No arquivo `.env`, troque somente:

```text
GROQ_API_KEY=gsk_COLE_SUA_CHAVE_AQUI
```

A chave não pode ser colocada em `index.html`, `store-config.js` ou no Git.

## 3. Testar o site e a função no Mac

```bash
cd "$HOME/Desktop/Pai_DEgua_Cardapio_Premium_GTech_ULTRA_FINAL_GROQ_DEPLOY"
npm run dev
```

Abra o endereço exibido pelo Netlify CLI, normalmente:

```text
http://localhost:8888/?versao=ultra-final-groq-7
```

O servidor simples do Python abre o visual, mas não executa a função Groq. Para testar a IA, use obrigatoriamente `npm run dev`.

## 4. Conectar ao site correto da Netlify

```bash
npx netlify login
npx netlify link
```

Selecione o projeto existente da Pai D'Égua.

## 5. Cadastrar as variáveis na Netlify

No painel do projeto, abra as variáveis de ambiente e cadastre:

```text
GROQ_API_KEY = sua chave secreta
GROQ_MODEL = modelo disponível na sua conta Groq
```

O modelo fica configurável para que seja possível trocá-lo sem editar o site.

## 6. Publicar

```bash
npm run deploy:prod
```

## 7. Teste depois da publicação

1. Abra o link público em janela anônima.
2. Vá até **Assistente de sabores com IA**.
3. Escolha ocasião, sabor e canal.
4. Escreva um detalhe opcional.
5. Confirme o selo **Recomendação gerada com Groq**.
6. Troque entre Coqueiro e Batista Campos.
7. Confirme o WhatsApp de Batista Campos: `+55 91 98842-4248`.
8. Teste Anota AI, Maps, Grupo VIP, Instagram e Bio Site.
9. Teste no iPhone e no computador.

Consulte também `CONFIGURAR_GROQ_E_DEPLOY.md`.
