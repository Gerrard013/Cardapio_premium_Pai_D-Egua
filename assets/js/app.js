(()=>{
'use strict';

const $ = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
const safe = v => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const wa = (phone,msg='Olá! Vim pelo Cardápio Premium Pai D’Égua.') => `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
let site, catalog, lastFocused = null;

async function getJSON(path){
  const res = await fetch(path,{cache:'no-store'});
  if(!res.ok) throw new Error(`Falha ao carregar ${path}`);
  return res.json();
}

async function load(){
  [site,catalog] = await Promise.all([
    getJSON('content/site-data.json'),
    getJSON('content/catalogo-final.json')
  ]);
  applyLinks();
  renderCatalog();
  renderPromos();
  renderUnits();
  bindShare();
  bindDialogs();
  bindEventForm();
  bindAssistant();
  bindEasterEgg();
  bindNavigation();
  registerSW();
  window.PaiDeguaMotion?.refresh();
}

function primaryUnit(){
  return site.units.find(u=>u.confirmedAddress) || site.units[0];
}

function applyLinks(){
  const brand = site.brand;
  const unit = primaryUnit();
  $$('[data-order-link]').forEach(a=>{a.href = brand.orderGeneral; a.target='_blank'; a.rel='noopener';});
  $$('[data-instagram]').forEach(a=>{a.href=brand.instagram; a.target='_blank'; a.rel='noopener';});
  $$('[data-burger-instagram]').forEach(a=>{a.href=brand.burgerInstagram; a.target='_blank'; a.rel='noopener';});
  $$('[data-bio]').forEach(a=>{a.href=brand.bio; a.target='_blank'; a.rel='noopener';});
  $$('[data-whatsapp-link]').forEach(a=>{a.href = wa(unit.phone,`Olá! Vim pelo Cardápio Premium Pai D’Égua e quero atendimento da ${unit.name}.`); if(a.tagName==='A'){a.target='_blank'; a.rel='noopener';}});
  $$('[data-maps-link]').forEach(a=>{a.href = unit.maps; if(a.tagName==='A'){a.target='_blank'; a.rel='noopener';}});
}

function picture(p,{eager=false,modal=false}={}){
  const fallback = p.variants?.find(v=>v.bytes>0)?.path || p.image;
  const srcset = (p.variants||[]).filter(v=>v.bytes!==0).map(v=>`${v.path} ${v.width}w`).join(', ') || p.srcset || '';
  const sizes = modal ? '(max-width: 760px) 100vw, 50vw' : (p.sizes || '(max-width: 760px) 92vw, 30vw');
  return `<img src="${safe(fallback)}" ${srcset?`srcset="${safe(srcset)}"`:''} sizes="${safe(sizes)}" alt="${safe(p.alt)}" width="${p.width||800}" height="${p.height||1000}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" onerror="this.onerror=null;this.src='${safe(fallback)}'">`;
}

function card(p){
  return `
  <article class="product-card" data-product-id="${safe(p.id)}">
    <div class="product-media">${picture(p)}<span class="product-badge">${safe(p.label)}</span></div>
    <div class="product-body">
      <h3>${safe(p.name)}</h3>
      <p>${safe(p.description)}</p>
      <div class="product-meta">
        <span class="product-price">${safe(p.price)}</span>
        <div class="product-actions">
          <button class="mini-button" type="button" data-product-detail="${safe(p.id)}" aria-label="Ver detalhes de ${safe(p.name)}">＋</button>
          <a class="mini-button" href="${safe(site.brand.orderGeneral)}" target="_blank" rel="noopener" aria-label="Pedir ${safe(p.name)}">→</a>
        </div>
      </div>
    </div>
  </article>`;
}

function renderCatalog(){
  const sections = ['pizzas','burger-paidegua','smash','artesanal','acompanhamento','salada','bebidas','sucos','vinhos'];
  sections.forEach(key=>{
    const grid = $(`[data-product-grid="${key}"]`);
    if(!grid) return;
    const items = catalog.products
      .filter(p=>p.section===key)
      .sort((a,b)=>(a.order||999)-(b.order||999));
    grid.innerHTML = items.map(card).join('');
    enhanceVitrine(grid,items.length);
  });

  const featured = catalog.products.filter(p=>p.featured).slice(0,4);
  $('#featuredGrid').innerHTML = featured.map(p=>`
    <article class="featured-card reveal">
      ${picture(p,{eager:false})}
      <div class="featured-card-content">
        <span class="eyebrow light">${safe(p.label)}</span>
        <h3>${safe(p.name)}</h3>
        <p>${safe(p.description)}</p>
        <button class="button button-gold" data-product-detail="${safe(p.id)}" type="button">Ver detalhes</button>
      </div>
    </article>`).join('');

  document.addEventListener('click',e=>{
    const detail = e.target.closest('[data-product-detail]');
    if(detail) openProduct(detail.dataset.productDetail);
  });
}

function enhanceVitrine(grid,total){
  const section = grid.closest('.catalog-section');
  if(!section || section.querySelector('.vitrine-tools')) return;
  const tools = document.createElement('div');
  tools.className = 'vitrine-tools';
  tools.innerHTML = `<span class="vitrine-count"><strong>1</strong> de ${total}</span><div class="vitrine-buttons"><button type="button" data-slide="prev" aria-label="Produto anterior">←</button><button type="button" data-slide="next" aria-label="Próximo produto">→</button></div>`;
  const hint = document.createElement('p');
  hint.className = 'swipe-hint';
  hint.textContent = total > 1 ? 'Deslize para ver os próximos sabores' : 'Abra os detalhes para saber mais';
  grid.before(tools,hint);

  const activeIndex = ()=>{
    const cards = [...grid.children];
    if(!cards.length) return 0;
    const center = grid.scrollLeft + grid.clientWidth/2;
    let closest = 0,dist = Infinity;
    cards.forEach((card,index)=>{
      const cardCenter = card.offsetLeft + card.offsetWidth/2;
      const d = Math.abs(cardCenter-center);
      if(d<dist){dist=d;closest=index;}
    });
    tools.querySelector('strong').textContent = String(closest+1);
    return closest;
  };
  let scrollTimer;
  grid.addEventListener('scroll',()=>{
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(activeIndex,70);
  },{passive:true});
  tools.addEventListener('click',e=>{
    const button = e.target.closest('[data-slide]');
    if(!button) return;
    const cards = [...grid.children];
    const current = activeIndex();
    const next = button.dataset.slide==='next' ? Math.min(cards.length-1,current+1) : Math.max(0,current-1);
    cards[next]?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  });
}

function openProduct(id){
  const p = catalog.products.find(x=>x.id===id);
  const dialog = $('#productModal');
  if(!p || !dialog) return;
  lastFocused = document.activeElement;
  $('#productModalContent').innerHTML = `
    <div class="modal-product-layout">
      <div class="modal-product-media">${picture(p,{modal:true})}</div>
      <div class="modal-product-copy">
        <span class="eyebrow">${safe(p.label)}</span>
        <h2 id="productModalTitle">${safe(p.name)}</h2>
        <p>${safe(p.description)}</p>
        <span class="product-price">${safe(p.price)}</span>
        <div class="modal-actions">
          <a class="button button-primary" href="${safe(site.brand.orderGeneral)}" target="_blank" rel="noopener">Fazer pedido</a>
          <a class="button" href="${wa(primaryUnit().phone,`Olá! Vim pelo Cardápio Premium Pai D’Égua e quero saber mais sobre ${p.name}.`)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
        <p><small>Preços, adicionais e disponibilidade devem ser confirmados no pedido oficial.</small></p>
      </div>
    </div>`;
  dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.querySelector('[data-close-product]')?.focus();
}

function closeProduct(){
  const dialog = $('#productModal');
  if(dialog?.open) dialog.close();
  document.body.classList.remove('modal-open');
  lastFocused?.focus?.();
}

function renderPromos(){
  const promos = site.promotions || [];
  const today = new Date().getDay();
  let active = promos.some(p=>p.day===today) ? today : (promos[0]?.day ?? 1);
  const tabs = $('#promoTabs');
  const grid = $('#promoGrid');
  if(!tabs || !grid) return;
  tabs.innerHTML = promos.map(p=>`<button type="button" role="tab" data-day="${p.day}">${safe(p.weekday)}</button>`).join('');
  function draw(){
    const current = promos.find(p=>p.day===active) || promos[0];
    $('#todayPromoTitle').textContent = `${active===today?'Hoje: ':''}${current.title}`;
    $('#todayPromoDescription').textContent = current.description;
    grid.innerHTML = promos.map(p=>`
      <article class="promo-card ${p.day===active?'active':''}">
        <span class="day">${safe(p.weekday)}</span>
        <h3>${safe(p.title)}</h3>
        <p>${safe(p.description)}</p>
        <small>${safe(p.note)}</small>
      </article>`).join('');
    $$('button',tabs).forEach(b=>{
      const on = Number(b.dataset.day)===active;
      b.classList.toggle('active',on);
      b.setAttribute('aria-selected',String(on));
    });
  }
  tabs.addEventListener('click',e=>{
    const button = e.target.closest('[data-day]');
    if(!button) return;
    active = Number(button.dataset.day);
    draw();
  });
  draw();
}

function renderUnits(){
  const grid = $('#unitGrid');
  const select = $('#eventUnit');
  if(!grid || !select) return;
  grid.innerHTML = site.units.map(u=>`
    <article class="unit-card reveal">
      <header><span>📍</span><strong>${safe(u.phoneDisplay)}</strong></header>
      <h3>${safe(u.name)}</h3>
      <address>${safe(u.address)}</address>
      ${u.confirmedAddress===false ? '<p class="unit-note">Localização resumida: confirme o endereço antes de sair.</p>' : ''}
      <div class="unit-services">${u.services.map(s=>`<span>${safe(s)}</span>`).join('')}</div>
      <div class="unit-actions">
        <a class="button button-primary" href="${wa(u.phone,`Olá! Vim pelo Cardápio Premium Pai D’Égua e quero atendimento da ${u.name}.`)}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="button" href="${safe(u.maps)}" target="_blank" rel="noopener">Como chegar</a>
      </div>
    </article>`).join('');
  select.innerHTML = site.units.map(u=>`<option value="${safe(u.id)}">${safe(u.name)}</option>`).join('');
}

function bindShare(){
  $('#shareButton')?.addEventListener('click',async()=>{
    try{
      if(navigator.share){
        await navigator.share({title:'Pai D’Égua | Cardápio Premium',text:'Explore o Cardápio Premium Pai D’Égua',url:location.href});
      }else{
        await navigator.clipboard.writeText(location.href);
        toast('Link copiado');
      }
    }catch(_){ }
  });
}

function bindDialogs(){
  const productDialog = $('#productModal');
  const eventDialog = $('#eventModal');
  $('[data-close-product]')?.addEventListener('click',closeProduct);
  productDialog?.addEventListener('click',e=>{ if(e.target===productDialog) closeProduct(); });
  productDialog?.addEventListener('close',()=>document.body.classList.remove('modal-open'));

  $$('[data-open-event]').forEach(btn=>btn.addEventListener('click',()=>{
    lastFocused = btn;
    eventDialog.showModal();
    document.body.classList.add('modal-open');
    eventDialog.querySelector('input')?.focus();
  }));
  $('[data-close-event]')?.addEventListener('click',()=>eventDialog?.close());
  eventDialog?.addEventListener('click',e=>{ if(e.target===eventDialog) eventDialog.close(); });
  eventDialog?.addEventListener('close',()=>{ document.body.classList.remove('modal-open'); lastFocused?.focus?.(); });
  [productDialog,eventDialog].forEach(dialog=>dialog?.addEventListener('keydown',trapFocus));
}

function trapFocus(e){
  if(e.key!=='Tab') return;
  const focusable = $$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',e.currentTarget).filter(el=>!el.disabled);
  if(!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
}

function bindEventForm(){
  $('#eventForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const unit = site.units.find(u=>u.id===form.get('unit')) || primaryUnit();
    const msg = `Olá! Vim pelo Cardápio Premium Pai D’Égua e quero planejar um evento.\n\nNome: ${form.get('name')}\nTelefone: ${form.get('phone')}\nData: ${form.get('date')}\nPessoas: ${form.get('people')}\nTipo: ${form.get('type')}\nUnidade: ${unit.name}\nObservações: ${form.get('notes') || 'Não informadas'}`;
    window.open(wa(unit.phone,msg),'_blank','noopener');
  });
}

function bindAssistant(){
  const panel = $('#assistantPanel');
  const input = $('#assistantInput');
  const open = ()=>{ panel.hidden = false; input?.focus(); document.body.classList.add('assistant-open'); };
  const close = ()=>{ panel.hidden = true; document.body.classList.remove('assistant-open'); };
  $('#assistantFab')?.addEventListener('click',open);
  $('#assistantOpen')?.addEventListener('click',open);
  $$('[data-open-assistant]').forEach(el=>el.addEventListener('click',open));
  $('#assistantClose')?.addEventListener('click',close);
  const quick = ['Quero pedir','Promoção de hoje','Ver unidades','Quero um burger','Planejar evento','Pizza Express'];
  $('#quickReplies').innerHTML = quick.map(q=>`<button type="button">${q}</button>`).join('');
  $('#quickReplies')?.addEventListener('click',e=>{ if(e.target.matches('button')) ask(e.target.textContent); });
  $('#assistantForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const q = input.value.trim();
    if(!q) return;
    input.value = '';
    ask(q);
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && !panel.hidden) close(); });
}

async function ask(question){
  addMessage(question,'user');
  addMessage('Pensando…','bot',true);
  let answer;
  try{
    const res = await fetch('/.netlify/functions/assistant',{
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({message:question})
    });
    if(res.ok) answer = (await res.json()).answer;
  }catch(_){ }
  if(!answer) answer = localAnswer(question);
  $('.assistant-message.typing')?.remove();
  addMessage(answer,'bot');
}

function localAnswer(q){
  const t = q.toLowerCase();
  if(/pedido|pedir|delivery|anota/.test(t)) return 'Use o botão “Pedir agora” para abrir o canal oficial. Nele você confirma disponibilidade, adicionais e valores atualizados.';
  if(/promo/.test(t)){
    const promo = site.promotions.find(x=>x.day===new Date().getDay());
    return promo ? `${promo.title}: ${promo.description}\n${promo.note}` : 'As promoções vão de segunda a sexta e devem ser confirmadas no canal oficial.';
  }
  if(/mapa|chegar|unidade|endereço/.test(t)) return site.units.map(u=>`${u.name}: ${u.address} — ${u.phoneDisplay}`).join('\n');
  if(/evento|anivers|confratern/.test(t)) return 'Toque em “Planejar meu evento” para enviar data, quantidade de pessoas e unidade pelo WhatsApp.';
  if(/burger|hambúrg/.test(t)) return 'Temos Burger Pai D’Égua, Smash Burgers e Burgers Artesanais. Comece pela seção Burgers e depois abra os detalhes do sabor que chamou sua atenção.';
  if(/express|5 minuto|rápid/.test(t)) return 'A Pizza Express trabalha com sabor exclusivo do dia e retirada aproximada em 5 minutos. Confirme sabor e disponibilidade com a unidade.';
  return 'Posso ajudar com pedidos, promoções, unidades, mapa, Pizza Express, eventos e seções do cardápio. Se quiser, posso te guiar agora.';
}

function addMessage(text,type,typing=false){
  const el = document.createElement('div');
  el.className = `assistant-message ${type}${typing ? ' typing' : ''}`;
  el.textContent = text;
  $('#assistantMessages').appendChild(el);
  $('#assistantMessages').scrollTop = $('#assistantMessages').scrollHeight;
}

function bindEasterEgg(){
  let taps=0, timer=0;
  $('#footerLogo')?.addEventListener('click',()=>{
    taps += 1;
    clearTimeout(timer);
    timer = setTimeout(()=>taps=0,1300);
    if(taps >= 5){ taps = 0; runEasterEgg(); }
  });
}

function runEasterEgg(){
  const box = $('#easterEgg');
  const canvas = $('#easterCanvas');
  const ctx = canvas.getContext('2d');
  box.hidden = false;
  const dpr = Math.min(window.devicePixelRatio || 1,2);
  canvas.width = innerWidth*dpr; canvas.height = innerHeight*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const particles = Array.from({length:110},()=>({
    x: innerWidth/2 + (Math.random()-.5)*220,
    y: innerHeight/2 + (Math.random()-.5)*120,
    vx:(Math.random()-.5)*2,
    vy:(Math.random()-.5)*2,
    a:1
  }));
  const start = performance.now();
  function frame(t){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.a -= .006;
      ctx.fillStyle = `rgba(255,190,70,${Math.max(0,p.a)})`;
      ctx.fillRect(p.x,p.y,3,3);
    });
    if(t-start<2000) requestAnimationFrame(frame);
    else box.hidden = true;
  }
  requestAnimationFrame(frame);
  setTimeout(()=>box.hidden=true,2400);
}

function bindNavigation(){
  document.addEventListener('click',e=>{
    const link = e.target.closest('a[href^="#"]');
    if(!link) return;
    const href = link.getAttribute('href');
    if(!href || href==='#') return;
    const target = document.querySelector(href);
    if(!target) return;
    e.preventDefault();
    target.scrollIntoView({behavior:'smooth',block:'start'});
    history.replaceState(null,'',href);
  });
}

function toast(text){
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  $('#toastRegion').appendChild(el);
  setTimeout(()=>el.remove(),2200);
}

function registerSW(){
  if(!('serviceWorker' in navigator)) return;
  addEventListener('load',async()=>{
    try{
      const registration = await navigator.serviceWorker.register('sw.js?v=20260731-final4',{updateViaCache:'none'});
      await registration.update();
    }catch(_){ }
  });
}

load().catch(err=>{
  console.error(err);
  document.body.insertAdjacentHTML('afterbegin','<div class="noscript">Não foi possível carregar o cardápio. Atualize a página.</div>');
});

})();
