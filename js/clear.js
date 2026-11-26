'use strict';
// クリア・ゲームオーバー・基本元素の取得演出（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- クリア・ゲームオーバー ---------------- */
const FW=['#ffe9a0','#ff9ae0','#8fe6ff','#b98cff','#7df0c0','#ff6a3d','#ffffff','#ffd23c'];
function victory(){
  S.cleared=true;S.cele=.0001;S.slowmo=0;S.flash=1;S.flashC='#fff6d8';shake(14);
  if(!FX)return;
  if(!DAILY&&S.lives>=DIFF[NIGHT].lives)grantAch('flawless'); // 今日の挑戦のクリアは数えない（「はじめての夜明け」などと同じ扱い）
  let gotB=[];
  if(!DAILY&&S.chal){
    const k=pkey(),r=prog[k]||(prog[k]={best:maxWave(),clear:true});
    const cur=new Set(Array.isArray(r.badges)?r.badges:[]);
    for(const b of BADGES)if(S.chal[b]&&!cur.has(b)){cur.add(b);gotB.push(b)}
    if(cur.size)r.badges=[...cur];
    if(gotB.length)save();
  }
  sfx.clear();buzz([40,60,40,60,120]);
  // 置いてある塔すべてから光の柱
  for(const sl of slots)if(sl.item){const c=ITEMS[sl.item.id].c;ring(sl.x,sl.y,c,90,.9,4);
    for(let i=0;i<26;i++)P(sl.x+rnd(-8,8),sl.y,rnd(-25,25),rnd(-520,-160),rnd(.6,1.4),rnd(4,8),c,{drag:.6});sl.item.sv=10}
  for(let i=0;i<7;i++)ring(W/2,300,FW[i],140+i*60,.8+i*.14,5,10);
  for(let i=0;i<160;i++)confetti(rnd(W),rnd(-260,0));
  setTimeout(()=>{if(!S.cleared)return;
    const mv=mvpOf(),bTxt=gotB.length?`<br><span style="color:#ffe9a0">✦ ${TT('badgeGot',gotB.map(b=>TT('badge_'+b)).join('・'))}</span>`:'';
    $('#t2').innerHTML=spanify(TT('dawn'));$('#clearSub').innerHTML=TT('clearSub',maxWave(),disc.size,TOTAL)+bTxt+(mv?`<br><span style="color:${ITEMS[mv.id].c}">${TT('mvpLine',nm(ITEMS[mv.id]),fmtD(mv.dmg))}</span>`:'')+(S.newBase?`<br><em class="nb" style="color:${ITEMS[S.newBase].c}">${TT('baseArrive',nm(ITEMS[S.newBase]))}</em>`:'');
    if(S.newBase){shopShow(S.newBase);SHOP.dotT[1]=6}
    show('clear');
    if(S.newBase)baseGetOpen(S.newBase)},1500);
}
/* 基本元素の取得演出：暗転 → 放射光とパーティクル → 元素がポップイン → 小見出しと名前 → 1.5 秒後に「タップで閉じる」。
   タップで元素が素材パレットの位置へ飛び、クリア画面（すでに下に出ている）が見える。イントロ中のタップは、タップ待ちまで飛ばす */
