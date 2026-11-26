'use strict';
// 重ね合わせの画面（詳細・図鑑・実績・統計・共有・設定）（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 重ね合わせの画面（DOM） ---------------- */
const spanify=t=>[...t].map((c,i)=>c==='\n'?'<br>':`<span style="animation-delay:${i*.09}s">${c===' '?'&nbsp;':c}</span>`).join(''); // \n で改行
let shownAt=-1e9;
function show(id){document.querySelectorAll('.ov').forEach(o=>o.classList.toggle('on',o.id===id))}
// スマホでは、タップのあとにブラウザが同じ場所へ「クリック」も送る。盤面のボタンで開いた画面が、
// その遅れてきたクリックで即座に閉じられないよう、開いた直後のクリックは捨てる
document.addEventListener('click',e=>{if(performance.now()-shownAt<400&&e.target.closest&&e.target.closest('.ov')){e.stopPropagation();e.preventDefault()}},true);
cv.addEventListener('touchend',e=>e.preventDefault(),{passive:false});
$('#baseGet').onclick=baseGetTap;
addEventListener('keydown',e=>{if(BG&&(e.code==='Space'||e.code==='Enter'||e.code==='Escape')){e.preventDefault();e.stopImmediatePropagation();baseGetTap()}},true);
// 元素の詳細（盤面や一覧で長押し、または図鑑のカードをタップ）
const USES={};for(const[a,b,r]of RECIPES){(USES[a]=USES[a]||[]).push([b,r]);if(a!==b)(USES[b]=USES[b]||[]).push([a,r])}
const RANKMAX={};for(const d of Object.values(ITEMS)){const m=RANKMAX[d.t]=RANKMAX[d.t]||{dps:1,range:1};m.dps=Math.max(m.dps,dpsOf(d));m.range=Math.max(m.range,d.range)}
function dpsOf(d){return d.kind==='trap'||noAtk(d)||d.kind==='mirror'?0:d.kind==='beam'&&!d.rate?d.dmg:d.dmg*d.rate} // 1 体に対する毎秒の威力（状態異常は別）
let detailFrom=null,detailId=null;
// 図鑑から開いたときは、図鑑の並び（★順）で見つけた元素だけを前後に送れる
// 図鑑に出す並び：しぼりこみ（CFLT）を通した元素。★順なら★ごとの見出しつき、それ以外は見つけた元素を並べ替えたあとに、まだ見つけていない元素
// ★以外でしぼっている間は、まだ見つけていない元素は出さない（ゲーム画面の一覧と同じ決まり）
function codexList(){
  const F=CFLT,a=Object.values(ITEMS).filter(d=>(!F.rank.size||F.rank.has(d.t))&&fltOk(d,F)),hideQ=fltOn(F);
  const found=a.filter(d=>disc.has(d.id)),q=hideQ?[]:a.filter(d=>!disc.has(d.id));
  if(F.sort==='rank'){const o=[];for(let tr=1;tr<=6;tr++){const r=found.concat(q).filter(d=>d.t===tr);if(r.length)o.push({tier:tr},...r)}return o}
  return fltSort(found,F).concat(q);
}
// 図鑑から開いたときは、図鑑に出ている並び（しぼりこみ・並べ替えのあと）で見つけた元素だけを前後に送れる
const codexOrder=()=>codexList().filter(d=>d.id&&disc.has(d.id)).map(d=>d.id);
function detailStep(dir){
  if(detailFrom!=='codex'||!detailId)return;
  const o=codexOrder(),i=o.indexOf(detailId),j=i+dir;
  if(i<0||j<0||j>=o.length)return;
  openDetail(o[j]);shownAt=0; // 続けて押せるよう、開いた直後のクリックを捨てる仕組みは使わない
}
function openDetail(id,from){
  const d=ITEMS[id],pz=POISON.has(id),R=RANKMAX[d.t],img=i=>`<img alt="" src="${orb(i).toDataURL()}">`,num=v=>+(+v).toFixed(1);
  const bar=(v,max)=>`<span class="bar"><u style="width:${Math.round(clamp(v/max,.03,1)*100)}%"></u></span>`;
  const st=[];
  const sup=d.kind==='support',ward=d.kind==='ward'||d.kind==='relic';
  if(sup)st.push([TT('dSupAtk'),TT('dSupNoAtk')]);
  else if(ward)st.push([TT('dSupAtk'),TT(d.dps?'dWardAtk':'dNoAtk2')]);
  else if(d.kind==='mirror'){
    st.push([TT('dDmg'),TT('dMirrorDmg')]);
    st.push([TT('dRate'),TT('dTimes',num(d.rate))]);
  }else if(d.kind!=='trap'&&!ward){
    st.push([TT('dDmg'),d.kind==='beam'&&!d.rate?TT('dPerSec',num(d.dmg)):num(d.dmg)]);
    if(d.rate)st.push([TT('dRate'),TT('dTimes',num(d.rate))]);
    st.push([TT('dDps'),num(dpsOf(d))+bar(dpsOf(d),R.dps)]);
  }
  if(d.kind!=='relic')st.push(d.kind==='trap'?[TT('dArea'),d.range]:sup?[TT('dSupArea'),d.range]:ward?[TT('dWardArea'),d.range]:[TT('dRange'),d.range+bar(d.range,R.range)]);
  if(d.splash&&!d.boom)st.push([TT('dSplash'),d.splash]);
  if(d.chain)st.push([TT('dChain'),TT('dBodies',d.chain)]);
  if(d.beams>1)st.push([TT('dBeams'),TT('dBodies',d.beams)]);
  if(d.rico)st.push([TT('dRico'),TT('dRicoVal',d.rico)]);
  if(d.chg)st.push([TT('dChg'),TT('dChgVal',d.chg)]);
  if(d.kind==='pulse')st.push([TT('dTarget'),TT('dAllIn')]);
  if(d.kind==='pierce')st.push([TT('dTarget'),TT('dLine')]);
  const fx2=[];
  if(d.kaleido)fx2.push([TT('dKaleido'),TT('dKaleidoFx')]);
  if(d.dot)fx2.push([TT(pz?'stPoison':'stBurn'),TT('dDot',num(d.dot),num(d.dotT))]);
  if(d.slow)fx2.push([TT('stSlow'),d.kind==='trap'?TT('dSlowTrap',Math.round(d.slow*100)):d.kind==='ward'?TT('dSlowWard',Math.round(d.slow*100)):TT('dSlow',Math.round(d.slow*100),num(d.slowT))]);
  if(d.drain)fx2.push([TT('stCurse'),TT('dDrain',num(d.drain*100),num(d.drain*100*DRAIN_BOSS))]);
  if(d.sil)fx2.push([TT('stSil'),TT('dSil',num(d.sil))]);
  if(d.ward==='sil')fx2.push([TT('stSil'),TT('dWardSil')]);
  if(d.dps)fx2.push([TT('dWardDpsK'),TT('dWardDps',d.dps)]);
  if(!noAtk(d))for(const y of SYN)if(y.by.includes(id))fx2.push([TT(y.st),TT('dSynV',y.to.map(f=>TT('f_'+f)).join(LANG==='ja'?'・':' / '),SYN_MUL,num(SYN_T))]); // 属性シナジー：当てた影に状態をかける
  if(d.amp)fx2.push([TT('dAmpK'),TT('dAmpV',TT('f_'+d.amp),AMP_MUL)]);
  if(d.gold)fx2.push([TT('dGoldK'),TT('dGoldV',d.gold)]);
  if(d.heal)fx2.push([TT('dHealK'),TT('dHealV',d.heal)]);
  if(d.rust)fx2.push([TT('dRustK'),TT('dRustV')]);
  if(d.boom)fx2.push([TT('dBoomK'),TT('dBoomV',d.boom,d.splash)]);
  if(d.plague)fx2.push([TT('dPlagueK'),TT('dPlagueV',d.plague)]);
  if(d.echo)fx2.push([TT('dEchoK'),TT('dEchoV',num(d.echo),Math.round(ECHO_POW*100))]);
  if(d.knock)fx2.push([TT('stKnock'),TT('dKnock')]);
  if(d.rew)fx2.push([TT('stRew'),TT('dRew',num(d.rew),REW_CD)]);
  if(d.conf)fx2.push([TT('stConf'),TT('dConf',Math.round((d.confP||1)*100),num(d.conf),CONF_RES)]);
  if(d.lure)fx2.push([TT('stLure'),TT('dLure',Math.round((d.lureP||1)*100),num(d.lure),LURE_RES)]);
  if(d.erase)fx2.push([TT('dEraseK'),TT('dErase',Math.round(d.erase*100))]);
  if(d.soul)fx2.push([TT('dSoulK'),TT('dSoulV',Math.round(d.soul*100),Math.round(d.soulMax*100))]);
  if(d.warp)fx2.push([TT('stKnock'),TT('dWarp',Math.round(d.warpP*100),d.warpCd)]);
  if(d.stop)fx2.push([TT('stStop'),d.stopP?TT('dStopP',Math.round(d.stopP*100),num(d.stop),STOP_RES):TT('dStop',num(d.stop),STOP_RES)]);
  if(d.stun)fx2.push([TT('stStop'),TT('dStun',Math.round(d.stunP*100),num(d.stun),d.stunCd)]);
  const mk=MADE_BY[id]||[],mkK=mk.filter(m=>madeR.has(rkey(m[0],m[1]))),us=USES[id]||[],usK=us.filter(u=>madeR.has(rkey(id,u[0]))),usU=us.length-usK.length;
  const chip=i=>`<span class="rcp" data-el="${i}">${img(i)}<span>${nm(ITEMS[i])}</span></span>`;
  const row=(a,b,r,go)=>`<div class="rc${go?' go':''}"${go?` data-id="${go}"`:''}>${chip(a)}＋${chip(b)}＝${chip(r)}</div>`;
  let h=`<div class="dh" style="--c:${d.c}">${img(id)}<div><b>${nm(d)}</b><span>${'★'.repeat(d.t)}</span><i>${TT('k_'+d.kind)}</i>${d.fam.length?`<i>${TT('dFam',d.fam.map(f=>TT('f_'+f)).join(LANG==='ja'?'・':' / '))}</i>`:''}<i>◆${itemValue(d)}</i></div></div>`;
  h+=`<div class="dd">${ds(d)}</div><div class="dn">${TT(d.kind==='trap'?'dPlaceTrap':d.kind==='relic'?'dPlaceCore':'dPlaceTower')}<br>${TT(d.t===1||canBuy(id)?'dBuyYes':'dBuyNo',d.t)}</div>${buyBtn(d)}`;
  h+=`<div class="dsec">${TT('dStats')}</div><div class="dst" style="--c:${d.c}">${st.map(r=>`<span>${r[0]}</span><b>${r[1]}</b>`).join('')}</div>`;
  if(fx2.length)h+=`<div class="dsec">${TT(ward?'dEffects2':'dEffects')}</div><div class="dst">${fx2.map(r=>`<span>${r[0]}</span><b>${r[1]}</b>`).join('')}</div>`;
  if(d.buffD!=null)h+=`<div class="dsec">${TT('dSupFx')}</div><div class="dst"><span>${TT('dSupDmg')}</span><b>${TT('dSupUp',Math.round(d.buffD*100))}</b><span>${TT('dSupRate')}</span><b>${TT('dSupUp',Math.round(d.buffR*100))}</b></div><div class="dn">${TT('dSupNote')}</div>`;
  h+=`<div class="dsec">${TT('dMadeBy')}</div>`;
  if(d.t===1){h+=`<div class="dn">${TT('dBase')}</div>`+mkK.map(m=>row(m[0],m[1],id)).join('');if(mk.length>mkK.length)h+=`<div class="dn">${TT('dMoreWays',mk.length-mkK.length)}</div>`} // 水・土は、崩れて戻る作り方もある
  else{h+=mkK.map(m=>row(m[0],m[1],id)).join('');if(mk.length>mkK.length)h+=`<div class="dn">${TT('dMoreWays',mk.length-mkK.length)}</div>`}
  h+=`<div class="dsec">${TT('dUses')}</div>`;
  if(!us.length)h+=`<div class="dn">${TT('dNoUse')}</div>`;
  else{h+=usK.map(u=>row(id,u[0],u[1],u[1])).join('');h+=`<div class="dn">${usU?TT('dUnknown',usU):TT('dAllKnown')}　${TT('dKnownN',usK.length,us.length)}</div>`}
  $('#dBody').innerHTML=h;$('#dBody').scrollTop=0;$('#dClose').textContent=TT('close');$('#dPrev').textContent=TT('dPrev');$('#dNext').textContent=TT('dNext');
  if(from!==undefined)detailFrom=from;
  detailId=id;
  {const o=detailFrom==='codex'?codexOrder():[],i=o.indexOf(id);$('#dPrev').hidden=$('#dNext').hidden=i<0;$('#dPrev').disabled=i<=0;$('#dNext').disabled=i<0||i>=o.length-1}
  show('detail');shownAt=performance.now();sfx.ui();
}
$('#dBody').addEventListener('click',ev=>{const bb=ev.target.closest('[data-buy]');
  if(bb){const r=undoable(()=>spawnBase(bb.dataset.buy));if(r){bb.textContent=TT(r==='full'?'benchFull':'noMana');bb.classList.add('poor')}else{const y=$('#dBody').scrollTop;openDetail(bb.dataset.buy);$('#dBody').scrollTop=y}return}
  const p=ev.target.closest('[data-el]');if(p){openDetail(p.dataset.el);return}const c=ev.target.closest('.rc.go');if(c)openDetail(c.dataset.id)}); // できる元素をタップすると、その詳細へ
