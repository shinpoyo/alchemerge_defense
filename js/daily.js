'use strict';
/* デイリーチャレンジ（今日の挑戦）：日付で決まるステージ・難易度・日替わり変調を 1 つ出し、
   退けた波の自己ベストを日付ごとに残す。ふつうのステージの進行度（prog）には書かない */
let DAILY=null;   // 今日の挑戦として遊んでいる間は、その日付（'2026-11-16'）
const daily={};   // 日付 → {best:退けた波, clear, stage, night}
const DAILY_KEEP=120,DAILY_GOAL=10;
const dayKey=(t=new Date())=>`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
const mixH=h=>{h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);h^=h>>>16;return h>>>0}; // 日付の並びが続いても散らばるよう混ぜる
// 今日の挑戦に出るステージの組。ステージを足したり外したりするときは、組を書きかえず、明日以降の日付（from）で新しい組を足す。
// こうすると、もう始まっている日の挑戦のステージが更新で入れかわらない（ステージの並び替え PR #42 で今日の分が変わってしまったため）
const DAILY_POOLS=[{from:'',ids:ORDER}]; // 並び替え後の 15 ステージ（ボツの迷いの森は出さない）
const DAILY_MUTS=['craftOnly','trapMaster','swiftBounty','highMana','noSupport'];
function dailyOf(key){ // 3 日に 1 日ほどが悪夢。ステージは、前の日と同じものが続かないように決める
  // 日付を 7 日ごとの組に分ける。組の 1 日目は組の番号だけで決め、2 日目からは「前の日のステージから 1〜L-1 だけ進める」ので、前の日と同じにならない。
  // 組の最後の日は、前の日とも、次の組の 1 日目ともちがうステージから選ぶ（組の境目でも続かない）。
  const pool=DAILY_POOLS.filter(q=>q.from<=key).pop().ids,L=pool.length,B=7,h=x=>mixH(hsh('alchemerge:'+x)),[y,mo,d]=key.split('-'),n=Math.round(Date.UTC(+y,mo-1,+d)/864e5),b=Math.floor(n/B),first=g=>h('w'+g)%L;
  let s=first(b);
  for(let j=1;j<=n-b*B;j++){const r=h('d'+(b*B+j));
    if(j<B-1)s=(s+1+r%(L-1))%L;
    else{const nx=first(b+1),c=pool.map((_,i)=>i).filter(i=>i!==s&&i!==nx);s=c[r%c.length]}}
  return{stage:pool[s],night:(h(key)>>>8)%3===0,mut:DAILY_MUTS[h(key+':mut')%DAILY_MUTS.length]};
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
let nightSel=null; // 今日の挑戦に入る前に、ステージ選択で選んでいた難易度。ステージ選択へ戻ったときに戻す
function dailyNow(k=dayKey()){const r=daily[k],c=dailyOf(k);if(r)return{stage:r.stage,night:r.night,mut:c.mut};return{stage:c.stage,night:c.night&&nightOpen(c.stage),mut:c.mut}}
const dailyMut=()=>DAILY?dailyOf(DAILY).mut:null;
function startDaily(){const k=dayKey(),c=dailyNow(k);if(nightSel===null)nightSel=NIGHT;DAILY=k;STAGE=c.stage;NIGHT=+c.night;reset()}

// 日替わり変調の文言とルール倍率を登録
addLang({
  mut_craftOnly:['純粋錬成','Pure Craft'],mutD_craftOnly:['工房からの直接呼び出し不可（★1とこの戦いで作った元素のみ）','No Workshop summoning (★1 & crafted this battle only)'],
  mut_trapMaster:['罠の夜','Night of Traps'],mutD_trapMaster:['罠の魔力半額・塔は 1.3 倍','Traps half price · Towers ×1.3 cost'],
  mut_swiftBounty:['疾風と豊穣','Swift & Bountiful'],mutD_swiftBounty:['敵の速度 1.25 倍・獲得魔力 1.4 倍','Foes 25% faster · +40% mana from kills'],
  mut_highMana:['魔力奔流','Mana Surge'],mutD_highMana:['初期魔力 100・波報酬 1.3 倍／敵体力 1.25 倍','Start with ◆100 & +30% wave bonus · Foe HP ×1.25'],
  mut_noSupport:['孤高の塔','Lone Towers'],mutD_noSupport:['支援の塔無効・すべての攻撃塔の威力 +15%','Support buffs disabled · All attack towers +15% DMG'],
});
MODS.towerDmg.push(()=>dailyMut()==='noSupport'?1.15:1);
MODS.enemyHp.push(()=>dailyMut()==='highMana'?1.25:1);
MODS.enemySpd.push(()=>dailyMut()==='swiftBounty'?1.25:1);
MODS.killMana.push(()=>dailyMut()==='swiftBounty'?1.4:1);
MODS.waveStart.push(()=>{const dm=dailyMut();if(S.wave===1&&dm&&FX)fx.push({ty:'text',x:W/2,y:152,txt:TT('mut_'+dm)+' ― '+TT('mutD_'+dm),color:'#ffe9a0',size:12.5,t:0,dur:5.5})});
