'use strict';
// 下の操作部の並び・呼び出し一覧・しぼりこみ（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
// 下の操作部の並び。画面の高さ H に余裕があるほど、マス・タブ・一覧・ボタンを大きくする
const LY={top:516,pitch:66,panelH:138,benchY:r=>516+5+33+r*66,k:1};
function layout(){
  const e=clamp(H-H_MIN,0,H_MAX-H_MIN),q=e/(H_MAX-H_MIN); // q：0（9:16）〜1（縦長）
  LY.k=1+q*.16;                                            // 文字の拡大率
  LY.pitch=62+q*18;LY.panelH=LY.pitch*2+6;LY.benchY=r=>LY.top+5+LY.pitch/2+r*LY.pitch; // マスを少し詰め、そのぶんタブと下のボタンを指で押しやすい大きさにする
  let y=LY.top+LY.panelH+3+q*3;
  for(const t of TABS){t.y=y;t.h=34+q*14}
  y+=34+q*14+4+q*4;SHOP.y=y;SHOP.h=56+q*24;
  y+=SHOP.h+5+q*6;for(const b of buttons){if(b.top)continue;b.y=y;b.h=52+q*20}
  for(const s of slots)if(s.bench)s.y=LY.benchY(s.row);
  bgCanvas=null;
}
// 下のボタンは 4 つ（波・戻す・還す・図鑑と設定）。倍速は右上の丸ボタン（top:true は layout で動かさない）
const buttons=[{id:'wave',x:12,y:747,w:180,h:52,p:0},{id:'undo',x:198,y:747,w:76,h:52,p:0},{id:'trash',x:280,y:747,w:76,h:52,p:0},{id:'menu',x:362,y:747,w:76,h:52,p:0},
  {id:'speed',x:W-50,y:5,w:44,h:44,p:0,top:true}];
