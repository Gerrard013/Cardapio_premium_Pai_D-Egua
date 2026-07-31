(() => {
  'use strict';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const PHONE = '5591982064743';
  const FALLBACK_PRICE = 'Consulte no pedido oficial';
  const FALLBACK_DESCRIPTION = 'Confira os detalhes e a disponibilidade no pedido oficial.';

  function renderMenuSections(){
    const host=$('#menu-sections');
    const frag=document.createDocumentFragment();
    window.PAIDEGUA_MENU.forEach(section=>{
      const el=document.createElement('section');
      el.className='menu-section';
      el.id=section.id;
      el.dataset.theme=section.theme;
      el.innerHTML=`<div class="menu-section__inner">
        <div class="section-heading reveal"><p class="eyebrow">${section.eyebrow}</p><h2>${section.title}</h2><p>${section.subtitle}</p></div>
        <div class="product-grid" data-grid></div>
        ${section.items.length>section.initial?`<button class="button button--glass expand-button" type="button" data-expand aria-expanded="false">Ver todos</button>`:''}
      </div>`;
      const grid=$('[data-grid]',el);
      section.items.forEach((item,index)=>{
        const card=document.createElement('article');
        const isContain=section.contain || /vinho|chopp|água|fanta|guaraná|sprite|heineken|red bull|h2oh|ice/i.test(item.name);
        card.className=`product-card reveal${isContain?' product-card--contain':''}`;
        card.dataset.openProduct=''; card.dataset.name=item.name; card.dataset.image=item.image;
        card.dataset.price=item.price||FALLBACK_PRICE; card.dataset.description=item.description||FALLBACK_DESCRIPTION;
        if(index>=section.initial) card.hidden=true;
        card.innerHTML=`<div class="product-card__media"><img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async"></div><div class="product-card__content"><small>${section.title}</small><h3>${item.name}</h3><strong class="product-card__price">${item.price||FALLBACK_PRICE}</strong><span class="product-card__action">Ver detalhes</span></div>`;
        grid.append(card);
      });
      frag.append(el);
    });
    host.append(frag);
  }

  function initIntro(){
    const intro=$('#intro');
    if(!intro) return;
    const hide=()=>{intro.classList.add('is-hidden');setTimeout(()=>intro.remove(),800);};
    if(sessionStorage.getItem('paidegua-intro-seen') || matchMedia('(prefers-reduced-motion: reduce)').matches){intro.remove();return;}
    sessionStorage.setItem('paidegua-intro-seen','1');
    $('[data-skip-intro]',intro)?.addEventListener('click',hide);
    intro.classList.add('is-primed'); setTimeout(()=>intro.classList.add('is-breaking'), 1050); setTimeout(hide,3600);
  }

  function initNav(){
    const toggle=$('.menu-toggle'),panel=$('.menu-panel');
    const close=()=>{toggle?.setAttribute('aria-expanded','false');panel?.classList.remove('is-open');};
    toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));panel.classList.toggle('is-open',!open);});
    $$('.main-nav a, .menu-panel .button').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('click',e=>{if(panel?.classList.contains('is-open')&&!panel.contains(e.target)&&!toggle.contains(e.target))close();});
    const anchors=$$('.main-nav a[href^="#"]');
    const sections=anchors.map(a=>$(a.getAttribute('href'))).filter(Boolean);
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){anchors.forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')==='#'+entry.target.id));}})},{rootMargin:'-38% 0px -56% 0px',threshold:0});
    sections.forEach(s=>observer.observe(s));
  }

  function initCardMotion(){
    const cards=$$('.product-card,.highlight-card,.service-card,.event-card,.order-card,.social-card,.unit-card,.promo-card');
    const active = matchMedia('(hover:hover)').matches;
    cards.forEach(card=>{
      if(active){
        card.addEventListener('pointermove',e=>{
          const r=card.getBoundingClientRect();
          const px=(e.clientX-r.left)/r.width-.5;
          const py=(e.clientY-r.top)/r.height-.5;
          card.style.setProperty('--rx', `${(-py*10).toFixed(2)}deg`);
          card.style.setProperty('--ry', `${(px*12).toFixed(2)}deg`);
          card.style.setProperty('--mx', `${(px*18).toFixed(1)}px`);
          card.style.setProperty('--my', `${(py*18).toFixed(1)}px`);
        });
        card.addEventListener('pointerleave',()=>{
          card.style.setProperty('--rx','0deg');
          card.style.setProperty('--ry','0deg');
          card.style.setProperty('--mx','0px');
          card.style.setProperty('--my','0px');
        });
      }
    });
    const onScroll=()=>{
      const vh=window.innerHeight||1;
      cards.forEach(card=>{
        const r=card.getBoundingClientRect();
        const center = r.top + r.height/2;
        const diff = (center - vh/2)/(vh/2);
        const clamp = Math.max(-1, Math.min(1, diff));
        card.style.setProperty('--scroll-shift', `${(-clamp*16).toFixed(2)}px`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
  }

  function initReveal(){
    const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    $$('.reveal,.product-card').forEach(el=>io.observe(el));
    return io;
  }

  function initExpand(io){
    $$('[data-expand]').forEach(btn=>btn.addEventListener('click',()=>{
      const section=btn.closest('.menu-section');
      const hidden=$$('.product-card[hidden]',section);
      const expanded=btn.getAttribute('aria-expanded')==='true';
      if(expanded){
        const initial=window.PAIDEGUA_MENU.find(s=>s.id===section.id)?.initial||4;
        $$('.product-card',section).forEach((card,index)=>{if(index>=initial)card.hidden=true;});
        btn.textContent='Ver todos';btn.setAttribute('aria-expanded','false');
        section.scrollIntoView({behavior:'smooth',block:'start'});
      }else{
        hidden.forEach(card=>{card.hidden=false;io.observe(card);});
        btn.textContent='Mostrar menos';btn.setAttribute('aria-expanded','true');
      }
    }));
  }

  function initProductDialog(){
    const dialog=$('#product-dialog'); if(!dialog) return;
    const image=$('img',dialog),title=$('h2',dialog),price=$('[data-dialog-price]',dialog),description=$('[data-dialog-description]',dialog);
    document.addEventListener('click',e=>{
      const card=e.target.closest('[data-open-product]'); if(!card) return;
      const name=card.dataset.name,imageSrc=card.dataset.image;
      image.src=imageSrc; image.alt=name; title.textContent=name;
      price.textContent=card.dataset.price||FALLBACK_PRICE;
      description.textContent=card.dataset.description||FALLBACK_DESCRIPTION;
      dialog.showModal(); document.body.classList.add('no-scroll');
    });
    const close=()=>{dialog.close();document.body.classList.remove('no-scroll');image.src='';};
    $('.product-dialog__close',dialog).addEventListener('click',close);
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
    dialog.addEventListener('close',()=>document.body.classList.remove('no-scroll'));
  }

  function initAssistant(){
    const trigger=$('.assistant-trigger'),panel=$('#assistant-panel'),closeBtn=$('[data-close-assistant]'),form=$('.assistant-form'),input=$('#assistant-input'),messages=$('.assistant-messages');
    if(!trigger||!panel) return;
    const setOpen=open=>{panel.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)setTimeout(()=>input.focus(),60);};
    trigger.addEventListener('click',()=>setOpen(panel.hidden)); closeBtn.addEventListener('click',()=>setOpen(false));
    const add=(text,type)=>{const div=document.createElement('div');div.className=`assistant-message assistant-message--${type}`;div.innerHTML=text;messages.append(div);messages.scrollTop=messages.scrollHeight;};
    const answer=q=>{
      const s=q.toLowerCase();
      if(/delivery|retirada normal|tempo de preparo|fila|quero pedir agora/.test(s)) return 'Perfeito! No delivery e na retirada normal você encontra o cardápio completo e as promoções exclusivas. A retirada normal tem preparo médio de 20 a 30 minutos e entra na fila de produção. Vá direto para <a href="#pedido">Pedido oficial</a> e escolha sua unidade.';
      if(/promo|segunda|terça|terca|quarta|quinta|sexta|happy hour|promoções de hoje/.test(s)) return 'Tem promoção boa te esperando! Veja a seção <a href="#promocoes">Promoções</a> para conferir as ofertas do delivery e retirada, além do Happy Hour exclusivo do salão. Antes de finalizar, confirme a disponibilidade na sua unidade.';
      if(/unidade|onde|endereço|endereco|mapa|coqueiro|batista/.test(s)) return 'Temos as unidades Coqueiro e Batista Campos. Abra a seção <a href="#unidades">Unidades</a> para iniciar a rota no Google Maps.';
      if(/pizza express|express|rápida|rapida/.test(s)) return 'A Pizza Express é ideal para quem quer praticidade: retirada em 5 minutos, com um sabor exclusivo por dia. Consulte o sabor do dia e a disponibilidade com a equipe antes de sair.';
      if(/evento|anivers|confratern|família|familia|fazer evento/.test(s)) return 'Ótima escolha! A Pai D’Égua também é o lugar certo para aniversários, encontros em família e confraternizações. Veja a seção <a href="#eventos">Eventos</a> e fale com a equipe para montar a melhor opção.';
      if(/burger|hamb|smash|quero um burger/.test(s)) return 'Se você quer um burger de respeito, vá para a seção <a href="#burgers">Burgers</a>. Lá estão as assinaturas paraenses, os artesanais e os smash mais desejados.';
      if(/pizza|sabor/.test(s)) return 'A seção <a href="#pizzas">Pizzas</a> reúne os sabores em destaque da Pai D’Égua. Toque em qualquer produto para ver melhor e comparar antes de pedir.';
      if(/vinho|chopp/.test(s)) return 'A seleção de <a href="#vinhos-chopp">Vinhos & chopp</a> inclui vinho italiano, opções nacionais e importadas, chopp e chopp de vinho.';
      if(/suco|tapereb|cupua|muruci|acerola|graviola/.test(s)) return 'Os sabores de frutas estão em <a href="#sucos">Sucos</a>, com opções em copo, jarra e integrais.';
      if(/pedido|comprar|valor|preço|preco/.test(s)) return 'Para ver valores atualizados e finalizar com segurança, abra a seção <a href="#pedido">Pedido oficial</a>, escolha sua unidade e continue pelo Anota Aí.';
      if(/instagram|insta|rede social|gtech|burger/.test(s)) return 'Acesse a seção <a href="#instagram">Instagram</a> para acompanhar @pizzariapaidegua16, @paidegua.burger e @gtech_brasil.';
      if(/whatsapp|dúvida|duvida|falar/.test(s)) return `Para falar com a equipe, <a href="https://wa.me/${PHONE}?text=${encodeURIComponent('Olá! Vim pelo Cardápio Premium Pai D\'Égua e preciso de ajuda.')}" target="_blank" rel="noopener">abra o WhatsApp</a>.`;
      return 'Posso te ajudar com pizzas, burgers, bebidas, promoções, eventos, unidades e pedido oficial. É só tocar em uma opção ou escrever sua dúvida.';
    };
    const send=q=>{q=q.trim();if(!q)return;add(q,'user');setTimeout(()=>add(answer(q),'bot'),260);};
    form.addEventListener('submit',e=>{e.preventDefault();const q=input.value;input.value='';send(q);});
    $$('.assistant-chips button').forEach(btn=>btn.addEventListener('click',()=>send(btn.textContent)));
    messages.addEventListener('click',e=>{if(e.target.matches('a[href^="#"]'))setOpen(false);});
  }

  function initSmoothAnchors(){
    document.addEventListener('click',e=>{
      const a=e.target.closest('a[href^="#"]'); if(!a) return;
      const target=$(a.getAttribute('href')); if(!target) return;
      e.preventDefault(); target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); history.replaceState(null,'',a.getAttribute('href'));
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    renderMenuSections();
    initIntro();initNav();initSmoothAnchors();
    const io=initReveal();initExpand(io);initProductDialog();initAssistant();initCardMotion();
  });
})();