$('#dClose').onclick=()=>{sfx.ui();if(detailFrom==='codex')openCodex();else show(null);detailFrom=null};
$('#dPrev').onclick=()=>detailStep(-1);$('#dNext').onclick=()=>detailStep(1);
addEventListener('keydown',e=>{if(!$('#detail').classList.contains('on'))return;if(e.code==='ArrowLeft')detailStep(-1);else if(e.code==='ArrowRight')detailStep(1)});
{let sx=null,sy=0; // スマホでは左右にはらっても前後へ
  $('#dBody').addEventListener('touchstart',e=>{const t=e.touches[0];sx=e.touches.length===1?t.clientX:null;sy=t.clientY},{passive:true});
  $('#dBody').addEventListener('touchend',e=>{if(sx===null)return;const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;sx=null;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)detailStep(dx<0?1:-1)},{passive:true});}
// 図鑑・詳細の呼び出しボタン。一覧と同じ canBuy（★1／この戦いで作った／工房レベル以下の★）で判定し、届かないものは押せない札にする
function buyBtn(d){
  if(!disc.has(d.id))return'';
  if(!canBuy(d.id))return`<button class="cbuy" disabled>${TT('cWs',d.t)}</button>`;
  const cost=itemValue(d);return`<button class="cbuy${S.mana<cost?' poor':''}" data-buy="${d.id}">◆${cost} ${TT('cBuy')}</button>`;
}
function openCodex(){
  const all=Object.values(ITEMS);
  $('#cnt').innerHTML=TT('found',disc.size,all.length)+'<br><small>'+TT('codexRule')+'</small>';
  $('#cfb').textContent=TT('cFlt');$('#cfb').classList.toggle('on',fltOn(CFLT)||CFLT.rank.size>0||CFLT.sort!=='rank');
  let h='';
  const list=codexList();
  if(!list.length)h=`<div class="cnone">${TT('cNone')}</div>`;
  for(const d of list){
      if(d.tier){h+=`<div class="tier">${'★'.repeat(d.tier)}</div>`;continue}
      const tr=d.t,mk=MADE_BY[d.id];
      if(disc.has(d.id)){
        // 作り方は、実際にその組み合わせで錬成したことがあるものだけ、最大 3 通り（材料を持っているだけでは出さない。詳細画面と同じ決まり）
        const rs=mk?mk.filter(m=>madeR.has(rkey(m[0],m[1]))).slice(0,3):[];
        h+=`<div class="card tap" data-id="${d.id}" style="--c:${d.c}"><img class="o" alt="" src="${orb(d.id).toDataURL()}"><b>${nm(d)}</b>${rs.map(m=>`<em>${nm(ITEMS[m[0]])} ＋ ${nm(ITEMS[m[1]])}</em>`).join('')}${ds(d)}</div>`;
      }else{ // 材料が両方とも図鑑にあれば、片方だけ教える（作った組み合わせ基準だと、作った時点で発見済みになりヒントが出る場面がなくなるため）
        const kn=mk&&mk.find(m=>disc.has(m[0])&&disc.has(m[1]));
        const hint=UNLOCK[d.id]!==undefined?TT('unlockAt',sn(STAGES[UNLOCK[d.id]])):kn?`${nm(ITEMS[kn[0]])} ＋ ？`:'？ ＋ ？';
        h+=`<div class="card q"><div class="o">？</div><b>？？？</b><em>${hint}</em>${TT(tr<6?'notYet':'theEnd')}</div>`;
      }
  }
  const g=$('#grid'),keep=$('#codex').classList.contains('on')?g.scrollTop:0;
  g.innerHTML=h;g.scrollTop=keep;show('codex');
}
$('#bClose').onclick=()=>{sfx.ui();show(null)};
function miniMap(c,st){ // ステージの縮図
  const g=c.getContext('2d'),k=c.width/450;g.setTransform(k,0,0,k,0,-42*k);g.lineJoin=g.lineCap='round';
  for(const[w,col]of[[46,'#8b5cf666'],[34,'#151126']]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();for(const p of st.paths)p.forEach((q,i)=>g[i?'lineTo':'moveTo'](q[0],q[1]));g.stroke()}
  g.fillStyle='#8b5cf6';for(const[x,y]of st.field){g.beginPath();g.arc(x,y,15,0,TAU);g.fill()}
  g.fillStyle='#e8c36a';for(const[x,y]of st.traps){g.beginPath();g.arc(x,y,9,0,TAU);g.fill()}
  const e=st.paths[0][st.paths[0].length-1];g.fillStyle='#fff3cf';g.beginPath();g.moveTo(e[0],e[1]-30);g.lineTo(e[0]+20,e[1]);g.lineTo(e[0],e[1]+30);g.lineTo(e[0]-20,e[1]);g.fill();
}
$('#grid').addEventListener('click',ev=>{
  const c=ev.target.closest('.card.tap');if(c)openDetail(c.dataset.id,'codex')});
