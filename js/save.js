'use strict';
// 状態・保存・統計・今日の挑戦・途中保存（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 状態 ---------------- */
let S,UNDO=null,disc,madeR=new Set(),prog={},muted=false,musicOff=false,FX=true,bgCanvas=null,TUT=0,RUN=null; // TUT：手引きを終えたら 9
const SAVE='yoiyami-alchemy-v1';
// 途中保存として読めるものだけ受けつける。項目が欠けていたり型がちがうものは捨てる（「つづきから」で止まったり、波や灯が NaN になったりしないように）
const runOK=r=>!!r&&typeof r==='object'&&ORDER.includes(r.stage)&&Array.isArray(r.items)&&[r.wave,r.mana,r.lives].every(v=>typeof v==='number'&&isFinite(v)&&v>=0)&&r.lives>0;
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');disc=new Set((Array.isArray(d.disc)?d.disc:BASES).filter(i=>ITEMS[i])); // 前の仕組み（図鑑の数）ですでに開いた木・光・闇はそのまま残す
  if(Array.isArray(d.madeR))madeR=new Set(d.madeR.filter(k=>typeof k==='string'&&RECIPE[k])); // 実際に作った組み合わせ（rkey 形式）
  else if(Array.isArray(d.disc)){madeR=new Set();for(const k in RECIPE){const[a,b]=k.split('+');if(disc.has(a)&&disc.has(b))madeR.add(k)}} // madeR が無い古いセーブ（disc の記録があるもの）：材料が両方そろっているレシピを、作ったものとして引き継ぐ。初回・初期化直後は disc が無いので種まきしない
  prog=d.prog&&typeof d.prog==='object'&&!Array.isArray(d.prog)?d.prog:{};for(const k in prog){const v=prog[k];if(!v||typeof v!=='object')delete prog[k];else{v.best=Math.max(0,Math.floor(+v.best)||0);v.clear=!!v.clear||v.best>=maxWave(parseInt(k))}} // 形のおかしい記録。波数を減らす前に、いまの最後の波まで進んでいた記録はクリア扱いは捨てる（そのままだと最高記録が更新されなくなる）
  for(const k in prog)if(!ORDER.includes(parseInt(k)))delete prog[k]; // ボツにしたステージ（迷いの森）の記録は消す（ユーザー決定 2026-11-23）
  TUT=d.tut?9:0;RUN=runOK(d.run)?d.run:null;if(d.best&&!prog['0'])prog['0']={best:d.best,clear:d.best>=maxWave(0)};
  for(const id in UNLOCK)if(!disc.has(id)&&(prog[String(UNLOCK[id])]||{}).clear)disc.add(id);muted=!!d.muted;musicOff=!!d.musicOff}catch(e){disc=new Set(BASES)}
BASES.forEach(b=>disc.add(b));
// 統計：これまでの合計。保存は項目を足すだけで、これまでの項目（disc・prog・run など）の意味と形は変えない
const stats={kills:0,bosses:0,kings:0,merges:0,plays:0,time:0,waves:0};
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');if(d.stats&&typeof d.stats==='object')for(const k in stats)if(d.stats[k]>0)stats[k]=+d.stats[k]||0}catch(e){}
const ach={}; // 実績：解除したものの id → 解除した時刻（秒）。これも保存に足すだけの項目
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');if(d.ach&&typeof d.ach==='object')for(const k in d.ach)if(d.ach[k]>0)ach[k]=+d.ach[k]}catch(e){}
/* デイリーチャレンジ（今日の挑戦）：日付で決まるステージと難易度を 1 つ出し、退けた波の自己ベストを日付ごとに残す。
   ふつうのステージの進行度（prog）には書かない。保存は daily という項目を足すだけ */
