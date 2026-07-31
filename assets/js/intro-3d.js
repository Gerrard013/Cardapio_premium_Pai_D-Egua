(()=>{
'use strict';
const stage=document.getElementById('introStage');
if(!stage)return;
const canvas=document.getElementById('introCanvas');
const ctx=canvas.getContext('2d',{alpha:true});
const logo=document.getElementById('introLogo');
const skip=document.getElementById('skipIntro');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=matchMedia('(max-width:760px)').matches;
let raf=0,done=false,particles=[];

function finish(){
  if(done)return;
  done=true;
  cancelAnimationFrame(raf);
  stage.classList.add('is-done');
  try{sessionStorage.setItem('paideguaIntroSeen','1')}catch(_){ }
  setTimeout(()=>stage.remove(),360);
}

try{
  if(sessionStorage.getItem('paideguaIntroSeen')==='1'){
    stage.remove();
    return;
  }
}catch(_){ }

function resize(){
  const dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(innerWidth*dpr);
  canvas.height=Math.round(innerHeight*dpr);
  canvas.style.width=innerWidth+'px';
  canvas.style.height=innerHeight+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function seed(){
  const total=reduced?0:(mobile?28:48);
  particles=Array.from({length:total},()=>({
    x:Math.random()*innerWidth,
    y:Math.random()*innerHeight,
    r:.4+Math.random()*1.3,
    a:.2+Math.random()*.5,
    vy:.03+Math.random()*.12
  }));
}

function burst(){
  if(reduced)return;
  const cx=innerWidth/2,cy=innerHeight/2;
  const total=mobile?65:110;
  for(let i=0;i<total;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=1.2+Math.random()*(mobile?4.6:6.2);
    particles.push({x:cx,y:cy,r:.8+Math.random()*2,a:1,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,burst:true,life:1});
  }
}

function draw(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(const p of particles){
    if(p.burst){p.x+=p.vx;p.y+=p.vy;p.vx*=.988;p.vy*=.988;p.life-=.025;p.a=Math.max(0,p.life);}
    else{p.y-=p.vy;if(p.y<0)p.y=innerHeight;}
    ctx.beginPath();
    ctx.fillStyle=`rgba(255,190,74,${Math.max(0,p.a)})`;
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  }
  particles=particles.filter(p=>!p.burst||p.life>0);
  raf=requestAnimationFrame(draw);
}

resize();seed();draw();
skip?.addEventListener('click',finish);
stage.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Enter')finish();});
addEventListener('resize',resize,{passive:true});
if(reduced){setTimeout(finish,350);}
else{
  setTimeout(()=>{logo.classList.add('is-bursting');burst();},mobile?900:1050);
  setTimeout(finish,mobile?1350:1550);
}
setTimeout(finish,1900);
})();
