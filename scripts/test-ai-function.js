const path = require("path");
const functionPath = path.resolve(__dirname, "../netlify/functions/ai-recommendation.js");
const { handler } = require(functionPath);

(async () => {
  const response = await handler({
    httpMethod: "POST",
    body: JSON.stringify({
      occasion: "casal",
      taste: "especial",
      channel: "delivery",
      unit: "batista-campos",
      notes: "Quero algo marcante para compartilhar"
    })
  });

  const accepted = [200, 503].includes(response.statusCode);
  console.log(JSON.stringify({ statusCode: response.statusCode, body: JSON.parse(response.body) }, null, 2));
  if (!accepted) process.exitCode = 1;
})();
