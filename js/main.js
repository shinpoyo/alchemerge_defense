'use strict';
// メインループ（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- メインループ ---------------- */
let last=performance.now(),ambT=0;
const PAUSE_OV=['title','codex','stages','menu','detail','stats','ach','pause','flt','moon']; // 開いている間は戦闘を止める画面
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  const paused=PAUSE_OV.some(id=>$('#'+id).classList.contains('on'));
  if(!paused&&!S.over){
    if(FX&&!(S.cleared&&!S.endless))stats.time+=dt; // 戦いの画面を開いている時間（重ね合わせの画面を開いている間は数えない）
    if(S.slowmo>0)S.slowmo-=dt;
    let sim=dt*S.speed*(S.slowmo>0?.2:1);
    if(S.kingIntro)sim=0; // 夜の王の降臨演出中は戦いを止めて姿を見せる
    if(S.hitstop>0){S.hitstop-=dt;sim=0} // ヒットストップ中は戦いを進めない
    while(sim>0&&!S.over){const st=Math.min(sim,1/30);update(st);sim-=st} // 陥落したら、そのフレームの残りは進めない
    if(S.cleared&&!S.endless)celebrate(dt);
    else if(S.allFound>0&&!S.banner){ // 全種発見：花火と紙吹雪
      S.allFound-=dt;S.rocketT-=dt;
      if(S.rocketT<=0){S.rocketT=rnd(.12,.35);fx.push({ty:'rocket',x:rnd(40,W-40),y:H+10,ty2:rnd(90,420),vx:rnd(-30,30),color:pick(FW),t:0,dur:rnd(.55,.9)})}
      if(Math.random()<dt*40)confetti(rnd(W),-10);
    }
  }
  ambT-=dt;if(ambT<=0){ambT=.12;P(rnd(W),rnd(60,515),rnd(-6,6),rnd(-14,-4),rnd(2,4),rnd(1.5,3),Math.random()<.5?'#8b5cf6':'#4a3a9a',{drag:0,tw:1})}
  render(dt);
  requestAnimationFrame(frame);
}
ready=true;layout();
reset();
checkAch(true); // これまでの記録ですでに満たしている実績は、知らせを出さずに解除しておく
window.G={tune(a,b,m,bh){HP0=a;if(b)GROW_BY=GROW_BY.map(()=>b);if(m)FINAL_BY=FINAL_BY.map(()=>m);if(bh)ENEMY.boss.hp=bh},async audioTest(name,sec,arg,battle){
  const sr=44100,keep=[AC,BUS,REV,MUS,noiseBuf,muted,FX,musT,musStep,musBattle,REVM,seVol,bgmVol,musicOff];muted=false;FX=true;seVol=bgmVol=100;musicOff=false;
  buildAudio(new OfflineAudioContext(2,sr*sec,sr));
  S.time+=1;if(name==='music'){musT=0;musStep=0;musBattle=battle?1:0;musicSchedule(sec,battle)}else sfx[name](arg);
  const buf=await AC.startRendering();[AC,BUS,REV,MUS,noiseBuf,muted,FX,musT,musStep,musBattle,REVM,seVol,bgmVol,musicOff]=keep;
  let pk=0,sq=0;const d=buf.getChannelData(0);for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>pk)pk=a;sq+=d[i]*d[i]}
  return{peak:+pk.toFixed(3),rms:+Math.sqrt(sq/d.length).toFixed(4),nan:d.some(x=>x!==x)};
},saveRun,resumeRun,get run(){return RUN},get ui(){return{TABS,SHOP,buttons,LY,H}},setLang(l){LANG=l;applyLang()},shareCard,start(i,n){DAILY=null;STAGE=i;NIGHT=toDiff(n);reset()},startDaily,dailyOf,dailyNow,dayKey,get daily(){return daily},get DAILY(){return DAILY},openStages,STAGES,get prog(){return prog},get stats(){return stats},openStats,save,get ach(){return ach},ACH,openAch,checkAch,grantAch,get S(){return S},slots,dnums,DNUM_MAX,ENEMY,ELEM,armorFam,buildWave,ITEMS,RECIPES,update,startWave,mkItem,dropOn,spawnBase,itemValue,victory,get disc(){return disc},setFX(v){FX=v},tune(a,b){HP0=a;GROW_BY=GROW_BY.map(()=>b)},enhance,enhCost,enhTune(p,c,st){ENH_POW=p;ENH_COST=c;if(st!=null)ENH_STEP=st}};
requestAnimationFrame(frame);
