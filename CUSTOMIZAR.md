# Guia de personalização

Todas as mudanças de conteúdo devem ser feitas primeiro em:

```text
assets/js/store-config.js
```

## 1. Marca e textos

Edite o bloco `brand`:

```js
brand: {
  name: "Pai D'Égua",
  tagline: "Pizzas Artesanais",
  heroTitle: "...",
  heroSubtitle: "..."
}
```

## 2. Cores

Abra:

```text
assets/css/variables.css
```

As principais variáveis são:

```css
--wine-900
--wine-700
--orange-500
--gold-500
--cream-50
--cream-100
```

Evite alterar o contraste sem testar botões, textos, modal e barra mobile.

## 3. Logo e ícones

- imagem de apoio da marca: `assets/img/brand/logo-paidegua.webp`;
- favicon: `icons/favicon.png`;
- PWA 192 px: `icons/icon-192.png`;
- PWA 512 px: `icons/icon-512.png`;
- QR Code: `assets/img/brand/qr-cardapio.png`.

Ao trocar ícones, preserve as dimensões e os nomes para não precisar editar o manifest.

## 4. Imagem do hero

Substitua:

```text
assets/img/hero/hero-pizza.webp
```

Recomendação:

- proporção aproximada de 16:10;
- 1600 × 1000 px;
- WebP;
- produto centralizado;
- até 350 KB quando possível.

## 5. Adicionar ou editar produtos

No array `products`, cada item aceita:

```js
{
  id: "pizza-exemplo",
  name: "Pizza Exemplo",
  description: "Descrição curta e fiel.",
  ingredients: "termos usados na busca",
  category: "pizzas-especiais",
  price: 49.90,
  priceLabel: "a partir de R$ 49,90",
  sizes: "P 49,90 · M 64,90 · G 69,90",
  image: "assets/img/produtos/pizzas-especiais/pizza-exemplo.webp",
  alt: "Texto alternativo específico",
  featured: false,
  popular: false,
  available: true
}
```

Regras:

- `id` sem espaços e sem acentos;
- `category` deve existir no array `categories`;
- `priceLabel` é o texto mostrado ao cliente;
- `ingredients` melhora a busca;
- `available: false` oculta o item sem apagar seus dados;
- não publique preço não confirmado.

## 6. Categorias

Edite `categories`:

```js
{ id: "entradas", label: "Entradas" }
```

O `id` precisa ser igual ao `category` usado nos produtos.

## 7. Unidade

Edite o array `units`:

```js
{
  id: "batista-campos",
  name: "Pai D'Égua — Coqueiro",
  shortName: "Coqueiro",
  address: "...",
  hours: "...",
  phone: "",
  whatsapp: "",
  orderUrl: "...",
  mapsUrl: "...",
  directionsUrl: "..."
}
```

Para adicionar uma segunda unidade, copie o objeto, troque todos os dados e use um `id` exclusivo.

Não invente telefone, endereço ou horário. Campos pendentes podem continuar vazios ou com texto de consulta ao canal oficial.

## 8. WhatsApp

No bloco:

```js
whatsapp: {
  number: "5591982486925",
  message: "Olá! Vim pelo Cardápio Digital da Pai D'Égua e gostaria de fazer um pedido."
}
```

Use:

```js
number: "5591XXXXXXXXX"
```

Sem `+`, espaços, parênteses ou traços.

Cada unidade deve possuir seu próprio número em `units[].whatsapp`. Os links usam somente o número da unidade selecionada; quando o campo está vazio, o WhatsApp fica desativado.

## 9. Google Maps

Para visualizar endereço:

```text
https://www.google.com/maps/search/?api=1&query=ENDERECO_CODIFICADO
```

Para iniciar rota:

```text
https://www.google.com/maps/dir/?api=1&destination=ENDERECO_CODIFICADO
```

Atualize `mapsUrl` e `directionsUrl` dentro da unidade.

## 10. Pedido oficial

O link principal está em:

```js
links: {
  order: "https://pedido.anota.ai/loja/paidegua-pizzas-artesanais?qrcode="
}
```

A unidade pode sobrescrever em `units[].orderUrl`.

Preserve o parâmetro `qrcode=`.

## 11. Cardápio visual

Arquivos grandes:

```text
assets/img/cardapio/01-capa.webp
...
assets/img/cardapio/12-saladas.webp
```

Miniaturas:

```text
assets/img/cardapio/01-capa-thumb.webp
...
```

Atualize o array `visualMenu` com `title`, `src`, `thumb` e `alt`.

## 12. Imagem social

Substitua:

```text
assets/img/social/og-paidegua.webp
```

Dimensão recomendada: 1200 × 630 px.

Caso o domínio mude, atualize:

- `index.html`: canonical e metadados Open Graph;
- `assets/js/store-config.js`: `links.site`;
- `robots.txt`;
- `sitemap.xml`.

## 13. Atualizar cache PWA

Sempre que alterar CSS, JS ou imagens importantes, mude em `sw.js`:

```js
const VERSION = "paidegua-v4.0.1";
```

Isso remove caches antigos após o novo deploy.
