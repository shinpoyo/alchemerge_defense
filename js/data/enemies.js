'use strict';
// 敵の定義・波の組み立て（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 敵 ---------------- */
const ENEMY={
  shade:{hp:1,   spd:44,r:11,w:1,  life:1,rim:'#7d5cf0'},
  wisp: {hp:.55, spd:82,r:8, w:.8, life:1,rim:'#e05ad8'},
  golem:{hp:3.6, spd:27,r:15,w:2.5,life:2,rim:'#e0913a',big:true}, // big：大型。倒したときに短いヒットストップと軽い揺れが入る
  mite: {hp:.28, spd:62,r:6, w:.35,life:1,rim:'#3ad6a0'},
  boss: {hp:14.4, spd:24,r:24,w:12, life:8,rim:'#ff3b6b'},
  // 通常の波に混ざる、くせのある敵
  runner:  {hp:1.1,spd:80,r:9, w:1.1,life:1,rim:'#ffd84a',res:.7},   // 駆ける影：減速が効きにくい（効き目が 3 割になる）
  flyer:   {hp:1.15,spd:53,r:10,w:1.2,life:1,rim:'#6ad8ff',fly:true}, // 飛ぶ影：道を無視して入口から灯へ一直線。罠にかからない
  splitter:{hp:2.2,spd:36,r:14,w:2,  life:2,rim:'#7ae08a',split:3,big:true},  // 分かれる影：倒すと小さい 3 体に分かれる
  healer:  {hp:1.5,spd:30,r:11,w:1.6,life:1,rim:'#f4eeff',heal:.05},  // 癒す影：まわりの影の傷を治す（主・王と、癒す影どうしは治さない）。硬い影と同じ足どりで寄りそう
  armored: {hp:2.6,spd:33,r:13,w:2.3,life:2,rim:'#8fa6c4',armor:.25,big:true}, // 鎧の影：ある 1 つの系統の攻撃を 4 分の 1 にする。どの系統かは波ごとに決まり、鎧の色と紋で分かる
};
const HEAL_R=64,HEAL_EVERY=1.2; // 癒す影：この広さの影を、この秒数ごとに最大体力の 5% 治す
// 鎧の影が防ぐ系統（元素の系統 FAMOF のうち、基本の 10 系統）。色と、紋に使う元素の絵
const ELEM={flame:{c:'#ff6a3d',icon:'fire'},water:{c:'#4aa8ff',icon:'water'},earth:{c:'#c08a4a',icon:'earth'},wind:{c:'#7df0c0',icon:'wind'},volt:{c:'#ffe45c',icon:'bolt'},
  ice:{c:'#8fe6ff',icon:'ice'},poison:{c:'#8be04a',icon:'venom'},dark:{c:'#9a7ad8',icon:'dark'},light:{c:'#fff2a0',icon:'light'},wood:{c:'#7ac85a',icon:'wood'}};
