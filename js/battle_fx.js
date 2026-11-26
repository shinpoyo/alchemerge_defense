// 戦闘エフェクト・弾の描画・シナジー演出（battle.js から分離）
'use strict';
// 攻撃の見た目・戦闘（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 攻撃の見た目（元素ごと） ----------------
   VIS：その元素の攻撃をどう描くか。弾の形・当たったときの演出・波動や貫通の形を決める */
const VIS={
  fire:'fireball',flame:'fireball',phoenix:'feather',wisp:'ghost',water:'drop',sea:'wave',
  earth:'rock',rock:'rock',mountain:'rock',peak:'rock',wind:'blade',gust:'blade',sand:'grain',desert:'grain',
  lava:'glob',ice:'shard',engine:'bullet',crystal:'snipe',curse:'hex',iron:'slug',sabi:'slug',fushoku:'slug',spore:'puff',titan:'shell',ragnarok:'meteor',reaper:'scythe',
  steam:'steam',pond:'ripple',inferno:'flames',sun:'rays',tornado:'spin',typhoon:'spin',storm:'spin',fujin:'spin',sandstorm:'spin',blizzard:'snow',
  miasma:'fog',abyss:'fog',mist:'fog',golem:'slam',colossus:'slam',
  obsidian:'blade2',tsunami:'tide',heat:'heat',railgun:'rail',dragon:'breath',
  hotspring:'steam',raincloud:'rain',glacier:'rock',volcano:'glob',blueflame:'fireball',geyser:'geyser',icicle:'blade2',
  tank:'shell',wraith:'ghost',forest:'fog',iceage:'snow',eruption:'glob',katana:'blade2',
  fortress:'shell',hyakki:'fog',yggdrasil:'fog',holysword:'rail',myth:'meteor',
  ryugu:'ripple',icespear:'blade2',foxfire:'ghost',poseidon:'tide',absolutezero:'snow',solarflare:'flames',kyoshin:'slam',ninetails:'ghost',paradise:'ripple',
  rinne:'feather',gaia:'slam',chaos:'spin',
  wood:'blade',leaves:'blade',bat:'blade',dark:'hex',shadow:'hex',charcoal:'glob',gokuen:'glob',blackflame:'fireball',venom:'drop',toxin:'drop',
  gem:'snipe',diamond:'snipe',vampire:'ghost',shinso:'ghost',thicket:'fog',jungle:'fog',jukai:'fog',tomb:'fog',twilight:'fog',nightfall:'fog',
  flower:'ripple',rainbow:'rays',aurora:'rays',holylight:'rays',
  hai:'puff',awa:'ripple',concrete:'rock',
  sound:'sonic',hanabi:'sonic',hamon:'sonic',jibiki:'sonic',suzu:'sonic',shakudama:'sonic',furin:'sonic',taiko:'sonic',seseragi:'sonic',komoriuta:'sonic',chinkonka:'sonic',yamabiko:'sonic',siren:'sonic',soukyoku:'sonic',goon:'sonic',mateki:'sonic',tenchi:'sonic',choonpa:'blade2',
  chisou:'slam',ancient:'slam',gentou:'fog',nemurigusa:'fog',maboroshi:'fog',poppy:'fog',kagee:'fog',muyuu:'fog',mugenyume:'fog',nemurinomori:'fog',hypnos:'fog',morpheus:'fog',slumber:'fog',
  yumenokuni:'fog',yuukyuu:'fog',
  soul:'ghost',hitodama:'ghost',reikon:'ghost',shinrei:'ghost',zombie:'puff',kinosei:'fog',maou:'flames',lilith:'fog',lucifer:'rays',
  shinkuu:'spin',seijaku:'sonic',kanbatsu:'heat',kouya:'heat',kuukyo:'fog',kyomu:'fog',kokuu:'fog',blackhole:'spin',
};
const POISON=new Set(['zombie','fushoku','ekibyo','barbwire','miasma','abyss','bog','spore','reaper','mire','forest','yggdrasil','flower','venom','toxin','jungle','jukai','thorn','thornwall']); // 継続ダメージが「毒」のもの（ほかは「燃焼」）
const LOB={rock:1,glob:1,puff:1,shell:1};                        // 山なりに飛ぶ弾
const flameP=(x,y,c,n=1,sp=8)=>{for(let i=0;i<n;i++)P(x+rnd(-sp,sp),y+rnd(-sp,sp)*.6,rnd(-18,18),rnd(-80,-30),rnd(.3,.6),rnd(4,8),Math.random()<.3?'#ffe9a0':c,{g:-60,drag:1})};
const smoke=(x,y,c,n=6,sp=20,size=8,life=.8,al=1)=>{for(let i=0;i<n;i++){const a=rnd(TAU),r=rnd(sp);P(x+Math.cos(a)*r,y+Math.sin(a)*r*.7,rnd(-12,12),rnd(-30,-8),rnd(life*.6,life),rnd(size*.6,size),c,{ty:'d',drag:.8,al})}};
const drops=(x,y,c,n=6,sp=120)=>{for(let i=0;i<n;i++){const a=-Math.PI/2+rnd(-1.1,1.1),v=rnd(sp*.4,sp);P(x,y,Math.cos(a)*v,Math.sin(a)*v,rnd(.3,.55),rnd(1.5,3),c,{ty:'w',g:520,drag:.4})}};
const chunks=(x,y,c,n=6,sp=150)=>{for(let i=0;i<n;i++){const a=-Math.PI/2+rnd(-1.3,1.3),v=rnd(sp*.4,sp);P(x,y,Math.cos(a)*v,Math.sin(a)*v,rnd(.35,.7),rnd(3,6),c,{ty:'k',g:560,drag:.4,rot:rnd(TAU),vr:rnd(-12,12)})}};
const flakes=(x,y,n=8,sp=120)=>{for(let i=0;i<n;i++){const a=rnd(TAU),v=rnd(sp*.3,sp);P(x,y,Math.cos(a)*v,Math.sin(a)*v,rnd(.5,.9),rnd(3,5),'#eaf8ff',{ty:'x',drag:2.2,rot:rnd(TAU),vr:rnd(-4,4)})}};
const FXP=(o)=>{if(FX)fx.push(Object.assign({t:0},o))};
// 敵の頭上に「燃焼」「減速」などを小さく出す（同じ言葉は 0.7 秒に 1 回まで）
function tag(e,key,color){
  if(!FX||S.time-(S.tagT[key]??-9)<.7)return;S.tagT[key]=S.time;floatText(e.x,e.y-e.r-12,TT(key),color,FS.f1);
}
function shotTrail(s){ // 飛んでいる弾の尾
  const c=s.d.c,x=s.x,y=s.y-s.h,r=Math.random();
  switch(s.vis){
    case'fireball':case'feather':if(r<.8)flameP(x,y,c,1,3);break;
    case'meteor':flameP(x,y,'#ff8a30',2,6);if(r<.5)smoke(x,y,'#3a2a2a',1,6,7,.5);break;
    case'ghost':if(r<.7)P(x,y,rnd(-10,10),rnd(-10,10),.35,5,c);break;
    case'glob':if(r<.5)flameP(x,y,c,1,3);break;
    case'shell':if(r<.6)smoke(x,y,'#6a6470',1,3,5,.4);break;
    case'hex':if(r<.6)P(x,y,rnd(-12,12),rnd(-12,12),.4,4,c);break;
    case'puff':if(r<.5)smoke(x,y,c,1,4,5,.5,.6);break;
    case'slug':if(r<.3)sparks(x,y,'#ffe9a0',1,60);break;
    case'shard':if(r<.4)P(x,y,0,0,.25,3,'#ffffff');break;
  }
}
function impact(s){ // 弾が当たったときの演出
  const d=s.d,c=d.c,x=s.x,y=s.y,R=d.splash||16,big=d.t>=4;
  switch(s.vis){
    case'fireball':flameP(x,y,c,6,8);ring(x,y,c,R+6,.3,2);break;
    case'feather':flameP(x,y,c,14,R*.6);ring(x,y,c,R,.35,3);FXP({ty:'pool',x,y,r:R,color:'#ff7a20',dur:1});break;
    case'ghost':flameP(x,y,c,5,6);ring(x,y,c,18,.3,2);break;
    case'drop':drops(x,y,c,7,130);FXP({ty:'pool',x,y,r:14,color:c,dur:.5});break;
    case'wave':drops(x,y,'#bfe0ff',18,220);ring(x,y,c,R,.4,4);ring(x,y,'#ffffff',R*.7,.3,2);FXP({ty:'pool',x,y,r:R,color:c,dur:.9});break;
    case'rock':chunks(x,y,c,5+d.t*3,130+d.t*30);smoke(x,y,'#9a8a78',4+d.t*2,R*.7,9,.7,.6);ring(x,y,'#d8c8b0',R,.3,2+d.t*.5);if(d.t>=3)shake(d.t-1);break;
    case'blade':sparks(x,y,'#eafff6',3,120);FXP({ty:'slash',x,y,a:s.a+Math.PI/2,color:c,dur:.16});break;
    case'grain':sparks(x,y,c,2,90);break;
    case'glob':chunks(x,y,'#ffb040',6,140);flameP(x,y,c,8,R*.5);ring(x,y,c,R,.3,3);FXP({ty:'pool',x,y,r:R,color:'#ff5a1a',dur:1.4});break;
    case'shard':chunks(x,y,'#dff6ff',5,130);flakes(x,y,4,90);ring(x,y,c,22,.3,2);break;
    case'bullet':sparks(x,y,'#fff3c0',2,110);break;
    case'snipe':sparks(x,y,'#ffffff',12,280);ring(x,y,c,30,.25,3);ring(x,y,'#ffffff',16,.18,2);break;
    case'hex':smoke(x,y,c,5,10,7,.6,.7);ring(x,y,c,20,.35,2);break;
    case'slug':sparks(x,y,'#ffe9a0',9,220);ring(x,y,'#e8eef8',18,.2,2);break;
    case'puff':smoke(x,y,c,12,R*.8,11,1.3,.55);ring(x,y,c,R,.5,2);break;
    case'shell':P(x,y,0,0,.25,R*1.6,'#fff3c0');flameP(x,y,'#ff8a30',14,R*.6);smoke(x,y,'#4a4450',8,R*.7,11,.9,.7);ring(x,y,c,R,.3,4);shake(3);break;
    case'meteor':P(x,y,0,0,.3,R*2,'#fff3c0');flameP(x,y,'#ff6a30',22,R*.7);chunks(x,y,'#ff9a50',10,260);smoke(x,y,'#3a3038',10,R*.8,13,1.1,.7);
      ring(x,y,c,R,.35,5);ring(x,y,'#ffffff',R*1.3,.5,2);FXP({ty:'pool',x,y,r:R,color:'#ff3a2a',dur:1.6});shake(6);break;
    case'scythe':FXP({ty:'slash',x,y,a:s.a+.8,color:c,dur:.22,big:1});sparks(x,y,c,6,150);smoke(x,y,c,3,8,6,.5,.6);break;
    default:if(d.splash){ring(x,y,c,R,.3,3);burst(x,y,c,d.t*5+4,R*4,{drag:4})}else sparks(x,y,c,2,110);
  }
}
function pulseFx(v,x,y,R,d){ // まわりへの波動
  const c=d.c;
  switch(v){
    case'steam':for(let i=0;i<10;i++){const a=rnd(TAU),r=rnd(R*.3,R);smoke(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,'#e6ecf6',1,4,11,.9,.55)}ring(x,y,c,R,.4,1.5,10);break;
    case'ripple':for(let i=0;i<3;i++)FXP({ty:'ring',x,y,color:i?c:'#ffffff',r0:8,r1:R,dur:.5,lw:3-i*.7,t:-i*.11});drops(x,y,c,6,150);break;
    case'flames':for(let i=0;i<16;i++){const a=i/16*TAU+rnd(.2),r=R*rnd(.55,1);flameP(x+Math.cos(a)*r,y+Math.sin(a)*r,c,1,3)}ring(x,y,c,R,.35,3,10);FXP({ty:'pool',x,y,r:R,color:'#ff5a1a',dur:.7});break;
    case'rays':FXP({ty:'rays',x,y,r:R,color:c,dur:.4});P(x,y,0,0,.3,R*.9,'#fff3c0');break;
    case'spin':FXP({ty:'spin',x,y,r:R,color:c,dur:.5,a:rnd(TAU),grit:d.id==='sandstorm'});break;
    case'snow':flakes(x,y,14,R*2.4);ring(x,y,'#eaf8ff',R,.5,3,10);FXP({ty:'pool',x,y,r:R,color:'#bfeaff',dur:.8});break;
    case'sonic':for(let i=0;i<3;i++)FXP({ty:'ring',x,y,color:i?c:'#ffffff',r0:8,r1:R,dur:.5,lw:3-i*.7,t:-i*.09});if(d.t>=3)for(let i=0;i<4;i++){const a=rnd(TAU);P(x+Math.cos(a)*R*.6,y+Math.sin(a)*R*.5,0,-30,.6,5,c,{drag:1})}if(d.t>=5)shake(2);break;
    case'fog':for(let i=0;i<9;i++){const a=rnd(TAU),r=rnd(R*.9);smoke(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,c,1,6,16,1.3,.35)}ring(x,y,c,R,.6,1.5,10);break;
    case'slam':FXP({ty:'slam',x,y,r:R,color:c,dur:.5,seed:rnd(99)});chunks(x,y+6,c,8,170);smoke(x,y+6,'#a89880',7,R*.6,10,.7,.6);ring(x,y,'#ffffff',R,.3,4,6);shake(d.t);break;
    case'rain':for(let i=0;i<22;i++){const px=x+rnd(-R,R),py=y+rnd(-R,R)*.7;P(px,py-60,rnd(-8,8),rnd(320,420),.18,2,c,{ty:'w',drag:0})}
      smoke(x,y-R*.4,'#8a98b8',4,R*.5,14,.9,.35);ring(x,y,c,R,.5,1.5,10);break;
    case'geyser':drops(x,y,'#e6f8ff',22,360);FXP({ty:'ring',x,y,color:c,r0:6,r1:R,dur:.4,lw:4});smoke(x,y,'#e6ecf6',5,8,10,.7,.5);break;
    default:ring(x,y,c,R,.45,3,10);burst(x,y,c,6,R*1.6,{drag:3});
  }
}
function pierceFx(v,x,y,ex,ey,d,a){ // 一直線に貫く攻撃
  const c=d.c,L=Math.hypot(ex-x,ey-y);
  switch(v){
    case'blade2':FXP({ty:'proj',x,y,ex,ey,a,color:c,dur:.2});break;
    case'tide':FXP({ty:'tide',x,y,ex,ey,a,L,color:c,dur:.42});break;
    case'heat':FXP({ty:'heat',x,y,a,L,color:c,dur:.4});for(let i=1;i<6;i++)flameP(x+(ex-x)*i/6,y+(ey-y)*i/6,c,1,5);break;
    case'rail':FXP({ty:'rail',x,y,ex,ey,a,L,color:c,dur:.35});sparks(x,y,'#ffffff',10,240);shake(2.5);break;
    case'breath':for(let i=0;i<34;i++){const b=a+rnd(-.2,.2),sp=rnd(260,620);P(x,y,Math.cos(b)*sp,Math.sin(b)*sp,rnd(.25,.45),rnd(5,10),Math.random()<.3?'#ffffff':c,{drag:1.2})}
      FXP({ty:'line',x,y,ex,ey,color:c,dur:.3});break;
    default:FXP({ty:'line',x,y,ex,ey,color:c,dur:.25});
  }
}
function trapFx(s,it,d,T,dt){ // 罠ごとの地面の様子
  const R=d.range,x=s.x,y=s.y,id=it.id;
  if(id==='root'||id==='thorn'||id==='thornwall'){ // 地面から根や棘がうごめく
    ctx.strokeStyle=rgba(d.c,.85);ctx.lineWidth=1.7;ctx.lineCap='round';
    for(let i=0;i<6;i++){const a=it.ph+i*1.05,px=x+Math.cos(a)*R*.6,py=y+Math.sin(a)*R*.35,h=5+Math.sin(T*3+i)*2;
      ctx.beginPath();ctx.moveTo(px-3,py+2);ctx.quadraticCurveTo(px,py-h*1.4,px+2.5,py-h);ctx.stroke()}
  }else if(id==='swamp'||id==='bog'||id==='mire'||id==='mud'||id==='bottomless'||id==='sekken'||id==='cement'||id==='shabondama'){ // ぶくぶく泡立つ
    if(Math.random()<dt*4)ring(x+rnd(-R,R)*.7,y+rnd(-R,R)*.35,d.c,rnd(4,7),.5,1.4,1);
    if(id!=='swamp'&&id!=='sekken'&&id!=='shabondama'&&Math.random()<dt*(id==='mire'?11:5))smoke(x+rnd(-R,R)*.6,y,d.c,1,4,6,.9,.5);
  }else if(id==='quicksand'||id==='antlion'||id==='naraku'){ // 渦を巻いて吸いこむ
    ctx.save();ctx.translate(x,y);ctx.scale(1,.62);ctx.rotate(T*1.6);ctx.strokeStyle=rgba(d.c,.7);ctx.lineWidth=2;
    for(const[r,a]of[[R*.85,0],[R*.55,2.2],[R*.28,4.1]]){ctx.beginPath();ctx.arc(0,0,r,a,a+2.4);ctx.stroke()}ctx.restore();
    if(Math.random()<dt*6){const a=rnd(TAU);P(x+Math.cos(a)*R,y+Math.sin(a)*R*.6,-Math.cos(a)*40,-Math.sin(a)*24,.6,2,d.c,{drag:.5})}
  }else if(id==='crater'||id==='purgatory'||id==='hellmouth'||id==='mugen'){ // 火が噴き上がる
    ctx.fillStyle='#ffb04066';ctx.beginPath();ctx.ellipse(x,y,R*.7,R*.42,0,0,TAU);ctx.fill();
    if(Math.random()<dt*(id==='crater'?14:id==='purgatory'?30:46))flameP(x+rnd(-R,R)*.7,y+rnd(-8,8),d.c,1,4);
    if((id==='hellmouth'||id==='mugen')&&Math.random()<dt*4)smoke(x+rnd(-R,R)*.5,y,'#3a1020',1,4,9,.9,.6);
  }else if(id==='stasis'){ // 時計の針がゆっくり回り、輪が脈打つ
    ctx.save();ctx.translate(x,y);ctx.scale(1,.62);ctx.strokeStyle=rgba(d.c,.75);ctx.lineWidth=1.5;
    for(let i=0;i<12;i++){const a=i/12*TAU;ctx.beginPath();ctx.moveTo(Math.cos(a)*R*.82,Math.sin(a)*R*.82);ctx.lineTo(Math.cos(a)*R*.95,Math.sin(a)*R*.95);ctx.stroke()}
    ctx.lineWidth=2.2;for(const[sp,L]of[[.25,.75],[.03,.5]]){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(T*sp)*R*L,Math.sin(T*sp)*R*L);ctx.stroke()}ctx.restore();
    if(Math.random()<dt*2)ring(x,y,d.c,R,.9,1.5,4);
  }else if(id==='frost'||id==='permafrost'){ // 凍った地面のひびときらめき
    ctx.strokeStyle='#ffffffb0';ctx.lineWidth=1;const q=it.ph;
    for(let i=0;i<4;i++){const a=q+i*1.7;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*R*.15,y+Math.sin(a)*R*.1);ctx.lineTo(x+Math.cos(a+.3)*R*.5,y+Math.sin(a+.3)*R*.3);ctx.lineTo(x+Math.cos(a)*R*.85,y+Math.sin(a)*R*.5);ctx.stroke()}
    if(Math.random()<dt*(id==='frost'?3:8))P(x+rnd(-R,R)*.7,y+rnd(-R,R)*.4,0,0,.5,4,'#ffffff',{ty:'x',rot:rnd(TAU),vr:3,drag:0});
  }else if(id==='mirage'||id==='kagerou'){ // 陽炎のように揺らめく波紋
    ctx.strokeStyle=rgba(d.c,.65);ctx.lineWidth=1.5;
    for(let i=-1;i<=1;i++){const oy=i*7+Math.sin(T*3+i)*2;ctx.beginPath();ctx.moveTo(x-R*.7,y+oy);ctx.bezierCurveTo(x-R*.2,y+oy-4,x+R*.2,y+oy+4,x+R*.7,y+oy);ctx.stroke()}
    if(Math.random()<dt*3)ring(x+rnd(-R,R)*.4,y+rnd(-R,R)*.25,d.c,R*.7,.7,1.4,3);
  }
}
function drawShot(s){ // 飛んでいる弾
  const d=s.d,c=d.c,v=s.vis,sc=.8+d.t*.12,T=S.time;
  ctx.save();
  if(LOB[v]){ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(s.x,s.y,7*sc,3*sc,0,0,TAU);ctx.fill()}
  ctx.translate(s.x,s.y-s.h);
  const glowAt=(col,z,a=1,ox=0)=>{ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.drawImage(glow(col),ox-z/2,-z/2,z,z);ctx.globalAlpha=1},solid=()=>{ctx.globalCompositeOperation='source-over'};
  switch(v){
    case'fireball':case'ghost':ctx.rotate(s.a-Math.PI/2+(v==='ghost'?Math.sin(T*16+s.seed)*.4:0));ctx.scale(sc*.75,sc*.75);glowAt(c,40,.8);solid();ctx.translate(0,-4);
      flame(ctx);ctx.fillStyle=c;ctx.fill();ctx.translate(0,5);ctx.scale(.5,.5);flame(ctx);ctx.fillStyle=v==='ghost'?'#ffffff':'#ffe9a0';ctx.fill();
      if(v==='ghost'){ctx.fillStyle=DARK;dot(ctx,-5,4,2.6);dot(ctx,5,4,2.6)}break;
    case'drop':ctx.rotate(s.a-Math.PI/2);ctx.scale(sc*.6,sc*.6);glowAt(c,34,.5);solid();ctx.beginPath();ctx.moveTo(0,-15);ctx.bezierCurveTo(3,-8,9,-2,9,4);ctx.arc(0,4,9,0,Math.PI);ctx.bezierCurveTo(-9,-2,-3,-8,0,-15);
      ctx.fillStyle=c;ctx.fill();ctx.fillStyle='#ffffffc0';dot(ctx,-3,5,2.6);break;
    case'rock':solid();ctx.rotate(s.rot);ctx.scale(sc*.62,sc*.62);poly(ctx,[-11,9,-13,0,-5,-10,6,-11,13,-2,10,9]);ctx.fillStyle=c;ctx.fill();ctx.fillStyle='#00000055';poly(ctx,[6,-11,13,-2,10,9,2,9,4,0]);ctx.fill();break;
    case'blade':ctx.rotate(s.a);glowAt(c,28,.5);ctx.lineCap='round';ctx.strokeStyle='#f2fff8';ctx.lineWidth=3;ctx.beginPath();ctx.arc(-8,0,11*sc,-1.05,1.05);ctx.stroke();
      ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(-13,0,11*sc,-.8,.8);ctx.stroke();break;
    case'glob':glowAt(c,34,.9);solid();ctx.fillStyle='#ffb040';dot(ctx,0,0,5.5*sc);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.stroke();break;
    case'shard':ctx.rotate(s.a);glowAt(c,26,.6);solid();ctx.scale(sc,sc);poly(ctx,[11,0,0,3.8,-8,0,0,-3.8]);ctx.fillStyle='#e6f9ff';ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=1;ctx.stroke();break;
    case'grain':solid();ctx.fillStyle=c;for(let i=0;i<3;i++)dot(ctx,Math.sin(s.seed*7+i*2)*4,Math.cos(s.seed*5+i*3)*4,1.5);break;
    case'wave':ctx.rotate(s.a);glowAt(c,44,.5);solid();ctx.scale(sc,sc);ctx.beginPath();ctx.arc(-4,0,13,-1.25,1.25);ctx.arc(-11,0,13,.95,-.95,true);ctx.closePath();ctx.fillStyle=c;ctx.fill();
      ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(-4,0,13,-1.2,1.2);ctx.stroke();break;
    case'bullet':ctx.rotate(s.a);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.strokeStyle='#fff3c0';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(3,0);ctx.stroke();break;
    case'snipe':ctx.rotate(s.a);glowAt(c,28);ctx.lineCap='round';ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-40,0);ctx.lineTo(4,0);ctx.stroke();break;
    case'hex':glowAt(c,34,.8);solid();ctx.fillStyle='#1c0a2c';dot(ctx,0,0,6.5);ctx.strokeStyle=c;ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(0,0,1.6,4.5,0,0,TAU);ctx.fill();
      ctx.beginPath();ctx.arc(0,0,10,T*8,T*8+2.2);ctx.stroke();break;
    case'slug':solid();ctx.fillStyle='#646c7c';dot(ctx,0,0,5.5*sc);ctx.strokeStyle='#eef2fa';ctx.lineWidth=1.4;ctx.stroke();ctx.fillStyle='#fff';dot(ctx,-1.8,-1.8,1.5);break;
    case'puff':solid();ctx.fillStyle=rgba(c,.85);dot(ctx,-4,1,5);dot(ctx,3,-2,5.5);dot(ctx,4,3,4);ctx.fillStyle='#ffffff90';dot(ctx,1,-3,1.6);break;
    case'shell':ctx.rotate(s.a);glowAt('#ff8a30',26,.8,-10);solid();ctx.fillStyle='#2c2632';ctx.beginPath();ctx.ellipse(0,0,8.5*sc,4.8*sc,0,0,TAU);ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.stroke();break;
    case'meteor':ctx.rotate(s.a);ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(-80,0,0,0);g.addColorStop(0,'rgba(255,120,40,0)');g.addColorStop(1,'rgba(255,160,60,.85)');
      ctx.strokeStyle=g;ctx.lineWidth=16;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-80,0);ctx.lineTo(0,0);ctx.stroke();glowAt('#ff8a30',80,.9);solid();ctx.fillStyle=c;dot(ctx,0,0,11);ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();
      ctx.fillStyle='#00000055';dot(ctx,-3,-3,2.5);dot(ctx,4,3,2);break;
    case'feather':ctx.rotate(s.a);glowAt(c,38,.7);solid();ctx.beginPath();ctx.moveTo(13,0);ctx.quadraticCurveTo(0,-7,-13,0);ctx.quadraticCurveTo(0,7,13,0);ctx.fillStyle='#ffd070';ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.stroke();
      ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.stroke();break;
    case'scythe':ctx.rotate(s.rot*1.6);glowAt(c,34,.5);solid();ctx.beginPath();ctx.arc(0,0,12,-.4,Math.PI+.4);ctx.arc(0,4,10,Math.PI+.2,-.2,true);ctx.closePath();ctx.fillStyle='#ece4ff';ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=1.2;ctx.stroke();break;
    default:glowAt(c,16);glowAt('#ffffff',7);
  }
  ctx.restore();
}
// 画面に一時的に出る演出（fx の種類ごと）。k は 0→1 の進み具合
const FXD={
  moonbeam(f,k){ // 月の恵み：空から差す月の光の柱と、足もとの光の輪
    const a=k<.15?k/.15:(1-k)/.85,w=40+70*Math.min(1,k*3),g=ctx.createLinearGradient(0,0,0,f.y+90);
    g.addColorStop(0,rgba(f.color,0));g.addColorStop(.25,rgba(f.color,.35*a));g.addColorStop(.72,rgba('#ffffff',.5*a));g.addColorStop(1,rgba('#ffffff',0));
    ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(f.x-w*.35,0);ctx.lineTo(f.x+w*.35,0);ctx.lineTo(f.x+w,f.y+90);ctx.lineTo(f.x-w,f.y+90);ctx.closePath();ctx.fill();
    const r=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,170);r.addColorStop(0,rgba('#ffffff',.5*a));r.addColorStop(.3,rgba(f.color,.3*a));r.addColorStop(1,rgba(f.color,0));
    ctx.fillStyle=r;ctx.beginPath();ctx.ellipse(f.x,f.y,170,110,0,0,TAU);ctx.fill();
    ctx.translate(f.x,f.y);ctx.rotate(k*1.2);ctx.strokeStyle=rgba(f.color,.6*a);ctx.lineWidth=1.5;
    for(let i=0;i<12;i++){const t=i/12*TAU,L=60+k*90;ctx.beginPath();ctx.moveTo(Math.cos(t)*30,Math.sin(t)*30*.6);ctx.lineTo(Math.cos(t)*L,Math.sin(t)*L*.6);ctx.stroke()}},
  pool(f,k){ctx.globalCompositeOperation='source-over';ctx.fillStyle=rgba(f.color,(1-k)*.32);ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,TAU);ctx.fill()},
  slash(f,k){const L=(f.big?26:15)*(.5+k);ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.lineCap='round';ctx.strokeStyle=rgba('#ffffff',1-k);ctx.lineWidth=(f.big?5:3)*(1-k);
    ctx.beginPath();ctx.arc(0,L,L*1.4,-Math.PI/2-.7,-Math.PI/2+.7);ctx.stroke();ctx.strokeStyle=rgba(f.color,(1-k)*.7);ctx.lineWidth*=2.4;ctx.stroke()},
  rays(f,k){ctx.translate(f.x,f.y);ctx.rotate(k*.5);ctx.fillStyle=rgba(f.color,(1-k)*.45);for(let i=0;i<12;i++){const a=i/12*TAU;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,f.r*(.5+k*.5),a-.09,a+.09);ctx.fill()}},
  spin(f,k){const r=f.r*(.35+k*.65);ctx.translate(f.x,f.y);ctx.rotate(f.a+k*9);ctx.lineCap='round';
    for(let i=0;i<3;i++){ctx.rotate(TAU/3);ctx.strokeStyle=rgba(i?f.color:'#ffffff',(1-k)*.9);ctx.lineWidth=3.5*(1-k*.5);ctx.beginPath();ctx.arc(0,0,r,0,1.5);ctx.stroke();
      ctx.strokeStyle=rgba(f.color,(1-k)*.5);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.6,.6,1.9);ctx.stroke();
      if(f.grit){ctx.fillStyle=rgba(f.color,1-k);for(let j=0;j<4;j++)dot(ctx,Math.cos(j*.5+2)*r*.85,Math.sin(j*.5+2)*r*.85,1.6)}}},
  slam(f,k){ctx.globalCompositeOperation='source-over';ctx.translate(f.x,f.y);ctx.scale(1,.7);ctx.lineCap='round';
    for(let i=0;i<9;i++){const a=i/9*TAU+f.seed,L=f.r*Math.min(1,k*3)*(.7+.3*Math.sin(f.seed*9+i*5));ctx.beginPath();ctx.moveTo(Math.cos(a)*8,Math.sin(a)*8);
      ctx.lineTo(Math.cos(a+.18)*L*.55,Math.sin(a+.18)*L*.55);ctx.lineTo(Math.cos(a-.05)*L,Math.sin(a-.05)*L);ctx.strokeStyle=rgba('#05040a',(1-k)*.9);ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle=rgba(f.color,1-k);ctx.lineWidth=1.5;ctx.stroke()}},
  proj(f,k){const x=f.x+(f.ex-f.x)*k,y=f.y+(f.ey-f.y)*k;ctx.lineCap='round';ctx.strokeStyle=rgba(f.color,.6);ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(f.x+(f.ex-f.x)*Math.max(0,k-.35),f.y+(f.ey-f.y)*Math.max(0,k-.35));ctx.lineTo(x,y);ctx.stroke();
    ctx.translate(x,y);ctx.rotate(f.a);ctx.globalCompositeOperation='source-over';poly(ctx,[16,0,0,5.5,-12,0,0,-5.5]);ctx.fillStyle='#1a1238';ctx.fill();ctx.strokeStyle=f.color;ctx.lineWidth=1.6;ctx.stroke();ctx.strokeStyle='#ffffffa0';ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(14,0);ctx.stroke()},
  tide(f,k){const q=f.L*k;ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.globalCompositeOperation='source-over';
    ctx.fillStyle=rgba(f.color,(1-k)*.3);ctx.fillRect(0,-22,q,44);
    ctx.fillStyle=rgba(f.color,1-k*.6);ctx.beginPath();ctx.arc(q-26,0,34,-.75,.75);ctx.arc(q-44,0,36,.65,-.65,true);ctx.closePath();ctx.fill();
    ctx.strokeStyle=rgba('#ffffff',1-k*.5);ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.arc(q-26,0,34,-.72,.72);ctx.stroke();
    if(Math.random()<.8)drops(f.x+Math.cos(f.a)*q,f.y+Math.sin(f.a)*q,'#cfe6ff',2,140)},
  heat(f,k){ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.lineCap='round';
    for(let j=-1;j<=1;j++){ctx.strokeStyle=rgba(j?f.color:'#ffe9a0',(1-k)*.85);ctx.lineWidth=(j?3:4)*(1-k*.5);ctx.beginPath();
      for(let x=0;x<=f.L*Math.min(1,k*4);x+=8)ctx.lineTo(x,j*9+Math.sin(x*.09+k*14+j)*5);ctx.stroke()}},
  rail(f,k){ctx.lineCap='round';ctx.strokeStyle=rgba(f.color,(1-k)*.55);ctx.lineWidth=22*(1-k);ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.ex,f.ey);ctx.stroke();
    ctx.strokeStyle=rgba('#ffffff',1-k);ctx.lineWidth=7*(1-k);ctx.stroke();
    ctx.translate(f.x,f.y);ctx.rotate(f.a);ctx.strokeStyle=rgba(f.color,1-k);ctx.lineWidth=2;for(let i=1;i<=4;i++){ctx.beginPath();ctx.ellipse(f.L*i/5,0,4+k*8,12+k*22,0,0,TAU);ctx.stroke()}},
};

