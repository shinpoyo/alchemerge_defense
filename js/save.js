'use strict';
// 状態・保存・統計・今日の挑戦・途中保存（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 状態 ---------------- */
let S,UNDO=null,disc,madeR=new Set(),prog={},muted=false,musicOff=false,sfxOff=false,FX=true,bgCanvas=null,TUT=0,RUN=null; // TUT：手引きを終えたら 9
const SAVE='yoiyami-alchemy-v1';
// 途中保存として読めるものだけ受けつける。項目が欠けていたり型がちがうものは捨てる（「つづきから」で止まったり、波や灯が NaN になったりしないように）
const runOK=r=>!!r&&typeof r==='object'&&ORDER.includes(r.stage)&&Array.isArray(r.items)&&[r.wave,r.mana,r.lives].every(v=>typeof v==='number'&&isFinite(v)&&v>=0)&&r.lives>0;
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');disc=new Set((Array.isArray(d.disc)?d.disc:BASES).filter(i=>ITEMS[i])); // 前の仕組み（図鑑の数）ですでに開いた木・光・闇はそのまま残す
  if(Array.isArray(d.madeR))madeR=new Set(d.madeR.filter(k=>typeof k==='string'&&RECIPE[k])); // 実際に作った組み合わせ（rkey 形式）
  else if(Array.isArray(d.disc)){madeR=new Set();for(const k in RECIPE){const[a,b]=k.split('+');if(disc.has(a)&&disc.has(b))madeR.add(k)}} // madeR が無い古いセーブ（disc の記録があるもの）：材料が両方そろっているレシピを、作ったものとして引き継ぐ。初回・初期化直後は disc が無いので種まきしない
  prog=d.prog&&typeof d.prog==='object'&&!Array.isArray(d.prog)?d.prog:{};for(const k in prog){const v=prog[k];if(!v||typeof v!=='object')delete prog[k];else{v.best=Math.max(0,Math.floor(+v.best)||0);v.clear=!!v.clear||v.best>=maxWave(parseInt(k))}} // 形のおかしい記録。波数を減らす前に、いまの最後の波まで進んでいた記録はクリア扱いは捨てる（そのままだと最高記録が更新されなくなる）
  for(const k in prog)if(!ORDER.includes(parseInt(k)))delete prog[k]; // ボツにしたステージ（迷いの森）の記録は消す（ユーザー決定 2026-11-23）
  TUT=d.tut?9:0;RUN=runOK(d.run)?d.run:null;if(d.best&&!prog['0'])prog['0']={best:d.best,clear:d.best>=maxWave(0)};
  for(const id in UNLOCK)if(!disc.has(id)&&(prog[String(UNLOCK[id])]||{}).clear)disc.add(id);musicOff=!!d.musicOff;sfxOff=!!d.sfxOff;if(d.muted){sfxOff=musicOff=true} /* 前の「音：オフ（すべて）」は、効果音と音楽の両方を消した状態に移す */}catch(e){disc=new Set(BASES)}