const btn=id=>buttons.find(b=>b.id===id);
// 呼び出し一覧：ランクのタブと、横に流せるボタンの列。見つけた元素はここから直接呼び出せる
const SHOP={x:12,y:683,w:426,h:58,bw:62,pitch:67,tab:0,scroll:{0:0,1:0,2:0,3:0,4:0,5:0,6:0},newId:null,newT:0,press:null,pressT:0,dotT:{}};
// ★のタブ：★1〜★6（窓の★の近道。光っているタブをもう一度押すと全部に戻る）、右端の ⇅（t:'f'）でしぼりこみと並べ替えの窓を開く
const TABS=[1,2,3,4,5,6].map((t,i)=>({t,x:12+i*(58.7+5),y:660,w:58.7,h:34})).concat([{t:'f',x:W-12-44,y:660,w:44,h:34}]);
// 一覧から買える元素：★1（解放済みの基本元素）／この戦いで作ったもの／工房レベル以下の★で、図鑑にあるもの
const WS_COST={2:40,3:100,4:240,5:560,6:1200}; // 工房レベルを上げる魔力
// ★t を錬成するには工房レベル t-1 が要る（序盤に上位元素ひとつで押し切れないように）
const rankLv=t=>t-1,rankOpen=t=>S.ws>=rankLv(t);
const canBuy=id=>{const d=ITEMS[id];return disc.has(id)&&(d.t===1||S.made.has(id)||d.t<=S.ws)};
// しぼりこみと並べ替え（⇅の窓で選ぶ）。rank・place・role は複数選べ、何も選んでいなければ全部を出す
// rank：1〜6、place：tower/trap、role：burn/slow/area/chain/pierce/buff
// fam：系統（none は系統なし）。図鑑は CFLT に別に持つ（only は「見つけたものだけ」）
const FLT={rank:new Set(),fam:new Set(),place:new Set(),role:new Set(),sort:'rank',only:false};
const CFLT={rank:new Set(),fam:new Set(),place:new Set(),role:new Set(),sort:'rank',only:false};
const FAMS=['flame','water','earth','wind','wood','volt','ice','poison','dark','light','sound','time','dream','soul','void'];
const fltOn=(F=FLT)=>F.fam.size>0||F.place.size>0||F.role.size>0||F.only; // ★以外で札をしぼっているか（並べ替えだけなら札は減らない）
const rankKey=()=>FLT.rank.size===1?[...FLT.rank][0]:0; // ★が 1 つだけなら、その★のタブとして扱う（横に流した位置を★ごとに覚える）
function setRank(a){FLT.rank=new Set(a);SHOP.tab=rankKey();SHOP.scroll[SHOP.tab]=0}
const ROLE={burn:d=>!!d.dot,slow:d=>!!(d.slow||d.stop||d.stun||d.rew||d.conf||d.lure),area:d=>!!d.splash||d.kind==='pulse',chain:d=>d.kind==='chain',pierce:d=>d.kind==='pierce',buff:d=>d.kind==='support'};
const PLACE={tower:d=>d.kind!=='trap'&&d.kind!=='relic',trap:d=>d.kind==='trap'};
const famOk=(d,k)=>k==='none'?!d.fam.length:d.fam.includes(k); // 2 系統の元素は、どちらの系統でも当てはまる
const fltOk=(d,F=FLT)=>(!F.fam.size||[...F.fam].some(k=>famOk(d,k)))&&(!F.place.size||[...F.place].some(k=>PLACE[k](d)))&&(!F.role.size||[...F.role].some(k=>ROLE[k](d)));
const power=d=>(d.dmg||0)*(d.rate||1)*(d.beams||1)+(d.dot||0);
function fltSort(a,F=FLT){
  if(F.sort==='cost')return a.sort((x,y)=>itemValue(x)-itemValue(y));
  if(F.sort==='pow')return a.sort((x,y)=>power(y)-power(x));
  if(F.sort==='new'){const m=[...S.made],r=id=>{const i=m.indexOf(id);return i<0?-1:i};return a.sort((x,y)=>r(y.id)-r(x.id))}
  return a.sort((x,y)=>x.t-y.t);
}
function shopList(t){
  // t：1〜6 はその★だけ、0 は窓で選んだ★（何も選んでいなければ全部）
  const rk=t?new Set([t]):FLT.rank,a=Object.values(ITEMS).filter(d=>(!rk.size||rk.has(d.t))&&fltOk(d)),f=fltOn(),nx=S.ws+1;
  const head=t>1&&S.ws<t?[{id:'__ws',ws:t}]:t===0&&nx<=6&&!f&&(!rk.size||rk.has(nx))?[{id:'__ws',ws:nx}]:[]; // まだ届いていない★のタブの先頭に、工房レベルを上げる札
  return head.concat(fltSort(a.filter(d=>canBuy(d.id))),FLT.only?[]:fltSort(a.filter(d=>disc.has(d.id)&&!canBuy(d.id))),f?[]:a.filter(d=>!disc.has(d.id))); // しぼっている間は、まだ見つけていない札は出さない
}
function wsHint(t,delay=0){ // 工房の札が初めて目に入ったとき、何をする札かを一言で知らせる（その戦いで 1 回）
  if(S.wsHinted||!(t>1&&S.ws<t))return;S.wsHinted=true;
  setTimeout(()=>floatText(W/2,SHOP.y-18,TT('wsInfo',S.ws+1),'#ffe9a0',FS.f1),delay*1000);
}
function upgradeWs(t,b){
  if(t!==S.ws+1){sfx.fail();floatText(b.x+b.w/2,SHOP.y-10,TT('wsFirst',t-1),'#b9b1d0',FS.f1);return}
  const cost=wsCost(t);
  if(S.mana<cost){S.manaErr=.5;sfx.fail();floatText(W-110,48,TT('noMana'),'#ff8a9a',FS.f1);return}
  S.mana-=cost;S.ws=t;S.manaBump=1;sfx.merge(t);buzz(20);
  const cx=b.x+b.w/2,cy=b.y+b.h/2;if(FX){burst(cx,cy,'#e8c36a',24,160);ring(cx,cy,'#ffe9a0',60,.5,3);sparks(cx,cy,'#fff',12,220)}
  floatText(W/2,SHOP.y-18,t<6?TT('wsUp2',t,t+1):TT('wsUp',t),'#ffe9a0',FS.f2);floatText(W-74,48,'−'+cost,'#ffb89a',FS.f2);SHOP.scroll[t]=0;
  if(!S.active)saveRun();
}
const shopMax=t=>Math.max(0,shopList(t).length*SHOP.pitch-5-SHOP.w);
const shopBtnX=i=>SHOP.x+i*SHOP.pitch-SHOP.scroll[SHOP.tab];
function shopShow(id){ // その元素のボタンが見える位置までタブと列を動かす
  let t=SHOP.tab,i=shopList(t).findIndex(d=>d.id===id);
  if(i<0){t=ITEMS[id].t;i=shopList(t).findIndex(d=>d.id===id);if(i<0)return;setRank([t])} // 今の一覧に無ければ、その★へ切り替える（しぼりこみで見えない札は追わない）
  SHOP.tab=t;SHOP.scroll[t]=clamp(i*SHOP.pitch-(SHOP.w-SHOP.bw)/2,0,shopMax(t));SHOP.newId=id;SHOP.newT=5;wsHint(t,2.2);
}
