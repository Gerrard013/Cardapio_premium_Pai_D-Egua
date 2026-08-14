const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const VERSION = "20260814-railway-final-v10";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function cacheHeader(rel) {
  if (
    rel === "index.html" ||
    rel === "sw.js" ||
    rel.startsWith("js/") ||
    rel.startsWith("css/") ||
    rel === "manifest.webmanifest" ||
    rel.endsWith("pizza-havaiana-card-master.png") ||
    rel.endsWith("entrada-bolinho-frito-molho-branco.png")
  ) {
    return "no-store, max-age=0";
  }
  if (rel.startsWith("assets/")) {
    return "public, max-age=604800";
  }
  return "no-cache";
}

const server = http.createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url || "/").split("?")[0]);

  if (rawPath === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify({ ok: true, version: VERSION }));
    return;
  }

  let rel = rawPath === "/" ? "index.html" : rawPath.replace(/^\/+/, "");
  let filePath = path.resolve(ROOT, rel);

  if (!filePath.startsWith(path.resolve(ROOT) + path.sep) && filePath !== path.resolve(ROOT, "index.html")) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statErr, stat) => {
    if (!statErr && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      rel = path.relative(ROOT, filePath).replaceAll(path.sep, "/");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
        });
        res.end("404");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": cacheHeader(rel),
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      });
      res.end(data);
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Pai D'Égua ${VERSION} rodando na porta ${PORT}`);
});