BASES.forEach(b=>disc.add(b));
// 統計：これまでの合計。保存は項目を足すだけで、これまでの項目（disc・prog・run など）の意味と形は変えない
const stats={kills:0,bosses:0,kings:0,merges:0,plays:0,time:0,waves:0};
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');if(d.stats&&typeof d.stats==='object')for(const k in stats)if(d.stats[k]>0)stats[k]=+d.stats[k]||0}catch(e){}
const ach={}; // 実績：解除したものの id → 解除した時刻（秒）。これも保存に足すだけの項目
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');if(d.ach&&typeof d.ach==='object')for(const k in d.ach)if(d.ach[k]>0)ach[k]=+d.ach[k]}catch(e){}
let dmgOff=false; // ダメージの数字を出さない設定（設定メニューで切りかえ）
try{dmgOff=!!JSON.parse(localStorage.getItem(SAVE)||'{}').dmgOff}catch(e){}
let vibOff=false; // 振動させない設定（設定メニューで切りかえ）
try{vibOff=!!JSON.parse(localStorage.getItem(SAVE)||'{}').vibOff}catch(e){}
let sparkOff=true; // 未発見レシピの予感演出を出さない設定（デフォルトはオフ。設定メニューで切りかえ）
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');if(d.sparkOff!==undefined)sparkOff=!!d.sparkOff}catch(e){}
let seVol=100,bgmVol=100; // 効果音と音楽の音量（0〜100）。セーブに無いときは 100 として扱う
const volOf=x=>typeof x!=='number'||!isFinite(x)?100:Math.max(0,Math.min(100,Math.round(x)));
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');seVol=volOf(d.seVol);bgmVol=volOf(d.bgmVol)}catch(e){}
let wiped=false; // 初期化したあと、読みこみ直すまでの間に古い進捗を書き戻さないように
function save(){
  if(wiped)return;
  try{
    localStorage.setItem(SAVE,JSON.stringify({
      disc:[...disc],madeR:[...madeR],prog,run:RUN,
      stats:{...stats,time:Math.round(stats.time)},ach,daily,
      muted,musicOff,sfxOff,seVol,bgmVol,
      lang:LANG,tut:TUT>=9?1:0,
      dmgOff,vibOff,sparkOff,
    }));
  }catch(e){}
}
// 途中保存：進行中の戦い（ステージ・波・魔力・灯・置いてある元素）を端末に残す。
// 取るのは「波を呼ぶ直前」「波を退けた直後」「敵がいないときに盤面を変えたとき」。
// 戦闘の途中で閉じた場合は、その波を呼ぶ直前の状態から再開になる
function saveRun(){
  if(!FX||S.over||(S.cleared&&!S.endless))return;
  RUN={stage:STAGE,night:NIGHT,wave:S.wave,mana:Math.floor(S.mana),lives:S.lives,endless:S.endless,made:[...S.made],ws:S.ws,chal:{...S.chal},
       items:slots.map((sl,i)=>sl.item?(sl.item.lv?[i,sl.item.id,sl.item.lv]:[i,sl.item.id]):null).filter(Boolean)};
  if(S.moon&&(S.moon.got.length||S.moon.pend))RUN.moon={got:[...S.moon.got],pend:S.moon.pend?[...S.moon.pend]:null}; // 月の恵み
  if(DAILY)RUN.daily=DAILY; // 今日の挑戦の途中なら、その日付も残す
  save();
}
function clearRun(){if(RUN&&FX){RUN=null;save()}}
function resumeRun(){
  const r=RUN;if(!r)return;
  const n0=NIGHT;STAGE=r.stage;NIGHT=toDiff(r.night);DAILY=/^\d{4}-\d\d-\d\d$/.test(r.daily||'')?r.daily:null;if(DAILY&&nightSel===null)nightSel=n0;reset();
  for(const sl of slots)sl.item=null;
  r.items.forEach((e,n)=>{if(!Array.isArray(e))return;const[i,id,lv]=e,sl=slots[i];if(!sl||!ITEMS[id])return;let to=sl;if(!fits(id,sl))to=slots.find(b=>b.bench&&!b.item&&!r.items.some(q=>Array.isArray(q)&&slots[q[0]]===b)); // 塔が罠に変わったなどで置けなくなった元素は、空いている作業台へ戻す（2026-11-29）
    if(to){const sl=to,it=mkItem(id,sl.x,sl.y);if(lv>0&&ITEMS[id].t===MAX_T)it.lv=Math.floor(lv);it.s=.01;it.hide=.1+n*.04;sl.item=it}});
  S.wave=Math.floor(r.wave);S.mana=S.manaShow=Math.floor(r.mana);S.manaFrac=0;S.lives=Math.floor(r.lives);S.endless=!!r.endless;S.cleared=S.endless;S.started=true;S.tut=9;
  S.made=new Set((Array.isArray(r.made)?r.made:[]).filter(i=>ITEMS[i]));S.ws=clamp(Math.floor(+r.ws)||1,1,6);
  if(r.chal&&typeof r.chal==='object')S.chal={max4:!!r.chal.max4,noTrap:!!r.chal.noTrap,base4:!!r.chal.base4};
  const mok=k=>typeof k==='string'&&MOON.some(c=>c.id===moonBase(k))&&(!k.startsWith('kago:')||!!TX['f_'+k.slice(5)]);
  if(r.moon&&Array.isArray(r.moon.got)){const p=Array.isArray(r.moon.pend)?r.moon.pend.filter(mok):[];S.moon={got:r.moon.got.filter(mok),pend:p.length?p:null}}
}
const BADGES=['max4','noTrap','base4'];
const BASE4_SET=(()=>{const s=new Set(BASES);let ch=true;while(ch){ch=false;for(const[a,b,r]of RECIPES)if(s.has(a)&&s.has(b)&&!s.has(r)){s.add(r);ch=true}}return s})();
function mkItem(id,x=W/2,y=H){return{id,cd:rnd(.3),rx:x,ry:y,s:1,sv:0,kick:0,hide:0,ph:rnd(TAU),held:false,shake:0,beamT:[],chg:0,chgT:0,chgB:0}}
const pkey=(i=STAGE,n=NIGHT)=>i+(n===2?'a':n?'n':'');
const rec=(i,n)=>prog[pkey(i,n)]||{best:0,clear:false};
const prevStage=i=>{const k=ORDER.indexOf(i);return k>0?ORDER[k-1]:-1};
const stageOpen=i=>{const p=prevStage(i),r=rec(i,false);return p<0||rec(p,false).clear||r.clear||r.best>0}; // 並び順で前のステージをクリアすると開く。並びを変える前に遊んだステージは開いたまま
const nightOpen=i=>stageOpen(i)&&rec(i,false).clear; // そのステージをクリアすると「悪夢」が開く
const abyssOpen=i=>nightOpen(i)&&rec(i,1).clear;     // 悪夢でクリアすると「深淵」が開く
const diffOpen=(i,n)=>n===2?abyssOpen(i):n?nightOpen(i):stageOpen(i);
function reset(){
  loadStage(STAGE);
  const m0=dailyMut()==='highMana'?100:40;
  S={
    mana:m0,manaShow:m0,manaBump:0,manaErr:0,lives:DIFF[NIGHT].lives,
    spawned:0,wave:0,active:false,queue:[],wt:0,budget:0,wsum:1,
    enemies:[],shots:[],time:0,speed:1,
    over:false,cleared:false,endless:false,dawn:0,cele:0,rocketT:0,
    tagT:{},shake:0,flash:0,flashC:'#fff',slowmo:0,banner:null,info:null,
    coreHit:0,benchShake:0,started:false,hintT:0,tut:TUT,
    made:new Set(),ws:1,seen:{},leaks:{},
    chal:{max4:true,noTrap:true,base4:true},elDmg:{},
    bossAt:null,warned:false,warn:0,warnFinal:false,bossLag:1,bossA:0,hitstop:0,
  };
  const bench=slots.filter(s=>s.bench);
  BASES.forEach((id,i)=>{const it=mkItem(id,bench[i].x,bench[i].y);it.s=.01;it.hide=.25+i*.12;bench[i].item=it});
  parts.length=0;fx.length=0;dnums.length=0;sel=null;drag=null;UNDO=null;
}