function openStages(){
  if(nightSel!==null){NIGHT=nightSel;nightSel=null} // 今日の挑戦から戻ったら、難易度の選択を挑戦の前に戻す
  NIGHT=toDiff(NIGHT);
  while(NIGHT&&!ORDER.some(i=>diffOpen(i,NIGHT)))NIGHT--; // 開いていない難易度が選ばれていたら、1 段ずつ下げる
  $('#dNorm').classList.toggle('on',!NIGHT);$('#dNight').classList.toggle('on',NIGHT===1);$('#dAbyss').classList.toggle('on',NIGHT===2);
  $('#dNight').disabled=!ORDER.some(i=>nightOpen(i));
  $('#dAbyss').disabled=!ORDER.some(i=>abyssOpen(i));
  $('#dNote').textContent=NIGHT===2?TT('abyssNote',ABYSS_HP,ABYSS_LIVES,ABYSS_SPICE):NIGHT?TT('nightNote',NIGHT_HP,NIGHT_LIVES)+($('#dAbyss').disabled?TT('abyssHint'):''):$('#dNight').disabled?TT('nightLocked'):TT('carry');
  const box=$('#slist');box.innerHTML='';
  if(RUN){ // 途中保存があれば、先頭に「つづきから」
    const st=STAGES[RUN.stage],b=document.createElement('button');b.className='stg res';
    b.innerHTML=`<canvas width="192" height="200"></canvas><div><b>${TT('resume')}</b><span>${sn(st)}${dParen(toDiff(RUN.night))}${RUN.daily?TT('dailyParen'):''}</span><span><em>${TT('resumeNote',RUN.wave+1,RUN.lives,RUN.mana)}</em></span></div>`;
    miniMap(b.querySelector('canvas'),st);
    b.onclick=()=>{audio();resumeRun();show(null);sfx.merge(2);if(S.moon&&S.moon.pend)openMoon()};
    box.appendChild(b);
  }
  // 今日の挑戦：日付で決まるステージと難易度。開放の順に関係なく遊べる（ふつうの進行度には数えない）
  // 初めての人がいきなり難しいステージに入らないよう、宵の回廊をクリアするまでは一覧の最後に鍵つきで出す
  const dayOpen=rec(0,false).clear;
  const dayBtn=()=>{
    const k=dayKey(),c=dailyNow(k),st=STAGES[c.stage],r=daily[k],b=document.createElement('button');b.className='stg day';b.disabled=!dayOpen;
    const date=new Date().toLocaleDateString(LANG==='ja'?'ja-JP':'en-US',{month:'short',day:'numeric'});
    b.innerHTML=`<canvas width="192" height="200"></canvas><div><b>${TT('daily')}</b><span>${date}　${sn(st)}${dParen(+c.night)}</span><span>${!dayOpen?TT('dailyLocked'):r?`<em>${TT(r.clear?'dailyClear':'dailyBest',r.best)}</em>`:TT('dailyNew')}</span><span class="gift" style="color:#ffe9a0">✦ ${TT('mut_'+c.mut)}：${TT('mutD_'+c.mut)}</span></div>`;
    miniMap(b.querySelector('canvas'),st);
    b.onclick=()=>{audio();startDaily();show(null);sfx.merge(2)};
    box.appendChild(b);
  };
  if(dayOpen)dayBtn();
  ORDER.forEach(i=>{const st=STAGES[i];
    const open=diffOpen(i,NIGHT),r=rec(i,NIGHT),b=document.createElement('button');
    b.className='stg';b.disabled=!open;
    const state=!open?TT(NIGHT===2?'needNight':NIGHT?'needNormal':'needPrev'):r.clear?`<em>${TT('cleared')}</em>`:r.best?TT('bestWave',r.best):TT('untried');
    const gift=!NIGHT&&Object.keys(UNLOCK).find(id=>UNLOCK[id]===i&&!disc.has(id)); // このステージのクリアで届く基本元素（まだ持っていないもの）
    const bdg=Array.isArray(r.badges)&&r.badges.length?`<span class="gift" style="color:#ffe9a0">${r.badges.map(x=>'✦'+TT('badge_'+x)).join('　')}</span>`:'';
    b.innerHTML=`<canvas width="192" height="200"></canvas><div><b>${sn(st)}</b><span>${snote(st)}${TT('stLen',maxWave(i))}</span><span>${state}</span>${bdg}${gift?`<span class="gift" style="color:${ITEMS[gift].c}">${TT('stageReward',nm(ITEMS[gift]))}</span>`:''}${st.aff?`<span class="gift" style="color:${st.aff.c||'#6ab8ff'}">${affText(st)}</span>`:''}${st.gates?st.gates.map(f=>`<span class="gift" style="color:${ELEM[f].c}">${gateText(f)}</span>`).join(''):''}</div>`;
    miniMap(b.querySelector('canvas'),st);
    b.onclick=()=>{audio();DAILY=null;STAGE=i;reset();show(null);sfx.merge(2)};
    box.appendChild(b);
  });
  if(!dayOpen)dayBtn();
  $('#sStats').textContent=TT('statsTitle');$('#sAch').textContent=TT('achTitle');$('#sHelp').textContent=TT('helpBtn');
  show('stages');
}
/* ---------------- 実績 ----------------
   ok：解除の条件（いまの記録から判定できるもの）。pg：進み具合 [いま, 目標]。arg：説明文に入れる値
   ok のないもの（flawless）は、その場面で grantAch を呼ぶ。
   今日の挑戦の扱い：ステージの進行にかかわる実績（主・王・クリア・悪夢・エンドレス・消えない灯）は、今日の挑戦では解除しない。
   通算の数（撃破・錬成）と図鑑は、挑戦のぶんも統計・図鑑に入るので、そのまま数える。daily10 は挑戦だけの実績 */
