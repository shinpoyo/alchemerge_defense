'use strict';
// 敵の絵（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 敵の絵 ----------------
   img/enemies/<種類>.webp：左半分が体（種類の色で暗く塗った「影」）、右半分が光る所（目・溶岩・炎など）。
   鎧の影は体が灰色の明暗、光る所が白で、防ぐ系統の色にここで染める。
   絵がまだ読みこめていないあいだは、これまでの形（render.js の ePath）で描く */
const SPR_DEF={ // face：絵の向き（-1 左向き、1 右向き、0 正面。進む向きに合わせて左右を返す）、k：絵の大きさ（半径の何倍）
  shade:{face:0,k:2.7},wisp:{face:-1,k:2.9},golem:{face:0,k:2.5},mite:{face:-1,k:3.1},runner:{face:1,k:2.8},
  flyer:{face:0,k:3.4},splitter:{face:0,k:2.6},healer:{face:0,k:2.9},armored:{face:1,k:3},boss:{face:0,k:2.9},
  king_ice:{face:0,k:4.8,rim:'#8fe6ff',foot:1},king_fire:{face:-1,k:5.2,rim:'#ff7a2a',foot:1}}; // king_*：ステージ専用の夜の王（stages.js の king）。rim：縁どりの色、foot：足もとを道に合わせる（大きい絵）
