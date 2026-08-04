import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const fail=[]; const ok=[];
const exists=p=>fs.existsSync(path.join(root,p));
const req=p=>exists(p)?ok.push(p):fail.push(`AUSENTE: ${p}`);
['index.html','css/styles.css','js/menu.js','js/app.js','manifest.webmanifest','netlify.toml','_redirects','sw.js','favicon.ico','apple-touch-icon.png'].forEach(req);
const menuText=fs.readFileSync(path.join(root,'js/menu.js'),'utf8');
const eq=menuText.indexOf('='); const data=JSON.parse(menuText.slice(eq+1).replace(/;\s*$/,''));
const ids=data.map(s=>s.id); if(new Set(ids).size!==ids.length) fail.push('IDs de categorias duplicados');
const pizzas=data.find(s=>s.id==='pizzas'); if(!pizzas||pizzas.items.length!==31)fail.push(`Pizzas: esperado 31, encontrado ${pizzas?.items.length??0}`);
const massas=data.find(s=>s.id==='massas'); if(!massas||massas.items.length!==5)fail.push(`Massas: esperado 5, encontrado ${massas?.items.length??0}`);
const entradas=data.find(s=>s.id==='entradas'); if(!entradas||entradas.items.length!==5)fail.push(`Entradas: esperado 5, encontrado ${entradas?.items.length??0}`);
const names=data.flatMap(s=>s.items.map(i=>i.name.toLowerCase())); if(names.some(n=>n==='atum'))fail.push('Atum ainda está no catálogo');
const productNames=data.flatMap(s=>s.items.map(i=>i.name)); if(new Set(productNames).size!==productNames.length)fail.push('Produtos duplicados pelo nome');
for(const section of data)for(const item of section.items){const p=item.image.split('?')[0];req(p);if(!item.price)fail.push(`Preço vazio: ${item.name}`);if(!item.description)fail.push(`Descrição vazia: ${item.name}`);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)=["']([^"'#]+)["']/g)){const ref=m[1].split('?')[0];if(/^(https?:|mailto:|tel:)/.test(ref))continue;if(ref.startsWith('/'))req(ref.slice(1));else if(!ref.includes('{{'))req(ref);}
if(/href=["']#["']/.test(html))fail.push('href="#" encontrado');
if(/social-showcase|social-card--gtech/.test(html))fail.push('Seção grande antiga da G Tech ainda existe');
if(!/responsaveis-pai-degua/.test(html))fail.push('Seção Rute e Cley ausente');
if(!/footer__credit/.test(html))fail.push('Crédito discreto da G Tech ausente');
if(!/data-order-choice/.test(html))fail.push('Modal de escolha salão/delivery não conectado');
console.log(`Categorias: ${data.length}`); console.log(`Pizzas: ${pizzas?.items.length||0}`); console.log(`Massas: ${massas?.items.length||0}`); console.log(`Entradas: ${entradas?.items.length||0}`); console.log(`Produtos totais: ${data.reduce((n,s)=>n+s.items.length,0)}`);
if(fail.length){console.error('\nFALHAS:');fail.forEach(x=>console.error('- '+x));process.exit(1);}console.log(`\nOK — ${ok.length} caminhos verificados sem ausência.`);
