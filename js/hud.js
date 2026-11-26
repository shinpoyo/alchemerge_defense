'use strict';
// HUD・ボタン・ショップ・手引き・ボス帯・予告帯（render.js から分離）
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
      const next=d.ws===S.ws+1,cost=wsCost(d.ws),can=next&&S.mana>=cost,sc=1-(SHOP.press===i?SHOP.pressT*.1:0),fz=FS.f1*LY.k;
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
  ctx.font=FONT(FS.f4,800);ctx.fillStyle='#e9e4f5';ctx.fillText(`${S.wave} / ${S.endless?'∞':maxWave()}`,W/2+12,23);
  ctx.font=FONT(FS.f1,800);ctx.fillStyle=NIGHT===2?'#d9a8ff':NIGHT?'#ff8a9a':'#a9a2c0';const dm=dailyMut(),ep=endlessPhase(),stn=sn(STAGES[STAGE])+(NIGHT===2?TT('abyssDot'):NIGHT?TT('nightDot'):'')+(dm?'・'+TT('mut_'+dm):DAILY?TT('dailyDot'):'')+(ep?'・'+TT('eph_'+ep):'');
  if(S.active){ // 戦闘中は、ステージ名の右に残りの敵の数を金色で出す
    const lt='　'+TT('left',S.queue.length+S.enemies.length),w1=ctx.measureText(stn).width,w2=ctx.measureText(lt).width,x0=W/2-(w1+w2)/2;
    ctx.textAlign='left';ctx.fillText(stn,x0,43);ctx.fillStyle='#ffe9a0';ctx.fillText(lt,x0+w1,43);ctx.textAlign='center';
  }else ctx.fillText(stn,W/2,43);
  { // 工房レベル（★をどこまで錬成できるか）を魔力の下に出す。次のレベルに届く魔力があれば金色に。ステージ名と重なるときは短く
    const cw=ctx.measureText(stn+(S.active?'　'+TT('left',S.queue.length+S.enemies.length):'')).width,nx=wsCost(S.ws+1);
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
  const T=performance.now()/1000,ph=e.phase||1,baseNm=e.final?kingName(sprKey(e)):TT('bossLord'),name=baseNm+(ph>1?(LANG==='ja'?'・':' · ')+TT(ph>2?'bossFury':'bossRage'):'');
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
