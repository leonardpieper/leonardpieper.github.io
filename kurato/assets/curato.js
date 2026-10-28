(function(){
const ALL = window.CARDS || [];
const $ = id => document.getElementById(id);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
// deterministic scatter so the mess is the same every visit
let seed=7; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

function cardEl(c,{year=true,hidden=false}={}){
  const el=document.createElement('div');
  el.className='card'+(hidden?' card--hidden':'');
  el.innerHTML='<div class="card__img"></div><div class="card__meta"><div class="card__title"></div><div class="card__artist"></div></div>'+(year?'<div class="card__year"></div>':'');
  const img=el.querySelector('.card__img');
  img.style.backgroundImage='url("'+c.image+'")';
  img.setAttribute('role','img'); img.setAttribute('aria-label',c.title+' by '+c.artist);
  el.querySelector('.card__title').textContent=c.title;
  el.querySelector('.card__artist').textContent=c.artist;
  if(year) el.querySelector('.card__year').textContent=c.year;
  return el;
}

/* ---------- hero fan + box art ---------- */
const picks=[ALL.find(c=>c.title==='The Starry Night'),ALL.find(c=>c.title==='Girl with a Pearl Earring'),ALL.find(c=>c.title==='The Great Wave off Kanagawa'),ALL.find(c=>c.title==='The Kiss'),ALL.find(c=>c.title==='Mona Lisa')].filter(Boolean);
const fan=$('hero-fan');
// [x, y, rotation, scale] per pick: Starry Night, Pearl Earring, Great Wave, The Kiss, Mona Lisa
const POS=[['60%','58%',2,.9],['70%','10%',-2,.95],['76%','44%',-3,1.05],['86%','6%',3,.85],['89%','60%',4,.8]];
picks.forEach((c,i)=>{
  const p=POS[i%POS.length], f=document.createElement('figure');
  f.className='hang';
  f.style.cssText='--x:'+p[0]+';--y:'+p[1]+';--r:'+p[2]+'deg;--s:'+p[3]+';z-index:'+i;
  f.appendChild(cardEl(c,{year:false}));
  const cap=document.createElement('figcaption');
  const n=document.createElement('b');n.textContent='No. '+String(c.id).padStart(2,'0');
  const d=document.createElement('span');d.textContent='Date unknown';
  cap.append(n,d);f.appendChild(cap);fan.appendChild(f);
});
const rb=$('ribbon');
shuffle(ALL).forEach(c=>{const sp=document.createElement('span');sp.textContent=c.title;rb.appendChild(sp);rb.appendChild(document.createTextNode(' '))});
const boxArt=$('box-art');
picks.slice().reverse().forEach((c,i)=>{const e=cardEl(c,{year:false});e.style.setProperty('--r',(i*7-14)+'deg');e.style.setProperty('--x',(i*26-52)+'px');e.style.setProperty('--y',(i%2?14:-14)+'px');boxArt.appendChild(e)});

/* ---------- scroll timeline ---------- */
const DECK=15;   // a fresh random hand for the stack on every page load
const sorted=shuffle(ALL).slice(0,DECK).sort((a,b)=>a.year-b.year);
const N=sorted.length;
const stage=$('stage'), section=$('timeline'), cardsWrap=$('cards'), erasWrap=$('eras');
const title=$('stage-title'), counter=$('counter'), bar=$('bar');
$('counter-total').textContent=N;
const ERAS=[[1400,1520,'Renaissance','#e9c46a'],[1520,1700,'Baroque','#e8a598'],[1700,1850,'Rococo & Romantic','#a9c9b0'],[1850,1900,'Impressionism','#a8bde0'],[1900,2000,'Modern','#e0905a']];
let items=[],vw,vh,CW,CH,SC=1,cw,ch,rows,n,pitch,RP,yTop,left0,pileX,pileY,eraOn,SX,SY;
const head=$('stage-head');
// landing order: roughly early-to-late, but shuffled enough that cards drop in front of and between earlier ones
const order=sorted.map((c,i)=>[i,i/N+(rnd()-.5)*.6]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
const rankOf=[];order.forEach((i,k)=>rankOf[i]=k);
sorted.forEach((c,i)=>{const el=cardEl(c);cardsWrap.appendChild(el);items.push({el,i,c,rank:rankOf[i],sw:(rnd()-.5)*30,jx:(rnd()-.5)*10,jy:(rnd()-.5)*10,jr:(rnd()-.5)*14,tilt:(rnd()-.5)*3,yr:el.querySelector('.card__year')})});
const eraData=ERAS.map(([a,b,name,col])=>{const idx=sorted.map((c,i)=>c.year>=a&&c.year<b?i:-1).filter(i=>i>=0);if(!idx.length)return null;const d=document.createElement('div');d.className='era';d.textContent=name+' · '+a+'–'+b;erasWrap.appendChild(d);return {el:d,idx}}).filter(Boolean);
function measure(){
  vw=stage.clientWidth;vh=stage.clientHeight;
  const cs=getComputedStyle(document.documentElement);
  CW=parseFloat(cs.getPropertyValue('--card-w'));CH=parseFloat(cs.getPropertyValue('--card-h'));
  cw=CW;ch=CH;SC=1;
  const mob=vw<800, pad=mob?16:44, A=vw-2*pad-CW;
  const maxP=CW+(mob?28:44), minP=CW*(mob?.42:.5), room=mob?30:40;
  // the title block lives left of the pile so it wraps instead of running over the cards
  head.style.maxWidth=Math.max(120,vw-2*head.offsetLeft-CW-24)+'px';
  rows=1;
  for(;rows<N;rows++){n=Math.ceil(N/rows);pitch=Math.min(maxP,A/(n-1));if(pitch>=minP)break}
  n=Math.ceil(N/rows);pitch=Math.min(maxP,A/(n-1));
  const top=head.offsetTop+head.offsetHeight+16, bot=vh-76, avail=bot-top;
  RP=rows>1?Math.max(CH*.62,Math.min(CH+room,(avail-CH-room*.6)/(rows-1))):0;
  const H=(rows-1)*RP+CH+room*.6;
  yTop=top+Math.max(0,(avail-H)/2)+CH/2;
  left0=vw/2-(n-1)*pitch/2;
  pileX=vw-head.offsetLeft-CW/2;pileY=head.offsetTop+CH/2;
  eraOn=rows===1;
}
function slot(s){
  s=Math.max(0,s);const f=Math.floor(s),t=s-f,f1=f+1;
  const r0=Math.floor(f/n),c0=f-r0*n,r1=Math.floor(f1/n),c1=f1-r1*n;
  SX=(c0+(c1-c0)*t)*pitch;SY=yTop+(r0+(r1-r0)*t)*RP;
}
const msgs=[[0,'A pile of paintings.'],[.03,'Dealing them out…'],[.88,'Five centuries, in line.']];
const LAND=.88, F=4;   // share of the scroll spent dealing; how many cards are in the air at once
let lastMsg=-1;
const e=new Array(N), pos=new Array(N);
function frame(){
  const p=progress();
  const Q=clamp(p/LAND)*(N-1+F);
  // progress of every card, and each card's slot = how many cards dated before it have arrived
  let acc=0;
  for(let i=0;i<N;i++){const d=clamp((Q-items[i].rank)/F);items[i].d=d;e[i]=ease(d);pos[i]=acc;acc+=e[i]}
  // a single row grows from the centre; wrapped rows stay put
  const left=rows===1?vw/2-Math.max(acc-1,0)*pitch/2:left0;
  let placed=0, bestRank=-1, mid=sorted[0];
  for(const it of items){
    const i=it.i, d=it.d, k=e[i];
    slot(pos[i]);const sx=left+SX, sy=SY;
    let x,y,rot,z,op=1;
    if(d<=0){                                      // waiting in the pile, next card on top
      const depth=Math.max(0,it.rank-Q), rr=Math.min(depth,8);
      x=pileX+it.jx+rr*2.5;y=pileY+it.jy-rr*2.5;rot=it.jr+rr*.6;z=100+N-it.rank;op=clamp(8-depth);
    }else{                                         // arcs from the pile into its slot
      x=pileX+(sx-pileX)*k;
      y=pileY+(sy-pileY)*k-Math.sin(Math.PI*k)*vh*.08;
      rot=it.jr*(1-k)+it.tilt*k+Math.sin(Math.PI*k)*it.sw;
      z=d<1?1000+Math.round(d*100):1+i;
      if(d>=.5&&it.rank>=bestRank){bestRank=it.rank;mid=it.c}
    }
    it.el.style.transform='translate('+x+'px,'+y+'px) rotate('+rot+'deg) scale('+SC+')';
    it.el.style.zIndex=z;it.el.style.opacity=op;
    it.yr.style.opacity=d>=1?1:0;
    if(d>=1)placed++;
  }
  for(const g of eraData){
    slot(pos[g.idx[0]]);
    let m=0;for(const i of g.idx)m=Math.max(m,e[i]);
    g.el.style.transform='translate('+(left+SX-pitch/2)+'px,'+(SY-ch/2-46)+'px)';g.el.style.opacity=eraOn?m:0;
  }
  const era=ERAS.find(e=>mid.year>=e[0]&&mid.year<e[1])||ERAS[0];
  stage.style.backgroundColor=era[3];stage.style.setProperty('--stage-bg',era[3]);
  counter.textContent=placed;
  bar.style.width=(p*100)+'%';
  let m=0;msgs.forEach((x,i)=>{if(p>=x[0])m=i});
  if(m!==lastMsg){lastMsg=m;title.textContent=msgs[m][1]}
}
// Velocity-gated pin, using plain CSS sticky so the page never snaps or jumps:
// while the section is still off screen we measure how fast you scroll. Slow -> the section is made tall
// (it pins and your scroll deals the cards). Fast -> it stays one screen tall and you pass straight over it.
const FAST=1.5;   // px/ms (~1500px/s) and above counts as fast
const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
let tall=false, samples=[], idleT;
const req=()=>{if(!tick){tick=true;requestAnimationFrame(()=>{tick=false;frame()})}};
let tick=false;
function velocity(){
  const t=performance.now();
  while(samples.length&&t-samples[0][0]>300)samples.shift();
  if(samples.length<2)return 0;
  const f=samples[0],l=samples[samples.length-1];
  return Math.abs(l[1]-f[1])/Math.max(40,l[0]-f[0]);
}
function setTall(w){
  if(w===tall)return;
  tall=w;section.classList.toggle('timeline--tall',w);
}
function decide(){
  if(still)return;
  // only resize while the section is still below the screen: nothing visible can move, so no scroll correction is ever needed
  if(section.getBoundingClientRect().top>=innerHeight*.9)setTall(played<1&&!frozen&&velocity()<FAST);   // once played it never pins again
}
// The deal only ever moves forward: scrolling back up never undoes it, and once you have scrolled past it, it is done for good.
let played=0, frozen=false;   // frozen: you scrolled up mid-deal, so the cards hold their current state until the stage is fully off screen
function progress(){
  if(still)return 1;
  const r=section.getBoundingClientRect();
  if(frozen){
    if(r.top>=innerHeight||r.bottom<=0){frozen=false;played=1;setTall(false)}   // fully off screen: skip to the finished state
    return played;
  }
  if(r.bottom<=0){
    played=1;
    if(tall){   // fully above the screen: collapse so scrolling back up is a plain one-screen section, no catch
      const y=scrollY, h=section.offsetHeight;
      setTall(false);
      const d=h-section.offsetHeight;
      // the browser's scroll anchoring normally keeps your place; only if it did not (no anchoring support) correct it once
      if(d>0&&Math.abs(scrollY-y)<2)scrollTo({top:y-d,behavior:'instant'})
    }
  }
  else if(played>0&&r.top>=innerHeight){played=1;setTall(false)}   // left upward mid-deal: skip to the finished state, collapsed, so you can pass it freely next time
  else played=Math.max(played,tall?clamp(-r.top/(r.height-vh)):clamp(1-r.top/(vh*.9)));
  return played;
}
let prevY=scrollY;
// Scrolling up while the stage is pinned: freeze the deal where it is and collapse the section, so nothing blocks you and the stage just scrolls away.
// The stage is fixed to the viewport at that moment, so re-seating the page under it is invisible.
function releaseUp(){
  const y=scrollY, up=y<prevY;prevY=y;
  if(!tall||!up)return;
  const st=parseFloat(getComputedStyle(stage).top)||0, r=section.getBoundingClientRect(), sr=stage.getBoundingClientRect();
  if(Math.abs(sr.top-st)>1.5||r.top>st+1)return;   // not pinned: it is moving normally, nothing blocks
  played=Math.max(played,clamp(-r.top/(r.height-vh)));frozen=true;setTall(false);   // keep the deal exactly where it is
  scrollTo({top:y+r.top-st,behavior:'instant'});
}
addEventListener('scroll',()=>{
  releaseUp();
  samples.push([performance.now(),scrollY]);
  decide();req();
  clearTimeout(idleT);idleT=setTimeout(()=>{samples.length=0;decide();req()},160);   // stopped = slow
},{passive:true});
addEventListener('resize',()=>{measure();req()});
decide();
measure();frame();

/* ---------- game ---------- */
const gScore=$('g-score'),gBest=$('g-best'),gLives=$('g-lives'),gDraw=$('g-draw'),gMsg=$('g-msg'),gLine=$('g-line'),gRestart=$('g-restart');
let deck,line,cur,score,lives,locked;
const BEST_KEY='curato-best';
gBest.textContent=localStorage.getItem(BEST_KEY)||0;
function preload(c){if(c){const i=new Image();i.src=c.image}}
function start(){
  deck=shuffle(ALL); line=[deck.pop()]; score=0; lives=3; locked=false;
  gRestart.hidden=true; next(); render();
}
function next(){
  cur=deck.pop();
  gDraw.innerHTML='';
  if(!cur){gMsg.innerHTML='You placed the whole deck. <b>'+score+'</b>';end(true);return}
  preload(deck[deck.length-1]);
  const el=cardEl(cur,{year:false,hidden:true});el.id='g-cur';
  gDraw.appendChild(el);
  gMsg.textContent='When was this painted? Pick a gap.';
}
function render(reveal){
  gScore.textContent=score; gLives.textContent='♥'.repeat(lives)+'♡'.repeat(3-lives);
  gLine.innerHTML='';
  const addGap=i=>{const b=document.createElement('button');b.className='gap';b.textContent='+';b.disabled=locked||!cur;
    b.setAttribute('aria-label',i===0?'Place before '+line[0].year:i===line.length?'Place after '+line[line.length-1].year:'Place between '+line[i-1].year+' and '+line[i].year);
    b.onclick=()=>place(i);gLine.appendChild(b)};
  line.forEach((c,i)=>{addGap(i);gLine.appendChild(cardEl(c))});
  addGap(line.length);
}
function place(i){
  if(locked||!cur)return; locked=true;
  const lo=line[i-1], hi=line[i];
  const ok=(!lo||lo.year<=cur.year)&&(!hi||cur.year<=hi.year);
  const el=$('g-cur'); el.classList.remove('card--hidden');
  const y=document.createElement('div');y.className='card__year';y.textContent=cur.year;el.appendChild(y);
  el.classList.add(ok?'right':'wrong');
  if(ok){line.splice(i,0,cur);score++;gMsg.innerHTML='Yes. <b>'+cur.year+'</b>. '+cur.title+', '+cur.artist+'.'}
  else{lives--;gMsg.innerHTML='Not quite, it was <b>'+cur.year+'</b>. '+cur.title+', '+cur.artist+'.'}
  const best=Math.max(score,+localStorage.getItem(BEST_KEY)||0);localStorage.setItem(BEST_KEY,best);gBest.textContent=best;
  render();
  if(ok){const nodes=gLine.querySelectorAll('.card');nodes[i]&&nodes[i].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})}
  if(lives<=0){setTimeout(()=>{gMsg.innerHTML='Gallery closed. You placed <b>'+score+'</b>.';end()},1400);return}
  setTimeout(()=>{locked=false;next();render()},1700);
}
function end(won){cur=null;locked=true;gRestart.hidden=false;render()}
gRestart.onclick=start;
if(ALL.length>3)start();
})();