const ARMOR_FAMS=Object.keys(ELEM);
const armorFam=w=>STAGES[STAGE].aff?STAGES[STAGE].aff.resist:ARMOR_FAMS[mixH(w*31+STAGE*7+5)%ARMOR_FAMS.length]; // ステージと波で決まる（同じ波をやり直せば同じ系統）
const ENDLESS_PHASES=['bloodMoon','denseFog','starfall','eclipse'];
const EPH_COL={bloodMoon:'#ff6a88',denseFog:'#9ab8e8',starfall:'#ffe45c',eclipse:'#c490ff'};
const endlessPhase=(w=S?S.wave:0)=>{const mw=maxWave();return w>mw?ENDLESS_PHASES[Math.floor((w-mw-1)/5)%ENDLESS_PHASES.length]:null};
let HP0=80;
// 1 波ごとの敵の体力の伸び（GROW_BY）と夜の王の体力の倍率（FINAL_BY）。並びは WAVES_BY_TIER（10・15・20 波）と同じ。
// 短いステージほど伸びを大きくして、後半にしっかり苦戦するようにする（2026-11-25。それまでは全ステージ 1.28・王 2 倍）
// 夜の王が硬すぎて宵の回廊でも王の体力が 8 割以上残ったまま陥落したので、10 波・15 波の面の王を軽くした（2026-11-26。それまでは 4・5.5 倍。10 波の面は遊んでみて 2.5 → 3 倍）
// ★ごとの威力をなだらかにして高い★が弱くなったので、主の体力を 18 → 14.4、王の倍率を 3・3.5・3.5 → 2.2・2.5・2.5 に下げた（2026-11-26。王は合わせて今の約 6 割）
let GROW_BY=[1.42,1.34,1.30],FINAL_BY=[2.2,2.5,2.5];
let MOB_HP=.25;const KING_SPD=.75; // 雑魚（主・王以外）の体力の上乗せ（第 4 波から少しずつ、第 8 波で +25%）／夜の王の歩く速さの倍率（2026-11-25）
const mobHp=w=>1+MOB_HP*clamp((w-3)/5,0,1);
const waveTier=(i=STAGE)=>WAVES_BY_TIER.indexOf(maxWave(i));
const ARMOR_FROM=13,ARMOR_AFF_FROM=7;
const waveHp=w=>HP0*GROW_BY[waveTier()]**(w-1)*STAGES[STAGE].hp*DIFF[NIGHT].hp*(typeof dailyMut==='function'&&dailyMut()==='highMana'?1.25:1)*(endlessPhase(w)==='starfall'?1.15:1);
function buildWave(w){
  const q=[];let t=0;
  const add=(type,n,gap,m=1)=>{for(let i=0;i<n;i++){q.push({type,at:t,m});t+=gap}};
  const gap=Math.max(.38,.95-w*.028);
  if(w>=3&&w%3===0){add('mite',8+w,gap*.38);t+=1}
  const sp=(STAGES[STAGE].spice??1)*DIFF[NIGHT].spice; // くせのある敵の多さ（最初のステージは半分）
  // 癒す影（第 9 波から）と鎧の影（第 13 波から。系統ステージは第 7 波から）は、数を足すのではなく、影・硬い影と入れかわる（敵の総数と魔力の入りはこれまでと同じ）
  const a0=STAGES[STAGE].aff?ARMOR_AFF_FROM:ARMOR_FROM; // 系統ステージ（属性の地）は鎧の影が早く出る（10 波のステージでも出るように）
  const nHeal=w>=9?Math.ceil((1+Math.floor((w-9)/4))*sp):0,nArm=w>=a0?Math.ceil((1+Math.floor((w-a0)/3))*sp):0;
  add('shade',5+Math.floor(w*1.25)-nHeal,gap);
  if(w>=2)add('wisp',1+(w>>1),gap*.7);
  if(w>=4){const ng=Math.max(1,Math.floor(w/2.5)-nArm);
    for(let i=0;i<ng;i++){q.push({type:'golem',at:t,m:1});if(i<nHeal)q.push({type:'healer',at:t+gap*.8,m:1});t+=gap*1.6}} // 癒す影は、硬い影のあいだに混ざって出る
  if(nArm)add('armored',nArm,gap*1.6);
  if(w>=6)add('runner',Math.ceil((2+Math.floor((w-6)*.5))*sp),gap*.8);
  if(w>=8)add('flyer',Math.ceil((2+Math.floor((w-8)*.5))*sp),gap);
  if(w>=11)add('splitter',Math.ceil((1+Math.floor((w-11)/2))*sp),gap*1.7);
  if(w%5===0||isKingWave(w)){t+=1;add('boss',1,1,isKingWave(w)?FINAL_BY[waveTier()]:w===5?.75:1);if(isKingWave(w))q[q.length-1].final=true} // 最後の波（エンドレスでは波数の倍数ごと）に「夜の王」、ほかの 5 の倍数に「夜の主」
  {const g=STAGES[STAGE].gates,k=q[q.length-1]; // 門が 2 つで系統の敵が出るステージ（双つの門・砂時計の峠）：夜の王は門ごとに 1 体ずつ、その門の系統で出る
    if(g&&g.length===2&&k.final){k.path=0;k.m*=KING2_M;q.push({...k,path:1})}}
  return q;
}
function wavePreview(w){ // 次の波の予告情報（特徴的な敵のバッジ一覧と総数）
  const q=buildWave(w),cnt={};
  for(const e of q)cnt[e.type]=(cnt[e.type]||0)+1;
  const tags=[];
  if(cnt.boss)tags.push({t:TT(isKingWave(w)?'bossKing':'bossLord'),c:'#ff6a88'});
  if(cnt.armored){const f=armorFam(w);tags.push({t:TT('pvArm',TT('f_'+f)),c:ELEM[f].c})}
  if(cnt.flyer)tags.push({t:TT('pvFly'),c:'#6ad8ff'});
  if(cnt.healer)tags.push({t:TT('pvHeal'),c:'#9affc8'});
  if(cnt.splitter)tags.push({t:TT('pvSplit'),c:'#7ae08a'});
  if(cnt.runner)tags.push({t:TT('pvRun'),c:'#ffd84a'});
  return{total:q.length,tags};
}
