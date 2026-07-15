const catalog = require("../../data/ai-catalog.json");

const ALLOWED = Object.freeze({
  occasion: new Set(["individual", "casal", "familia", "evento"]),
  taste: new Set(["tradicional", "especial", "doce", "variado"]),
  channel: new Set(["delivery", "express", "salao"]),
  unit: new Set(["coqueiro", "batista-campos"])
});

const LABELS = Object.freeze({
  occasion: {
    individual: "Só para mim",
    casal: "Para duas pessoas",
    familia: "Família ou amigos",
    evento: "Festa ou evento"
  },
  taste: {
    tradicional: "Clássicos",
    especial: "Sabores especiais",
    doce: "Quero doce também",
    variado: "Quero variedade"
  },
  channel: {
    delivery: "Delivery",
    express: "Retirada Express",
    salao: "Salão"
  },
  unit: {
    coqueiro: "Coqueiro",
    "batista-campos": "Batista Campos"
  }
});

const DEFAULTS = Object.freeze({
  evento: "kit-festa",
  express: "pizza-express",
  doce: "pizza-brigadeiro",
  especial: "pizza-sabor-buteco",
  casal: "combo-casal",
  familia: "combo-tartarugas-ninjas",
  tradicional: "pizza-calabresa"
});

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    },
    body: JSON.stringify(payload)
  };
}

function cleanText(value, maxLength = 180) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return null;
  }
}

function validateInput(body) {
  if (!body || typeof body !== "object") return null;
  const occasion = cleanText(body.occasion, 30);
  const taste = cleanText(body.taste, 30);
  const channel = cleanText(body.channel, 30);
  const unit = cleanText(body.unit || "coqueiro", 40);
  const notes = cleanText(body.notes, 180);

  if (!ALLOWED.occasion.has(occasion)) return null;
  if (!ALLOWED.taste.has(taste)) return null;
  if (!ALLOWED.channel.has(channel)) return null;
  if (!ALLOWED.unit.has(unit)) return null;

  return { occasion, taste, channel, unit, notes };
}

function defaultItemId(input) {
  if (input.occasion === "evento") return DEFAULTS.evento;
  if (input.channel === "express") return DEFAULTS.express;
  if (input.taste === "doce") return DEFAULTS.doce;
  if (input.taste === "especial") return DEFAULTS.especial;
  if (input.occasion === "casal") return DEFAULTS.casal;
  if (input.occasion === "familia" || input.taste === "variado") return DEFAULTS.familia;
  return DEFAULTS.tradicional;
}

function safeJsonFromModel(content) {
  const raw = String(content || "").trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function buildRecommendation(modelResult, input) {
  const fallbackId = defaultItemId(input);
  const requestedId = cleanText(modelResult?.product_id, 80);
  const item = catalog.items.find((candidate) => candidate.id === requestedId)
    || catalog.items.find((candidate) => candidate.id === fallbackId)
    || catalog.items[0];

  const reason = cleanText(modelResult?.reason, 280)
    || `Esta opção combina com ${LABELS.occasion[input.occasion].toLowerCase()} e com a preferência por ${LABELS.taste[input.taste].toLowerCase()}.`;
  const label = cleanText(modelResult?.label, 70) || item.label;
  const whatsappMessage = cleanText(modelResult?.whatsapp_message, 260)
    || `Olá! Usei a Ajuda Inteligente da Pai D'Égua e quero saber mais sobre ${item.name}.`;

  return {
    label,
    title: item.name,
    text: reason,
    image: item.image,
    target: item.target,
    priceLabel: item.priceLabel,
    actionType: item.actionType,
    orderUrl: item.orderUrl || null,
    whatsappMessage,
    productId: item.id,
    source: "groq"
  };
}

function buildPrompt(input) {
  const compactCatalog = catalog.items.map((item) => ({
    id: item.id,
    nome: item.name,
    descricao: item.description,
    preco: item.priceLabel,
    tags: item.tags
  }));

  return {
    system: [
      "Você é a Ajuda Inteligente da Pai D'Égua Pizzas Artesanais, em Belém-PA.",
      "Sua função é indicar exatamente uma opção do catálogo fornecido, com texto curto, humano e persuasivo em português do Brasil.",
      "Nunca invente produtos, ingredientes, preços, tamanhos, brindes, prazos ou promoções.",
      "Não dê orientação médica, nutricional ou sobre alergias. Diga que disponibilidade, regras e conclusão do pedido devem ser confirmadas no canal oficial.",
      "Responda somente um objeto JSON válido, sem markdown, com estas chaves: product_id, label, reason, whatsapp_message.",
      "product_id deve ser exatamente um dos IDs fornecidos. label deve ter até 45 caracteres. reason deve ter até 240 caracteres. whatsapp_message deve ter até 220 caracteres."
    ].join(" "),
    user: JSON.stringify({
      pedido: {
        ocasiao: LABELS.occasion[input.occasion],
        preferencia: LABELS.taste[input.taste],
        canal: LABELS.channel[input.channel],
        unidade: LABELS.unit[input.unit],
        detalhe_opcional: input.notes || "Nenhum detalhe adicional"
      },
      catalogo: compactCatalog,
      regras: catalog.rules
    })
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, code: "METHOD_NOT_ALLOWED" });
  }

  const input = validateInput(parseBody(event));
  if (!input) {
    return json(400, { ok: false, code: "INVALID_INPUT" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  if (!apiKey) {
    return json(503, { ok: false, code: "AI_NOT_CONFIGURED" });
  }

  const prompt = buildPrompt(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const detail = cleanText(await response.text(), 500);
      console.error("Groq API error", response.status, detail);
      return json(502, { ok: false, code: "AI_PROVIDER_ERROR" });
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    const modelResult = safeJsonFromModel(content);
    if (!modelResult) {
      return json(502, { ok: false, code: "INVALID_AI_RESPONSE" });
    }

    return json(200, {
      ok: true,
      recommendation: buildRecommendation(modelResult, input)
    });
  } catch (error) {
    console.error("AI recommendation failed", error?.name || "Error");
    return json(error?.name === "AbortError" ? 504 : 502, {
      ok: false,
      code: error?.name === "AbortError" ? "AI_TIMEOUT" : "AI_REQUEST_FAILED"
    });
  } finally {
    clearTimeout(timeout);
  }
};