const SPR={};
const sprKey=e=>e.final&&STAGES[STAGE].king&&SPR[STAGES[STAGE].king]?STAGES[STAGE].king:e.type; // 第20波の夜の王は、ステージ専用の絵があればそれ
function sprBox(e,r){ // 絵を描く大きさと位置（敵の位置が原点）。cy：絵の真ん中の高さ
  const key=sprKey(e),D=SPR_DEF[key],S0=SPR[key],sz=r*D.k,sc=S0?sz/Math.max(S0.w,S0.h):1,w=S0?S0.w*sc:sz,h=S0?S0.h*sc:sz;
  const y=D.foot?-h+r*.35:-h/2-r*.1;return{key,D,S0,w,h,x:-w/2,y,cy:D.foot?y+h/2:0};
}
const sprR=(e,r)=>{const b=sprBox(e,r);return b.D.foot?b.h*.45:r*b.D.k*.46}; // 絵の見た目の半径（状態の輪や体力の帯をこの大きさに合わせる）
const sprCY=(e,r)=>sprBox(e,r).cy;
const sprTall=e=>{const k=sprKey(e);return!!(SPR_DEF[k].foot&&SPR[k])}; // 背の高い王：塔より手前に描く（render.js） // 足もとを道に合わせた絵は、輪や体力の帯を絵の真ん中に合わせて上へずらす
function sprLoad(type){
  const img=new Image();
  img.onload=()=>{
    const w=img.width/2,h=img.height,mk=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
    const body=mk(),glw=mk(),sil=mk();
    body.getContext('2d').drawImage(img,0,0,w,h,0,0,w,h);glw.getContext('2d').drawImage(img,w,0,w,h,0,0,w,h);
    const sg=sil.getContext('2d');sg.drawImage(body,0,0);sg.globalCompositeOperation='source-in';sg.fillStyle='#fff';sg.fillRect(0,0,w,h);
    const tint=c=>{const t=mk(),tg=t.getContext('2d');tg.drawImage(sil,0,0);tg.globalCompositeOperation='source-in';tg.fillStyle=c;tg.fillRect(0,0,w,h);return t};
    SPR[type]={w,h,body,glow:glw,white:sil,tint,cache:{},fam:{}};
  };
  img.src='img/enemies/'+type+'.webp';
}
for(const t in SPR_DEF)sprLoad(t);
function sprTint(S0,c){return S0.cache[c]||(S0.cache[c]=S0.tint(c))}
function sprFam(S0,fam){ // 鎧の影：体と光る所を、防ぐ系統の色に染める
  if(S0.fam[fam])return S0.fam[fam];
  const c=(ELEM[fam]||ELEM.earth).c,{w,h}=S0,mk=()=>{const q=document.createElement('canvas');q.width=w;q.height=h;return q};
  const b=mk(),bg=b.getContext('2d');bg.drawImage(S0.body,0,0);bg.globalCompositeOperation='multiply';
  const gr=bg.createLinearGradient(0,0,0,h);gr.addColorStop(0,c);gr.addColorStop(1,'#'+[1,3,5].map(i=>Math.round(parseInt(c.substr(i,2),16)*.22).toString(16).padStart(2,'0')).join('')); // 上は系統の色、下ほど暗く
  bg.fillStyle=gr;bg.fillRect(0,0,w,h);bg.globalCompositeOperation='destination-in';bg.drawImage(S0.body,0,0);
  const g=mk(),gg=g.getContext('2d');gg.drawImage(S0.glow,0,0);gg.globalCompositeOperation='source-in';gg.fillStyle=c;gg.fillRect(0,0,w,h);
  return S0.fam[fam]={body:b,glow:g};
}
// 絵で敵を描く。描けたら true（まだ読みこめていなければ false を返し、これまでの形で描く）
function drawSprite(e,t,r,rage){
  const{key,D,S0,w,h,x,y}=sprBox(e,r);if(!S0)return false;
  const arm=e.type==='armored',fc=arm?(ELEM[e.armor]||ELEM.earth).c:null,gc=e.gate&&ELEM[e.gate].c; // 門ごとの系統の敵：縁どりと体を系統の色にする
  ctx.save();
  if(D.face){const cs=e.P.seg.find(q=>e.d<=q.s+q.l)||e.P.seg[e.P.seg.length-1],vx=cs.bx-cs.ax;if(vx*D.face<-.01)ctx.scale(-1,1)}
  const rim=e.stopT>0?'#e6f9ff':e.slowT>0?'#8fe6ff':e.dotT>0?(e.dotK?'#a8f06a':'#ff8a3a'):gc||fc||D.rim||e.def.rim,o=e.type==='boss'||gc?1.6:1.1,R=sprTint(S0,rim);
  for(const[dx,dy]of[[o,0],[-o,0],[0,o],[0,-o]])ctx.drawImage(R,x+dx,y+dy,w,h); // 縁どり
  if(e.flash>0&&!D.foot)ctx.drawImage(S0.white,x,y,w,h);
  else{
    const B=arm?sprFam(S0,e.armor):S0;
    ctx.drawImage(B.body,x,y,w,h);
    if(gc){ctx.globalAlpha=.3;ctx.drawImage(sprTint(S0,gc),x,y,w,h);ctx.globalAlpha=1}
    if(rage){ctx.globalAlpha=.45;ctx.drawImage(sprTint(S0,e.phase>2?'#c0601a':'#b02020'),x,y,w,h);ctx.globalAlpha=1} // 怒り：体が赤く
    ctx.globalCompositeOperation='lighter';if(D.foot){ctx.globalAlpha=.4;ctx.drawImage(B.glow,x,y,w,h)}else{ctx.drawImage(B.glow,x,y,w,h);ctx.globalAlpha=.6;ctx.drawImage(B.glow,x,y,w,h)}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'; // 光る所を足す（大きい王は光る所が広いので弱めに 1 回だけ）
    if(e.stopT>0){ctx.globalAlpha=.52;ctx.drawImage(sprTint(S0,'#c8f2ff'),x,y,w,h);ctx.globalAlpha=1} // 停止：青白く凍りつく
    if(e.dotT>0&&e.dotK){ctx.globalAlpha=.33;ctx.drawImage(sprTint(S0,'#a8f06a'),x,y,w,h);ctx.globalAlpha=1} // 毒：体が緑がかる
    if(e.flash>0){ctx.globalAlpha=.22;ctx.drawImage(S0.white,x,y,w,h);ctx.globalAlpha=1} // 大きい王の被弾：真っ白にせず、うっすら明るくするだけ（体が見えなくならないように）
  }
  ctx.restore();
  const rv=sprR(e,r);
  if(e.slowT>0){ // 減速：足もとの氷（絵の手前、足の位置に描く）
    const z=.7+e.slow,fy=y+h-r*.15;ctx.fillStyle=rgba('#8fe6ff',.3);ctx.beginPath();ctx.ellipse(0,fy,rv*.9*z,r*.4*z,0,0,TAU);ctx.fill();
    ctx.fillStyle='#e6f9ff';for(const sx of[-1,0,1]){const bx=sx*rv*.55*z,hh=(4+r*.35)*z*(sx?1:1.4);ctx.beginPath();ctx.moveTo(bx-3,fy+r*.1);ctx.lineTo(bx,fy+r*.1-hh);ctx.lineTo(bx+3,fy+r*.1);ctx.fill()}}
  if(arm){famAura(e,t,rv*1.25);if(e.block>0){ctx.strokeStyle=rgba(fc,e.block/.3);ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,rv+4,0,TAU);ctx.stroke()}} // はじいた瞬間：系統の色の輪
  return true;
}
// 鎧の影：防ぐ系統ごとに、体のまわりを舞うもの
function famAura(e,t,R){
  const f=e.armor||'earth',c=ELEM[f].c,ph=e.ph;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  const orb=(n,sp,rr,fn)=>{for(let i=0;i<n;i++){const a=t*sp+ph+i*TAU/n;fn(Math.cos(a)*rr,Math.sin(a)*rr*.55-R*.1,a,i)}};
  if(f==='wood')orb(3,1.6,R*1.05,(x,y,a,i)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a*2);ctx.fillStyle=i%2?'#7ac85a':'#a8e070';ctx.beginPath();ctx.ellipse(0,0,R*.28,R*.12,0,0,TAU);ctx.fill();
    ctx.strokeStyle='#2c5a1c';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-R*.26,0);ctx.lineTo(R*.26,0);ctx.stroke();ctx.restore()}); // 木の葉
  else if(f==='poison'){for(let i=0;i<4;i++){const q=(t*.7+i/4+ph)%1,x=Math.sin(ph*5+i*2.3)*R*.8,y=R*.4-q*R*1.6;ctx.globalAlpha=1-q*.8;ctx.strokeStyle=c;ctx.lineWidth=1;ctx.fillStyle=rgba(c,.35);
    ctx.beginPath();ctx.arc(x,y,R*(.08+.1*q),0,TAU);ctx.fill();ctx.stroke()}} // 立ちのぼる毒の泡
  else if(f==='volt'){const k=Math.floor(t*12+ph*3);for(let i=0;i<2;i++){const a=(k*1.7+i*3.1)%TAU;ctx.strokeStyle=i?'#fff':c;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(Math.cos(a)*R*.6,Math.sin(a)*R*.5);
    for(let j=1;j<=3;j++){const rr=R*(.6+j*.18),aa=a+(j%2?.25:-.25);ctx.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr*.8)}ctx.stroke()}} // ぱちぱち走る稲妻
  else if(f==='light')orb(4,1.2,R*1.05,(x,y,a)=>{const s=R*(.13+.05*Math.sin(t*6+a*3));ctx.fillStyle='#fffbe0';ctx.beginPath();ctx.moveTo(x,y-s*2);ctx.lineTo(x+s*.5,y);ctx.lineTo(x,y+s*2);ctx.lineTo(x-s*.5,y);ctx.closePath();
    ctx.moveTo(x-s*2,y);ctx.lineTo(x,y-s*.5);ctx.lineTo(x+s*2,y);ctx.lineTo(x,y+s*.5);ctx.closePath();ctx.fill()}); // きらめき
  else if(f==='ice')orb(3,1.1,R*1.05,(x,y,a)=>{ctx.strokeStyle='#e6f9ff';ctx.lineWidth=1.1;const s=R*.2;for(let k=0;k<3;k++){const b=a+k*Math.PI/3;ctx.beginPath();ctx.moveTo(x-Math.cos(b)*s,y-Math.sin(b)*s);ctx.lineTo(x+Math.cos(b)*s,y+Math.sin(b)*s);ctx.stroke()}}); // 雪の結晶
  else if(f==='water')orb(3,1.5,R,(x,y)=>{const s=R*.16;ctx.fillStyle='#8ac8ff';ctx.beginPath();ctx.moveTo(x,y-s*1.8);ctx.quadraticCurveTo(x+s,y,x,y+s);ctx.quadraticCurveTo(x-s,y,x,y-s*1.8);ctx.fill()}); // しずく
  else if(f==='flame'){for(let i=0;i<5;i++){const q=(t*1.1+i/5+ph)%1;ctx.globalAlpha=1-q;ctx.fillStyle=i%2?'#ffd070':c;ctx.beginPath();ctx.arc(Math.sin(ph*4+i*1.9)*R*.75,R*.2-q*R*1.5,R*.07+.6,0,TAU);ctx.fill()}} // 火の粉
  else if(f==='earth')orb(3,1.3,R,(x,y,a)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='#a87a44';ctx.strokeStyle='#3a2a14';ctx.lineWidth=.7;const s=R*.16;
    ctx.beginPath();ctx.moveTo(-s,-s*.6);ctx.lineTo(s*.7,-s);ctx.lineTo(s,s*.5);ctx.lineTo(-s*.4,s);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}); // 小石
  else if(f==='wind'){ctx.strokeStyle=rgba(c,.85);ctx.lineWidth=1.2;for(let i=0;i<3;i++){const a=t*3+ph+i*TAU/3;ctx.beginPath();ctx.ellipse(0,-R*.1,R*1.05,R*.55,0,a,a+1.3);ctx.stroke()}} // 回る風
  else if(f==='dark')orb(3,-1.4,R,(x,y)=>{ctx.fillStyle='rgba(20,10,40,.85)';ctx.strokeStyle=c;ctx.lineWidth=.9;ctx.beginPath();ctx.arc(x,y,R*.16,0,TAU);ctx.fill();ctx.stroke()}); // 黒い玉
  ctx.restore();
}