const anyClear=n=>ORDER.some(i=>rec(i,n).clear),clearN=n=>ORDER.filter(i=>rec(i,n).clear).length;
const bestWaveAll=()=>Object.values(prog).reduce((m,r)=>Math.max(m,r&&r.best||0),0); // ふつうのステージ（通常・悪夢）での最高到達波。今日の挑戦の記録は入れない
const dailyTop=()=>Object.values(daily).reduce((m,r)=>Math.max(m,r.best),0);
const T6=Object.values(ITEMS).filter(d=>d.t>=6).map(d=>d.id),ENDLESS_GOAL=30;
const achCount=(id,get,n)=>({id,arg:()=>[fmtN(n)],ok:()=>get()>=n,pg:()=>[get(),n]});
const achCodex=(id,q)=>{const n=Math.ceil(TOTAL*q);return{id,arg:()=>[n],ok:()=>disc.size>=n,pg:()=>[disc.size,n]}};
const ACH=[
  {id:'firstBoss',ok:()=>anyClear(false)||anyClear(true)}, // クリアしていれば、主も王も倒している。倒したその場での解除は、敵を倒す処理の中（stats.bosses・kings は挑戦のぶんも入るので、ここでは見ない）
  {id:'king',ok:()=>anyClear(false)||anyClear(true)},
  {id:'clear1',ok:()=>anyClear(false)||anyClear(true)},
  {id:'clearAll',arg:()=>[ORDER.length],ok:()=>clearN(false)>=ORDER.length,pg:()=>[clearN(false),ORDER.length]},
  {id:'night1',ok:()=>anyClear(true)},
  {id:'abyss1',ok:()=>anyClear(2)},
  {id:'nightAll',arg:()=>[ORDER.length],ok:()=>clearN(true)>=ORDER.length,pg:()=>[clearN(true),ORDER.length]},
  achCodex('codex25',.25),achCodex('codex50',.5),achCodex('codex100',1),
  {id:'star6',ok:()=>T6.some(i=>disc.has(i))},
  {id:'endless30',arg:()=>[ENDLESS_GOAL],ok:()=>bestWaveAll()>=ENDLESS_GOAL,pg:()=>[bestWaveAll(),ENDLESS_GOAL]},
  achCount('kills100',()=>stats.kills,100),achCount('kills1000',()=>stats.kills,1000),achCount('kills5000',()=>stats.kills,5000),
  achCount('merges50',()=>stats.merges,50),achCount('merges300',()=>stats.merges,300),achCount('merges1000',()=>stats.merges,1000),
  {id:'flawless'},
  {id:'daily10',arg:()=>[DAILY_GOAL],ok:()=>dailyTop()>=DAILY_GOAL,pg:()=>[dailyTop(),DAILY_GOAL]},
];
const achName=a=>TT('a_'+a.id),achDesc=a=>TT('ad_'+a.id,...(a.arg?a.arg():[]));
// 画面の上に小さく出す知らせ（実績の解除）。重なったら順に出す
const toastQ=[];let toastOn=false;
function toast(head,body){toastQ.push([head,body]);if(!toastOn)toastNext()}
function toastNext(){
  const t=toastQ.shift(),el=$('#toast');if(!t){toastOn=false;return}
  toastOn=true;$('#toH').textContent=t[0];$('#toB').textContent=t[1];el.classList.add('on');sfx.ach();
  setTimeout(()=>{el.classList.remove('on');setTimeout(toastNext,380)},2600);
}
function grantAch(id,silent){ // silent：知らせを出さずに解除する（これまでの記録ですでに満たしていた分）
  if(ach[id]||!ACH.some(a=>a.id===id))return;
  ach[id]=Math.floor(Date.now()/1000);save();
  if(!silent&&FX)toast(TT('achGot'),TT('a_'+id));
}
function checkAch(silent){for(const a of ACH)if(!ach[a.id]&&a.ok&&a.ok())grantAch(a.id,silent)}
function openAch(from){
  if(from)subFrom=from;
  const got=ACH.filter(a=>ach[a.id]).length,day=t=>new Date(t*1000).toLocaleDateString(LANG==='ja'?'ja-JP':'en-US');
  $('#hAch').textContent=TT('achTitle');$('#aClose').textContent=TT('close');$('#aCnt').textContent=TT('achCount',got,ACH.length);
  $('#aBody').innerHTML=ACH.map(a=>{const on=!!ach[a.id],p=!on&&a.pg?a.pg():null;
    return`<div class="ar${on?' on':''}"><i>${on?'✦':'◇'}</i><div><b>${achName(a)}</b><span>${achDesc(a)}</span></div><em>${on?day(ach[a.id]):p?fmtN(Math.min(p[0],p[1]))+' / '+fmtN(p[1]):''}</em></div>`}).join('');
  $('#aBody').scrollTop=0;show('ach');shownAt=performance.now();
}
$('#aClose').onclick=()=>{sfx.ui();subBack()};
let fltCx=false; // しぼりこみの窓を図鑑から開いているか（図鑑は CFLT、ゲーム画面の一覧は FLT）
function fltChanged(){if(fltCx){openCodex();$('#grid').scrollTop=0}else SHOP.scroll[SHOP.tab]=0}
function fltClose(){if(fltCx){$('#flt').classList.remove('on','cx');fltCx=false}else show(null)}
function openFilter(cx=fltCx){
  fltCx=cx;const F=cx?CFLT:FLT;
  // 複数選べる項目（Set）は押すたびに入れたり外したり、並べ替えは 1 つだけ
  const grp=(el,key,opts)=>{const multi=F[key] instanceof Set,has=v=>multi?F[key].has(v):F[key]===v;
    $(el).innerHTML=opts.map(([v,l])=>`<button data-v="${v}" class="${has(v)?'on':''}">${l.startsWith('★')?l:TT(l)}</button>`).join('');
    $(el).onclick=e=>{const b=e.target.closest('button');if(!b)return;let v=b.dataset.v;sfx.ui();
      if(key==='rank'){v=+v;const r=new Set(F.rank);r.has(v)?r.delete(v):r.add(v);if(cx)F.rank=r;else setRank(r)}
      else if(multi)F[key].has(v)?F[key].delete(v):F[key].add(v);else F[key]=v;
      fltChanged();openFilter()}};
  $('#fhRank').textContent=TT('fRank');grp('#fRank','rank',[1,2,3,4,5,6].map(n=>[n,'★'+n]));
  $('#fhFam').textContent=TT('fFam');grp('#fFam','fam',FAMS.map(f=>[f,'f_'+f]).concat([['none','fNoFam']]));
  $('#fhPlace').textContent=TT('fPlace');$('#fhRole').textContent=TT('fRole');$('#fhSort').textContent=TT('fSort');
  grp('#fPlace','place',[['tower','fTower'],['trap','fTrap']]);
  grp('#fRole','role',[['burn','fBurn'],['slow','fSlow'],['area','fArea'],['chain','fChain'],['pierce','fPierce'],['buff','fBuff']]);
  grp('#fSort','sort',[['rank','sRank'],['cost','sCost'],['pow','sPow']].concat(cx?[]:[['new','sNew']])); // 最近作った順はその戦いの記録なので、図鑑には出さない
  $('#fOnlyL').textContent=TT(cx?'cOnly':'fOnly');$('#fOnly').classList.toggle('on',F.only);
  $('#fReset').textContent=TT('fReset');$('#fClose').textContent=TT('close');
  $('#fltPs').textContent=TT('fPaused');$('#fltPs').hidden=cx||!S.active; // 波の最中は止めていることを知らせる
  $('#fltP').style.bottom=cx?`calc(var(--u)*8)`:`calc(var(--u)*${(H-TABS[0].y+6).toFixed(1)})`; // ★の行のすぐ上に開き、下の札で結果が見えるようにする（図鑑では画面の下に）
  if(cx){$('#flt').classList.add('on','cx')}else{$('#flt').classList.remove('cx');show('flt')}
}
$('#fOnly').onclick=()=>{const F=fltCx?CFLT:FLT;F.only=!F.only;sfx.ui();fltChanged();openFilter()};
$('#fReset').onclick=()=>{const F=fltCx?CFLT:FLT;Object.assign(F,{fam:new Set(),place:new Set(),role:new Set(),sort:'rank',only:false});if(fltCx)F.rank=new Set();else setRank([]);sfx.ui();fltChanged();openFilter()};
$('#fClose').onclick=()=>{sfx.ui();fltClose()};
$('#flt').onclick=e=>{if(e.target.id==='flt'){sfx.ui();fltClose()}}; // 窓の外を押しても閉じる
$('#cfb').onclick=()=>{sfx.ui();openFilter(true)};
$('#mCodex').onclick=()=>{sfx.ui();openCodex();shownAt=performance.now()};
$('#mAch').onclick=()=>{sfx.ui();openAch('menu')};
$('#sAch').onclick=()=>{audio();sfx.ui();openAch('stages')};
/* ---------------- 統計 ---------------- */
let subFrom=null; // 統計などの画面をどこから開いたか（'menu'／'stages'）。閉じたらそこへ戻る
const fmtN=n=>Math.floor(n).toLocaleString(LANG==='ja'?'ja-JP':'en-US');
function fmtTime(sec){const s=Math.floor(sec),h=s/3600|0,m=(s%3600)/60|0;return h?TT('tHM',h,m):m?TT('tMS',m,s%60):TT('tS',s)}
function subBack(){if(subFrom==='stages')openStages();else if(subFrom==='menu')openMenu();else show(null)}
function openStats(from){
  if(from)subFrom=from;
  const row=(k,v)=>`<span>${k}</span><b>${v}</b>`;
  const best=(i,n)=>{const r=rec(i,n);return r.clear?`<em>${r.best>maxWave(i)?TT('stClearBest',r.best):TT('cleared')}</em>`:r.best?TT('bestWave',r.best):diffOpen(i,n)?TT('untried'):TT('stNone')};
  let h=`<div class="dsec">${TT('stTotal')}</div><div class="dst">`
    +row(TT('stKills'),fmtN(stats.kills))+row(TT('stBosses'),fmtN(stats.bosses))+row(TT('stMerges'),fmtN(stats.merges))
    +row(TT('stPlays'),fmtN(stats.plays))+row(TT('stTime'),fmtTime(stats.time))+row(TT('stWaves'),fmtN(stats.waves))
    +row(TT('stFound'),`${disc.size} / ${TOTAL}`)+'</div>';
  h+=`<div class="dsec">${TT('stStage')}</div><div class="sbt"><span></span><i>${TT('normal')}</i><i>${TT('night')}</i><i>${TT('abyss')}</i>`
    +ORDER.map(i=>{const st=STAGES[i];return`<b>${sn(st)}</b><span>${best(i,0)}</span><span>${best(i,1)}</span><span>${best(i,2)}</span>`}).join('')+'</div>';
  const dk=Object.keys(daily).sort().reverse(),dl=k=>{const[y,m,d]=k.split('-');return new Date(+y,m-1,+d).toLocaleDateString(LANG==='ja'?'ja-JP':'en-US',{month:'short',day:'numeric'})};
  h+=`<div class="dsec">${TT('stDaily')}</div><div class="dst">`+row(TT('stDays'),fmtN(dk.length))
    +dk.slice(0,7).map(k=>row(`${dl(k)}　${sn(STAGES[daily[k].stage])}${dParen(+daily[k].night)}`,TT(daily[k].clear?'stDayClear':'stDayWave',daily[k].best))).join('')+'</div>';
  $('#hStats').textContent=TT('statsTitle');$('#stClose').textContent=TT('close');
  $('#stBody').innerHTML=h;$('#stBody').scrollTop=0;show('stats');shownAt=performance.now();
}
$('#stClose').onclick=()=>{sfx.ui();subBack()};
$('#mStats').onclick=()=>{sfx.ui();openStats('menu')};
$('#sStats').onclick=()=>{audio();sfx.ui();openStats('stages')};
/* ---------------- 共有 ---------------- */
const SITE='https://shinpoyo.com/alchemerge_defense/';
function shareLines(kind){
  const st=sn(STAGES[STAGE])+dParen(NIGHT)+(DAILY?TT('dailyParen'):'');
  const res=kind==='codex'?'':S.cleared?TT('shareClear',maxWave()):TT('shareOver',S.wave);
  return{title:TT('title'),st:kind==='codex'?TT('codexTitle'):st,res,found:TT('found',disc.size,TOTAL)};
}
function shareCard(kind){ // いまの盤面に結果を重ねた画像（800×800）
  const L=shareLines(kind),c=document.createElement('canvas');c.width=c.height=800;const g=c.getContext('2d');
  const k=cv.width/W;g.drawImage(cv,0,46*k,cv.width,474*k,0,0,800,800*474/450);
  g.fillStyle='#07060d';g.fillRect(0,800*474/450-2,800,800);
  let gr=g.createLinearGradient(0,380,0,800);gr.addColorStop(0,'rgba(5,4,9,0)');gr.addColorStop(.55,'rgba(5,4,9,.93)');gr.addColorStop(1,'#050409');g.fillStyle=gr;g.fillRect(0,380,800,420);
  g.textAlign='center';g.textBaseline='middle';
  gr=g.createLinearGradient(0,560,0,640);gr.addColorStop(0,'#fff6d8');gr.addColorStop(.6,'#e8c36a');gr.addColorStop(1,'#8a6a2a');
  g.font=FONT(78,800);g.shadowColor='#8b5cf6';g.shadowBlur=30;g.fillStyle=gr;g.fillText(L.res||L.st,400,600);g.shadowBlur=0;
  g.font=FONT(FS.f5,800);g.fillStyle='#e9e4f5';g.fillText(L.res?`${L.st}　${L.found}`:L.found,400,676);
  g.font=FONT(FS.f4,800);g.fillStyle='#e8c36a';g.fillText(`${L.title} ― ${TT('genre')}`,400,735);
  g.font=FONT(FS.f3);g.fillStyle='#8d86a3';g.fillText(SITE.replace('https://',''),400,770);
  return c;
}
async function share(btn,kind){
  const L=shareLines(kind),text=LANG==='ja'?`${L.title}｜${L.st}${L.res?' '+L.res:''}・${L.found}`:`${L.title} | ${L.st}${L.res?' — '+L.res:''} · ${L.found}`;
  const done=msg=>{const o=btn.textContent;btn.textContent=msg;btn.classList.add('done');setTimeout(()=>{btn.textContent=o;btn.classList.remove('done')},1800)};
  sfx.ui();
  let file=null;
  try{const blob=await new Promise(r=>shareCard(kind).toBlob(r,'image/png'));if(blob)file=new File([blob],'yoiyami.png',{type:'image/png'})}catch(e){}
  try{
    if(file&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],text:text+'\n'+SITE});return}
    if(navigator.share){await navigator.share({text,url:SITE});return}
  }catch(e){if(e&&e.name==='AbortError')return}
  // 共有の画面が出せない環境（PC など）は、文章をコピーして画像を保存する
  try{await navigator.clipboard.writeText(text+'\n'+SITE);done(TT('copied'))}catch(e){window.prompt(TT('copyThis'),text+' '+SITE)}
  if(file){const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download='yoiyami.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
}
$('#bShare1').onclick=e=>share(e.currentTarget,'result');
$('#bShare2').onclick=e=>share(e.currentTarget,'result');
$('#bShare3').onclick=e=>share(e.currentTarget,'codex');
$('#dNorm').onclick=()=>{NIGHT=0;sfx.ui();openStages()};
$('#dNight').onclick=()=>{NIGHT=1;sfx.ui();openStages()};
$('#dAbyss').onclick=()=>{NIGHT=2;sfx.ui();openStages()};
$('#bStart').onclick=()=>{audio();sfx.ui();openStages()};
$('#bRetry').onclick=()=>{audio();reset();show(null);sfx.merge(1)};
$('#bAgain').onclick=$('#bStages1').onclick=()=>{audio();sfx.ui();S.cleared=false;S.over=true;openStages()};
$('#bEndless').onclick=()=>{S.endless=true;S.cele=0;show(null);sfx.ui();saveRun()};
function applyLang(){ // 画面の文言を、いまの言語に入れかえる
  const ja=LANG==='ja',set=(id,k,...a)=>{$(id).innerHTML=TT(k,...a)};
  document.documentElement.lang=LANG;document.title=TT('docTitle');$('#stage').classList.toggle('en',!ja);
  $('#t1').innerHTML=spanify(ja?'アルケマージ\nディフェンス':'ALCHEMERGE\nDEFENSE');
  set('#how','how',TOTAL);set('#bStart','start');set('#bLang','langBtn');set('#bHelp0','helpBtn');set('#hStages','stages');set('#dNorm','normal');set('#dNight','night');set('#dAbyss','abyss');
  set('#hCodex','codexTitle');set('#bClose','close');set('#bShare3','shareCodex');set('#bShare1','shareResult');set('#bShare2','shareResult');
  set('#hOver','fallen');set('#bRetry','retry');set('#bStages1','toStages');set('#bAgain','toStages');set('#bEndless','endless');
  orbCache=new Map();bgCanvas=null;
}
const SPK='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
      SPK0='<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>';
