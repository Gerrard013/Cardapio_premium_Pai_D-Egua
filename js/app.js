(() => {
  'use strict';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const FALLBACK_PRICE = 'Consulte no pedido oficial';
  const FALLBACK_DESCRIPTION = 'Confira os detalhes e a disponibilidade no pedido oficial.';
  const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  function renderMenuSections(){
    const primary=$('#menu-sections-primary');
    const secondary=$('#menu-sections-secondary');
    if((!primary && !secondary) || !Array.isArray(window.PAIDEGUA_MENU)) return;
    const primaryFrag=document.createDocumentFragment();
    const secondaryFrag=document.createDocumentFragment();
    window.PAIDEGUA_MENU.forEach((section,sectionIndex)=>{
      const el=document.createElement('section');
      el.className=`menu-section menu-section--${escapeHTML(section.id)}`;
      el.id=section.id;
      el.dataset.theme=section.theme;
      const categoryLabel=section.categoryLabel||`${section.items.length} opções`;
      el.innerHTML=`<div class="menu-section__inner"><div class="menu-section__meta reveal"><span>${escapeHTML(categoryLabel)}</span><strong>${section.items.length} ${section.items.length===1?'opção':'opções'}</strong></div><div class="section-heading reveal"><p class="eyebrow">${escapeHTML(section.eyebrow)}</p><h2>${escapeHTML(section.title)}</h2><p>${escapeHTML(section.subtitle)}</p></div><div class="product-grid" data-grid></div>${section.items.length>section.initial?`<button class="button button--glass expand-button" type="button" data-expand aria-expanded="false">Ver todos</button>`:''}</div>`;
      const grid=$('[data-grid]',el);
      section.items.forEach((item,index)=>{
        const card=document.createElement('article');
        const isContain=section.contain || /vinho|chopp|água|fanta|guaraná|sprite|heineken|red bull|h2oh|ice/i.test(item.name);
        card.className=`product-card reveal${isContain?' product-card--contain':''}`;
        card.style.setProperty('--float-duration',`${(5.6+((index+sectionIndex)%5)*.45).toFixed(2)}s`);
        card.style.setProperty('--float-delay',`${(-((index+sectionIndex)%7)*.62).toFixed(2)}s`);
        Object.assign(card.dataset,{openProduct:'',name:item.name,image:item.image,price:item.price||FALLBACK_PRICE,description:item.description||FALLBACK_DESCRIPTION});
        const isInitiallyVisible=index<section.initial;
        if(!isInitiallyVisible) card.hidden=true;
        const imageAttr=isInitiallyVisible?`src="${escapeHTML(item.image)}"`:`data-src="${escapeHTML(item.image)}"`;
        card.innerHTML=`<div class="product-card__media"><img ${imageAttr} alt="${escapeHTML(item.name)}" loading="lazy" decoding="async" fetchpriority="low"></div><div class="product-card__content">${item.badge?`<span class="product-card__badge">${escapeHTML(item.badge)}</span>`:''}<small>${escapeHTML(section.title)}</small><h3>${escapeHTML(item.name)}</h3><strong class="product-card__price">${escapeHTML(item.price||FALLBACK_PRICE)}</strong><span class="product-card__action">Ver detalhes</span></div>`;
        grid.append(card);
      });
      (section.placement==='primary'?primaryFrag:secondaryFrag).append(el);
    });
    primary?.replaceChildren(primaryFrag);
    secondary?.replaceChildren(secondaryFrag);
  }

  function initImageFallbacks(){
    const attach=img=>{
      if(img.dataset.fallbackReady) return;
      img.dataset.fallbackReady='1';
      const fail=()=>{
        const wrapper=img.closest('.product-card__media,.product-dialog__stage,.highlight-card,.story-card__media,.happy-hour__media')||img.parentElement;
        if(!wrapper || wrapper.classList.contains('image-fallback')) return;
        wrapper.classList.add('image-fallback'); img.hidden=true;
        const fallback=document.createElement('div'); fallback.className='image-fallback__content'; fallback.innerHTML='<img src="assets/brand/logo-pizza-official.png" alt="" aria-hidden="true"><span>Imagem em atualização</span>';
        wrapper.append(fallback);
      };
      img.addEventListener('error',fail,{once:true});
      if(img.getAttribute('src') && img.complete && img.naturalWidth===0) fail();
    };
    $$('img').forEach(attach);
    new MutationObserver(mutations=>mutations.forEach(m=>m.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.('img'))attach(node);node.querySelectorAll?.('img').forEach(attach);}))).observe(document.body,{childList:true,subtree:true});
  }

  function initIntro(){
    const intro=$('#intro'); if(!intro)return;
    const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    const hide=()=>{intro.classList.add('is-hidden');setTimeout(()=>intro.remove(),300);};
    if(sessionStorage.getItem('paidegua-intro-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches||connection?.saveData||/2g/.test(connection?.effectiveType||'')){intro.remove();return;}
    sessionStorage.setItem('paidegua-intro-seen','1'); $('[data-skip-intro]',intro)?.addEventListener('click',hide);
    intro.classList.add('is-primed'); setTimeout(()=>intro.classList.add('is-breaking'),220); setTimeout(hide,780);
  }

  function initNav(){
    const toggle=$('.menu-toggle'),panel=$('.menu-panel');
    const close=()=>{toggle?.setAttribute('aria-expanded','false');panel?.classList.remove('is-open');};
    toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));panel?.classList.toggle('is-open',!open);});
    $$('.main-nav a,.menu-panel .button').forEach(el=>el.addEventListener('click',close));
    document.addEventListener('click',e=>{if(panel?.classList.contains('is-open')&&!panel.contains(e.target)&&!toggle?.contains(e.target))close();});
    const anchors=$$('.main-nav a[href^="#"]');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)anchors.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+entry.target.id));}),{rootMargin:'-38% 0px -56% 0px'});
    anchors.map(a=>$(a.getAttribute('href'))).filter(Boolean).forEach(section=>observer.observe(section));
  }

  function initCardMotion(){
    if(!matchMedia('(hover:hover) and (pointer:fine)').matches || innerWidth<900 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('.product-card,.highlight-card,.service-card,.event-card,.order-card,.story-card,.unit-card,.promo-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--rx',`${(-py*7).toFixed(2)}deg`);card.style.setProperty('--ry',`${(px*8).toFixed(2)}deg`);card.style.setProperty('--mx',`${(px*10).toFixed(1)}px`);card.style.setProperty('--my',`${(py*10).toFixed(1)}px`);});
      card.addEventListener('pointerleave',()=>['--rx','--ry','--mx','--my'].forEach(p=>card.style.removeProperty(p)));
    });
  }

  function initReveal(){
    if(!('IntersectionObserver' in window)){$$('.reveal,.product-card').forEach(el=>el.classList.add('is-visible'));return null;}
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}}),{rootMargin:'0px 0px -8% 0px',threshold:.06});
    $$('.reveal,.product-card').forEach(el=>io.observe(el)); return io;
  }

  function initExpand(io){
    $$('[data-expand]').forEach(btn=>btn.addEventListener('click',()=>{const section=btn.closest('.menu-section'),expanded=btn.getAttribute('aria-expanded')==='true';if(expanded){const initial=window.PAIDEGUA_MENU.find(s=>s.id===section.id)?.initial||4;$$('.product-card',section).forEach((card,index)=>{if(index>=initial)card.hidden=true;});btn.textContent='Ver todos';btn.setAttribute('aria-expanded','false');section.scrollIntoView({behavior:'smooth',block:'start'});}else{$$('.product-card[hidden]',section).forEach(card=>{const img=$('img[data-src]',card);if(img){img.src=img.dataset.src;img.removeAttribute('data-src');}card.hidden=false;io?.observe(card);requestAnimationFrame(()=>card.classList.add('is-visible'));});btn.textContent='Mostrar menos';btn.setAttribute('aria-expanded','true');}}));
  }

  function initProductDialog(){
    const dialog=$('#product-dialog'); if(!dialog)return;
    const image=$('img',dialog),title=$('h2',dialog),price=$('[data-dialog-price]',dialog),description=$('[data-dialog-description]',dialog);
    document.addEventListener('click',e=>{const card=e.target.closest('[data-open-product]');if(!card)return;const stage=image.closest('.product-dialog__stage');stage?.classList.remove('image-fallback');stage?.querySelector('.image-fallback__content')?.remove();image.hidden=false;image.src=card.dataset.image;image.alt=card.dataset.name;title.textContent=card.dataset.name;price.textContent=card.dataset.price||FALLBACK_PRICE;description.textContent=card.dataset.description||FALLBACK_DESCRIPTION;dialog.showModal();document.body.classList.add('no-scroll');});
    const close=()=>{if(dialog.open)dialog.close();document.body.classList.remove('no-scroll');image.removeAttribute('src');};
    $('.product-dialog__close',dialog)?.addEventListener('click',close); dialog.addEventListener('cancel',e=>{e.preventDefault();close();}); dialog.addEventListener('click',e=>{if(e.target===dialog)close();}); dialog.addEventListener('close',()=>document.body.classList.remove('no-scroll'));
  }

  function initOrderChoice(){
    const dialog=$('#order-choice-dialog'); if(!dialog)return;
    const guidance=$('[data-salon-guidance]',dialog);
    const open=()=>{guidance.hidden=true;dialog.showModal();document.body.classList.add('no-scroll');};
    const close=()=>{if(dialog.open)dialog.close();document.body.classList.remove('no-scroll');};
    $$('[data-order-choice]').forEach(btn=>btn.addEventListener('click',open));
    $('[data-close-order]',dialog)?.addEventListener('click',close);
    $('[data-salon-choice]',dialog)?.addEventListener('click',()=>{guidance.hidden=false;guidance.scrollIntoView({behavior:'smooth',block:'nearest'});});
    $('[data-delivery-choice]',dialog)?.addEventListener('click',close);
    dialog.addEventListener('cancel',e=>{e.preventDefault();close();}); dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  }

  function initAssistant(){
    const trigger=$('.assistant-trigger'),panel=$('#assistant-panel'),closeBtn=$('[data-close-assistant]'),form=$('.assistant-form'),input=$('#assistant-input'),messages=$('.assistant-messages'); if(!trigger||!panel)return;
    const setOpen=open=>{panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)setTimeout(()=>input?.focus(),60);};
    trigger.addEventListener('click',()=>setOpen(panel.hidden));closeBtn?.addEventListener('click',()=>setOpen(false));
    const add=(text,type)=>{const div=document.createElement('div');div.className=`assistant-message assistant-message--${type}`;div.innerHTML=text;messages.append(div);messages.scrollTop=messages.scrollHeight;};
    const answer=q=>{const s=q.toLowerCase();
      if(/atum/.test(s))return 'A pizza de Atum foi retirada do catálogo atual. Veja as <a href="#pizzas">31 pizzas oficiais</a> disponíveis.';
      if(/açaí|acai/.test(s)&&/burger|hamb/.test(s))return 'O <strong>Burger Pai D’Égua: Açaí</strong> é carro-chefe: pão brioche, blend de 160 g, queijo do Marajó, charque de primeira e maionese de açaí. Veja em <a href="#burgers">Burgers</a>.';
      if(/massa|penne|farfalle|bavette|mignon/.test(s))return 'Temos cinco opções na seção <a href="#massas">Massas</a>, incluindo Monte sua Massa, Farfalle de Camarão, Mignon ao Penne, Bavette à Parisiense e Penne com Calabresa e Bacon.';
      if(/entrada|camarão empanado|bolinho|pastel|macaxeira|batata/.test(s))return 'Veja as porções na seção <a href="#entradas">Entradas</a>. Valores não confirmados aparecem como “Consulte no pedido oficial”.';
      if(/delivery|retirada normal|tempo de preparo|fila|quero pedir agora/.test(s))return 'No delivery e na retirada você encontra o cardápio completo. Vá para <a href="#pedido">Pedido oficial</a> e escolha sua unidade.';
      if(/promo|segunda|terça|terca|quarta|quinta|sexta|happy hour/.test(s))return 'As promoções atualizadas estão em <a href="#promocoes">Promoções</a>: segunda Pague M, Leve G; terça da Sobremesa; quarta Combo Família; quinta das Bordas; sexta do Buteco. Confirme disponibilidade no canal oficial.';
      if(/unidade|onde|endereço|endereco|mapa|coqueiro|batista/.test(s))return 'Coqueiro: Tv. We 6 Cj Satélite, 454 - Coqueiro, Belém - PA, 66670-420, Brasil. Batista Campos: R. dos Mundurucus, 1427 - Batista Campos, Belém - PA, 66033-716. Abra <a href="#unidades">Unidades</a> para rota, pedido e WhatsApp correto.';
      if(/pizza express|express|rápida|rapida/.test(s))return 'A Pizza Express tem retirada rápida e sabor do dia. Consulte a equipe antes de sair.';
      if(/evento|anivers|confratern|família|familia|bolo|roleta/.test(s))return 'Veja <a href="#eventos">Eventos</a>: há opções para grupos, Mesa do Bolo de segunda a quinta por R$ 49,90 e campanha de aniversariantes com avaliação e roleta. Confirme regras e disponibilidade na unidade.';
      if(/burger|hamb|smash/.test(s))return 'Conheça as assinaturas paraenses, artesanais e smash em <a href="#burgers">Burgers</a>.';
      if(/pizza|sabor/.test(s))return 'As pizzas estão separadas em quatro categorias a partir de <a href="#pizzas">Pizzas Tradicionais</a>, com 31 sabores oficiais. Toque em um card para ver ingredientes e preço confirmado.';
      if(/vinho|chopp/.test(s))return 'Veja as opções em <a href="#vinhos-chopp">Vinhos & chopp</a>.';
      if(/suco|tapereb|cupua|muruci|acerola|graviola/.test(s))return 'Os sabores de frutas estão em <a href="#sucos">Sucos</a>.';
      if(/pedido|comprar|valor|preço|preco/.test(s))return 'Os valores atualizados ficam no <a href="#pedido">Pedido oficial</a>. Quando o preço não está confirmado no material, o card orienta consultar a unidade.';
      if(/instagram|insta|rede social|gtech/.test(s))return 'A história de Rute e Cley e os perfis oficiais estão em <a href="#historia">Responsáveis por essa história</a>. O crédito da G Tech fica discretamente no rodapé.';
      if(/whatsapp|dúvida|duvida|falar/.test(s))return 'Abra <a href="#unidades">Unidades</a> e escolha Coqueiro ou Batista Campos para falar no WhatsApp correto.';
      return 'Posso ajudar com pizzas, burgers, entradas, massas, bebidas, promoções, eventos, unidades e pedido oficial.';};
    const send=q=>{q=q.trim();if(!q)return;add(escapeHTML(q),'user');setTimeout(()=>add(answer(q),'bot'),220);};
    form?.addEventListener('submit',e=>{e.preventDefault();const q=input.value;input.value='';send(q);});$$('.assistant-chips button').forEach(btn=>btn.addEventListener('click',()=>send(btn.textContent)));messages?.addEventListener('click',e=>{if(e.target.matches('a[href^="#"]'))setOpen(false);});
  }

  function initSmoothAnchors(){document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const href=a.getAttribute('href');if(href==='#')return;const target=$(href);if(!target)return;e.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});history.replaceState(null,'',href);});}
  function initServiceWorker(){if('serviceWorker' in navigator && location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js?v=20260813-final-cley-rute-v1').catch(err=>console.warn('Service worker não registrado:',err)));}

  document.addEventListener('DOMContentLoaded',()=>{renderMenuSections();initImageFallbacks();initIntro();initNav();initSmoothAnchors();const io=initReveal();initExpand(io);initProductDialog();initOrderChoice();initAssistant();initCardMotion();initServiceWorker();});
})();
