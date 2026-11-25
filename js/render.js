'use strict';
// 描画（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 描画 ---------------- */
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
const ART={}; // ステージの絵（img/stages/）。読みこめるまではこれまでの背景で描き、読みこめたら描き直す
function stageArt(){
  const src=STAGES[STAGE].bg;if(!src)return null;
  if(!ART[src]){const img=new Image();img.onload=()=>{bgCanvas=null};img.src=src;ART[src]=img}
  const img=ART[src];return img.complete&&img.naturalWidth?img:null;
}
function makeBg(){
  const c=document.createElement('canvas'),k=2;c.width=W*k;c.height=H*k;const g=c.getContext('2d');g.scale(k,k);
  let gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0c0a18');gr.addColorStop(.6,'#07060e');gr.addColorStop(1,'#040308');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  const art=stageArt(); // ステージの絵（あれば、星・月・星雲・道の帯のかわりに敷く）
  if(art){g.save();g.beginPath();g.rect(0,0,W,518);g.clip();g.drawImage(art,0,0,W,art.height*W/art.width);g.restore();
   gr=g.createLinearGradient(0,0,0,76);gr.addColorStop(0,'rgba(5,4,9,.8)');gr.addColorStop(1,'rgba(5,4,9,0)');g.fillStyle=gr;g.fillRect(0,0,W,76)} // 上の表示（灯・夜波）が明るい絵の上でも読めるように
  else{
  for(let i=0;i<120;i++){g.fillStyle=rgba('#b9a8ff',rnd(.03,.2));g.fillRect(rnd(W),rnd(48,515),rnd(.5,1.6),rnd(.5,1.6))}
  for(let i=0;i<22;i++){const x=rnd(W),y=rnd(48,470),r=rnd(2,4.2),a=rnd(.25,.6);g.strokeStyle=rgba('#e6dcff',a);g.lineWidth=1;
    g.beginPath();g.moveTo(x-r,y);g.lineTo(x+r,y);g.moveTo(x,y-r);g.lineTo(x,y+r);g.stroke();g.fillStyle=rgba('#ffffff',a);g.fillRect(x-.7,y-.7,1.4,1.4)}
  {const x=378,y=104;gr=g.createRadialGradient(x,y,0,x,y,74);gr.addColorStop(0,'rgba(232,195,106,.20)');gr.addColorStop(1,'rgba(232,195,106,0)');g.fillStyle=gr;g.fillRect(x-74,y-74,148,148);
   g.fillStyle='#e8dcc0';g.beginPath();g.arc(x,y,17,0,TAU);g.fill();
   g.globalCompositeOperation='destination-out';g.beginPath();g.arc(x+7,y-4,14.5,0,TAU);g.fill();g.globalCompositeOperation='source-over'}
  for(let i=0;i<7;i++){const x=rnd(W),y=rnd(80,500),r=rnd(80,170);gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rgba((STAGES[STAGE].neb||['#3a1d6e','#1d2a6e'])[i%2],.16));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
  {const sa=STAGES[STAGE].aff; // 属性の地の地面：凍った湖のひび／沈んだ都の波紋
   if(sa&&sa.resist==='ice'){gr=g.createRadialGradient(225,280,0,225,280,200);gr.addColorStop(0,'rgba(170,230,255,.10)');gr.addColorStop(1,'rgba(170,230,255,0)');g.fillStyle=gr;g.beginPath();g.ellipse(225,280,180,200,0,0,TAU);g.fill();
     g.strokeStyle='rgba(200,240,255,.10)';g.lineWidth=1;for(let i=0;i<14;i++){let x=rnd(110,340),y=rnd(140,420);g.beginPath();g.moveTo(x,y);for(let j=0;j<3;j++){x+=rnd(-30,30);y+=rnd(-30,30);g.lineTo(x,y)}g.stroke()}}
   else if(sa&&sa.resist==='flame'){for(let i=0;i<40;i++){g.fillStyle=rgba(i%3?'#ff8a3a':'#ffd06a',rnd(.08,.3));g.beginPath();g.arc(rnd(W),rnd(60,500),rnd(.8,2),0,TAU);g.fill()}} // 火の山：舞う火の粉
   else if(sa&&sa.resist==='dark'){for(let i=0;i<9;i++){const x=rnd(W),y=rnd(60,500),r=rnd(60,120);gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(0,0,0,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}} // 光の届かぬ森：濃い闇
   else if(sa&&sa.resist==='poison'){g.strokeStyle='rgba(140,224,74,.10)';g.lineWidth=1;for(let i=0;i<26;i++){g.beginPath();g.arc(rnd(W),rnd(60,500),rnd(2,7),0,TAU);g.stroke()}} // 瘴気の沼：泡
   else if(sa&&sa.resist==='light'){for(let i=0;i<5;i++){const x=rnd(40,410);gr=g.createLinearGradient(x,48,x+60,500);gr.addColorStop(0,'rgba(255,242,160,.09)');gr.addColorStop(1,'rgba(255,242,160,0)');g.fillStyle=gr;g.beginPath();g.moveTo(x,48);g.lineTo(x+22,48);g.lineTo(x+90,500);g.lineTo(x+50,500);g.fill()}} // 白夜の聖堂：差しこむ光
   else if(sa&&sa.wet){g.strokeStyle='rgba(120,190,255,.08)';g.lineWidth=1;for(let i=0;i<18;i++){const x=rnd(W),y=rnd(60,500),r=rnd(8,26);for(const k of[1,.6]){g.beginPath();g.ellipse(x,y,r*k,r*k*.4,0,0,TAU);g.stroke()}}}}
  }
  // 道
  const tr=()=>{g.beginPath();for(const P of PATHS)P.pts.forEach((p,i)=>g[i?'lineTo':'moveTo'](p[0],p[1]))};
  g.lineJoin='round';g.lineCap='round';
  if(!art){ // 絵があるときは、絵に描かれた道をそのまま使う
  g.strokeStyle=rgba('#8b5cf6',.16);g.lineWidth=50;tr();g.stroke();
  g.strokeStyle=rgba('#8b5cf6',.5);g.lineWidth=42;tr();g.stroke();
  g.strokeStyle='#0b0915';g.lineWidth=39;tr();g.stroke();
  g.strokeStyle='#131022';g.lineWidth=30;tr();g.stroke();}
  g.setLineDash([2,13]);g.strokeStyle=rgba('#c9b8ff',.3);g.lineWidth=2;tr();g.stroke();g.setLineDash([]);
  // 入口の裂け目
  for(const P of PATHS){const y=P.pts[0][1],x0=clamp(P.pts[0][0],0,W);gr=g.createRadialGradient(x0,y,0,x0,y,60);gr.addColorStop(0,rgba('#b03cff',.55));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x0-70,y-65,140,130)}
  for(let i=0;i<4;i++){const x=rnd(40,410),y=rnd(430,512),r=rnd(60,120);gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(160,140,255,.05)');gr.addColorStop(1,'rgba(160,140,255,0)');g.fillStyle=gr;g.fillRect(x-r,y-r*.4,r*2,r*.8)}
  // 作業台
  gr=g.createLinearGradient(0,LY.top,0,LY.top+LY.panelH);gr.addColorStop(0,'#100c1f');gr.addColorStop(1,'#060510');g.fillStyle=gr;rr(g,5,LY.top,W-10,LY.panelH,14);g.fill();g.strokeStyle='#2a2440';g.lineWidth=1;g.stroke();
  g.fillStyle='rgba(232,195,106,.07)';g.fillRect(17,521,W-34,1);
  // 共鳴陣ペアの結び線
  for(const s of slots){
    if(s.mod==='link'&&s.linkTo&&slots.indexOf(s)<slots.indexOf(s.linkTo)){
      g.strokeStyle=rgba('#ffe9a0',.28);g.lineWidth=1.4;g.setLineDash([4,6]);
      g.beginPath();g.moveTo(s.x,s.y);g.lineTo(s.linkTo.x,s.linkTo.y);g.stroke();g.setLineDash([]);
    }
  }
  for(const s of slots){
    if(s.field){
      const mc=s.mod?MOD_COL[s.mod]:'#8b5cf6';
      g.fillStyle=art?'rgba(12,9,22,.58)':rgba(mc,s.mod?.12:.06);g.beginPath();g.arc(s.x,s.y,28,0,TAU);g.fill(); // 絵の上では、柱や壁と重なっても読めるよう下を暗く
      g.strokeStyle=rgba(mc,s.mod?.75:.4);g.lineWidth=s.mod?1.6:1.2;g.beginPath();g.arc(s.x,s.y,28,0,TAU);g.stroke();
      g.strokeStyle=rgba(mc,s.mod?.38:.2);g.beginPath();g.arc(s.x,s.y,22,0,TAU);g.stroke();
      g.beginPath();for(let i=0;i<3;i++){const a=i/3*TAU-TAU/4;g[i?'lineTo':'moveTo'](s.x+Math.cos(a)*22,s.y+Math.sin(a)*22)}g.closePath();g.stroke();
      if(s.mod){g.fillStyle=rgba(mc,.8);g.font=FONT(LANG==='ja'?9.5:7.5,800);g.textAlign='center';g.textBaseline='middle';g.fillText(TT('mod_'+s.mod),s.x,s.y+18)}
    }else if(s.path){
      g.strokeStyle=rgba('#e8c36a',.4);g.lineWidth=1.2;g.setLineDash([4,4]);
      g.beginPath();g.moveTo(s.x,s.y-15);g.lineTo(s.x+15,s.y);g.lineTo(s.x,s.y+15);g.lineTo(s.x-15,s.y);g.closePath();g.stroke();g.setLineDash([]);
      g.fillStyle=rgba('#e8c36a',.5);g.font=FONT(LANG==='ja'?10:7.5,800);g.textAlign='center';g.textBaseline='middle';g.fillText(TT('trapMark'),s.x,s.y+.5);
    }else{const ch=LY.pitch-6;g.fillStyle='#07060d';rr(g,s.x-31,s.y-ch/2,62,ch,12);g.fill();g.strokeStyle='#231e38';g.stroke()}
  }
  // 周辺を暗く
  gr=g.createRadialGradient(W/2,300,160,W/2,300,430);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.55)');
  g.fillStyle=gr;g.fillRect(0,0,W,518);
  return c;
}
function ePath(e,t,r){ // 敵の輪郭：種類ごとのシルエットを描く
  const ph=e.ph;
  if(e.type==='wisp'){ // 炎のしずく：先端が揺れる
    const fl=Math.sin(t*9+ph)*r*.12;
    ctx.beginPath();ctx.moveTo(0,-r*1.25+fl);
    ctx.bezierCurveTo(r*.75,-r*.55,r*.85,r*.25,r*.55,r*.7);
    ctx.quadraticCurveTo(0,r*1.05,-r*.55,r*.7);
    ctx.bezierCurveTo(-r*.85,-r*.25,-r*.75,-r*.55,0,-r*1.25+fl);
    ctx.closePath();return;
  }
  if(e.type==='golem'){ // 角ばった岩の多角形
    const pts=[[-.55,-.95],[.5,-1],[.95,-.45],[.85,.5],[.45,1],[-.5,.95],[-.95,.4],[-.9,-.5]];
    ctx.beginPath();pts.forEach((q,i)=>ctx[i?'lineTo':'moveTo'](q[0]*r,q[1]*r));ctx.closePath();return;
  }
  if(e.type==='mite'){ctx.beginPath();ctx.arc(0,0,r,0,TAU);return}
  if(e.type==='runner'){ // 前のめりの細い矢じり
    ctx.beginPath();ctx.moveTo(0,-r*1.3);ctx.lineTo(r*.8,r*.2);ctx.lineTo(r*.35,r*.95);ctx.lineTo(0,r*.55);ctx.lineTo(-r*.35,r*.95);ctx.lineTo(-r*.8,r*.2);ctx.closePath();return;
  }
  if(e.type==='flyer'){ // 羽ばたく翼
    const f=Math.sin(t*14+ph)*r*.45;
    ctx.beginPath();ctx.moveTo(0,-r*.55);ctx.quadraticCurveTo(r*.9,-r*.9-f,r*1.7,-r*.25-f);ctx.quadraticCurveTo(r*1.05,-r*.05,r*.95,r*.45);ctx.quadraticCurveTo(r*.5,r*.2,0,r*.75);
    ctx.quadraticCurveTo(-r*.5,r*.2,-r*.95,r*.45);ctx.quadraticCurveTo(-r*1.05,-r*.05,-r*1.7,-r*.25-f);ctx.quadraticCurveTo(-r*.9,-r*.9-f,0,-r*.55);ctx.closePath();return;
  }
  if(e.type==='splitter'){ // 三つのかたまりがくっついた形
    const w2=Math.sin(t*4+ph)*r*.05;
    ctx.beginPath();ctx.arc(-r*.5,r*.3,r*.62+w2,0,TAU);ctx.moveTo(r*.5+r*.62-w2,r*.3);ctx.arc(r*.5,r*.3,r*.62-w2,0,TAU);ctx.moveTo(r*.62+w2,-r*.45);ctx.arc(0,-r*.45,r*.62+w2,0,TAU);return;
  }
  if(e.type==='healer'){ // 丸い頭巾：頭がまるく、すそがなめらかに波打つ
    const w2=Math.sin(t*3+ph)*r*.07;
    ctx.beginPath();ctx.moveTo(-r*.95,r*.72);ctx.bezierCurveTo(-r*1.08,-r*.25,-r*.72,-r*1.12,0,-r*1.12);ctx.bezierCurveTo(r*.72,-r*1.12,r*1.08,-r*.25,r*.95,r*.72);
    ctx.quadraticCurveTo(r*.62,r*1.08+w2,r*.32,r*.74);ctx.quadraticCurveTo(0,r*1.08-w2,-r*.32,r*.74);ctx.quadraticCurveTo(-r*.62,r*1.08+w2,-r*.95,r*.72);ctx.closePath();return;
  }
  if(e.type==='armored'){ // 盾の形：上が平らで、下がとがる
    ctx.beginPath();ctx.moveTo(-r*.95,-r*.9);ctx.lineTo(r*.95,-r*.9);ctx.lineTo(r*1.04,r*.1);ctx.quadraticCurveTo(r*.8,r*.86,0,r*1.22);ctx.quadraticCurveTo(-r*.8,r*.86,-r*1.04,r*.1);ctx.closePath();return;
  }
  // shade と boss：裾がギザギザの影（ボスはひと回り大きい）
  const wd=e.type==='boss'?1.12:.92,ht=e.type==='boss'?1.08:1,wob=Math.sin(t*6+ph)*r*.04;
  ctx.beginPath();ctx.moveTo(-r*wd,r*.55);
  ctx.quadraticCurveTo(-r*wd*1.02,-r*.5,Math.sin(t*2.2+ph)*r*.05,-r*ht);
  ctx.quadraticCurveTo(r*wd*1.02,-r*.5,r*wd,r*.55);
  const teeth=5;for(let i=1;i<=teeth;i++)ctx.lineTo(r*wd-(i/teeth)*r*wd*2,r*.55+((i%2)?-r*.22:r*.02)+wob);
  ctx.closePath();
}
function drawEnemy(e){
  const t=e.stopT>0?0:S.time,r=e.r,boss=e.type==='boss';
  const bob=e.stopT>0?0:e.type==='golem'?Math.sin(t*2.4+e.ph)*.8:e.type==='mite'?Math.sin(t*11+e.ph)*.7:Math.sin(t*5+e.ph)*1.5,
        sway=e.stopT>0?0:e.type==='wisp'?Math.sin(t*3.1+e.ph)*2:(e.type==='shade'||boss)?Math.sin(t*1.7+e.ph)*1.2:0;
  const sg=e.P.seg[e.P.seg.length-1],ux=(sg.bx-sg.ax)/sg.l,uy=(sg.by-sg.ay)/sg.l,back=e.siege?30-Math.max(0,e.lunge||0)*14:0;
  if(e.siege){const k=clamp(1-e.atk/(e.atkEvery||SIEGE_EVERY),0,1);ctx.save();ctx.translate(e.x-ux*30,e.y-uy*30);ctx.strokeStyle=rgba('#ff3b6b',.35+k*.65);ctx.lineWidth=3;ctx.lineCap='round';
    ctx.beginPath();ctx.arc(0,0,r+9,-Math.PI/2,-Math.PI/2+TAU*k);ctx.stroke();ctx.restore()}
  const lift=e.def.fly?16:0;
  if(lift){ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(e.x,e.y+4,r*.9,r*.35,0,0,TAU);ctx.fill()}
  if(e.type==='runner'&&!e.dead){const cs=e.P.seg.find(q=>e.d<=q.s+q.l)||sg,vx=(cs.bx-cs.ax)/cs.l,vy=(cs.by-cs.ay)/cs.l;ctx.strokeStyle=rgba(e.def.rim,.55);ctx.lineWidth=1.6;ctx.lineCap='round';
    for(const o of[-5,0,5]){ctx.beginPath();ctx.moveTo(e.x-vx*(r+3)-vy*o,e.y-vy*(r+3)+vx*o);ctx.lineTo(e.x-vx*(r+13+Math.abs(o))-vy*o,e.y-vy*(r+13+Math.abs(o))+vx*o);ctx.stroke()}}
  ctx.save();ctx.translate(e.x+sway-ux*back,e.y+bob-uy*back-lift);
  const rage=boss&&e.phase>1;
  if(e.born>0){const q=1-e.born/BOSS_BORN,z=.25+.75*(1-(1-q)**3)+Math.sin(q*Math.PI)*.18;ctx.scale(z,z);ctx.globalAlpha=Math.min(1,q*2.5)} // 登場：ふくらんで現れる
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=.5;ctx.drawImage(glow(e.def.rim),-r*2.2,-r*2.2,r*4.4,r*4.4);
  if(rage){const pu=.5+.5*Math.sin(t*(e.phase>2?11:7)+e.ph),z=r*(5+pu*.8);ctx.globalAlpha=.4+.25*pu;ctx.drawImage(glow(e.phase>2?'#ffb040':'#ff5a2a'),-z/2,-z/2,z,z)} // 怒り：炎の色の光が脈打つ
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=e.born>0?Math.min(1,(1-e.born/BOSS_BORN)*2.5):1;
  if(e.slowT>0&&!SPR[e.type]){ // 減速：足もとが凍りつく（強い減速ほど氷が大きい）
    const z=.7+e.slow;ctx.fillStyle=rgba('#8fe6ff',.3);ctx.beginPath();ctx.ellipse(0,r*.8,r*1.3*z,r*.45*z,0,0,TAU);ctx.fill();
    ctx.fillStyle='#e6f9ff';for(const sx of[-1,0,1]){const bx=sx*r*.75*z,h=(4+r*.35)*z*(sx?1:1.4);ctx.beginPath();ctx.moveTo(bx-3,r*.9);ctx.lineTo(bx,r*.9-h);ctx.lineTo(bx+3,r*.9);ctx.fill()}
  }
  if(e.def.heal){ // 癒す影：治せる広さの輪（治した瞬間に明るくなる）
    ctx.strokeStyle=rgba('#9affc8',.1+.4*Math.max(0,e.pulse||0));ctx.lineWidth=1.2;ctx.setLineDash([3,7]);ctx.beginPath();ctx.arc(0,0,HEAL_R,0,TAU);ctx.stroke();ctx.setLineDash([])}
  if(e.cfT>0){ // 惑わし：頭の上をまわる小さな星
    ctx.fillStyle='#f0c0ff';for(let i=0;i<3;i++){const a=S.time*4+i*TAU/3;ctx.beginPath();ctx.arc(Math.cos(a)*r*.8,-r-5+Math.sin(a)*2.5,1.8,0,TAU);ctx.fill()}}
  if(e.lrT>0){ // 誘惑：頭の上に小さなハート
    ctx.fillStyle='#ff8ad0';for(let i=0;i<2;i++){const hx=(i?1:-1)*r*.45,hy=-r-6+Math.sin(S.time*5+i*2)*2;ctx.beginPath();ctx.arc(hx-1.3,hy,1.6,Math.PI,0);ctx.arc(hx+1.3,hy,1.6,Math.PI,0);ctx.lineTo(hx,hy+3.4);ctx.closePath();ctx.fill()}}
  if(e.kb>0){ // 押し戻し：進む向きとは逆へ流れる線
    ctx.strokeStyle=rgba('#ffffff',e.kb/.3);ctx.lineWidth=2;ctx.lineCap='round';
    for(const oy of[-r*.5,0,r*.5]){ctx.beginPath();ctx.moveTo(r+4,oy);ctx.lineTo(r+14,oy);ctx.stroke();ctx.beginPath();ctx.moveTo(-r-4,oy);ctx.lineTo(-r-14,oy);ctx.stroke()}
  }
  const spr=drawSprite(e,t,r,rage); // 絵で描く（sprites.js）。絵がまだ読みこめていなければ、これまでの形で描く
  if(!spr){  ePath(e,t,r);
  if(e.flash>0)ctx.fillStyle='#ffffff';
  else{const bg2=ctx.createLinearGradient(0,-r*1.2,0,r),fc=rage?(e.phase>2?['#8a3a10','#1c0a04']:['#7a1c1c','#190505']):{shade:['#2a1e5c','#070512'],wisp:['#6b1e63','#14061e'],golem:['#6e4a26','#150d05'],mite:['#14523f','#03110c'],boss:['#57152c','#0d0307'],runner:['#5c4a12','#121003'],flyer:['#174a63','#04121a'],splitter:['#1d5226','#04140a'],healer:['#8a84a6','#1c1a2a'],armored:['#3e4c63','#0a0d15']}[e.type];bg2.addColorStop(0,fc[0]);bg2.addColorStop(1,fc[1]);ctx.fillStyle=bg2}
  ctx.fill();
  if(e.stopT>0){ctx.fillStyle='rgba(200,242,255,.52)';ctx.fill()} // 停止：青白く凍りつく
  ctx.strokeStyle=e.stopT>0?'#e6f9ff':e.slowT>0?'#8fe6ff':e.dotT>0?(e.dotK?'#a8f06a':'#ff8a3a'):e.def.rim;ctx.lineWidth=(boss?2.5:e.type==='armored'?2.4:1.6)+(e.stopT>0?1.2:e.slowT>0||e.dotT>0?.8:0);ctx.stroke();
  if(e.dotT>0&&e.dotK){ctx.fillStyle='#a8f06a55';ctx.fill()} // 毒：体が緑がかる
  if(e.stopT>0){ // 停止：体を包む氷の結晶と冷気の輪
    ctx.strokeStyle='rgba(230,249,255,.85)';ctx.lineWidth=1.5;ctx.beginPath();
    for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6,rx=Math.cos(a)*(r+3.5),ry=Math.sin(a)*(r+3.5);ctx[i?'lineTo':'moveTo'](rx,ry)}
    ctx.closePath();ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-r*.5,-r*.4);ctx.lineTo(r*.35,r*.35);ctx.moveTo(r*.4,-r*.45);ctx.lineTo(-r*.25,r*.2);ctx.stroke();
  }
  if(boss){ctx.fillStyle=e.def.rim;for(const sx of[-1,1]){ctx.beginPath();ctx.moveTo(sx*r*.45,-r*.8);ctx.lineTo(sx*r*.95,-r*1.6);ctx.lineTo(sx*r*.85,-r*.5);ctx.fill()}
    const pu=.6+.4*Math.sin(t*4+e.ph),cq=r*.17;ctx.save();ctx.translate(0,r*.38);ctx.rotate(Math.PI/4);ctx.fillStyle=rgba(e.def.rim,.55+.35*pu);ctx.fillRect(-cq/2,-cq/2,cq,cq);ctx.restore();
    ctx.strokeStyle=rgba(e.def.rim,.85);ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<=4;i++){const mx=-r*.3+i*r*.15;ctx[i?'lineTo':'moveTo'](mx,r*.08+((i%2)?r*.09:0))}ctx.stroke()}
  if(e.type==='golem'){ // 岩の面とひび、怒り眉
    ctx.fillStyle='rgba(255,255,255,.07)';ctx.beginPath();ctx.moveTo(-.55*r,-.95*r);ctx.lineTo(.5*r,-1*r);ctx.lineTo(.1*r,-.2*r);ctx.lineTo(-.7*r,-.3*r);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,190,90,.34)';ctx.beginPath();ctx.moveTo(-r*.82,-r*.56);ctx.lineTo(r*.82,-r*.56);ctx.lineTo(r*.64,-r*.32);ctx.lineTo(-r*.64,-r*.32);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffe1ad';for(const bx of[-.55,0,.55]){ctx.beginPath();ctx.arc(bx*r,-r*.44,Math.max(1.2,r*.07),0,TAU);ctx.fill()}
    ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-r*.2,-r*.9);ctx.lineTo(-r*.05,-r*.4);ctx.lineTo(-r*.3,r*.1);ctx.moveTo(r*.55,r*.2);ctx.lineTo(r*.3,r*.55);ctx.stroke();
    ctx.strokeStyle=e.def.rim;ctx.lineWidth=1.6;for(const sx of[-1,1]){ctx.beginPath();ctx.moveTo(sx*r*.1,-r*.34);ctx.lineTo(sx*r*.52,-r*.22);ctx.stroke()}
  }
  if(e.type==='mite'){ // 小さな脚と背のトゲ、触角
    ctx.strokeStyle=e.def.rim;ctx.lineWidth=1.5;ctx.lineCap='round';
    for(const sx of[-1,1])for(let i=0;i<3;i++){const y0=r*.5+i*r*.17,wg=Math.sin(t*18+i*1.7+e.ph)*1.6;
      ctx.beginPath();ctx.moveTo(sx*r*.8,y0);ctx.lineTo(sx*(r+5.5),y0+3.5+wg);ctx.stroke()}
    ctx.fillStyle=e.def.rim;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*r*.45-r*.14,-r*.8);ctx.lineTo(i*r*.45,-r*1.3);ctx.lineTo(i*r*.45+r*.14,-r*.8);ctx.fill()}
    ctx.strokeStyle=e.def.rim;ctx.lineWidth=1.2;for(const sx of[-1,1]){const wg=Math.sin(t*14+e.ph+sx)*1.3;
      ctx.beginPath();ctx.moveTo(sx*r*.28,-r*.82);ctx.quadraticCurveTo(sx*r*.5,-r*1.4,sx*r*.85,-r*1.32+wg);ctx.stroke();
      ctx.fillStyle=e.def.rim;ctx.beginPath();ctx.arc(sx*r*.85,-r*1.32+wg,1.4,0,TAU);ctx.fill()}
  }
  if(e.type==='wisp'){ // 内側の炎
    ctx.save();ctx.scale(.55,.62);ctx.translate(0,r*.28);
    const fl2=Math.sin(t*11+e.ph)*r*.1;ctx.beginPath();ctx.moveTo(0,-r*1.25+fl2);
    ctx.bezierCurveTo(r*.75,-r*.55,r*.85,r*.25,r*.55,r*.7);ctx.quadraticCurveTo(0,r*1.05,-r*.55,r*.7);
    ctx.bezierCurveTo(-r*.85,r*.25,-r*.75,-r*.55,0,-r*1.25+fl2);ctx.closePath();
    ctx.fillStyle=rgba(e.def.rim,.5);ctx.fill();ctx.restore();
    for(const sx of[-1,1]){const tf=Math.sin(t*13+sx*2.1+e.ph)*r*.1;ctx.fillStyle=rgba(e.def.rim,.6);
      ctx.beginPath();ctx.moveTo(sx*r*.9,r*.3);ctx.quadraticCurveTo(sx*r*1.45,r*.05+tf,sx*r*1.1,r*.8);ctx.quadraticCurveTo(sx*r*.78,r*.55,sx*r*.9,r*.3);ctx.fill()}
  }
  if(e.type==='healer'){ // 頭上の光の輪と、胸の淡い光
    ctx.strokeStyle='#ffe9a0';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(0,-r*1.5+Math.sin(t*3+e.ph)*.8,r*.58,r*.19,0,0,TAU);ctx.stroke();
    ctx.fillStyle=rgba('#9affc8',.18+.3*Math.max(0,e.pulse||0));ctx.beginPath();ctx.arc(0,-r*.05,r*.62,0,TAU);ctx.fill();
  }
  if(e.type==='armored'){ // 鋲と継ぎ目、肩のとげ、防ぐ系統の色の紋
    const ec=ELEM[e.armor]||ELEM.earth;
    ctx.fillStyle=e.def.rim;for(const sx of[-1,1]){ctx.beginPath();ctx.moveTo(sx*r*.95,-r*.9);ctx.lineTo(sx*r*1.35,-r*1.3);ctx.lineTo(sx*r*.55,-r*.9);ctx.fill()}
    ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-r*.98,-r*.18);ctx.lineTo(r*.98,-r*.18);ctx.stroke();
    ctx.fillStyle='#dfe8f4';for(const[qx,qy]of[[-.72,-.66],[.72,-.66],[-.78,.02],[.78,.02]]){ctx.beginPath();ctx.arc(qx*r,qy*r,Math.max(1,r*.08),0,TAU);ctx.fill()}
    ctx.fillStyle=rgba(ec.c,.28);ctx.strokeStyle=ec.c;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,r*.42,r*.46,0,TAU);ctx.fill();ctx.stroke();
    ctx.save();ctx.translate(0,r*.42);const k=r*.3/14;ctx.scale(k,k);ctx.fillStyle=ctx.strokeStyle=ec.c;ctx.lineWidth=2.4;ctx.lineJoin=ctx.lineCap='round';ICON[ec.icon](ctx,ec.c);ctx.restore();
    if(e.block>0){ctx.strokeStyle=rgba(ec.c,e.block/.3);ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,r+6,0,TAU);ctx.stroke()} // はじいた瞬間：系統の色の輪
  }
  if(e.type==='shade'){ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,-r*.3,r*.52,r*.42,0,0,TAU);ctx.fill()}
  const eyC=e.type==='wisp'?'#ffd0ff':e.type==='golem'?'#ffb03a':e.type==='mite'?'#c9ffe9':e.type==='runner'?'#fff3b0':e.type==='flyer'?'#e6f7ff':e.type==='splitter'?'#eaffea':e.type==='healer'?'#9affc8':e.type==='armored'?(ELEM[e.armor]||ELEM.earth).c:rage?(e.phase>2?'#ffffff':'#ffe45c'):'#ff3b6b';ctx.fillStyle=eyC;
  if(e.type==='mite'){for(const sx of[-1,1]){ctx.beginPath();ctx.arc(sx*r*.34,-r*.08,Math.max(1.2,r*.2),0,TAU);ctx.fill()}}
  else if(e.type==='golem'){for(const sx of[-1,1]){ctx.beginPath();ctx.ellipse(sx*r*.32,-r*.08,r*.17,r*.07,-.15*sx,0,TAU);ctx.fill()}}
  else if(e.type==='wisp'){const er=Math.max(1.6,r*.2);ctx.beginPath();ctx.arc(-r*.32,-r*.05,er,0,TAU);ctx.arc(r*.32,-r*.05,er,0,TAU);ctx.fill()}
  else if(e.type==='runner'){ctx.save();ctx.rotate(-.35);ctx.beginPath();ctx.ellipse(0,-r*.12,Math.max(1.6,r*.34),Math.max(1.2,r*.13),0,0,TAU);ctx.fill();ctx.restore()}
  else if(e.type==='flyer'){const er=Math.max(1.5,r*.17);ctx.beginPath();ctx.arc(-r*.3,-r*.05,er,0,TAU);ctx.arc(r*.3,-r*.05,er,0,TAU);ctx.fill();ctx.fillStyle=e.def.rim;ctx.beginPath();ctx.moveTo(-r*.14,r*.16);ctx.lineTo(r*.14,r*.16);ctx.lineTo(0,r*.48);ctx.closePath();ctx.fill()}
  else if(e.type==='splitter'){for(const q of[[-.5,.3],[.5,.3],[0,-.45]]){ctx.beginPath();ctx.arc(q[0]*r,q[1]*r,Math.max(1.3,r*.15),0,TAU);ctx.fill()}}
  else if(e.type==='healer'){ctx.fillRect(-r*.36,-r*.16,r*.72,r*.22);ctx.fillRect(-r*.11,-r*.41,r*.22,r*.72)} // 十字の目
  else if(e.type==='armored'){ctx.fillRect(-r*.6,-r*.62,r*1.2,Math.max(2,r*.17))}                               // 兜の細い覗き穴
  else if(boss){for(const sx of[-1,1]){ctx.beginPath();ctx.ellipse(sx*r*.36,-r*.12,Math.max(1.4,r*.1),Math.max(2.4,r*.26),0,0,TAU);ctx.fill()}ctx.beginPath();ctx.ellipse(0,-r*.5,Math.max(1.6,r*.13),Math.max(2.6,r*.3),0,0,TAU);ctx.fill()}
  else{for(const sx of[-1,1]){ctx.beginPath();ctx.ellipse(sx*r*.34,-r*.18,Math.max(1.2,r*.09),Math.max(2,r*.24),0,0,TAU);ctx.fill()}}}
  const rv=spr?sprR(e,r):r; // 状態の輪・印・体力の帯は、絵の大きさに合わせる
  if(spr)ctx.translate(0,sprCY(e,r));
  if(e.drainT>0){ // 呪い：回る輪と、頭上の印
    ctx.strokeStyle='#d05aff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,rv+4,t*3,t*3+4);ctx.stroke();
    const my=-rv-17-(boss?12:0);ctx.fillStyle='#d98aff';ctx.beginPath();ctx.moveTo(-5,my-4);ctx.lineTo(5,my-4);ctx.lineTo(0,my+4);ctx.fill();ctx.fillStyle='#1c0a2c';ctx.beginPath();ctx.ellipse(0,my-1.5,.9,2,0,0,TAU);ctx.fill()}
  if(e.wetT>0){ // 濡れ：青い輪と、頭上の雫
    ctx.strokeStyle='rgba(90,170,255,.8)';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,rv+3,t*2.4,t*2.4+3);ctx.stroke();
    const wx=-11,wy=-rv-17-(boss?12:0);ctx.fillStyle='#6ab8ff';ctx.beginPath();ctx.moveTo(wx,wy-5);ctx.quadraticCurveTo(wx+5,wy+1,wx,wy+4.5);ctx.quadraticCurveTo(wx-5,wy+1,wx,wy-5);ctx.fill()}
  if(e.britT>0){ // ひび割れ：白いヒビと、頭上の印
    ctx.strokeStyle='rgba(235,246,255,.85)';ctx.lineWidth=1.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-rv*.1,-rv*.9);ctx.lineTo(rv*.12,-rv*.5);ctx.lineTo(-rv*.08,-rv*.2);ctx.lineTo(rv*.15,rv*.2);ctx.moveTo(rv*.12,-rv*.5);ctx.lineTo(rv*.45,-rv*.4);ctx.stroke();
    const bx=e.wetT>0?-23:-11,by=-rv-17-(boss?12:0);ctx.strokeStyle='#e8f6ff';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(bx-4,by);ctx.lineTo(bx+4,by);ctx.moveTo(bx,by-4);ctx.lineTo(bx,by+4);ctx.moveTo(bx-3,by-3);ctx.lineTo(bx+3,by+3);ctx.moveTo(bx+3,by-3);ctx.lineTo(bx-3,by+3);ctx.stroke()}
  {let i=0;for(const y of SYN){if(y.k==='wetT'||y.k==='britT'||!(e[y.k]>0))continue; // 乾き・火種・よろめき：その色の回る短い輪と、頭上右の丸印
    ctx.strokeStyle=rgba(y.c,.85);ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,rv+5+i*2,-t*2-i*1.6,-t*2-i*1.6+2.2);ctx.stroke();
    const qx=14+i*8,qy=-rv-17-(boss?12:0);ctx.fillStyle='#07060d';ctx.beginPath();ctx.arc(qx,qy,3.6,0,TAU);ctx.fill();ctx.fillStyle=y.c;ctx.beginPath();ctx.arc(qx,qy,2.5,0,TAU);ctx.fill();i++}}
  {const sa=STAGES[STAGE].aff;if(sa&&sa.c){ctx.strokeStyle=rgba(sa.c,.5);ctx.lineWidth=1.2;ctx.setLineDash([2,3]);ctx.beginPath();ctx.arc(0,0,rv+2,0,TAU);ctx.stroke();ctx.setLineDash([])}} // 属性の地：影のまわりに属性の色の点線
  if(e.gate&&!spr){const c=ELEM[e.gate].c;ctx.strokeStyle=rgba(c,.9);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,rv+2,0,TAU);ctx.stroke();ctx.fillStyle=rgba(c,.22);ctx.beginPath();ctx.arc(0,0,rv,0,TAU);ctx.fill()} // 門ごとの系統の敵：系統の色の輪と、うっすら色づいた体
  if(e.silT>0){ // 沈黙：暗い渦と頭上の「×」印
    ctx.strokeStyle='#7a60b8';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,rv+6,-t*4,-t*4+3.6);ctx.stroke();
    const sx=e.drainT>0?8:0,sy=-rv-17-(boss?12:0);ctx.lineCap='round';
    for(const[w,col]of[[3.6,'#07060d'],[1.8,'#c4b0ff']]){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(sx-3.5,sy-3.5);ctx.lineTo(sx+3.5,sy+3.5);ctx.moveTo(sx+3.5,sy-3.5);ctx.lineTo(sx-3.5,sy+3.5);ctx.stroke()}}
  if(e.healed>0){const k=e.healed/.6,py=-rv*.9-(1-k)*10;ctx.fillStyle=rgba('#9affc8',Math.min(1,k*1.6));ctx.fillRect(rv*.7-4,py-1.2,8,2.4);ctx.fillRect(rv*.7-1.2,py-4,2.4,8)} // 治してもらった印
  if(e.hp<e.max){const w=Math.max(18,rv*2.2),k=clamp(e.hp/e.max,0,1);
    ctx.fillStyle='#000a';ctx.fillRect(-w/2,-rv-9-(boss?12:0),w,3.5);ctx.fillStyle=k>.5?'#b98cff':k>.25?'#ffb070':'#ff3b6b';ctx.fillRect(-w/2,-rv-9-(boss?12:0),w*k,3.5)}
  ctx.restore();
}
function drawBtn(b,dt){
  b.p+=(((pressed===b)?1:0)-b.p)*Math.min(1,dt*22);
  const s=1-b.p*.09,cx=b.x+b.w/2,cy=b.y+b.h/2;
  ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);ctx.translate(-cx,-cy);
  let on=true,label='',col='#8b5cf6';
  if(BASES.includes(b.id)){on=S.mana>=BASE_COST;col=ITEMS[b.id].c}
  if(b.id==='wave'){on=!S.active;col='#e8c36a'}
  if(b.id==='undo')on=canUndo();
  const hot=b.id==='trash'&&drag&&drag.moved&&!drag.shop&&inBtn(b,ptr.x,ptr.y);
  const gr=ctx.createLinearGradient(0,b.y,0,b.y+b.h);gr.addColorStop(0,hot?'#3a1020':'#191430');gr.addColorStop(1,'#0a0814');
  ctx.fillStyle=gr;rr(ctx,b.x,b.y,b.w,b.h,b.top?b.h/2:12);ctx.fill();
  ctx.strokeStyle=rgba(hot?'#ff3b6b':col,on?(.55+b.p*.45):.2);ctx.lineWidth=1.3;ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';
  if(BASES.includes(b.id)){
    ctx.globalAlpha=on?1:.35;ctx.drawImage(orb(b.id),cx-26,b.y-8,52,52);
    ctx.font=FONT(FS.f1,800);ctx.textAlign='right';ctx.fillStyle='#ece7f7';ctx.fillText(nm(ITEMS[b.id]),cx-3,b.y+b.h-9);
    ctx.textAlign='left';ctx.fillStyle='#e8c36a';ctx.fillText('◆'+BASE_COST,cx,b.y+b.h-9);ctx.textAlign='center';
  }else if(b.id==='wave'){
    if(S.tut<2)on=false; // 手引き中：塔を置くまでは波のボタンを目立たせない（押すことはできる）
    const pulse=on&&!S.over?.5+.5*Math.sin(S.time*4):0;
    if(on){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.12+pulse*.12;ctx.fillStyle='#e8c36a';rr(ctx,b.x,b.y,b.w,b.h,12);ctx.fill();ctx.globalCompositeOperation='source-over'}
    ctx.globalAlpha=on?1:.85;ctx.font=FONT(FS.f3*LY.k,800);ctx.fillStyle=on?'#fff3cf':'#b9b1d0';
    ctx.fillText(S.active?TT('fighting'):TT('nextWave',S.wave+1),cx,cy+1,b.w-10);on=!S.active;
  }else{
    const fg=hot?'#ff8a9a':'#cfc8e6';
    if(b.id==='speed'){ // 右上の丸ボタン：早送りの印と倍率
      ctx.fillStyle=fg;for(const ox of[-7,1]){ctx.beginPath();ctx.moveTo(cx+ox-1,cy-13);ctx.lineTo(cx+ox+7,cy-8);ctx.lineTo(cx+ox-1,cy-3);ctx.fill()}
      ctx.font=FONT(FS.f2,800);ctx.fillText('×'+S.speed,cx,cy+9);
    }else{ // 上に絵、下に名前
      if(b.id==='undo')ctx.globalAlpha=on?1:.3;
      const k=LY.k,iy=cy-8*k;ctx.save();ctx.translate(cx,iy);ctx.scale(k,k);ctx.lineWidth=1.9;ctx.lineCap='round';ctx.lineJoin='round';
      if(b.id==='undo'){ctx.strokeStyle='#e8c36a';ctx.beginPath();ctx.moveTo(-4,-6);ctx.lineTo(-9,-1);ctx.lineTo(-4,4);ctx.moveTo(-9,-1);ctx.lineTo(3,-1);ctx.arc(3,4,5,-Math.PI/2,Math.PI/2);ctx.lineTo(0,9);ctx.stroke()}
      if(b.id==='trash'){ctx.strokeStyle=hot?'#ff8a9a':'#e8c36a';ctx.beginPath();ctx.moveTo(-9,-5);ctx.lineTo(9,-5);ctx.moveTo(-3,-5);ctx.lineTo(-3,-8.5);ctx.lineTo(3,-8.5);ctx.lineTo(3,-5);
        ctx.moveTo(-6.5,-5);ctx.lineTo(-5.5,9);ctx.lineTo(5.5,9);ctx.lineTo(6.5,-5);ctx.moveTo(-2,-1);ctx.lineTo(-2,5);ctx.moveTo(2,-1);ctx.lineTo(2,5);ctx.stroke()}
      if(b.id==='menu'){ctx.strokeStyle=fg;ctx.lineWidth=2.1;ctx.beginPath();for(const oy of[-6,0,6]){ctx.moveTo(-8,oy);ctx.lineTo(8,oy)}ctx.stroke()}
      ctx.restore();
      ctx.font=FONT(FS.f1*LY.k,800);ctx.fillStyle=fg;
      ctx.fillText(b.id==='trash'&&hot?TT('bTrashHot'):{trash:TT('bTrash'),menu:TT('bMenu'),undo:TT('bUndo')}[b.id],cx,cy+13*k,b.w-6);ctx.globalAlpha=1;
    }
  }
  ctx.restore();
}
function drawShop(dt){
  const T=performance.now()/1000;
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const t of TABS){
    if(t.t==='f'){const act=fltOn()||FLT.sort!=='rank',cx=t.x+t.w/2,cy=t.y+t.h/2; // ⇅：しぼっている間は金色と点
      ctx.fillStyle=act?'#3a2f15':'#0d0b18';rr(ctx,t.x,t.y,t.w,t.h,11);ctx.fill();ctx.strokeStyle=act?'#e8c36a':rgba('#8b5cf6',.5);ctx.lineWidth=1.2;ctx.stroke();
      ctx.save();ctx.translate(cx,cy);ctx.scale(LY.k,LY.k);ctx.strokeStyle=act?'#ffe9a0':'#cfc8e6';ctx.lineWidth=1.9;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
      ctx.moveTo(-4,7);ctx.lineTo(-4,-7);ctx.moveTo(-8,-3);ctx.lineTo(-4,-7);ctx.lineTo(0,-3);ctx.moveTo(4,-7);ctx.lineTo(4,7);ctx.moveTo(0,3);ctx.lineTo(4,7);ctx.lineTo(8,3);ctx.stroke();ctx.restore();
      if(act){ctx.fillStyle='#ffe9a0';ctx.beginPath();ctx.arc(t.x+t.w-6,t.y+6,3,0,TAU);ctx.fill()}
      continue}
    const on=FLT.rank.has(t.t),has=shopList(t.t).some(d=>disc.has(d.id));
    ctx.fillStyle=on?'#2a2148':'#0d0b18';rr(ctx,t.x,t.y,t.w,t.h,11);ctx.fill();
    ctx.strokeStyle=on?'#e8c36a':rgba('#8b5cf6',has?.5:.2);ctx.lineWidth=1.2;ctx.stroke();
    ctx.font=FONT(FS.f3*LY.k,800);ctx.fillStyle=on?'#ffe9a0':has?'#cfc8e6':'#8a82ad';ctx.fillText('★'+t.t,t.x+t.w/2,t.y+t.h/2+.5); // ★の数を数えなくて済むよう数字で
    if(t.t>1&&t.t<=S.ws){ctx.fillStyle=rgba('#e8c36a',.8);ctx.fillRect(t.x+10,t.y+t.h-3,t.w-20,1.6)}
    if(SHOP.dotT[t.t]>0){SHOP.dotT[t.t]-=dt;if(on)SHOP.dotT[t.t]=Math.min(SHOP.dotT[t.t],1.2);
      ctx.fillStyle=rgba('#ffe9a0',.6+.4*Math.sin(T*9));ctx.beginPath();ctx.arc(t.x+t.w-5,t.y+3,3.2,0,TAU);ctx.fill()}}
  const tab=SHOP.tab,list=shopList(tab),max=shopMax(tab);SHOP.scroll[tab]=clamp(SHOP.scroll[tab],0,max);
  if(SHOP.newT>0)SHOP.newT-=dt;SHOP.pressT+=((SHOP.press!==null?1:0)-SHOP.pressT)*Math.min(1,dt*22);
  ctx.save();ctx.beginPath();ctx.rect(SHOP.x-2,SHOP.y-10,SHOP.w+4,SHOP.h+14);ctx.clip();
  list.forEach((d,i)=>{
    const x=shopBtnX(i);if(x>SHOP.x+SHOP.w||x+SHOP.bw<SHOP.x)return;
    const cx=x+SHOP.bw/2,cy=SHOP.y+SHOP.h/2;
    if(d.ws){ // 工房レベルを上げる札
      const next=d.ws===S.ws+1,cost=WS_COST[d.ws],can=next&&S.mana>=cost,sc=1-(SHOP.press===i?SHOP.pressT*.1:0),fz=FS.f1*LY.k;
      ctx.save();ctx.translate(cx,cy);ctx.scale(sc,sc);ctx.translate(-cx,-cy);
      const g2=ctx.createLinearGradient(0,SHOP.y,0,SHOP.y+SHOP.h);g2.addColorStop(0,next?'#3a2a14':'#16120e');g2.addColorStop(1,'#0a0814');
      ctx.fillStyle=g2;rr(ctx,x,SHOP.y,SHOP.bw,SHOP.h,4);ctx.fill(); // 元素の札（角の丸い札）と見分けがつくよう、角を立てて二重の枠にする
      const pu=can?.5+.5*Math.sin(T*4):0;ctx.strokeStyle=rgba('#e8c36a',next?.55+pu*.45:.25);ctx.lineWidth=next?1.8:1.2;ctx.stroke();
      ctx.lineWidth=.8;rr(ctx,x+3,SHOP.y+3,SHOP.bw-6,SHOP.h-6,2);ctx.stroke();
      ctx.strokeStyle=rgba('#e8c36a',.35);ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(x+SHOP.pitch-2.5,SHOP.y+6);ctx.lineTo(x+SHOP.pitch-2.5,SHOP.y+SHOP.h-6);ctx.stroke();ctx.setLineDash([]); // 元素の列との区切り
      ctx.globalAlpha=next?1:.45;
      ctx.font=FONT(fz*.95,800);ctx.fillStyle='#e8c36a';ctx.fillText(TT('wsName'),cx,SHOP.y+SHOP.h*.22);
      ctx.font=FONT(fz*1.45,800);ctx.fillStyle='#fff3cf';ctx.fillText('▲Lv'+d.ws,cx,SHOP.y+SHOP.h*.5,SHOP.bw-8);
      ctx.font=FONT(fz,800);ctx.fillStyle=next?(S.mana>=cost?'#e8c36a':'#a08a6a'):'#8d86a3';ctx.fillText(next?'◆'+cost:TT('wsFirstShort',d.ws-1),cx,SHOP.y+SHOP.h-fz*.7);
      ctx.globalAlpha=1;ctx.restore();return;
    }
    const ok=disc.has(d.id),buy=ok&&canBuy(d.id),cost=itemValue(d),can=buy&&S.mana>=cost;
    const sc=1-(SHOP.press===i?SHOP.pressT*.1:0);
    ctx.save();ctx.translate(cx,cy);ctx.scale(sc,sc);ctx.translate(-cx,-cy);
    const gr=ctx.createLinearGradient(0,SHOP.y,0,SHOP.y+SHOP.h);gr.addColorStop(0,ok?'#191430':'#0e0c19');gr.addColorStop(1,'#0a0814');
    ctx.fillStyle=gr;rr(ctx,x,SHOP.y,SHOP.bw,SHOP.h,11);ctx.fill();
    ctx.strokeStyle=rgba(ok?d.c:'#3a3355',can?.6:.28);ctx.lineWidth=1.3;ctx.stroke();
    if(ok){
      const fz=FS.f1*LY.k,iz=Math.min(64,SHOP.h-8,(SHOP.h-fz*2.3)/.73);
      ctx.globalAlpha=can?1:.38;ctx.drawImage(orb(d.id),cx-iz/2,SHOP.y-iz*.12,iz,iz);
      ctx.font=FONT(LANG==='ja'?fz:fz*.9,800);ctx.fillStyle='#ece7f7';ctx.fillText(nm(d),cx,SHOP.y+SHOP.h-fz*1.75);
      ctx.font=FONT(fz,800);ctx.fillStyle=buy?'#e8c36a':'#a890ff';ctx.fillText(buy?'◆'+cost:'Lv'+d.t,cx,SHOP.y+SHOP.h-fz*.7,SHOP.bw-6);ctx.globalAlpha=1;
      if(tab===0){ctx.font=FONT(FS.f1*.9,800);ctx.textAlign='left';ctx.fillStyle='#e8c36a';ctx.fillText('★'+d.t,x+4,SHOP.y+8);ctx.textAlign='center'} // 全タブでは★が混ざるので小さく出す
      if(SHOP.newId===d.id&&SHOP.newT>0){const pu=.5+.5*Math.sin(T*8);ctx.strokeStyle=rgba('#ffe9a0',Math.min(1,SHOP.newT)*(.5+pu*.5));ctx.lineWidth=2.5;
        rr(ctx,x-1-pu*2,SHOP.y-1-pu*2,SHOP.bw+2+pu*4,SHOP.h+2+pu*4,12);ctx.stroke();
        ctx.font=FONT(FS.f1,800);ctx.lineWidth=3;ctx.strokeStyle='#05040a';ctx.strokeText('NEW',cx+16,SHOP.y+7);ctx.fillStyle=rgba('#ffe9a0',Math.min(1,SHOP.newT));ctx.fillText('NEW',cx+16,SHOP.y+7)}
    }else{
      ctx.strokeStyle='#3a3355';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(cx,SHOP.y+19,14,0,TAU);ctx.stroke();
      ctx.font=FONT(FS.f2,800);ctx.fillStyle='#4f4870';ctx.fillText('？',cx,SHOP.y+20);ctx.font=FONT(FS.f1*LY.k);(UNLOCK[d.id]!==undefined?TT('lockN',sn(STAGES[UNLOCK[d.id]])).split('\n'):[TT('unknown')]).forEach((ln,k,a)=>ctx.fillText(ln,cx,SHOP.y+SHOP.h-13-(a.length-1-k)*FS.f1*LY.k*1.1,SHOP.bw-6));
    }
    ctx.restore();
  });
  ctx.restore();
  // まだ先があるときは端をぼかし、矢印を出す
  for(const[cond,x0,x1,ax]of[[SHOP.scroll[tab]<max-1,W-46,W,W-10],[SHOP.scroll[tab]>1,46,0,10]]){if(!cond)continue;
    const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'rgba(5,4,9,0)');g.addColorStop(1,'rgba(5,4,9,.95)');ctx.fillStyle=g;ctx.fillRect(Math.min(x0,x1),SHOP.y-8,46,SHOP.h+12);
    ctx.font=FONT(FS.f2,800);ctx.fillStyle=rgba('#e8c36a',.6+.4*Math.sin(T*5));ctx.fillText(ax>W/2?'›':'‹',ax+(ax>W/2?1:-1)*Math.sin(T*5)*2,SHOP.y+SHOP.h/2)}
}
// 最初の手引き：やることを 1 つずつ、指の動きと吹き出しで示す
function tutBubble(x,y,txt){
  ctx.font=FONT(FS.f2*Math.min(LY.k,1.1),800);const w=Math.min(W-24,ctx.measureText(txt).width+30),h=30;x=clamp(x,w/2+8,W-w/2-8);
  ctx.fillStyle='#0b0916ee';rr(ctx,x-w/2,y-h/2,w,h,15);ctx.fill();ctx.strokeStyle='#e8c36a';ctx.lineWidth=1.3;ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff3cf';ctx.fillText(txt,x,y+1);
}
function tutFinger(x0,y0,x1,y1,T){ // (x0,y0) をつまんで (x1,y1) へ運ぶ動き
  const u=(T*.6)%1,k=u<.15?0:u>.8?1:(u-.15)/.65,e=k*k*(3-2*k),x=x0+(x1-x0)*e,y=y0+(y1-y0)*e-Math.sin(e*Math.PI)*18,a=u>.9?(1-u)/.1:Math.min(1,u/.1);
  ctx.setLineDash([3,6]);ctx.strokeStyle=rgba('#ffe9a0',.5);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x0,y0);ctx.quadraticCurveTo((x0+x1)/2,(y0+y1)/2-36,x1,y1);ctx.stroke();ctx.setLineDash([]);
  const pr=u<.15?1-u/.15*.25:.75;ctx.globalAlpha=a;ctx.fillStyle='#ffffff33';ctx.strokeStyle='#ffffff';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(x,y,15*pr,0,TAU);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,4,0,TAU);ctx.fill();ctx.globalAlpha=1;
}
function tutArrow(x,y,T){const b=Math.sin(T*6)*4;ctx.fillStyle='#ffe9a0';ctx.beginPath();ctx.moveTo(x-9,y-14+b);ctx.lineTo(x+9,y-14+b);ctx.lineTo(x,y+b);ctx.fill()}
function tutBuy(T){ // 一覧の元素をつまんで、空いた作業台へ運ぶ動き
  const f=slots.find(s=>s.bench&&!s.item),i=shopList(SHOP.tab).findIndex(d=>!d.ws&&canBuy(d.id));
  if(!f||i<0){tutArrow(SHOP.x+30,SHOP.y-4,T);return}
  tutFinger(shopBtnX(i)+SHOP.bw/2,SHOP.y+SHOP.h/2,f.x,f.y,T);
}
function drawTut(T){
  const bench=slots.filter(s=>s.bench&&s.item&&s.item.hide<=0),by=LY.benchY(1),pu=.5+.5*Math.sin(T*6);
  if(S.tut===0){ // 重ねる
    let A=null,B=null;for(const a of bench){B=bench.find(b=>b!==a&&!tryCombine(a.item,b.item).fail);if(B){A=a;break}}
    if(!A){if(S.mana>=BASE_COST){tutBuy(T);tutBubble(W/2,by,TT('tut3'))}return}
    tutFinger(A.x,A.y,B.x,B.y,T);tutBubble(W/2,by,TT('tut0'));
  }else if(S.tut===1){ // 魔法陣へ運ぶ
    const A=bench.filter(s=>!isTrap(s.item.id)).sort((a,b)=>ITEMS[b.item.id].t-ITEMS[a.item.id].t)[0],F=slots.filter(s=>s.field&&!s.item),Bf=F[1]||F[0];
    if(!A||!Bf)return;
    ctx.strokeStyle=rgba('#ffe9a0',.5+pu*.5);ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(Bf.x,Bf.y,31+pu*3,0,TAU);ctx.stroke();
    tutFinger(A.x,A.y,Bf.x,Bf.y,T);tutBubble(W/2,by,TT('tut1'));
  }else if(S.tut===2&&!S.active){ // 波を呼ぶ
    const b=btn('wave');tutArrow(b.x+b.w/2,b.y-4,T);tutBubble(W/2,by,TT('tut2'));
  }else if(S.tut===3&&S.mana>=BASE_COST){ // 一覧から呼び出す
    tutBuy(T);tutBubble(W/2,TABS[0].y-22,TT('tut3'));
  }
}
function drawHud(dt){
  S.manaShow+=(S.mana-S.manaShow)*Math.min(1,dt*10);
  ctx.textBaseline='middle';
  // 灯（残りライフ）
  { // 灯火の絵（小さな炎）
    const fx0=19,fy0=25,fl=1+.06*Math.sin(S.time*7);ctx.save();ctx.translate(fx0,fy0+7);ctx.scale(fl,fl);
    ctx.fillStyle=S.lives<=5?'#ff3b6b':'#ffb0c0';ctx.beginPath();ctx.moveTo(0,-15);ctx.bezierCurveTo(6,-8,7,-3,6,-1);ctx.arc(0,-1,6,0,Math.PI);ctx.bezierCurveTo(-7,-3,-6,-8,0,-15);ctx.fill();
    ctx.fillStyle='#fff3cf';ctx.beginPath();ctx.moveTo(0,-8);ctx.bezierCurveTo(3,-4,3,-2,2.6,-1);ctx.arc(0,-1,2.6,0,Math.PI);ctx.bezierCurveTo(-3,-2,-3,-4,0,-8);ctx.fill();ctx.restore();
  }
  ctx.textAlign='left';ctx.font=FONT(FS.f2);ctx.fillStyle='#8d86a3';ctx.fillText(TT('lives'),30,25);const lw=ctx.measureText(TT('lives')).width+16;
  ctx.font=FONT(FS.f4,800);ctx.fillStyle=S.lives<=5?'#ff3b6b':'#ffb0c0';
  const ls=1+S.coreHit*.5;ctx.save();ctx.translate(20+lw,25);ctx.scale(ls,ls);ctx.fillText(S.lives,0,1);ctx.restore();
  // 波
  ctx.textAlign='center';ctx.font=FONT(FS.f2);ctx.fillStyle='#8d86a3';ctx.fillText(TT('wave'),W/2-56,24);
  ctx.font=FONT(FS.f4,800);ctx.fillStyle='#e9e4f5';ctx.fillText(`${S.wave} / ${S.endless?'∞':MAX_WAVE}`,W/2+12,23);
  ctx.font=FONT(FS.f1,800);ctx.fillStyle=NIGHT===2?'#d9a8ff':NIGHT?'#ff8a9a':'#a9a2c0';const stn=sn(STAGES[STAGE])+(NIGHT===2?TT('abyssDot'):NIGHT?TT('nightDot'):'')+(DAILY?TT('dailyDot'):'');
  if(S.active){ // 戦闘中は、ステージ名の右に残りの敵の数を金色で出す
    const lt='　'+TT('left',S.queue.length+S.enemies.length),w1=ctx.measureText(stn).width,w2=ctx.measureText(lt).width,x0=W/2-(w1+w2)/2;
    ctx.textAlign='left';ctx.fillText(stn,x0,43);ctx.fillStyle='#ffe9a0';ctx.fillText(lt,x0+w1,43);ctx.textAlign='center';
  }else ctx.fillText(stn,W/2,43);
  { // 工房レベル（★をどこまで錬成できるか）を魔力の下に出す。次のレベルに届く魔力があれば金色に。ステージ名と重なるときは短く
    const cw=ctx.measureText(stn+(S.active?'　'+TT('left',S.queue.length+S.enemies.length):'')).width,nx=WS_COST[S.ws+1];
    let t=TT('wsHud',S.ws,Math.min(6,S.ws+1));if(W-56-ctx.measureText(t).width<W/2+cw/2+10)t=TT('wsHudS',S.ws);
    ctx.textAlign='right';ctx.fillStyle=nx&&S.mana>=nx?'#e8c36a':'#a9a2c0';ctx.fillText(t,W-56,43);ctx.textAlign='center';
  }
  // 魔力
  const mx=W-56,sc=1+S.manaBump*.35;
  ctx.save();ctx.translate(mx+(S.manaErr>0?Math.sin(S.manaErr*70)*5*S.manaErr:0),25);ctx.scale(sc,sc);
  ctx.textAlign='right';ctx.font=FONT(FS.f4,800);ctx.fillStyle=S.manaErr>0?'#ff3b6b':'#ffe9a0';
  const tx=(Math.abs(S.mana-S.manaShow)<.5?Math.floor(S.mana):Math.round(S.manaShow))+'';ctx.fillText(tx,0,1);
  const tw=ctx.measureText(tx).width;ctx.font=FONT(FS.f2);ctx.fillStyle='#e8c36a';ctx.fillText('◆',-tw-5,1);
  ctx.restore();
}
// 主・王の体力：画面の上に専用の帯で出す（段階の境目に目盛り、減ったぶんは白く遅れて追いかける）
function drawBossBar(dt){ // 夜の王が2体いるときは帯を2本重ねて出す。戻り値は帯の本数
  const bs=S.enemies.filter(q=>q.type==='boss'&&!q.dead).slice(0,2);
  if(!bs.length){S.bossA=0;return 0}
  S.bossA=Math.min(1,S.bossA+dt*3);
  bs.forEach((e,i)=>drawBossBar1(e,dt,55+i*BOSS_BAR_GAP));return bs.length;
}
const BOSS_BAR_GAP=16;
function drawBossBar1(e,dt,y){
  const k=clamp(e.hp/e.max,0,1);e.lag=Math.max(k,(e.lag??1)-dt*.35);
  const T=performance.now()/1000,ph=e.phase||1,name=TT(e.final?'bossKing':'bossLord')+(ph>1?(LANG==='ja'?'・':' · ')+TT(ph>2?'bossFury':'bossRage'):'');
  ctx.save();ctx.globalAlpha=S.bossA;ctx.translate(0,(1-S.bossA)*-8);
  ctx.font=FONT(FS.f1,800);ctx.textAlign='left';ctx.textBaseline='middle';const nw=ctx.measureText(name).width,x=20+nw+8,w=W-16-x,h=9;
  ctx.fillStyle=ph>2?'#ffd98a':ph>1?'#ffb070':'#ffd0d8';ctx.fillText(name,16,y+h/2+.5);
  ctx.fillStyle='#05040acc';rr(ctx,x-2,y-2,w+4,h+4,5);ctx.fill();ctx.strokeStyle=rgba('#ff3b6b',.55);ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#ffffffb0';ctx.fillRect(x,y,w*e.lag,h);
  const pu=ph>1?.5+.5*Math.sin(T*(ph>2?12:7)):0,g=ctx.createLinearGradient(x,0,x+w,0);
  if(ph>2){g.addColorStop(0,'#ff5a2a');g.addColorStop(1,'#ffd23c')}else if(ph>1){g.addColorStop(0,'#d0375a');g.addColorStop(1,'#ff7a3a')}else{g.addColorStop(0,'#8a1f3c');g.addColorStop(1,'#ff3b6b')}
  ctx.fillStyle=g;ctx.fillRect(x,y,w*k,h);
  if(pu){ctx.globalCompositeOperation='lighter';ctx.fillStyle=rgba('#ffe9a0',.18*pu);ctx.fillRect(x,y,w*k,h);ctx.globalCompositeOperation='source-over'}
  ctx.fillStyle='#ffffff30';ctx.fillRect(x,y,w*k,2);
  for(const q of(e.final?[BOSS_PH[1].at,BOSS_PH[2].at]:[BOSS_PH[1].at])){ctx.fillStyle=k>q?'#05040a':'#05040a66';ctx.fillRect(x+w*q-1,y-2,2,h+4);ctx.fillStyle='#ffe9a0';ctx.beginPath();ctx.moveTo(x+w*q-3,y-4);ctx.lineTo(x+w*q+3,y-4);ctx.lineTo(x+w*q,y);ctx.fill()}
  ctx.restore();
}
// 主が近づく警告：戦場のふちが赤く脈打ち、縞の帯が流れる
function drawWarn(dt){
  S.warn-=dt;const k=1-Math.max(0,S.warn)/WARN_T,a=k<.1?k/.1:k>.82?(1-k)/.18:1,T=performance.now()/1000,pu=.5+.5*Math.sin(T*11);
  let g=ctx.createRadialGradient(W/2,282,140,W/2,282,340);g.addColorStop(0,'rgba(255,42,74,0)');g.addColorStop(1,rgba('#ff2a4a',a*(.22+.2*pu)));ctx.fillStyle=g;ctx.fillRect(0,46,W,472);
  const y=150,h=46;ctx.globalAlpha=a;ctx.fillStyle='#14040ae0';ctx.fillRect(0,y,W,h);
  ctx.save();ctx.beginPath();ctx.rect(0,y,W,5);ctx.rect(0,y+h-5,W,5);ctx.clip();ctx.fillStyle='#ff3b6b';
  for(let x=-40+((T*40)%20);x<W+20;x+=20){ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x+10,y+h);ctx.lineTo(x+10+h,y);ctx.lineTo(x+h,y);ctx.fill()}ctx.restore();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=FONT(LANG==='ja'?23:19,800);ctx.fillStyle=rgba('#ffd0d8',.75+.25*pu);
  const txt=TT(S.warnFinal?'warnKing':'warnLord'),tw=ctx.measureText(txt).width;ctx.fillText(txt,W/2,y+h/2+1);
  ctx.fillStyle='#ff3b6b';for(const sx of[-1,1]){const cx=W/2+sx*(tw/2+22),cy=y+h/2+1;ctx.beginPath();ctx.moveTo(cx,cy-9);ctx.lineTo(cx+9,cy+7);ctx.lineTo(cx-9,cy+7);ctx.closePath();ctx.fill();
    ctx.fillStyle='#14040a';ctx.fillRect(cx-1,cy-3.5,2,6);ctx.fillRect(cx-1,cy+3.5,2,2);ctx.fillStyle='#ff3b6b'}
  ctx.globalAlpha=1;
}
function zapPath(f){
  ctx.beginPath();
  for(let i=0;i<f.pts.length-1;i++){
    const[ax,ay]=f.pts[i],[bx,by]=f.pts[i+1],n=Math.max(2,Math.hypot(bx-ax,by-ay)/14|0);
    ctx.moveTo(ax,ay);
    for(let j=1;j<=n;j++){const k=j/n,o=j<n?Math.sin(f.seed*91+i*7+j*13+((f.t*40)|0))*7:0;ctx.lineTo(ax+(bx-ax)*k+o,ay+(by-ay)*k-o)}
  }
}
function render(dt){
  ctx.setTransform(SC,0,0,SC,0,0);
  if(!bgCanvas)bgCanvas=makeBg();
  ctx.save();
  if(S.shake>.2)ctx.translate(rnd(-S.shake,S.shake),rnd(-S.shake,S.shake));
  ctx.drawImage(bgCanvas,0,0,W,H);
  const t=S.time,T=performance.now()/1000;
  if(S.dawn>0){ // 夜明け
    const g=ctx.createLinearGradient(0,40,0,520);g.addColorStop(0,rgba('#3a2a7a',.35*S.dawn));g.addColorStop(.55,rgba('#c0507a',.3*S.dawn));g.addColorStop(1,rgba('#ffc070',.5*S.dawn));
    ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(0,40,W,480);
    ctx.globalAlpha=S.dawn;ctx.drawImage(glow('#ffe9a0'),W/2-260,515-260*S.dawn,520,520);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
  // 魔法陣・作業台の強調（運んでいるとき）
  const held=drag&&drag.moved?drag:null,src=held?held.slot:sel;
  // 運んでいる・選んでいる元素と★の数がちがう元素は重ねられないので、暗くして禁止の印をつける（★が同じでレシピが無いものは、そのまま）
  const offT=src&&src.item?ITEMS[src.item.id].t:0,rankOff=it=>!!offT&&it!==src.item&&ITEMS[it.id].t!==offT;
  const banMark=(x,y)=>{ctx.save();ctx.translate(x,y);ctx.lineCap='round';
    for(const[w,c]of[[5.5,'#07060d'],[2.4,'#ff6a7a']]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.moveTo(-5.6,5.6);ctx.lineTo(5.6,-5.6);ctx.stroke()}
    ctx.restore()};
  for(const s of slots){
    if(src&&s!==src){
      let ok=false;
      if(!s.item)ok=!!held&&fits(src.item.id,s);else{const r=tryCombine(src.item,s.item);ok=!r.fail&&disc.has(r.id)}
      if(ok){const pu=.5+.5*Math.sin(T*7);ctx.strokeStyle=rgba(s.item?'#ffe9a0':'#8b5cf6',s.item?.5+pu*.5:.25+pu*.3);ctx.lineWidth=s.item?2.5:1.5;
        ctx.beginPath();ctx.arc(s.x,s.y,31+pu*2,0,TAU);ctx.stroke()}
    }
    const it=s.item;if(!it)continue;
    // ばねで位置と大きさを追従させる
    const k=1-Math.exp(-dt*(it.fly>0?9:20));it.rx+=(s.x-it.rx)*k;it.ry+=(s.y-it.ry)*k;
    if(it.fly>0){it.fly-=dt;P(it.rx+rnd(-6,6),it.ry+rnd(-6,6),rnd(-20,20),rnd(-20,20),.45,5,ITEMS[it.id].c)}
    if(it.hide>0){it.hide-=dt;if(it.hide<=0&&it.s<.1){it.s=.3;it.sv=8}continue}
    it.sv+=((1-it.s)*320-it.sv*16)*dt;it.s+=it.sv*dt;it.kick*=Math.exp(-dt*12);if(it.shake>0)it.shake-=dt;
  }
  // 塔の足もとの回る輪と射程
  for(const s of slots){const it=s.item;if(!it||!s.field||it.hide>0||it===held?.item)continue;
    const d=ITEMS[it.id];ctx.save();ctx.translate(s.x,s.y);ctx.rotate(T*(.4+d.t*.15)+it.ph);ctx.strokeStyle=rgba(d.c,.5);ctx.lineWidth=1.5;ctx.setLineDash([5,7]);
    ctx.beginPath();ctx.arc(0,0,31,0,TAU);ctx.stroke();ctx.restore();
    if(d.kind==='support'||d.kind==='ward'||d.buffD!=null){ // 支援の塔・結界：効く広さの輪（癒す影の輪と同じ点線。ゆっくり回り、淡く明滅する）
      const pu=.5+.5*Math.sin(T*1.6+it.ph);ctx.fillStyle=rgba(d.c,.025);ctx.strokeStyle=rgba(d.c,.26+.16*pu);ctx.lineWidth=1.3;ctx.setLineDash([3,7]);ctx.lineDashOffset=-T*6;
      ctx.beginPath();ctx.arc(s.x,s.y,d.range,0,TAU);ctx.fill();ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0}}
  if((held||sel)&&ITEMS[(held||sel).item?.id]?.kind==='relic'){ // 聖灰を持っている・選んでいる間は、使える砦を光らせる
    const pu=.5+.5*Math.sin(T*6),on=held&&nearCore(ptr.x,ptr.y-(held.touch?26:0));ctx.strokeStyle=rgba('#ffe9a0',on?.9:.35+pu*.35);ctx.lineWidth=on?3:2;ctx.setLineDash([4,5]);ctx.lineDashOffset=-T*20;
    ctx.beginPath();ctx.arc(CORE.x,CORE.y,on?34:28+pu*4,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.lineDashOffset=0}
  // 共鳴陣が両方そろったときの光の結び線
  for(const s of slots){
    if(s.mod==='link'&&s.linkTo&&slots.indexOf(s)<slots.indexOf(s.linkTo)&&s.item&&s.linkTo.item&&!s.item.held&&!s.linkTo.item.held){
      const pu=.5+.5*Math.sin(T*4);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba('#ffe9a0',.32+.25*pu);ctx.lineWidth=2.4;
      ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.linkTo.x,s.linkTo.y);ctx.stroke();ctx.restore();
    }
  }
  const rs=held?(slotAt(ptr.x,ptr.y-(held.touch?26:0))||null):sel;
  if(rs&&!rs.bench&&(held||rs.item)&&fits((held?held.item:rs.item).id,rs)){const it=held?held.item:rs.item,d=ITEMS[it.id],R=d.range*slotMod(rs).range;
    ctx.fillStyle=rgba(d.c,.07);ctx.strokeStyle=rgba(d.c,.5);ctx.lineWidth=1;ctx.beginPath();ctx.arc(rs.x,rs.y,R,0,TAU);ctx.fill();ctx.stroke()}
  if(sel&&sel.item){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.setLineDash([4,5]);ctx.lineDashOffset=-T*30;ctx.beginPath();ctx.arc(sel.x,sel.y,33,0,TAU);ctx.stroke();ctx.setLineDash([])}
  else if(sel)sel=null;
  // 灯（守るもの）
  {const p=.5+.5*Math.sin(T*3),c=S.coreHit>0?'#ff2a4a':'#ffe9a0';S.coreHit=Math.max(0,S.coreHit-dt*2.5);
   ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.6+p*.3;ctx.drawImage(glow(c),CORE.x-42,CORE.y-42,84,84);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
   ctx.save();ctx.translate(CORE.x,CORE.y+Math.sin(T*2)*2);ctx.fillStyle='#120e22';ctx.strokeStyle=c;ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(11,0);ctx.lineTo(0,17);ctx.lineTo(-11,0);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle=c;ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(5,0);ctx.lineTo(0,8);ctx.lineTo(-5,0);ctx.fill();ctx.restore();ctx.globalAlpha=1}
  for(const s of slots){const it=s.item;if(!s.path||!it||it.hide>0||it===held?.item)continue;
    const d=ITEMS[it.id],pu=.5+.5*Math.sin(T*2.5+it.ph);
    ctx.fillStyle=rgba(d.c,.2+pu*.08);ctx.strokeStyle=rgba(d.c,.55);ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(s.x,s.y,d.range+pu*1.5,0,TAU);ctx.fill();ctx.stroke();
    trapFx(s,it,d,T,dt);
    const off=rankOff(it);drawItem(it,it.rx,it.ry,.8,off?.3:.9);if(off)banMark(it.rx+17,it.ry-17)}
  for(const e of S.enemies)if(!sprTall(e))drawEnemy(e);
  // 置いてある元素
  ctx.save();if(S.benchShake>0){S.benchShake-=dt}
  for(const s of slots){const it=s.item;if(!it||s.path||it.hide>0||it===held?.item)continue;
    const bx=s.bench&&S.benchShake>0?Math.sin(S.benchShake*60)*S.benchShake*10:0;
    const off=rankOff(it);drawItem(it,it.rx+bx,it.ry+Math.sin(T*2+it.ph)*1.5,1,off?.3:1);if(off)banMark(it.rx+bx+19,it.ry-19);
    if(it.buff&&s.field){ // 支援を受けている塔：右上に上向きの矢印（支援の★が高いほど 1〜3 本）
      const b=it.buff,n=b.t-2,ax=it.rx+21,ay=it.ry-17+Math.sin(T*3+it.ph)*1.2;ctx.lineCap=ctx.lineJoin='round';
      for(const[w,c]of[[4.4,'#07060d'],[2,b.c]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();
        for(let i=0;i<n;i++){const y=ay+i*4.6;ctx.moveTo(ax-4.2,y+2.2);ctx.lineTo(ax,y-2);ctx.lineTo(ax+4.2,y+2.2)}ctx.stroke()}}
    const chn=(it.chg||0)+(it.chgB||0);
    if(chn>0&&s.field){ // 蓄電：チャージ数に応じて塔が軽く光り、周囲に小さな玉が回る
      const d=ITEMS[it.id],cx=it.rx,cy=it.ry+Math.sin(T*2+it.ph)*1.5;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.15+chn*.07;ctx.drawImage(glow(d.c),cx-38,cy-38,76,76);
      ctx.globalAlpha=.95;for(let i=0;i<chn;i++){const a=T*2.6+it.ph+i*TAU/chn,ox=cx+Math.cos(a)*26,oy=cy+Math.sin(a)*26;
        ctx.drawImage(glow(d.c),ox-8,oy-8,16,16);ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(ox,oy,2.1,0,TAU);ctx.fill()}
      ctx.restore()}}
  ctx.restore();
  for(const e of S.enemies)if(sprTall(e))drawEnemy(e); // 背の高い王は、塔にかぶっても手前に見えるよう塔のあとに描く
  // 光線・弾・演出（加算合成）
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(const s of slots){const it=s.item;if(!it||!it.beamT.length)continue;const d=ITEMS[it.id],bc=it.beamC||d.c;
    for(const e of it.beamT){for(const[w,a,c]of[[5+d.t*1.5,.25,bc],[2+d.t*.6,.95,'#ffffff']]){ctx.strokeStyle=rgba(c,a*(.8+.2*Math.sin(T*40)));ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(e.x,e.y);ctx.stroke()}
      ctx.drawImage(glow(bc),e.x-16,e.y-16,32,32);
      ctx.save();ctx.translate(e.x,e.y);ctx.rotate(T*5+it.ph);ctx.strokeStyle='#ffffff';ctx.lineWidth=1.6;const q=7+d.t*2;
      for(let i=0;i<2;i++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(-q,0);ctx.lineTo(q,0);ctx.stroke()}ctx.restore()}}
  for(const s of S.shots)drawShot(s);
  for(const f of fx){
    f.t+=dt;if(f.t<0)continue;const k=Math.min(1,f.t/f.dur);
    if(f.ty==='ring'){const e=1-(1-k)**3;ctx.strokeStyle=rgba(f.color,1-k);ctx.lineWidth=f.lw*(1-k*.6);ctx.beginPath();ctx.arc(f.x,f.y,f.r0+(f.r1-f.r0)*e,0,TAU);ctx.stroke()}
    else if(FXD[f.ty]){ctx.save();FXD[f.ty](f,k);ctx.restore()}
    else if(f.ty==='land'){const e=1-(1-k)**2;ctx.strokeStyle=rgba(f.color,(1-k));ctx.lineWidth=3;rr(ctx,f.x-31-e*5,f.y-30-e*5,62+e*10,60+e*10,12+e*3);ctx.stroke();
      ctx.fillStyle=rgba(f.color,(1-k)*.25);ctx.fill()}
    else if(f.ty==='zap'){zapPath(f);ctx.strokeStyle=rgba(f.color,(1-k)*.5);ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle=rgba('#ffffff',1-k);ctx.lineWidth=2;ctx.stroke()}
    else if(f.ty==='line'){ctx.strokeStyle=rgba(f.color,(1-k)*.6);ctx.lineWidth=12*(1-k);ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.ex,f.ey);ctx.stroke();ctx.strokeStyle=rgba('#ffffff',1-k);ctx.lineWidth=3*(1-k);ctx.stroke()}
    else if(f.ty==='mana'){const u=k*k*(3-2*k),tx=W-40,ty=25,a=1-u;
      const x=a*a*f.x+2*a*u*f.cx+u*u*tx,y=a*a*f.y+2*a*u*f.cy+u*u*ty;ctx.drawImage(glow('#ffe9a0'),x-9,y-9,18,18);
      if(k>=1){S.manaBump=1}}
    else if(f.ty==='rocket'){const e=1-(1-k)**2,x=f.x+f.vx*f.t,y=f.y+(f.ty2-f.y)*e;ctx.drawImage(glow(f.color),x-8,y-8,16,16);
      P(x,y,rnd(-10,10),rnd(20,60),.4,3,'#ffe9a0');if(k>=1)firework(x,y,f.color)}
    else if(f.ty==='merge'){ // ふたつの元素が渦を巻いて吸いこまれる
      const e=k*k;for(const[o,sg]of[[f.a,1],[f.b,-1]]){const dx=o.x-f.x,dy=o.y-f.y,r=Math.max(18,Math.hypot(dx,dy))*(1-e),a=Math.atan2(dy,dx)+sg*0+e*7;
        const x=f.x+Math.cos(a)*r*(sg>0?1:1),y=f.y+Math.sin(a)*r;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1-e*.5;
        ctx.drawImage(orb(o.id),x-40*(1-e*.6),y-40*(1-e*.6),80*(1-e*.6),80*(1-e*.6));ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';
        P(x,y,rnd(-20,20),rnd(-20,20),.3,4,ITEMS[o.id].c)}
      ctx.globalAlpha=e;ctx.drawImage(glow('#ffffff'),f.x-40*e,f.y-40*e,80*e,80*e);ctx.globalAlpha=1;
      if(k>=1)mergeDone(f)}
  }
  for(let i=fx.length-1;i>=0;i--)if(fx[i].t>=fx[i].dur&&fx[i].ty!=='text'&&fx[i].ty!=='wave')fx.splice(i,1);
  // パーティクル
  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];p.life-=dt;if(p.life<=0){parts[i]=parts[parts.length-1];parts.pop();continue}
    const dr=Math.exp(-p.drag*dt);p.vx*=dr;p.vy=p.vy*dr+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    const k=p.life/p.max,a=p.tw?k*(.6+.4*Math.sin(T*30+i)):k;
    if(p.ty==='g'){const z=p.size*(1.2+k)*2;ctx.globalAlpha=a;ctx.drawImage(glow(p.color),p.x-z/2,p.y-z/2,z,z)}
    else if(p.ty==='s'){ctx.globalAlpha=a;ctx.strokeStyle=p.color;ctx.lineWidth=p.size;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.05,p.y-p.vy*.05);ctx.stroke()}
    else if(p.ty==='c'){p.rot+=p.vr*dt;p.vx+=Math.sin(T*3+i)*40*dt;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,k*3);
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(1,Math.cos(p.rot*1.7));ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/3,p.size,p.size/1.5);ctx.restore();ctx.globalCompositeOperation='lighter'}
    else if(p.ty==='w'){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,k*2.5);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter'}
    else if(p.ty==='k'){p.rot+=p.vr*dt;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,k*2.5);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*.8);ctx.restore();ctx.globalCompositeOperation='lighter'}
    else if(p.ty==='x'){p.rot+=p.vr*dt;ctx.globalAlpha=Math.min(1,k*2);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.strokeStyle=p.color;ctx.lineWidth=1.2;
      for(let i=0;i<3;i++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(-p.size,0);ctx.lineTo(p.size,0);ctx.stroke()}ctx.restore()}
    else{ctx.globalCompositeOperation='source-over';ctx.globalAlpha=k*.7*(p.al||1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(2-k),0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter'}
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  // 画面下の操作部
  drawHud(dt);
  const bossBar=drawBossBar(dt),iy=bossBar?21+(bossBar-1)*BOSS_BAR_GAP:0; // 主の体力の帯が出ている間は、説明の帯を少し下げる
  drawShop(dt);
  for(const b of buttons)drawBtn(b,dt);
  // 説明の帯（選んでいる・運んでいる元素）
  const inf=held?held.item:sel&&sel.item;
  INFO_R=inf&&!held?{x:40,y:50+iy,w:W-80,h:44,id:inf.id}:null; // 説明の帯（と下の一言）を押すと詳細を開く
  if(inf){const d=ITEMS[inf.id];ctx.fillStyle='#07060dd0';rr(ctx,40,50+iy,W-80,26,13);ctx.fill();ctx.strokeStyle=rgba(d.c,.5);ctx.lineWidth=1;ctx.stroke();
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=FONT(FS.f2);ctx.fillStyle=d.c;ctx.fillText(`${nm(d)} ${'★'.repeat(d.t)} ― ${ds(d)}`,W/2,63.5+iy,W-92);ctx.font=FONT(FS.f1);
    const ms=rs&&rs.field&&rs.mod;
    ctx.fillStyle=ms?MOD_COL[rs.mod]:'#8d86a3';ctx.fillText(ms?TT('modD_'+rs.mod):TT('lpTip'),W/2,84+iy)}
  // 最高ランクを選んでいるときの強化ボタン（押すたびに +1。値段は段ごとに上がる）
  ENH_R=null;
  if(sel&&!held&&canEnh(sel.item)){const it=sel.item,cost=enhCost(it),can=S.mana>=cost,bw=132,bh=30,bx=clamp(sel.x-bw/2,6,W-bw-6),by=sel.bench?sel.y-36-bh-14:sel.y+40;
    ENH_R={x:bx,y:by,w:bw,h:bh,p:ENH_R0p=Math.max(0,ENH_R0p-dt*6)};
    const sc=1-ENH_R.p*.08;ctx.save();ctx.translate(bx+bw/2,by+bh/2);ctx.scale(sc,sc);ctx.translate(-bx-bw/2,-by-bh/2);
    ctx.fillStyle='#07060de8';rr(ctx,bx,by,bw,bh,15);ctx.fill();ctx.strokeStyle=rgba('#e8c36a',can?.9:.3);ctx.lineWidth=1.5;ctx.stroke();
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=FONT(FS.f1,800);ctx.fillStyle=can?'#ffe9a0':'#8d86a3';ctx.fillText(TT('enhBtn',(it.lv||0)+1,cost),bx+bw/2,by+bh/2+1,bw-12);ctx.restore()}
  // 最初の手引き
  if(S.tut<9&&!held&&!S.banner&&!S.over)drawTut(T);
  // 運んでいる元素
  if(held){const it=held.item,y=ptr.y-(held.touch?26:0);it.rx=ptr.x;it.ry=y;
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5;ctx.drawImage(glow(ITEMS[it.id].c),ptr.x-48,y-48,96,96);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    drawItem(it,ptr.x,y,1.22);if(Math.random()<.5)P(ptr.x+rnd(-14,14),y+rnd(-14,14),rnd(-20,20),rnd(10,50),.4,3,ITEMS[it.id].c)}
  else if(drag){drag.item.rx=drag.slot.x;drag.item.ry=drag.slot.y}
  // ダメージの数字
  if(dnums.length){ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=2.6;ctx.strokeStyle='#05040acc';
    for(let i=dnums.length-1;i>=0;i--){const n=dnums[i];n.t+=dt;const k=n.t/DNUM_LIFE;if(k>=1){dnums.splice(i,1);continue}
      const x=n.x+n.vx*n.t,y=n.y-(1-(1-k)**2)*22;ctx.globalAlpha=k>.55?(1-k)/.45:1;ctx.font=FONT(n.sz+(k<.15?2:0),800);
      ctx.strokeText(n.txt,x,y);ctx.fillStyle=n.c;ctx.fillText(n.txt,x,y)}
    ctx.globalAlpha=1}
  // 浮かぶ文字
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];
    if(f.ty==='text'){const k=f.t/f.dur;if(k>=1){fx.splice(i,1);continue}
      const s=k<.15?.6+k/.15*.5:1.1-Math.min(.1,(k-.15)*.5);ctx.save();ctx.translate(f.x,f.y-k*26);ctx.scale(s,s);ctx.globalAlpha=k>.7?(1-k)/.3:1;
      ctx.font=FONT(f.size,800);ctx.lineWidth=4;ctx.strokeStyle='#05040acc';ctx.strokeText(f.txt,0,0);ctx.fillStyle=f.color;ctx.fillText(f.txt,0,0);ctx.restore()}
    else if(f.ty==='wave'){if(f.t<0)continue;const k=f.t/f.dur;if(k>=1){fx.splice(i,1);continue}
      const a=k<.2?k/.2:k>.7?(1-k)/.3:1,ox=(1-Math.min(1,k/.2))**3*-160+(k>.7?((k-.7)/.3)**3*160:0);
      ctx.globalAlpha=a;ctx.fillStyle='#05040a99';ctx.fillRect(0,282,W,56);ctx.fillStyle='#ff3b6b';ctx.fillRect(0,282,W,1);ctx.fillRect(0,337,W,1);
      ctx.font=FONT(FS.f5,800);ctx.fillStyle='#ffd0d8';ctx.fillText(f.txt||TT('waveN',f.n)+(f.n%20===0?TT('finalTag'):f.n%5===0?TT('bossTag'):''),W/2+ox,311);ctx.globalAlpha=1}
  }
  ctx.restore();
  if(S.warn>0)drawWarn(dt);
  // 新発見の幕
  if(S.banner){const b=S.banner;b.t+=dt;const k=b.t/b.dur;
    if(k>=1)S.banner=null;else{const d=ITEMS[b.id],a=k<.12?k/.12:k>.85?(1-k)/.15:1,e=Math.min(1,b.t/.35),sc=1+(1-e)**2*1.6;
      ctx.globalAlpha=a*.72;ctx.fillStyle='#05040a';ctx.fillRect(0,170,W,246);ctx.globalAlpha=a;
      ctx.save();ctx.translate(W/2,262);ctx.globalCompositeOperation='lighter';
      for(let i=0;i<14;i++){const an=i/14*TAU+T*.7;ctx.fillStyle=rgba(d.c,.09);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,190,an,an+.13);ctx.fill()}
      ctx.drawImage(glow(d.c),-100,-100,200,200);ctx.globalCompositeOperation='source-over';
      ctx.scale(sc*1.9,sc*1.9);ctx.drawImage(orb(b.id),-40,-40,80,80);ctx.restore();
      ctx.textAlign='center';ctx.font=FONT(FS.f2,800);ctx.fillStyle='#e8c36a';ctx.fillText(TT(b.base?'newBase':'newFound'),W/2,192);
      ctx.font=FONT(FS.f5,800);ctx.fillStyle=d.c;ctx.fillText(nm(d),W/2,340);ctx.font=FONT(FS.f2);ctx.fillStyle='#cfc8e6';ctx.fillText(ds(d),W/2,366);
      ctx.font=FONT(FS.f1,800);ctx.fillStyle='#e8c36a';ctx.fillText(TT('buyNext',itemValue(d)),W/2,394);ctx.globalAlpha=1}}
  if(S.flash>0){ctx.globalCompositeOperation='lighter';ctx.fillStyle=rgba(S.flashC,Math.min(.7,S.flash));ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';S.flash-=dt*1.6}
  S.shake*=Math.exp(-dt*9);S.manaBump*=Math.exp(-dt*10);if(S.manaErr>0)S.manaErr-=dt;
}
