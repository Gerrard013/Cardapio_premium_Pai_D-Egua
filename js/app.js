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
    setTimeout(hide,2350);
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
      if(/promo|segunda|terça|terca|quarta|quinta|sexta/.test(s)) return 'As promoções semanais estão na seção <a href="#promocoes">Promoções</a>. Confirme unidade, disponibilidade e regras no WhatsApp.';
      if(/unidade|onde|endereço|endereco|mapa|coqueiro|batista/.test(s)) return 'Temos as unidades Coqueiro e Batista Campos. Abra a seção <a href="#unidades">Unidades</a> para iniciar a rota no Google Maps.';
      if(/pizza express|express|rápida|rapida/.test(s)) return 'A Pizza Express é a opção de retirada rápida. Sabores, horário e disponibilidade devem ser confirmados com a equipe pelo WhatsApp.';
      if(/evento|anivers|confratern|família|familia/.test(s)) return 'Há opções para encontros em família, confraternizações e celebrações premium. Veja <a href="#eventos">Eventos</a> ou fale com a equipe para planejar.';
      if(/burger|hamb|smash/.test(s)) return 'Veja a vitrine de <a href="#burgers">Burgers</a>: assinaturas paraenses, artesanais e smash.';
      if(/pizza|sabor/.test(s)) return 'A seção <a href="#pizzas">Pizzas</a> reúne todos os sabores disponíveis nesta vitrine. Toque em qualquer produto para vê-lo de perto.';
      if(/vinho|chopp/.test(s)) return 'A seleção de <a href="#vinhos-chopp">Vinhos & chopp</a> inclui vinho italiano, opções nacionais e importadas, chopp e chopp de vinho.';
      if(/suco|tapereb|cupua|muruci|acerola|graviola/.test(s)) return 'Os sabores de frutas estão em <a href="#sucos">Sucos</a>, com opções em copo, jarra e integrais.';
      if(/pedido|comprar|valor|preço|preco/.test(s)) return 'Abra a seção <a href="#pedido">Pedido oficial</a>, escolha a unidade e veja os valores atualizados no Anota Aí.';
      if(/whatsapp|dúvida|duvida|falar/.test(s)) return `Para falar com a equipe, <a href="https://wa.me/${PHONE}?text=${encodeURIComponent('Olá! Vim pelo Cardápio Premium Pai D\'Égua e preciso de ajuda.')}" target="_blank" rel="noopener">abra o WhatsApp</a>.`;
      return 'Posso ajudar com pizzas, burgers, sucos, vinhos, promoções, eventos, unidades e pedidos. Escolha um desses assuntos ou escreva sua dúvida de outra forma.';
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
    const io=initReveal();initExpand(io);initProductDialog();initAssistant();
  });
})();
