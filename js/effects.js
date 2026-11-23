'use strict';
// パーティクル・ヒットストップ・ダメージの数字（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- パーティクルと演出 ---------------- */
const parts=[],fx=[];
const glowCache=new Map();
function glow(color){
  let c=glowCache.get(color);if(c)return c;
  c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,rgba(color,1));gr.addColorStop(.25,rgba(color,.55));gr.addColorStop(1,rgba(color,0));
  g.fillStyle=gr;g.fillRect(0,0,64,64);glowCache.set(color,c);return c;
}
function P(x,y,vx,vy,life,size,color,o){
  if(!FX||parts.length>2600)return;
  parts.push(Object.assign({x,y,vx,vy,life,max:life,size,color,ty:'g',g:0,drag:1.5,rot:0,vr:0},o));
}
function burst(x,y,color,n=14,sp=120,o){
  for(let i=0;i<n;i++){const a=rnd(TAU),v=rnd(sp*.25,sp);P(x,y,Math.cos(a)*v,Math.sin(a)*v,rnd(.3,.7),rnd(3,7),color,o)}
}
function sparks(x,y,color,n=8,sp=200){
  for(let i=0;i<n;i++){const a=rnd(TAU),v=rnd(sp*.3,sp);P(x,y,Math.cos(a)*v,Math.sin(a)*v,rnd(.2,.5),1.6,color,{ty:'s',drag:3})}
}
function ring(x,y,color,r1=50,dur=.4,lw=3,r0=6){if(FX)fx.push({ty:'ring',x,y,color,r0,r1,dur,lw,t:0})}
function floatText(x,y,txt,color='#e9e4f5',size=14){ // 長い文字は画面の端からはみ出さないよう寄せる
  const hw=Math.min(W/2-4,String(txt).length*size*.55);x=clamp(x,hw+4,W-hw-4);if(FX)fx.push({ty:'text',x,y,txt,color,size,t:0,dur:1})}
function shake(v){if(FX)S.shake=Math.max(S.shake,v)}
// ヒットストップ：主・王や大型の敵を倒した瞬間だけ、戦いの時間をほんの一瞬止める（火花などの演出は動き続ける）。
// 大型が続けて倒れても画面がかくつかないよう、短いものは HS_COOL ミリ秒に 1 回まで。時間は足さず、長いほうを取る
const HS_BIG=.07,HS_BOSS=.16,HS_KING=.24,HS_COOL=350;let hsLast=-1e9;
function hitStop(sec){
  if(!FX)return;const now=performance.now();
  if(sec<=HS_BIG&&now-hsLast<HS_COOL)return;
  hsLast=now;S.hitstop=Math.max(S.hitstop,sec);
}
/* ダメージの数字：敵に入った傷を、小さな数字で浮かべて消す。
   重くならないよう、敵ごとに DNUM_GAP 秒ぶんをまとめて 1 つにし（照射や燃焼は毎フレーム入るため）、同時に出すのは DNUM_MAX 個まで */
const dnums=[],DNUM_MAX=36,DNUM_GAP=.25,DNUM_LIFE=.7;
const fmtD=v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?Math.round(v/1e3)+'k':v>=1e3?(v/1e3).toFixed(1)+'k':Math.round(v)+'';
function dnumPop(e){
  const v=e.dn,weak=e.dnW,cur=e.dnC,syn=e.dnS;e.dn=0;e.dnW=e.dnC=e.dnS=0;e.dnT=DNUM_GAP;
  if(dmgOff||v<1||e.x<-10||e.x>W+10)return; // 設定でオフにした直後に、それまでにたまっていた数字が出ないように
  if(dnums.length>=DNUM_MAX/2&&v<e.max*.08)return;               // 半分うまったら、かすり傷の数字は出さない（群れに波動が当たったときの数字の壁を防ぐ）
  if(dnums.length>=DNUM_MAX){if(v<e.max*.2)return;dnums.shift()} // いっぱいのとき：大きい一撃だけ、いちばん古いものと入れかえる
  dnums.push({x:e.x+rnd(-e.r,e.r)*.7,y:e.y-e.r-7-(e.def.fly?16:0),txt:fmtD(v),t:0,sz:10+Math.round(clamp(v/e.max,0,1)*6),vx:rnd(-9,9),
    c:weak?'#98a6ba':syn?'#8fe6ff':cur?'#e8b8ff':'#fff6e0'}); // はじかれた＝灰色、シナジーで増えた＝水色、呪いで増えた＝紫、ふつう＝白
}
