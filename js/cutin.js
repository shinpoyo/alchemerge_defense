'use strict';
// 夜の王 降臨カットイン演出と固有王名（render.js / lang.js から分離）
addLang({
  kingDanger:['夜の王 襲来','NIGHT KING APPROACHES'],
  kingDanger2:['双つの夜の王 襲来','TWIN NIGHT KINGS APPROACH'],
  kingIntroH:['―  夜 の 王  降 臨  ―','—  THE NIGHT KING DESCENDS  —'],
  kingIntroH2:['―  双 つ の 夜 の 王  降 臨  ―','—  TWIN NIGHT KINGS DESCEND  —'],
  tapSkip:['タップでスキップ','Tap to skip'],
});
const KING_INFO={ // 夜の王の固有名と二つ名 [日本語名, 日本語二つ名, English name, English title]
  king_corridor:['宵闇の影王','宵の回廊の主','Umbra Sovereign','Lord of the Dusk Corridor'],
  king_ice:['氷冠の凍王','凍てつく湖の王','Frostcrown Monarch','King of the Frozen Lake'],
  king_garden:['茨花の妖王','螺旋の庭の王','Thornbloom Tyrant','King of the Spiral Garden'],
  king_fire:['紅蓮の溶岩竜王','火の山の王','Cinderwing Wyrm','King of Fire Mountain'],
  king_crossroads:['双頭の冥犬王','十字の辻の王','Twin-Headed Hellhound','King of the Crossroads'],
  king_sunken:['深海の沈王','沈んだ都の王','Drowned Sea King','King of the Sunken City'],
  king_gates_flame:['熾炎の炎獣王','双つの門・炎の王','Blazemane Beast','Twin Gates · Flame'],
  king_gates_ice:['蒼氷の凍狼王','双つの門・氷の王','Frostfang Direwolf','Twin Gates · Ice'],
  king_swamp:['毒泡の瘴気王','瘴気の沼の王','Blightmire Ooze','King of Miasma Marsh'],
  king_hg_earth:['砂岩の巨神王','砂時計の峠・土の王','Sandstone Colossus','Hourglass Pass · Earth'],
  king_hg_wind:['翠嵐の黒烏王','砂時計の峠・風の王','Galewing Raven','Hourglass Pass · Wind'],
  king_forest:['深森の黒蜘蛛王','光の届かぬ森の王','Gloomweaver Arachnid','King of Lightless Wood'],
  king_cathedral:['白夜の堕天使王','白夜の聖堂の王','Fallen Seraph','King of White Night'],
  king_valley:['三首の災厄竜王','三叉の谷の王','Tri-Element Hydra','King of Three Forks'],
  king_starfall:['星宿の大蛇王','星降りの道の王','Astral Serpent','King of Starfall Road'],
  king_throne:['深紅の夜の王','王の間の覇者','Crimson Night King','Sovereign of the Throne'],
  king_altar:['六腕の終焉魔神','最果ての祭壇の王','Six-Armed Endbringer',"King of World's End"],
};
const kingName=k=>{const o=KING_INFO[k];return o?o[LANG==='ja'?0:2]:TT('bossKing')};
const kingSub=k=>{const o=KING_INFO[k];return o?o[LANG==='ja'?1:3]:''};
function drawKingIntro(dt){ // 夜の王 降臨カットイン：DANGER警告（0〜1.35s）→ シルエット降臨（1.35〜2.15s）→ 閃光顕現＆名前刻印（2.15〜4.65s）
  const ki=S.kingIntro;ki.t+=dt;
  const t=ki.t,dur=ki.dur,T=performance.now()/1000,pair=ki.kings.length>1;
  if(t>=dur){S.kingIntro=null;return}
  const danEnd=1.35,revAt=2.15;
  const fadeIn=clamp(t/.18,0,1),fadeOut=t>dur-.42?clamp((dur-t)/.42,0,1):1,alpha=fadeIn*fadeOut;
  const c0=ki.kings[0].c,c1=pair?ki.kings[1].c:c0;
  // フェーズ1：DANGER / 夜の王 襲来 警告（0〜1.35s）
  if(t<danEnd){
    const dk=t/danEnd,pu=.5+.5*Math.sin(t*14),outA=t>danEnd-.22?clamp((danEnd-t)/.22,0,1):1,a=fadeIn*outA;
    ctx.save();ctx.globalAlpha=a;
    ctx.fillStyle='#0a0206d8';ctx.fillRect(0,0,W,H);
    // 画面ふちの深紅脈動ビネット
    const vg=ctx.createRadialGradient(W/2,H/2,90,W/2,H/2,W*.9);
    vg.addColorStop(0,'rgba(255,30,60,0)');vg.addColorStop(1,rgba('#ff1e42',.35+.28*pu));
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    // 奥にうごめく王の影の気配（ごく薄く）
    const S0=SPR[ki.kings[0].key];
    if(S0){
      const sc0=Math.min(310/S0.w,260/S0.h)*(1+dk*.08),w=S0.w*sc0,h=S0.h*sc0;
      ctx.save();ctx.globalAlpha=a*(.14+.08*pu);ctx.drawImage(sprTint(S0,'#06010a'),W/2-w/2,H*.44-h/2,w,h);ctx.restore();
    }
    // 中央のDANGER帯（上下に斜めハザード縞）
    const by=H*.37,bh=138,stripH=16;
    ctx.fillStyle='#14030ae8';ctx.fillRect(0,by,W,bh);
    ctx.save();ctx.beginPath();ctx.rect(0,by,W,stripH);ctx.rect(0,by+bh-stripH,W,stripH);ctx.clip();
    ctx.fillStyle='#ff2a4a';
    const off=(T*65)%28;
    for(let x=-bh-28+off;x<W+48;x+=28){ctx.beginPath();ctx.moveTo(x,by+bh);ctx.lineTo(x+14,by+bh);ctx.lineTo(x+14+bh,by);ctx.lineTo(x+bh,by);ctx.fill()}
    ctx.restore();
    ctx.fillStyle='#ff6a80';ctx.fillRect(0,by+stripH,W,1.5);ctx.fillRect(0,by+bh-stripH-1.5,W,1.5);
    // DANGER 英語透かし＋警告三角＋「夜の王 襲来」
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font=FONT(16,800);ctx.fillStyle=rgba('#ff4a68',.75+.25*pu);
    ctx.fillText('▲  D A N G E R  ▲',W/2,by+stripH+22);
    const txt=TT(pair?'kingDanger2':'kingDanger');
    ctx.save();ctx.translate(W/2,by+bh/2+14);const sc=1+.03*pu;ctx.scale(sc,sc);
    ctx.font=FONT(LANG==='ja'?(pair?28:34):(pair?20:23),800);
    ctx.shadowColor='#ff1e42';ctx.shadowBlur=18+10*pu;
    ctx.lineWidth=4;ctx.strokeStyle='#090105';ctx.strokeText(txt,0,0,W-28);
    ctx.fillStyle='#fff0f3';ctx.fillText(txt,0,0,W-28);ctx.restore();
    if(t>=.55){ctx.globalAlpha=a*(.4+.3*Math.sin(T*5));ctx.font=FONT(FS.f1,700);ctx.fillStyle='#cfc8e6';ctx.fillText(TT('tapSkip'),W/2,H-42)}
    ctx.restore();
    return;
  }
  // フェーズ2〜3：シルエット降臨（1.35〜2.15s）→ 閃光顕現＆名前刻印（2.15〜4.65s）
  const st=t-danEnd,silDur=revAt-danEnd,revealed=t>=revAt,rt=Math.max(0,t-revAt);
  const sIn=clamp(st/.2,0,1),a2=sIn*fadeOut;
  // 顕現の瞬間にフラッシュ・画面揺れ・パーティクル爆発
  if(revealed&&!ki.flashed){
    ki.flashed=true;S.shake=15;S.flash=.78;S.flashC=c0;
    for(let i=0;i<76;i++){
      const a=rnd(TAU),v=rnd(90,410),col=i%4===0?'#ffffff':i%2?c0:c1;
      ki.parts.push({x:W/2+rnd(-24,24),y:H*.42+rnd(-24,24),vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rnd(.8,1.8),m:1.8,s:rnd(2,5.8),c:col,st:i%3===0});
    }
  }
  // 継続的に舞い上がるオーラパーティクル
  if(t<dur-.4){
    const rate=revealed?34:24;
    if(Math.random()<dt*rate){
      const col=Math.random()<.5?c0:c1;
      if(!revealed){const a=rnd(TAU),r=rnd(130,240);ki.parts.push({x:W/2+Math.cos(a)*r,y:H*.42+Math.sin(a)*r,vx:-Math.cos(a)*220,vy:-Math.sin(a)*220,l:.55,m:.55,s:rnd(2,4),c:col,st:true})}
      else{ki.parts.push({x:rnd(20,W-20),y:H*.65+rnd(-30,40),vx:rnd(-20,20),vy:rnd(-130,-50),l:rnd(.9,1.7),m:1.7,s:rnd(2,4.5),c:Math.random()<.25?'#ffe9a0':col,st:false})}
    }
  }
  ctx.save();ctx.globalAlpha=a2;
  if(S.shake>.2)ctx.translate(rnd(-S.shake,S.shake),rnd(-S.shake,S.shake));
  // 背景の深い暗転＋固有色の禍々しいオーラ
  ctx.fillStyle='#04020bf0';ctx.fillRect(0,0,W,H);
  const cy=H*.42;
  ctx.save();ctx.globalCompositeOperation='lighter';
  const bgG=ctx.createRadialGradient(W/2,cy,10,W/2,cy,W*.78);
  bgG.addColorStop(0,rgba(c0,revealed?.48:.24));bgG.addColorStop(.5,rgba(c1,revealed?.22:.09));bgG.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=bgG;ctx.fillRect(0,0,W,H);
  // 回転する放射光（顕現後にゆったり開く）
  if(revealed){
    const rayA=clamp(rt/.4,0,1)*.18;
    ctx.save();ctx.translate(W/2,cy);ctx.rotate(T*.25);
    for(let i=0;i<16;i++){const a=i/16*TAU;ctx.fillStyle=rgba(i%2?c1:c0,rayA);ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,W*.95,a,a+.11);ctx.fill()}
    ctx.restore();
  }
  // 背後の回転魔法陣
  {const mr=(revealed?165+Math.min(1,rt/.55)*22:110+clamp(st/silDur,0,1)*55);
   ctx.save();ctx.translate(W/2,cy);ctx.rotate(T*(revealed?.3:-.9));
   ctx.strokeStyle=rgba(c0,revealed?.55:.38);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,mr,0,TAU);ctx.stroke();
   ctx.strokeStyle=rgba('#ffe9a0',revealed?.35:.22);ctx.lineWidth=1.2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(0,0,mr*.84,0,TAU);ctx.stroke();ctx.setLineDash([]);
   for(let k=0;k<2;k++){ctx.beginPath();for(let i=0;i<3;i++){const a=i/3*TAU+k*Math.PI/3;ctx[i?'lineTo':'moveTo'](Math.cos(a)*mr*.84,Math.sin(a)*mr*.84)}ctx.closePath();ctx.stroke()}
   ctx.restore();}
  // 顕現時の3連衝撃波リング
  if(revealed&&rt<1.1){
    for(let i=0;i<3;i++){const rk=clamp((rt-i*.09)/.72,0,1);if(rk<=0||rk>=1)continue;const e=1-(1-rk)**3;
      ctx.strokeStyle=rgba(i?c0:'#ffffff',(1-rk)*.9);ctx.lineWidth=(5-i*1.2)*(1-rk*.6);
      ctx.beginPath();ctx.arc(W/2,cy,24+e*(220+i*55),0,TAU);ctx.stroke()}
  }
  ctx.restore();
  // パーティクル描画
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=ki.parts.length-1;i>=0;i--){
    const p=ki.parts[i];p.l-=dt;if(p.l<=0){ki.parts.splice(i,1);continue}
    p.vx*=Math.exp(-dt*1.5);p.vy*=Math.exp(-dt*1.5);p.x+=p.vx*dt;p.y+=p.vy*dt;
    const pk=clamp(p.l/p.m,0,1);ctx.globalAlpha=a2*pk;
    if(p.st){ctx.strokeStyle=p.c;ctx.lineWidth=p.s*.55;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*.04,p.y-p.vy*.04);ctx.stroke()}
    else{const z=p.s*3.4;ctx.drawImage(glow(p.c),p.x-z/2,p.y-z/2,z,z)}
  }
  ctx.restore();
  // 夜の王の全身イラスト（シルエット → 閃光でくっきり顕現！）
  const preK=clamp(st/silDur,0,1);
  ki.kings.forEach((ko,idx)=>{
    const S0=SPR[ko.key];if(!S0)return;
    const maxW=pair?215:355,maxH=pair?230:295,sc0=Math.min(maxW/S0.w,maxH/S0.h);
    const zoom=revealed?(1.08-.08*Math.exp(-rt*6)+Math.min(.08,rt*.025)):(.66+.39*preK*preK);
    const w=S0.w*sc0*zoom,h=S0.h*sc0*zoom;
    const cx=pair?(idx===0?W*.28:W*.72):W/2;
    const shx=!revealed?rnd(-2.5,2.5)*preK:0,shy=revealed?Math.sin(rt*2.2+idx)*4:rnd(-2.5,2.5)*preK;
    ctx.save();ctx.translate(cx+shx,cy+shy);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a2*(revealed?.65:.35);
    const gz=Math.max(w,h)*1.25;ctx.drawImage(glow(ko.c),-gz/2,-gz/2,gz,gz);ctx.restore();
    const R=sprTint(S0,ko.c),o=revealed?3.2:2.2;
    ctx.globalAlpha=a2*(revealed?.95:.7);
    for(const[dx,dy]of[[o,0],[-o,0],[0,o],[0,-o]])ctx.drawImage(R,-w/2+dx,-h/2+dy,w,h);
    if(!revealed){
      ctx.globalAlpha=a2;ctx.drawImage(sprTint(S0,'#090612'),-w/2,-h/2,w,h);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a2*(.5+.5*preK);
      ctx.drawImage(S0.glow,-w/2,-h/2,w,h);ctx.drawImage(S0.glow,-w/2,-h/2,w,h);ctx.restore();
    }else{
      ctx.globalAlpha=a2;ctx.drawImage(S0.body,-w/2,-h/2,w,h);
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a2*.85;ctx.drawImage(S0.glow,-w/2,-h/2,w,h);ctx.restore();
      if(rt<.3){ctx.globalAlpha=a2*(1-rt/.3)*.75;ctx.drawImage(S0.white,-w/2,-h/2,w,h)}
    }
    ctx.restore();
  });
  // 上下のシネマスコープ帯と金線
  const bandH=Math.round(H*.13)*clamp(st/.3,0,1);
  ctx.fillStyle='#05030af2';ctx.fillRect(0,0,W,bandH);ctx.fillRect(0,H-bandH,W,bandH);
  ctx.fillStyle=rgba('#e8c36a',.75);ctx.fillRect(0,bandH-1.5,W,1.5);ctx.fillRect(0,H-bandH,W,1.5);
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=FONT(LANG==='ja'?15:13,800);ctx.fillStyle='#ffe9a0';
  ctx.fillText(TT(pair?'kingIntroH2':'kingIntroH'),W/2,bandH*.52,W-24);
  // 顕現後の名前＆二つ名表示（ゆったり刻み込み）
  if(revealed){
    const nk=clamp((rt-.12)/.48,0,1),e=1-(1-nk)**3;
    const ny=H*.685;
    const lw=155*e;
    ctx.strokeStyle=rgba('#e8c36a',.8*nk);ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(W/2-lw,ny-24);ctx.lineTo(W/2+lw,ny-24);ctx.stroke();
    ctx.fillStyle='#ffe9a0';ctx.beginPath();ctx.moveTo(W/2,ny-29);ctx.lineTo(W/2+5,ny-24);ctx.lineTo(W/2,ny-19);ctx.lineTo(W/2-5,ny-24);ctx.closePath();ctx.fill();
    if(!pair){
      const k=ki.kings[0].key,sub=kingSub(k),nmTxt=kingName(k);
      ctx.globalAlpha=a2*nk;
      if(sub){ctx.font=FONT(LANG==='ja'?14:12.5,700);ctx.fillStyle='#d8c8ff';ctx.fillText(sub,W/2,ny-6,W-36)}
      ctx.save();ctx.translate(W/2,ny+28);const ns=1+(1-e)*.35;ctx.scale(ns,ns);
      ctx.font=FONT(LANG==='ja'?32:25,800);
      ctx.shadowColor=c0;ctx.shadowBlur=20;ctx.lineWidth=5;ctx.strokeStyle='#05030a';ctx.strokeText(nmTxt,0,0,W-28);
      const tg=ctx.createLinearGradient(0,-18,0,18);tg.addColorStop(0,'#ffffff');tg.addColorStop(.55,'#ffe9a0');tg.addColorStop(1,c0);
      ctx.fillStyle=tg;ctx.fillText(nmTxt,0,0,W-28);ctx.restore();
    }else{
      ctx.globalAlpha=a2*nk;
      ki.kings.forEach((ko,idx)=>{
        const y0=ny+idx*44,nmTxt=kingName(ko.key),sub=kingSub(ko.key);
        ctx.font=FONT(LANG==='ja'?11.5:10.5,700);ctx.fillStyle=rgba(ko.c,.9);ctx.fillText(sub,W/2,y0-6,W-36);
        ctx.save();ctx.shadowColor=ko.c;ctx.shadowBlur=14;ctx.font=FONT(LANG==='ja'?23:19,800);
        ctx.lineWidth=4;ctx.strokeStyle='#05030a';ctx.strokeText(nmTxt,W/2,y0+14,W-28);
        ctx.fillStyle='#fff6df';ctx.fillText(nmTxt,W/2,y0+14,W-28);ctx.restore();
      });
    }
    ctx.globalAlpha=a2*(.45+.35*Math.sin(T*5));
    ctx.font=FONT(FS.f1,700);ctx.fillStyle='#cfc8e6';ctx.fillText(TT('tapSkip'),W/2,H-bandH*.48);
  }
  ctx.restore();
}
