'use strict';
// 月の恵み（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
// 最後の波より前の 5 波ごと（エンドレスでも 5 波ごと）に、札を 3 枚見せて 1 枚えらぶ。効果はその戦いのあいだだけ。
// S.moon = {got:[えらんだ札], pend:[まだえらんでいない 3 枚] | null}。札は 'deep' のような名前、加護だけ 'kago:flame' の形
const MOON_EVERY=5;
const MOON=[ // name・desc は TX の moon_<id>・moonD_<id>。bad：代償つき
  {id:'kago',bad:1},{id:'deep',bad:1},{id:'full',bad:1},{id:'red',bad:1},{id:'wane',bad:1},
  {id:'lantern'},{id:'rest'},{id:'kindle'},{id:'night'},{id:'drop'},{id:'crush'},
];
const MOON_KAGO=1.25,MOON_KAGO_ELSE=.95,MOON_DEEP=1.2,MOON_DEEP_TOWER=.95,MOON_LANTERN=1.5,MOON_REST=2,MOON_KINDLE=3,
      MOON_NIGHT=1.5,MOON_DROP=1.2,MOON_CRUSH=.5,MOON_FULL=1.5,MOON_FULL_SPD=1.05,MOON_RED=1.3,MOON_RED_LIVES=3,MOON_WANE=.75,MOON_WANE_SPD=1.1;
