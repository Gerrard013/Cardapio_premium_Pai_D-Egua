/**
 * Conteúdo exclusivo da versão Ultra Final.
 * Mantido separado para facilitar futuras atualizações sem mexer na base do cardápio.
 */
window.ULTRA_DATA = Object.freeze({
  version: "7.0.0-ultra-final-groq",
  directProductUrl: "https://pedido.anota.ai/product/63d96e925b52008112c710d8/0/paideguapizzasartesanais?o=a",
  experiences: [
    {
      id: "delivery",
      label: "Delivery",
      kicker: "Comodidade + promoções",
      title: "Receba o sabor Pai D'Égua onde estiver",
      description: "Acesse o pedido oficial, aproveite as promoções exclusivas do delivery e acompanhe todos os sabores disponíveis.",
      bullets: ["Promoção diferente de segunda a sexta", "Pedido pelo canal oficial Anota AI", "Links estratégicos para produtos e campanhas"],
      actionLabel: "Ver promoções do delivery",
      actionTarget: "promocoes-delivery"
    },
    {
      id: "express",
      label: "Pizza Express",
      kicker: "Retirada rápida",
      title: "Sua pizza pronta para sair do forno",
      description: "Sabores fixos, pizzas inteiras e operação pensada para retirada rápida. Consulte a disponibilidade do dia antes de sair.",
      bullets: ["Sabores específicos e produção agilizada", "Retirada estimada em cerca de 5 minutos", "Pedido confirmado pelo WhatsApp da unidade"],
      actionLabel: "Conhecer a Pizza Express",
      actionTarget: "pizza-express"
    },
    {
      id: "salao",
      label: "Salão",
      kicker: "Experiência completa",
      title: "Um cardápio feito para compartilhar",
      description: "Pizzas artesanais, entradas, massas, saladas, sobremesas, bebidas e opções para confraternizações.",
      bullets: ["Categorias organizadas para decidir rápido", "Combos e opções para grupos", "Localização e rota em poucos toques"],
      actionLabel: "Explorar o cardápio",
      actionTarget: "cardapio"
    }
  ],
  promotions: [
    {
      weekday: 1,
      day: "Segunda",
      name: "Segunda PLUS",
      headline: "Pague M e leve G",
      description: "Comece a semana com mais pizza. Promoção exclusiva do delivery.",
      tag: "Mais tamanho"
    },
    {
      weekday: 2,
      day: "Terça",
      name: "Terça Favorita",
      headline: "Compre uma Favorita e ganhe broto doce",
      description: "A combinação de pizza salgada com um toque doce para fechar o pedido.",
      tag: "Doce de presente"
    },
    {
      weekday: 3,
      day: "Quarta",
      name: "Quarta em Dobro",
      headline: "1 Pizza G + 1 Pizza Pequena Doce",
      description: "Uma promoção pensada para dividir e experimentar mais sabores.",
      tag: "Pedido em dobro"
    },
    {
      weekday: 4,
      day: "Quinta",
      name: "Quinta da Borda Grátis",
      headline: "Pizza salgada G com borda grátis",
      description: "Escolha sua pizza grande salgada e aproveite a borda recheada da promoção.",
      tag: "Borda grátis"
    },
    {
      weekday: 5,
      day: "Sexta",
      name: "Sexta do Boteco",
      headline: "Sabor de Boteco + bebida grátis",
      description: "Pizza com charque desfiado, macaxeira frita e cebola roxa. Escolha 2 Eisenbahn 350 ml, 1 L de Coca-Cola ou 1 L de suco, conforme regras da campanha.",
      tag: "Sabor paraense"
    }
  ],
  express: {
    title: "Pizza Express Pai D'Égua",
    description: "Uma seleção de sabores fixos preparada para agilizar a retirada. As pizzas ficam montadas e seguem para o forno após a confirmação do pedido.",
    timing: "Retirada estimada em cerca de 5 minutos",
    note: "Tempo sujeito ao movimento, disponibilidade dos sabores e confirmação da unidade."
  },
  partyKit: {
    title: "Seu rodízio em casa",
    subtitle: "Kit Festa Pai D'Égua",
    description: "Uma experiência pensada para aniversários, confraternizações e encontros em casa.",
    metrics: [
      { value: "5", label: "pizzas G" },
      { value: "80", label: "fatias" },
      { value: "5", label: "sabores" },
      { value: "≈15", label: "pessoas" }
    ],
    detail: "A proposta permite que aproximadamente 15 pessoas provem os sabores, com média de até 5 fatias por pessoa. Consulte composição, bebidas, sabores e disponibilidade no atendimento."
  },
  owners: {
    title: "Uma história feita por Rute e Cley",
    lead: "A Pai D'Égua começou na cozinha de casa há cerca de 10 anos e cresceu com trabalho, carinho e a confiança de cada cliente.",
    body: "Hoje, a marca celebra sua trajetória, o espaço físico e uma comunidade que acompanha cada etapa. Esta homenagem apresenta quem está por trás de cada receita, de cada melhoria e da vontade de entregar sempre o melhor.",
    image: "assets/img/ultra/rute-cley-historia.webp"
  },
  assistant: {
    title: "Ajuda inteligente Pai D'Égua",
    subtitle: "Responda três escolhas rápidas e receba uma sugestão para começar seu pedido.",
    occasions: [
      { id: "individual", label: "Só para mim" },
      { id: "casal", label: "Para duas pessoas" },
      { id: "familia", label: "Família ou amigos" },
      { id: "evento", label: "Festa ou evento" }
    ],
    tastes: [
      { id: "tradicional", label: "Clássicos" },
      { id: "especial", label: "Sabores especiais" },
      { id: "doce", label: "Quero doce também" },
      { id: "variado", label: "Quero variedade" }
    ],
    channels: [
      { id: "delivery", label: "Delivery" },
      { id: "express", label: "Retirada Express" },
      { id: "salao", label: "Salão" }
    ]
  }
});
