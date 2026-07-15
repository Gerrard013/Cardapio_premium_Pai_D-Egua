process.env.GROQ_API_KEY = "test-key";
process.env.GROQ_MODEL = "test-model";

global.fetch = async () => ({
  ok: true,
  status: 200,
  json: async () => ({
    choices: [{
      message: {
        content: JSON.stringify({
          product_id: "pizza-sabor-buteco",
          label: "Sabor paraense",
          reason: "Uma escolha marcante para compartilhar no delivery.",
          whatsapp_message: "Olá! Quero pedir a Pizza Sabor de Buteco indicada pela IA."
        })
      }
    }]
  })
});

const { handler } = require("../netlify/functions/ai-recommendation.js");

(async () => {
  const response = await handler({
    httpMethod: "POST",
    body: JSON.stringify({
      occasion: "casal",
      taste: "especial",
      channel: "delivery",
      unit: "batista-campos",
      notes: "Quero algo marcante"
    })
  });

  const body = JSON.parse(response.body);
  console.log(JSON.stringify({ statusCode: response.statusCode, body }, null, 2));
  if (response.statusCode !== 200 || body?.recommendation?.source !== "groq") process.exitCode = 1;
})();
