(()=>{'use strict';
const stage=document.getElementById('introStage');if(!stage)return;
const canvas=document.getElementById('introCanvas'),ctx=canvas.getContext('2d',{alpha:true}),logo=document.getElementById('introLogo'),skip=document.getElementById('skipIntro');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let raf=0,done=false,particles=[];
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*d);canvas.height=Math.round(innerHeight*d);canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(d,0,0,d,0,0)}
function seedBackground(){particles=Array.from({length:reduced?0:70},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.8+.3,a:Math.random()*.6+.2,v:Math.random()*.22+.04,burst:false}))}
function burst(){if(reduced)return;const cx=innerWidth/2,cy=innerHeight/2;for(let i=0;i<190;i++){const a=Math.random()*Math.PI*2,s=1.6+Math.random()*9;particles.push({x:cx+(Math.random()-.5)*120,y:cy+(Math.random()-.5)*70,r:.7+Math.random()*2.5,a:1,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,burst:true})}}
function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of particles){if(p.burst){p.x+=p.vx;p.y+=p.vy;p.vx*=.992;p.vy*=.992;p.life-=.018;p.a=Math.max(0,p.life)}else{p.y-=p.v;if(p.y<0)p.y=innerHeight;p.a=.25+Math.sin((performance.now()/900)+p.x)*.18}ctx.beginPath();ctx.fillStyle=`rgba(255,190,74,${Math.max(0,p.a)})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}particles=particles.filter(p=>!p.burst||p.life>0);raf=requestAnimationFrame(draw)}
function finish(){if(done)return;done=true;stage.classList.add('is-done');cancelAnimationFrame(raf);setTimeout(()=>{stage.remove();document.documentElement.classList.add('intro-complete')},480)}
function sequence(){if(reduced){setTimeout(finish,360);return}setTimeout(()=>{logo.classList.add('is-bursting');burst()},1750);setTimeout(finish,2550)}
function skipNow(){finish()}
resize();seedBackground();draw();sequence();addEventListener('resize',resize,{passive:true});skip.addEventListener('click',skipNow);stage.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Enter')skipNow()});setTimeout(finish,2950);requestAnimationFrame(()=>skip.focus({preventScroll:true}));
})();