function openMenu(){
  $('#hMenu').textContent=TT('menuTitle');$('#mClose').textContent=TT('mBack');$('#mHelp').textContent=TT('helpBtn');
  $('#mStats').textContent=TT('statsTitle');$('#mAch').textContent=TT('achTitle');$('#mCodex').textContent=`${TT('bCodex')}　${disc.size}/${TOTAL}`;
  $('#mSec1').textContent=TT('mSec1');$('#mSec2').textContent=TT('mSec2');
  $('#lSe').textContent=TT('mSeVol');$('#lBgm').textContent=TT('mBgmVol');$('#rSe').setAttribute('aria-label',TT('mSeVolFull'));$('#rBgm').setAttribute('aria-label',TT('mBgmVolFull'));
  // スピーカーの絵：効果音の行は効果音だけ、音楽の行は音楽だけを消す
  $('#mSound').innerHTML=sfxOff?SPK0:SPK;$('#mSound').setAttribute('aria-label',TT(sfxOff?'mUnmuteBtn':'mMuteBtn')+': '+TT('mSeVol'));
  $('#mMusic').innerHTML=musicOff?SPK0:SPK;$('#mMusic').setAttribute('aria-label',TT(musicOff?'mUnmuteBtn':'mMuteBtn')+': '+TT('mBgmVol'));
  $('#lDmg').textContent=TT('mDmg');$('#mDmg').classList.toggle('on',!dmgOff);$('#mDmg').setAttribute('aria-pressed',!dmgOff);
  $('#lVib').textContent=TT('mVib');$('#mVib').classList.toggle('on',!vibOff);$('#mVib').setAttribute('aria-pressed',!vibOff);
  $('#lLang').textContent=TT('mLangL');$('#mJa').classList.toggle('on',LANG==='ja');$('#mEn').classList.toggle('on',LANG==='en');
  $('#mStages').textContent=TT('mStages');$('#mReset').textContent=TT('mReset');
  $('#rSe').value=seVol;$('#rBgm').value=bgmVol;volShow();show('menu');
}
$('#mSound').onclick=()=>{sfxOff=!sfxOff;save();audio();if(!sfxOff)sfx.ui();openMenu()};
$('#mMusic').onclick=()=>{musicOff=!musicOff;save();audio();audioState();sfx.ui();openMenu()};
// 音量のつまみ：動かしている間もその場で音量を変え、効果音は試しに鳴らす。離したときに保存する
function volShow(){$('#nSe').textContent=seVol+'%';$('#nBgm').textContent=bgmVol+'%';$('#vSe').classList.toggle('off',sfxOff);$('#vBgm').classList.toggle('off',musicOff)}
let volT=0;
function volTest(gap){const n=performance.now();if(n-volT>gap){volT=n;sfx.ui()}}
$('#rSe').oninput=e=>{seVol=volOf(+e.target.value);audio();applyVol();volShow();volTest(140)};
$('#rBgm').oninput=e=>{bgmVol=volOf(+e.target.value);audio();applyVol();volShow()};
$('#rSe').onchange=()=>{save();volTest(60)};$('#rBgm').onchange=()=>save();
$('#mDmg').onclick=()=>{dmgOff=!dmgOff;if(dmgOff)dnums.length=0;save();sfx.ui();openMenu()};
$('#mVib').onclick=()=>{vibOff=!vibOff;save();sfx.ui();buzz(30);openMenu()}; // オンにしたときは試しに一度ふるわせる
function setLang(l){if(LANG===l)return;LANG=l;save();applyLang();sfx.ui();openMenu()}
$('#mJa').onclick=()=>setLang('ja');$('#mEn').onclick=()=>setLang('en');
$('#mStages').onclick=()=>{sfx.ui();S.cleared=false;S.over=true;openStages()};
$('#mClose').onclick=()=>{sfx.ui();show(null)};
/* ---------------- 遊び方 ---------------- */
// 章は 8 つ。ルールと操作だけを書く（敵や札の中身など、遊んで知る楽しみは書かない）
let helpCh=0,helpFrom=null;
function openHelp(from,ch){
  if(from!==undefined)helpFrom=from;if(ch!==undefined)helpCh=ch;
  $('#hHelp').textContent=TT('helpT');$('#hPrev').textContent=TT('hPrev');$('#hNext').textContent=TT('hNext');$('#hClose').textContent=TT('close');
  let t='';for(let i=0;i<8;i++)t+=`<button class="${i===helpCh?'on':''}" data-i="${i}">${TT('hc'+(i+1))}</button>`;
  $('#hTabs').innerHTML=t;$('#hTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{sfx.ui();openHelp(undefined,+b.dataset.i)});
  $('#hBody').innerHTML=`<h3>${TT('hc'+(helpCh+1))}</h3><ul>${TT('hb'+(helpCh+1))}</ul>`;$('#hBody').scrollTop=0;
  $('#hPrev').disabled=helpCh===0;$('#hNext').disabled=helpCh===7;
  if(!$('#help').classList.contains('on')){show('help');shownAt=performance.now()}
}
$('#hPrev').onclick=()=>{if(helpCh>0){sfx.ui();openHelp(undefined,helpCh-1)}};
$('#hNext').onclick=()=>{if(helpCh<7){sfx.ui();openHelp(undefined,helpCh+1)}};
$('#hClose').onclick=()=>{sfx.ui();if(helpFrom==='menu')openMenu();else if(helpFrom==='stages')openStages();else if(helpFrom==='title')show('title');else show(null)};
$('#mHelp').onclick=()=>{sfx.ui();openHelp('menu',helpCh)};
$('#sHelp').onclick=()=>{audio();sfx.ui();openHelp('stages',helpCh)};
$('#bHelp0').onclick=()=>{audio();sfx.ui();openHelp('title',0)};
// 一時停止：止まるだけ。開いている間は盤面にも一覧にも触れない。どこを押しても再開
function openPause(){sfx.ui();$('#hPause').textContent=TT('pauseT');$('#pMoon').textContent=moonGot().length?TT('moonNow',moonList()):'';$('#pResume').textContent=TT('pResume');show('pause');shownAt=performance.now()}
$('#pause').onclick=()=>{sfx.ui();show(null)};
addEventListener('keydown',e=>{if(e.code!=='Space'&&e.code!=='KeyP')return; // Space／P でも止める・再開する（Space で止めるのは startWave 側）
  if($('#pause').classList.contains('on')){e.preventDefault();e.stopImmediatePropagation();sfx.ui();show(null)}else if(e.code==='KeyP'&&!$('.ov.on')&&S.active&&!S.over){e.preventDefault();openPause()}},true);
// 進捗の初期化：設定（音・言語・ダメージ数字・振動）だけを残して保存を書きかえ、ページを読みこみ直す。
// 状態をその場で 1 つずつ戻すより、読みこみ直すほうが取りこぼしがない
$('#mReset').onclick=()=>{sfx.ui();$('#hWipe').textContent=TT('wipeTitle');$('#wipeTxt').innerHTML=TT('wipeTxt');
  $('#wYes').textContent=TT('wipeYes');$('#wNo').textContent=TT('wipeNo');show('wipe');$('#wNo').focus()};
$('#wNo').onclick=()=>{sfx.ui();openMenu()};
$('#wYes').onclick=()=>{
  try{localStorage.setItem(SAVE,JSON.stringify({musicOff,sfxOff,lang:LANG,dmgOff,vibOff,seVol,bgmVol}))}catch(e){}
  wiped=true;location.reload()};
$('#bLang').onclick=()=>{LANG=LANG==='ja'?'en':'ja';save();applyLang();sfx.ui()};
applyLang();