const moonGot=()=>S.moon?S.moon.got:[];
const moonHas=id=>moonGot().includes(id);
const lastWave=()=>maxWave(); // ステージの最後の波（10・15・20 波）
const moonDue=w=>w>0&&w%MOON_EVERY===0&&(S.endless||w<lastWave());
// 威力：加護（系統ごと）と赤い月。fs は攻撃した元素の系統の配列
function moonM(fs){
  let m=moonHas('red')?MOON_RED:1;
  for(const k of moonGot())if(k.startsWith('kago:'))m*=fs.includes(k.slice(5))?MOON_KAGO:fs.length?MOON_KAGO_ELSE:1;
  return m;
}
const moonTower=()=>moonHas('deep')?MOON_DEEP_TOWER:1;           // 塔の威力（深い罠の代償）
const moonTrap=()=>moonHas('deep')?MOON_DEEP:1;                  // 罠の効き目と広さ
const moonBuff=()=>moonHas('lantern')?MOON_LANTERN:1;            // 支援の塔が強める量
const moonSpd=()=>(moonHas('full')?MOON_FULL_SPD:1)*(moonHas('wane')?MOON_WANE_SPD:1); // 影の足
const moonGold=()=>moonHas('drop')?MOON_DROP:1;                  // 倒したときの魔力
const moonWave=()=>moonHas('full')?MOON_FULL:1;                  // 波の終わりの魔力
const moonArmor=a=>moonHas('crush')?MOON_CRUSH:a;                // 鎧の影の守り
const wsCost=t=>Math.round(WS_COST[t]*(moonHas('wane')?MOON_WANE:1)); // 工房の値段
// 長い夜：状態異常の続く時間をのばした元素の数値（元素ごとに 1 回だけ作る）
const NIGHT_KEYS=['slowT','dotT','stop','stun','sil','conf','lure'],nightCache={};
function moonLong(d){
  if(!moonHas('night'))return d;
  return nightCache[d.id]||(nightCache[d.id]=Object.assign({},d,...NIGHT_KEYS.filter(k=>d[k]>0).map(k=>({[k]:d[k]*MOON_NIGHT}))));
}
const moonSyn=T=>moonHas('night')?T*MOON_NIGHT:T;
// 加護の系統：盤面（魔法陣・罠）にある元素の系統から。なければ基本の系統から
function kagoFam(){
  const got=new Set(moonGot()),fs=new Set();
  for(const sl of slots)if(sl.item&&!sl.bench)for(const f of famL(ITEMS[sl.item.id].fam))if(ELEM[f]||TX['f_'+f])fs.add(f);
  let c=[...fs].filter(f=>!got.has('kago:'+f));
  if(!c.length)c=ARMOR_FAMS.filter(f=>!got.has('kago:'+f));
  return c.length?pick(c):null;
}
function moonDeal(){ // 3 枚をえらぶ。同じ札は 2 回出ない（加護は系統がちがえば出る）
  const got=moonGot(),pool=[];
  for(const c of MOON){
    if(c.id==='kago'){const f=kagoFam();if(f)pool.push('kago:'+f)}
    else if(!got.includes(c.id))pool.push(c.id);
  }
  const out=[];while(out.length<3&&pool.length)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  return out;
}
const moonBase=k=>k.split(':')[0];
const moonName=k=>{const b=moonBase(k);return b==='kago'?TT('moon_kago',TT('f_'+k.slice(5))):TT('moon_'+b)};
const moonDesc=k=>{const b=moonBase(k);return b==='kago'?TT('moonD_kago',TT('f_'+k.slice(5))):TT('moonD_'+b)};
function moonOffer(){ // 波を退けたあとに呼ぶ
  if(!moonDue(S.wave))return false;
  S.moon=S.moon||{got:[],pend:null};
  if(!S.moon.pend){const p=moonDeal();if(!p.length)return false;S.moon.pend=p}
  openMoon();return true;
}
// 札の色と絵。月の札（満ちる月・赤い月・欠けた月）は CSS で月を描き、ほかは元素の玉の絵を使う
const MOON_ICON={deep:'bottomless',lantern:'lantern',rest:'gem',kindle:'seihai',night:'dark',drop:'hougyoku',crush:'sabi'};
const MOON_PHASE={full:'#fff3c4',red:'#ff4a5a',wane:'#b9c8ff'};
function moonColor(k){
  const b=moonBase(k);if(b==='kago'){const f=k.slice(5);return ELEM[f]?ELEM[f].c:(ITEMS[f]&&ITEMS[f].c)||'#e8c36a'}
  return MOON_PHASE[b]||(MOON.find(c=>c.id===b).bad?'#ff8a7a':'#e8c36a');
}
function moonIcon(k){
  const b=moonBase(k);
  if(MOON_PHASE[b])return `<i class="mi ph ${b}"></i>`;
  const id=b==='kago'?(ELEM[k.slice(5)]?ELEM[k.slice(5)].icon:k.slice(5)):MOON_ICON[b];
  return ITEMS[id]?`<i class="mi"><img alt="" src="${orb(id).toDataURL()}"></i>`:'<i class="mi ph full"></i>';
}
let moonBusy=false;
function openMoon(){
  const p=S.moon&&S.moon.pend;if(!p)return;moonBusy=false;
  $('#hMoon').innerHTML=[...TT('moonT')].map((c,i)=>`<span style="--d:${i*.09}s">${c===' '?'&nbsp;':c}</span>`).join('');$('#moonSub').textContent=TT('moonSub');
  const box=$('#moonCards');box.innerHTML='';
  p.forEach((k,i)=>{
    const b=document.createElement('button'),bad=MOON.find(c=>c.id===moonBase(k)).bad;
    b.className='mc'+(bad?' bad':'');b.style.setProperty('--fc',moonColor(k));b.style.setProperty('--i',i);
    b.innerHTML=`${moonIcon(k)}<div><b>${moonName(k)}</b>${bad?`<em>${TT('moonBad')}</em>`:''}<span>${moonDesc(k)}</span></div>`;
    b.onclick=()=>moonPick(k,b);box.appendChild(b);
  });
  show('moon');shownAt=performance.now();
  sfx.moonOpen();p.forEach((_,i)=>setTimeout(()=>{if($('#moon').classList.contains('on'))sfx.moonDeal(i)},700+i*160));
}
function moonPick(k,el){
  if(moonBusy||!S.moon||!S.moon.pend||!S.moon.pend.includes(k))return;
  moonBusy=true;sfx.moonPick(MOON.find(c=>c.id===moonBase(k)).bad);buzz(25);
  for(const c of $('#moonCards').children)c.classList.add(c===el?'pick':'gone');
  $('#moon').classList.add('chosen');
  setTimeout(()=>moonApply(k),el?720:0);
}
function moonApply(k){
  if(!S.moon||!S.moon.pend)return;
  S.moon.got.push(k);S.moon.pend=null;UNDO=null;moonBusy=false;$('#moon').classList.remove('chosen');show(null);
  const b=moonBase(k),c=moonColor(k),cx=W/2,cy=260;
  if(b==='kindle')S.lives+=MOON_KINDLE;
  if(b==='red'){S.lives=Math.max(1,S.lives-MOON_RED_LIVES);S.coreHit=1}
  if(FX){
    fx.push({ty:'moonbeam',x:cx,y:cy,color:c,t:0,dur:1.6});
    S.flash=.4;S.flashC=c;shake(b==='red'?9:5);
    for(let i=0;i<3;i++)fx.push({ty:'ring',x:cx,y:cy,color:i?c:'#ffffff',r0:10,r1:120+i*60,dur:.7+i*.15,lw:4-i,t:-i*.12});
    burst(cx,cy,c,36,260);sparks(cx,cy,'#ffffff',22,340);
    for(let i=0;i<40;i++)P(rnd(20,W-20),rnd(-40,120),rnd(-10,10),rnd(60,160),rnd(1.2,2),rnd(1.6,3.2),i%3?c:'#fffbe8',{ty:'w',drag:.3});
    fx.push({ty:'text',x:cx,y:cy-6,txt:moonName(k),color:c,size:24,t:0,dur:2.6});
    if(b==='kindle'){for(let i=0;i<16;i++)P(cx,cy,(CORE.x-cx)/.7+rnd(-60,60),(CORE.y-cy)/.7+rnd(-60,60),.7,3,'#ffe9a0',{drag:0});
      setTimeout(()=>{ring(CORE.x,CORE.y,'#ffe9a0',70,.5,4);floatText(CORE.x-6,CORE.y-34,TT('livesUp',MOON_KINDLE),'#ffe9a0',FS.f3)},650)}
    if(b==='red')floatText(CORE.x-6,CORE.y-34,'−'+MOON_RED_LIVES,'#ff8a9a',FS.f3);
  }
  saveRun();
}
const moonList=()=>moonGot().map(moonName).join('・');