function synFx(e,y){ // 属性シナジー成立時の専用ビジュアル＆SE（状態異常の文字タグと混ざらないよう文字は出さず、反応エフェクトだけで表現）
  if(!FX)return;
  const k='syn_'+y.k;if(S.time-(S.tagT[k]??-9)<.26)return;S.tagT[k]=S.time;
  sfx.syn(y.k);
  const x=e.x,yy=e.y,r=e.r;
  if(y.k==='wetT'){ // 濡れ×雷・氷：周囲に走る稲妻＋水色の二重フラッシュ輪
    const a0=rnd(TAU),pts=[];for(let i=0;i<4;i++){const a=a0+i*1.6,rad=r+10+i*5;pts.push([x+Math.cos(a)*rad,yy+Math.sin(a)*rad])}
    FXP({ty:'zap',pts,color:'#8fe6ff',dur:.22,seed:rnd(99)});
    sparks(x,yy,'#8fe6ff',10,260);sparks(x,yy,'#ffffff',6,220);
    ring(x,yy,'#ffffff',r+18,.22,2.6);ring(x,yy,'#8fe6ff',r+30,.32,2.2);
  }else if(y.k==='britT'){ // ひび割れ×土：砕け散る結晶片＋白い閃光輪
    chunks(x,yy,'#e8f6ff',11,210);sparks(x,yy,'#ffffff',6,200);
    P(x,yy,0,0,.18,r*2.4,'#ffffff');ring(x,yy,'#ffffff',r+28,.28,3.2);ring(x,yy,'#d8c8b0',r+18,.24,2);
  }else if(y.k==='dryT'){ // 乾き×水：弾ける水しぶき＋二重の水紋リング
    drops(x,yy,'#6ab8ff',12,210);drops(x,yy,'#f0d08a',5,160);
    ring(x,yy,'#6ab8ff',r+30,.36,2.8);ring(x,yy,'#f0d08a',r+18,.28,2);
  }else if(y.k==='tinderT'){ // 火種×炎：爆ぜる炎の輪＋白熱フラッシュ
    flameP(x,yy,'#ff6a3d',12,18);sparks(x,yy,'#ffe9a0',8,240);
    P(x,yy,0,0,.2,r*2.6,'#ffe9a0');ring(x,yy,'#ff6a3d',r+32,.34,3);ring(x,yy,'#ffe9a0',r+18,.24,2);
  }else{ // よろめき×風：交差する翠のX字斬撃＋風火花
    const a=rnd(TAU);
    FXP({ty:'slash',x,y:yy,a,color:'#a8f0c8',dur:.22,big:1});
    FXP({ty:'slash',x,y:yy,a:a+Math.PI/2,color:'#ffffff',dur:.2,big:1});
    sparks(x,yy,'#a8f0c8',10,240);ring(x,yy,'#a8f0c8',r+28,.28,2.2);
  }
}