let DAILY=null;   // 今日の挑戦として遊んでいる間は、その日付（'2026-11-16'）
const daily={};   // 日付 → {best:退けた波, clear, stage, night}
const DAILY_KEEP=120,DAILY_GOAL=10;
const dayKey=(t=new Date())=>`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
const mixH=h=>{h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);h^=h>>>16;return h>>>0}; // 日付の並びが続いても散らばるよう混ぜる
// 今日の挑戦に出るステージの組。ステージを足したり外したりするときは、組を書きかえず、明日以降の日付（from）で新しい組を足す。
// こうすると、もう始まっている日の挑戦のステージが更新で入れかわらない（ステージの並び替え PR #42 で今日の分が変わってしまったため）
const DAILY_POOLS=[{from:'',ids:ORDER}]; // 並び替え後の 15 ステージ（ボツの迷いの森は出さない）
function dailyOf(key){ // 3 日に 1 日ほどが悪夢。ステージは、前の日と同じものが続かないように決める
  // 日付を 7 日ごとの組に分ける。組の 1 日目は組の番号だけで決め、2 日目からは「前の日のステージから 1〜L-1 だけ進める」ので、前の日と同じにならない。
  // 組の最後の日は、前の日とも、次の組の 1 日目ともちがうステージから選ぶ（組の境目でも続かない）。
  // 前の日を「ずらす前の値」で見ていたころは、前の日もずれていたときに同じステージが続くことがあった
  const pool=DAILY_POOLS.filter(q=>q.from<=key).pop().ids,L=pool.length,B=7,h=x=>mixH(hsh('alchemerge:'+x)),[y,mo,d]=key.split('-'),n=Math.round(Date.UTC(+y,mo-1,+d)/864e5),b=Math.floor(n/B),first=g=>h('w'+g)%L;
  let s=first(b);
  for(let j=1;j<=n-b*B;j++){const r=h('d'+(b*B+j));
    if(j<B-1)s=(s+1+r%(L-1))%L;
    else{const nx=first(b+1),c=pool.map((_,i)=>i).filter(i=>i!==s&&i!==nx);s=c[r%c.length]}}
  return{stage:pool[s],night:(h(key)>>>8)%3===0}; // 悪夢になる日は、これまでと同じ
}
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');if(d.daily&&typeof d.daily==='object')for(const k in d.daily){const v=d.daily[k];
  if(/^\d{4}-\d\d-\d\d$/.test(k)&&v&&v.best>0&&ORDER.includes(v.stage))daily[k]={best:Math.floor(v.best),clear:!!v.clear,stage:STAGES[v.stage]?v.stage:0,night:!!v.night}}}catch(e){}
const curBest=()=>DAILY?(daily[DAILY]||{best:0}).best:rec().best; // いまの戦いの、これまでの最高到達波
function dailyRecord(w){ // 今日の挑戦で波を退けたときに呼ぶ
  const r=daily[DAILY]||(daily[DAILY]={best:0,clear:false,stage:STAGE,night:NIGHT});
  if(w<=r.best)return;
  r.best=w;r.clear=r.clear||w>=maxWave(r.stage);
  const ks=Object.keys(daily).sort();while(ks.length>DAILY_KEEP)delete daily[ks.shift()]; // 古い日付から消す
  save();
}
let nightSel=null; // 今日の挑戦に入る前に、ステージ選択で選んでいた難易度。ステージ選択へ戻ったときに戻す（挑戦の難易度を、ふつうのステージの選択に持ちこまない）
// 実際に出す今日の挑戦。そのステージの悪夢がまだ開いていなければ、悪夢の日でも通常にする。
// その日の記録がすでにあれば、記録と同じステージ・難易度のままにする（途中で悪夢が開いても、同じ日の記録に通常と悪夢がまざらない）
function dailyNow(k=dayKey()){const r=daily[k];if(r)return{stage:r.stage,night:r.night};const c=dailyOf(k);return{stage:c.stage,night:c.night&&nightOpen(c.stage)}}
function startDaily(){const k=dayKey(),c=dailyNow(k);if(nightSel===null)nightSel=NIGHT;DAILY=k;STAGE=c.stage;NIGHT=+c.night;reset()}
let dmgOff=false; // ダメージの数字を出さない設定（設定メニューで切りかえ）
try{dmgOff=!!JSON.parse(localStorage.getItem(SAVE)||'{}').dmgOff}catch(e){}
let vibOff=false; // 振動させない設定（設定メニューで切りかえ）
try{vibOff=!!JSON.parse(localStorage.getItem(SAVE)||'{}').vibOff}catch(e){}
let seVol=100,bgmVol=100; // 効果音と音楽の音量（0〜100）。セーブに無いときは 100 として扱う
const volOf=x=>typeof x!=='number'||!isFinite(x)?100:Math.max(0,Math.min(100,Math.round(x)));
try{const d=JSON.parse(localStorage.getItem(SAVE)||'{}');seVol=volOf(d.seVol);bgmVol=volOf(d.bgmVol)}catch(e){}
let wiped=false; // 初期化したあと、読みこみ直すまでの間に古い進捗を書き戻さないように
function save(){if(wiped)return;try{localStorage.setItem(SAVE,JSON.stringify({disc:[...disc],madeR:[...madeR],prog,muted,musicOff,lang:LANG,tut:TUT>=9?1:0,run:RUN,stats:{...stats,time:Math.round(stats.time)},ach,daily,dmgOff,vibOff,seVol,bgmVol}))}catch(e){}}
// 途中保存：進行中の戦い（ステージ・波・魔力・灯・置いてある元素）を端末に残す。
// 取るのは「波を呼ぶ直前」「波を退けた直後」「敵がいないときに盤面を変えたとき」。
// 戦闘の途中で閉じた場合は、その波を呼ぶ直前の状態から再開になる
function saveRun(){
  if(!FX||S.over||(S.cleared&&!S.endless))return;
  RUN={stage:STAGE,night:NIGHT,wave:S.wave,mana:Math.floor(S.mana),lives:S.lives,endless:S.endless,made:[...S.made],ws:S.ws,
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
  r.items.forEach((e,n)=>{if(!Array.isArray(e))return;const[i,id,lv]=e,sl=slots[i];if(sl&&ITEMS[id]&&fits(id,sl)){const it=mkItem(id,sl.x,sl.y);if(lv>0&&ITEMS[id].t===MAX_T)it.lv=Math.floor(lv);it.s=.01;it.hide=.1+n*.04;sl.item=it}});
  S.wave=Math.floor(r.wave);S.mana=S.manaShow=Math.floor(r.mana);S.manaFrac=0;S.lives=Math.floor(r.lives);S.endless=!!r.endless;S.cleared=S.endless;S.started=true;S.tut=9;
  S.made=new Set((Array.isArray(r.made)?r.made:[]).filter(i=>ITEMS[i]));S.ws=clamp(Math.floor(+r.ws)||1,1,6);
  const mok=k=>typeof k==='string'&&MOON.some(c=>c.id===moonBase(k))&&(!k.startsWith('kago:')||!!TX['f_'+k.slice(5)]);
  if(r.moon&&Array.isArray(r.moon.got)){const p=Array.isArray(r.moon.pend)?r.moon.pend.filter(mok):[];S.moon={got:r.moon.got.filter(mok),pend:p.length?p:null}}
}
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
  S={mana:40,manaShow:40,manaBump:0,manaErr:0,lives:DIFF[NIGHT].lives,spawned:0,wave:0,active:false,queue:[],wt:0,budget:0,wsum:1,
     enemies:[],shots:[],time:0,speed:1,over:false,cleared:false,endless:false,dawn:0,cele:0,rocketT:0,
     tagT:{},shake:0,flash:0,flashC:'#fff',slowmo:0,banner:null,info:null,coreHit:0,benchShake:0,started:false,hintT:0,tut:TUT,made:new Set(),ws:1,seen:{},leaks:{},elDmg:{},bossAt:null,warned:false,warn:0,warnFinal:false,bossLag:1,bossA:0,hitstop:0};
  const bench=slots.filter(s=>s.bench);
  BASES.forEach((id,i)=>{const it=mkItem(id,bench[i].x,bench[i].y);it.s=.01;it.hide=.25+i*.12;bench[i].item=it});
  parts.length=0;fx.length=0;dnums.length=0;sel=null;drag=null;UNDO=null;
}