let BG=null;
function baseGetOpen(id){
  const d=ITEMS[id],o=$('#baseGet'),fx=$('#bgFx');
  o.style.setProperty('--c',d.c);o.classList.remove('out','skip');o.classList.add('go');
  const g=$('#bgOrb').getContext('2d');g.clearRect(0,0,240,240);g.drawImage(orb(id),0,0,240,240);
  $('#bgSub').textContent=TT('newBase');$('#bgName').textContent=TT('baseArrive',nm(d));$('#bgHint').textContent=TT('tapClose');
  BG={id,c:d.c,t:0,ready:false,closing:false,burst:false,parts:[],at:performance.now(),last:performance.now()};bgMeasure();
  sfx.base();buzz([30,50,60]);requestAnimationFrame(bgLoop);
}
function bgMeasure(){ // 画面の大きさ・中心を測りなおす（開いたときと、回転・リサイズのとき）。飛んでいる粒は中心のずれぶん動かす
  const o=$('#baseGet'),fx=$('#bgFx'),r=o.getBoundingClientRect(),k=Math.min(window.devicePixelRatio||1,2),ir=$('#bgIco').getBoundingClientRect();
  fx.width=Math.round(r.width*k);fx.height=Math.round(r.height*k);
  const cx=ir.left+ir.width/2-r.left,cy=ir.top+ir.height/2-r.top;
  if(BG.cx!==undefined)for(const p of BG.parts){p.x+=cx-BG.cx;p.y+=cy-BG.cy}
  Object.assign(BG,{k,w:r.width,h:r.height,cx,cy,u:r.width/W});
}
addEventListener('resize',()=>{if(BG&&!BG.closing)bgMeasure()});
function bgBurst(){
  BG.burst=true;
  for(let i=0;i<80;i++){const a=rnd(TAU),v=rnd(80,320)*BG.u;BG.parts.push({x:BG.cx,y:BG.cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rnd(.8,1.7),m:1.7,s:rnd(2,5)*BG.u,c:i%3?'#ffe9a0':BG.c})}
}
function bgLoop(now){
  if(!BG)return;
  const dt=Math.min(.05,(now-BG.last)/1000);BG.last=now;BG.t+=dt;
  if(BG.t>=1.5)BG.ready=true;
  if(!BG.burst&&BG.t>=.3)bgBurst();
  if(BG.burst&&!BG.closing&&Math.random()<dt*28){const a=rnd(TAU),r=rnd(30,90)*BG.u;BG.parts.push({x:BG.cx+Math.cos(a)*r,y:BG.cy+Math.sin(a)*r,vx:rnd(-12,12)*BG.u,vy:rnd(-70,-25)*BG.u,l:rnd(.9,1.6),m:1.6,s:rnd(1.5,3.5)*BG.u,c:Math.random()<.5?'#fff3cf':BG.c})}
  const c=$('#bgFx').getContext('2d'),{w,h,cx,cy,u}=BG,a=Math.min(1,BG.t/.5);
  c.setTransform(BG.k,0,0,BG.k,0,0);c.clearRect(0,0,w,h);c.globalCompositeOperation='lighter';
  const R=Math.hypot(w,h)*.6,gr=c.createRadialGradient(cx,cy,0,cx,cy,R*.8);
  gr.addColorStop(0,rgba('#ffe9a0',.55*a));gr.addColorStop(.45,rgba(BG.c,.2*a));gr.addColorStop(1,rgba(BG.c,0));
  c.save();c.translate(cx,cy);c.rotate(BG.t*.2);c.fillStyle=gr;c.translate(-cx,-cy);
  for(let i=0;i<14;i++){c.save();c.translate(cx,cy);c.rotate(i/14*TAU);c.beginPath();c.moveTo(0,0);c.lineTo(R,-R*.075);c.lineTo(R,R*.075);c.closePath();c.restore();c.fill()}
  c.restore();
  const gl=c.createRadialGradient(cx,cy,0,cx,cy,120*u);gl.addColorStop(0,rgba('#fff3cf',.5*a));gl.addColorStop(.4,rgba(BG.c,.3*a));gl.addColorStop(1,rgba(BG.c,0));c.fillStyle=gl;c.fillRect(cx-120*u,cy-120*u,240*u,240*u);
  for(let i=BG.parts.length-1;i>=0;i--){const p=BG.parts[i];p.l-=dt;if(p.l<=0){BG.parts.splice(i,1);continue}
    p.vx*=Math.exp(-dt*1.6);p.vy*=Math.exp(-dt*1.6);p.x+=p.vx*dt;p.y+=p.vy*dt;
    c.fillStyle=rgba(p.c,Math.min(1,p.l/p.m*1.6));c.beginPath();c.arc(p.x,p.y,p.s,0,TAU);c.fill()}
  c.globalCompositeOperation='source-over';
  requestAnimationFrame(bgLoop);
}
function baseGetTap(){
  if(!BG||BG.closing||performance.now()-BG.at<250)return;
  const o=$('#baseGet');
  if(!BG.ready){BG.ready=true;BG.t=Math.max(BG.t,1.5);if(!BG.burst)bgBurst();o.classList.add('skip');return} // イントロ中：タップ待ちまで飛ばす
  BG.closing=true;sfx.ui();
  const id=BG.id;shopShow(id);SHOP.dotT[1]=6; // 素材欄の強調はここで改めてつける（演出のあいだに薄れないように）
  const i=shopList(SHOP.tab).findIndex(d=>d.id===id),tx=(i<0?W/2:shopBtnX(i)+SHOP.bw/2),ty=SHOP.y+SHOP.h/2-4;
  const r=o.getBoundingClientRect(),ir=$('#bgIco').getBoundingClientRect();
  const dx=tx/W*r.width-(ir.left+ir.width/2-r.left),dy=ty/H*r.height-(ir.top+ir.height/2-r.top);
  o.classList.add('out');
  $('#bgIco').animate([{transform:'none'},{transform:`translate(${dx}px,${dy}px) scale(${52*r.width/W/ir.width})`}],{duration:650,easing:'cubic-bezier(.55,0,.7,.4)',fill:'forwards'});
  setTimeout(()=>{
    if(FX){ring(tx,ty,'#ffe9a0',46,.4,3);burst(tx,ty,ITEMS[id].c,18,140)}
    o.classList.remove('go','out','skip');$('#bgIco').getAnimations().forEach(a=>a.cancel());BG=null;
  },650);
}
function confetti(x,y){
  P(x,y,rnd(-40,40),rnd(40,150),rnd(2.5,4.5),rnd(4,8),pick(FW),{ty:'c',g:60,drag:.8,rot:rnd(TAU),vr:rnd(-9,9)});
}
function firework(x,y,color){
  const kind=Math.random(),n=kind<.25?90:60;
  S.flash=Math.max(S.flash,.12);S.flashC=color;sfx.fw();
  ring(x,y,color,rnd(70,120),.5,3);ring(x,y,'#ffffff',40,.25,2);
  P(x,y,0,0,.35,90,color);
  for(let i=0;i<n;i++){
    const a=kind<.25?i/n*TAU:rnd(TAU),v=kind<.25?210:kind<.6?rnd(60,260):rnd(140,300);
    const c=kind>.8&&i%2?'#ffffff':color;
    P(x,y,Math.cos(a)*v,Math.sin(a)*v,rnd(.9,1.7),kind<.6?4:3,c,{ty:kind<.6?'g':'s',g:kind<.6?90:150,drag:kind<.6?1.6:1.1,tw:1});
  }
  if(kind>.6)for(let i=0;i<24;i++){const a=rnd(TAU),v=rnd(20,90);P(x,y,Math.cos(a)*v,Math.sin(a)*v,rnd(1.4,2.4),3,'#ffe9a0',{g:70,drag:.7,tw:1})}
}
function celebrate(dt){
  S.cele+=dt;S.dawn=Math.min(1,S.dawn+dt*.25);
  S.rocketT-=dt;
  if(S.rocketT<=0){
    S.rocketT=S.cele<5?rnd(.1,.3):rnd(.35,.8);
    fx.push({ty:'rocket',x:rnd(40,W-40),y:H+10,ty2:rnd(90,420),vx:rnd(-30,30),color:pick(FW),t:0,dur:rnd(.55,.9)});
  }
  if(S.cele<9)for(let i=0;i<(S.cele<4?3:1);i++)if(Math.random()<dt*40)confetti(rnd(W),-10);
  if(Math.random()<dt*10)P(rnd(W),rnd(60,520),0,rnd(-20,-60),rnd(1,2),rnd(3,6),pick(FW),{tw:1,drag:.2});
}
function gameOver(){
  clearRun();S.over=true;S.active=false;S.warn=0;S.hitstop=0;S.shake=18;S.flash=.8;S.flashC='#ff2a4a';
  if(!FX)return;
  save();
  sfx.over();burst(CORE.x,CORE.y,'#ff2a4a',70,320);sparks(CORE.x,CORE.y,'#ffd0d8',50,420);
  for(let i=0;i<4;i++)ring(CORE.x,CORE.y,'#ff2a4a',120+i*90,.6+i*.2,5);
  setTimeout(()=>{if(!S.over)return;const mv=mvpOf();$('#overSub').innerHTML=TT('overSub',S.wave,curBest())+(mv?`<br><span style="color:${ITEMS[mv.id].c}">${TT('mvpLine',nm(ITEMS[mv.id]),fmtD(mv.dmg))}</span>`:'');show('over')},1300);
}
