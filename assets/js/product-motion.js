(()=>{
'use strict';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealOnce(selector){
  const elements = [...document.querySelectorAll(selector)];
  if(reduced){elements.forEach(el=>el.classList.add('visible','motion-active'));return;}
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      entry.target.classList.add('visible','motion-active');
      observer.unobserve(entry.target);
    });
  },{rootMargin:'0px 0px -8%',threshold:.08});
  elements.forEach(el=>observer.observe(el));
}

function navigationGroup(id){
  if(['burger-paidegua','smash','artesanal'].includes(id)) return 'burger-paidegua';
  if(['bebidas','sucos','vinhos'].includes(id)) return 'bebidas';
  if(id==='salada') return 'acompanhamentos';
  return id;
}

function initNav(){
  const links = [...document.querySelectorAll('.category-rail a,.desktop-nav a')];
  const sections = [...document.querySelectorAll('[data-nav-section]')];
  if(!links.length || !sections.length) return;
  const observer = new IntersectionObserver(entries=>{
    const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    const group = navigationGroup(visible.target.id);
    links.forEach(link=>{
      const active = link.getAttribute('href')===`#${group}`;
      link.toggleAttribute('aria-current',active);
      if(active && link.closest('.category-rail') && innerWidth<=760){
        link.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
      }
    });
  },{rootMargin:'-22% 0px -64%',threshold:[.05,.2,.45]});
  sections.forEach(section=>observer.observe(section));
}

function refresh(){
  revealOnce('.reveal,.product-card,.featured-card,.unit-card,.quick-action-card');
  initNav();
}

window.PaiDeguaMotion={refresh};
addEventListener('DOMContentLoaded',()=>{
  revealOnce('.reveal');
  initNav();
});
})();
