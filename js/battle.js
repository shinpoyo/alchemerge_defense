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

/* ---------------- 戦闘 ---------------- */
function startWave(){
  if(S.active&&!S.over){openPause();return} // 波の最中に波のボタン／Space を押すと一時停止
  if(S.active||S.over||(S.cleared&&!S.endless))return;
  saveRun();
  if(S.wave===0&&FX)stats.plays++; // 最初の波を呼んだときに 1 回と数える（途中保存からの再開は数えない）
  S.wave++;S.active=true;S.wt=0;S.started=true;
  if(S.tut<3)S.tut=3;if(S.wave>=3&&S.tut<9)tutDone();
  S.queue=buildWave(S.wave);
  {const st=STAGES[STAGE];if(S.wave===1&&st.aff&&FX)fx.push({ty:'text',x:W/2,y:130,txt:affText(st),color:st.aff.c||'#6ab8ff',size:13,t:0,dur:5})} // 属性の地：最初の波で弱点を知らせる
  S.wsum=S.queue.reduce((a,q)=>a+ENEMY[q.type].w,0);S.budget=26+9*S.wave;
  const bq=S.queue.find(q=>q.type==='boss');S.bossAt=bq?bq.at:null;S.warnFinal=!!(bq&&bq.final);S.warned=false;
  sfx.wave(S.wave);if(FX)fx.push({ty:'wave',t:0,dur:1.6,n:S.wave});
}
function spawnEnemy(q){
  const d=ENEMY[q.type],hp=d.hp*waveHp(S.wave)*q.m*(q.type==='boss'?1:mobHp(S.wave)),final=!!q.final;
  const pi=q.path??S.spawned++%PATHS.length;let P=PATHS[pi];
  // 門ごとの系統の敵：その門から出る敵のおよそ半分（交互）が門の系統になる。夜の主と、門が 3 つのステージの夜の王は系統なし
  const gs=STAGES[STAGE].gates;let gate=null;
  if(gs&&gs[pi]&&!q.free){if(q.type==='boss'){if(final&&gs.length===2)gate=gs[pi]}else{S.gateN=S.gateN||{};const n=S.gateN[pi]=(S.gateN[pi]||0)+1;if(n%2)gate=gs[pi]}}
  if(gate&&!S.seen['gate_'+gate]){S.seen['gate_'+gate]=1;if(FX)fx.push({ty:'text',x:W/2,y:116+pi*22,txt:gateText(gate),color:ELEM[gate].c,size:13,t:0,dur:4.5})} // 初めて出た系統の敵は弱点を知らせる
  if(d.fly){ // 飛ぶ敵は、その道の入口から灯までの直線を進む
    if(!P.air){const a=P.pts[0],b=P.pts[P.pts.length-1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);P.air={pts:[a,b],seg:[{ax:a[0],ay:a[1],bx:b[0],by:b[1],l,s:0}],len:l}}
    P=P.air;
  }
  const armor=d.armor?armorFam(S.wave):null,sk=armor?'armored'+S.wave:q.type; // 鎧の影は、防ぐ系統が波ごとに変わるので、波ごとに紹介する
  if(!S.seen[sk]&&TX['e_'+q.type]){S.seen[sk]=1;if(FX)fx.push({ty:'text',x:W/2,y:96,txt:armor?TT('e_armored',TT('f_'+armor)):TT('e_'+q.type),color:armor?ELEM[armor].c:d.rim,size:13,t:0,dur:armor?4:3.2})} // 初めて出た種類は一言で紹介
  S.enemies.push({type:q.type,def:d,P,hp,max:hp,d:0,x:P.pts[0][0],y:P.pts[0][1],r:d.r*(q.m>1?1.25:1),
    slow:0,slowT:0,dot:0,dotT:0,dotC:'#fff',silT:0,flash:0,ph:rnd(TAU),reward:q.call?S.budget*d.w/S.wsum*KING_CALL_MANA:q.free?0:S.budget*d.w/S.wsum,dead:false,final,armor,gate,healT:rnd(.5,HEAL_EVERY)});
  if(q.type==='boss'){ // 主・王の登場：入口から闇が噴き出し、体がふくらんで現れる
    const e=S.enemies[S.enemies.length-1];e.phase=1;e.spdM=BOSS_PH[0].spd*(final?KING_SPD:1);e.atkEvery=siegeEvery(e)*BOSS_PH[0].atk;e.born=BOSS_BORN;e.lag=1;S.bossA=0;
    if(FX){const x=clamp(e.x,24,W-24),y=e.y;shake(final?10:7);S.flash=.28;S.flashC='#ff2a4a';
      if(final){
        const k=sprKey(e),c=(SPR_DEF[k]&&SPR_DEF[k].rim)||'#ff3b6b';
        if(S.kingIntro&&S.kingIntro.t<.1){S.kingIntro.kings.push({key:k,c,e})}
        else{S.kingIntro={kings:[{key:k,c,e}],t:0,dur:4.65,flashed:false,parts:[]};S.warn=0;sfx.kingIntro();buzz([50,60,50,60,80,100,140])}
      }else{sfx.boom();buzz(30)}
      for(let i=0;i<3;i++)FXP({ty:'ring',x,y,color:i?'#ff3b6b':'#ffffff',r0:10,r1:90+i*40,dur:.6+i*.15,lw:5-i,t:-i*.12});
      smoke(x,y,'#1a0a14',14,30,16,1.2,.7);burst(x,y,'#ff3b6b',30,240);sparks(x,y,'#ffd0d8',20,320)}
  }
}
/* 主・王の段階：体力が半分を切ると怒り、足が速まり、入口から手下を呼ぶ。夜の王は 25% でさらに激昂し、灯への攻撃も早くなる。
   怒ると守りが甘くなり、受ける傷が同じ割合で増える（vul）。速くなったぶん早く倒れるので、倒れるまでに進む道のりはこれまでと変わらない */
const KING_CALL_FIRST=2,KING_CALL_EVERY=2.5,KING_CALL_MANA=.2; // 夜の王がいる間に雑魚が湧く：最初の 1 体までの秒数／その後の間隔／落とす魔力（ふつうの雑魚の 2 割）
const BOSS_BORN=.7,WARN_T=2.6,WARN_LEAD=2.4; // 現れるときにふくらむ秒数／警告を出している秒数／現れる何秒前から警告するか
const BOSS_PH=[{spd:1,atk:1,vul:1},{at:.5,spd:1.15,atk:1,vul:1.15,call:4},{at:.25,spd:1.3,atk:.85,vul:1.3,call:6}]; // 3 段階目（体力 25%）は夜の王だけ
function bossPhase(e){
  const k=e.hp/e.max,np=e.final&&k<=BOSS_PH[2].at?3:k<=BOSS_PH[1].at?2:1;
  if(np<=e.phase)return;
  const ph=BOSS_PH[np-1];e.phase=np;e.spdM=ph.spd; // 怒ったら、夜の王もゆっくり歩きをやめて元の速さで加速するe.vul=ph.vul;e.atkEvery=siegeEvery(e)*ph.atk;e.rageT=1;
  for(let i=0;i<ph.call;i++)S.queue.push({type:'mite',at:S.wt+.5+i*.28,m:1,free:true}); // 手下は入口から出る（魔力は落とさない）。主は波の最後に出るので、列はもう空いている
  if(!FX)return;
  const nm2=TT(e.final?'bossKing':'bossLord');
  shake(9);S.flash=.3;S.flashC='#ff5a2a';sfx.rage();buzz([20,30,50]);
  ring(e.x,e.y,'#ff5a2a',120,.6,5);ring(e.x,e.y,'#ffe45c',70,.4,3);burst(e.x,e.y,'#ff5a2a',36,260);flameP(e.x,e.y,'#ff5a2a',16,e.r);
  floatText(e.x,e.y-e.r-26,TT(np>2?'bossFury':'bossRage')+'！','#ffb070',FS.f3);
  fx.push({ty:'text',x:W/2,y:96,txt:TT('rageNote',nm2),color:'#ffb070',size:13,t:0,dur:3.2});
}
/* 属性シナジー：ある系統の直撃で影に状態をかけ、その状態の影は別の系統から SYN_MUL 倍の傷を受ける。ボスは持続が半分。状態は戦闘中のみ（セーブには入れない）
   from：おもにかける系統（目安）　by：かける元素　to：よく効く系統　k：影の残り秒数　st：状態名　c：色。組は 2 系統の元素で自分にかからないように選ぶ（MULTI を見る） */
const SYN_MUL=1.5,SYN_T=2.5;
const SYN=[{to:['volt','ice'],k:'wetT',st:'stWet',c:'#6ab8ff',by:['sea','raincloud','geyser','tsunami','storm','typhoon','poseidon']}, // 濡れ：雷と氷の両方がよく効く
  {to:['earth'],k:'britT',st:'stBrit',c:'#e8f6ff',by:['blizzard','frost','iceage','absolutezero','sabi','fuka','shinshoku','iseki','sekka']}, // ひび割れ：土で砕ける
  {to:['water'],k:'dryT',st:'stDry',c:'#f0d08a',by:['gust','tornado','sandstorm','fujin','kanbatsu','kouya']}, // 乾き：乾いた土や砂は水で崩れる
  {to:['flame'],k:'tinderT',st:'stTinder',c:'#ff9a4a',by:['leaves','kinosei','spore','swamp','bog']}, // 火種：木の葉・胞子・沼のガスなど燃えるものをまとわせる
  {to:['wind'],k:'stagT',st:'stStag',c:'#a8f0c8',by:['mud','frost','quicksand','nendo']}]; // よろめき：足を取られた影は風に倒される
// by：その状態をかける元素（系統にこだわらず、名前や効果に合うものだけ。よく効く系統を持つ元素は入れない）。毒・光・闇によく効く状態はない（ユーザー決定 2026-11-23）
const AMP_MUL=1.2; // 系統の結界：輪の中の影が、その系統から受ける傷の倍率
function ampAt(e,fs){ // 影がいる場所の系統の結界の倍率（同じ系統の結界は重ならない）
  if(!S.amps||!S.amps.length)return 1;
  for(const a of S.amps)if(fs.includes(a.f)&&(e.x-a.x)**2+(e.y-a.y)**2<=a.r2)return AMP_MUL;
  return 1;
}
function hurt(e,dmg,fam){ // fam：攻撃した元素の系統（配列。どれか 1 つが当てはまれば鎧・結界・シナジーが働く）
  if(e.dead)return;
  const fs=famL(fam);
  const weak=!!e.armor&&!(e.silT>0)&&fs.includes(e.armor);
  if(weak){dmg*=moonArmor(e.def.armor);e.block=.3;tag(e,'stResist','#c4d2e6')} // 鎧の影：防ぐ系統の攻撃は 4 分の 1（沈黙中は軽減が働かない）
  const syn=SYN.some(y=>e[y.k]>0&&y.to.some(f=>fs.includes(f)))?SYN_MUL:1; // 属性シナジー：濡れ×雷・氷／ひび割れ×土／乾き×水／火種×炎／よろめき×風（いくつ重なっても 1 回だけ。呪い・vul とは別枠）
  const amp=fs.length?ampAt(e,fs):1; // 系統の結界（シナジー・呪いとは掛け算）
  const sa=STAGES[STAGE].aff,af=(sa&&fs.length?(sa.weak&&fs.includes(sa.weak)?AFF_WEAK:1)*(fs.includes(sa.resist)?AFF_RES:1):1) // 属性の地
    *(e.gate&&fs.length?(fs.includes(GATE_FAM[e.gate])?AFF_WEAK:1)*(fs.includes(e.gate)?AFF_RES:1):1); // 門ごとの系統の敵
  dmg*=(e.vul||1)*syn*amp*af*moonM(fs); // 月の恵み（加護・赤い月）
  e.hp-=dmg;e.flash=.08;
  if(FX&&!dmgOff){e.dn=(e.dn||0)+dmg;if(weak)e.dnW=1;else if(syn>1||amp>1||af>1)e.dnS=1;else if(af<1)e.dnW=1}
  if(e.hp<=0)kill(e);else if(e.phase)bossPhase(e);
}
const ECHO_POW=.7; // 山彦のこだまの威力（1 回目に対する割合）
const STOP_RES=6,STOP_BOSS=.6;
const LURE_RES=4; // 誘惑：解けたあとの耐性秒数
let HIT=null; // いま当てている塔 {it,x,y}（魂集め・誘惑で使う。毒・燃焼・罠・結界のときは null）
const soulM=it=>{const d=ITEMS[it.id];return d.soul?1+Math.min(d.soulMax,(it.souls||0)*d.soul):1}; // 魂集め：倒した数ぶん威力が上がる（上限あり）
function pathNear(P,x,y){ // 道のうち (x,y) にいちばん近い所までの道のり
  let best=0,bd=Infinity;
  for(const g of P.seg){const vx=g.bx-g.ax,vy=g.by-g.ay,k=clamp(((x-g.ax)*vx+(y-g.ay)*vy)/(g.l*g.l||1),0,1),q=(g.ax+vx*k-x)**2+(g.ay+vy*k-y)**2;if(q<bd){bd=q;best=g.s+g.l*k}}
  return best;
}
const REW_CD=3,CONF_RES=4,CONF_SPD=.6; // 巻き戻し：同じ敵には REW_CD 秒に 1 回／惑わし：解けたあとの耐性秒数・逆に歩く速さ（ふだんの速さに対する割合） // 停止が解けたあとの耐性秒数／ボスに停止の代わりにかかる減速
function applyHit(e,d,m,color,sl){
  if(e.dead)return;
  d=moonLong(d); // 月の恵み：長い夜
  {const id=d.id; // 属性シナジーの状態：決まった元素の直接攻撃の命中で付与（毒・燃焼の tick では付けない）。延長のみ
    for(const y of SYN)if(y.by.includes(id)){const bs=e.type==='boss'||/[主王]$/.test(e.name||''),T=moonSyn(bs?SYN_T/2:SYN_T);if(!(e[y.k]>0))tag(e,y.st,y.c);if(T>(e[y.k]||0))e[y.k]=T}}
  if(d.sil){if(!(e.silT>0))tag(e,'stSil','#c4b0ff');e.silT=Math.max(e.silT||0,d.sil)}
  if(d.rust&&e.armor){e.armor=null;tag(e,'stRust',d.c)} // 錆：鎧の影の鎧がなくなる（この戦いの間ずっと）
  const isBoss=e.type==='boss'||/[主王]$/.test(e.name||'');
  if(d.erase&&!isBoss&&e.hp<=e.max*d.erase){ // 無：体力の少ない敵を消し去る
    tag(e,'stErase',color);if(FX){ring(e.x,e.y,color,26,.4,2.4);burst(e.x,e.y,'#ffffff',10,120)}
    e.hp=0;kill(e);return;
  }
  if(d.warp&&!isBoss&&!(e.mirT>0)&&(!sl||e._mirSl!==sl)){
    if(sl)e._mirSl=sl;
    if(Math.random()<d.warpP){
      if(FX){ring(e.x,e.y,color,24,.35,2);burst(e.x,e.y,color,8,90)}
      e.d=Math.max(0,e.d-d.warp);const p=pathPoint(e.P,e.d);e.x=p[0];e.y=p[1];
      e.mirT=d.warpCd;e.kb=.35;e._mirSl=null;tag(e,'stKnock',color);
      if(FX)ring(e.x,e.y,color,24,.35,2);
    }
  }
  if(d.stop){
    if(isBoss){
      if(d.kind!=='trap'&&(!d.stopP||Math.random()<d.stopP)){
        if(STOP_BOSS>=e.slow||e.slowT<=0){if(e.slowT<=0)tag(e,'stSlow','#8fe6ff');e.slow=STOP_BOSS;e.slowT=Math.max(e.slowT||0,d.stop)}
      }
    }else if(!(e.stopT>0)&&!(e.stopRes>0)&&!(e.hazT>0)){
      if(!d.stopP||Math.random()<d.stopP){
        e.stopT=d.stop;e.stopRes=d.stop+STOP_RES;e.hazT=Math.max(e.hazT||0,d.stop+STOP_RES);
        tag(e,'stStop',color);
        if(FX){ring(e.x,e.y,color,24,.35,2.2);flakes(e.x,e.y,5,80)}
      }
    }
  }
  if(d.stun&&!isBoss&&!(e.hazT>0)&&!(e.stopT>0)&&!(e.stopRes>0)){
    e.hazT=d.stunCd;
    if(Math.random()<d.stunP){
      e.slow=1;e.slowT=d.stun;tag(e,'stStop',color);
      if(FX)ring(e.x,e.y,color,22,.35,2);
    }
  }
  if(d.rew&&!isBoss&&!(e.rwT>0)){ // 巻き戻し：rew 秒ぶん歩いた道のりだけ戻す
    e.d=Math.max(0,e.d-e.def.spd*(e.spdM||1)*d.rew);e.rwT=REW_CD;e.kb=.3;tag(e,'stRew',color);
    if(FX){const p=pathPoint(e.P,e.d);ring(p[0],p[1],color,20,.35,2)}
  }
  if(d.conf&&!isBoss&&!(e.cfT>0)&&!(e.cfRes>0)&&(!d.confP||Math.random()<d.confP)){ // 惑わし：少しの間、来た道を逆に歩く
    e.cfT=d.conf;e.cfRes=d.conf+CONF_RES;tag(e,'stConf',color);
    if(FX)ring(e.x,e.y,color,22,.35,2);
  }
  if(d.lure&&!isBoss&&HIT&&!(e.lrT>0)&&!(e.lrRes>0)&&(!d.lureP||Math.random()<d.lureP)){ // 誘惑：その塔のいちばん近くの道まで引き返して立ち止まる
    e.lrD=pathNear(e.P,HIT.x,HIT.y);e.lrT=d.lure;e.lrRes=d.lure+LURE_RES;e.cfT=0;tag(e,'stLure',color);
    if(FX)ring(e.x,e.y,color,22,.35,2);
  }
  if(d.knock&&!isBoss&&!(e.knT>0)){e.d=Math.max(0,e.d-d.knock);e.knT=.8;e.kb=.3;tag(e,'stKnock','#ffffff')}
  if(d.drain&&d.drain>=(e.drainT>0?e.drain:0)-1e-6){if(!(e.drainT>0))tag(e,'stCurse','#d98aff');e.drain=d.drain;e.drainT=DRAIN_T} // 呪い：命を削る
  const slw=(d.stun||d.stop)&&d.kind==='trap'&&isBoss?d.slow*.5:d.slow;
  if(slw&&(slw>=e.slow||e.slowT<=0)){if(e.slowT<=0)tag(e,'stSlow','#8fe6ff');e.slow=slw;e.slowT=e.slow===slw?Math.max(e.slowT||0,d.slowT):d.slowT}
  if(d.dot&&(d.dot*m>=e.dot||e.dotT<=0)){const pz=POISON.has(d.id);if(e.dotT<=0)tag(e,pz?'stPoison':'stBurn',pz?'#a8f06a':'#ffa060');e.dot=d.dot*m;e.dotT=d.dotT;e.dotC=color;e.dotK=pz?1:0;e.dotF=d.fam}
  if(d.plague&&e.dotT>0&&e.dotK){if(!e.plague)tag(e,'stPlague','#c8f070');e.plague=d.plague} // 疫病：この影が毒のまま倒れると、まわりへうつる
}
function kill(e){
  if(e.def.split&&!e.dead){ // 分かれる影：倒れた場所から小さい影が出る（魔力は親のぶんだけ）
    for(let i=0;i<e.def.split;i++){const hp=e.max*.3;
      S.enemies.push({type:'mite',def:ENEMY.mite,P:e.P,hp,max:hp,d:Math.max(0,e.d-i*9),x:e.x,y:e.y,r:ENEMY.mite.r*1.15,
        slow:0,slowT:0,dot:0,dotT:0,dotC:'#fff',silT:0,flash:0,ph:rnd(TAU),reward:0,dead:false,final:false,gate:e.gate})}
    if(FX){ring(e.x,e.y,e.def.rim,34,.35,3);burst(e.x,e.y,e.def.rim,12,150)}
  }
  if(e.plague&&e.dotT>0&&!e.dead){const r=e.plague,pd={id:'ekibyo',dot:e.dot,dotT:4,fam:e.dotF,plague:r}; // 疫病：毒で倒れた影から、まわりの影へ同じ毒がうつる
    for(const o of S.enemies)if(!o.dead&&o!==e&&(o.x-e.x)**2+(o.y-e.y)**2<r*r)applyHit(o,pd,1,'#a0d040');
    if(FX){ring(e.x,e.y,'#a0d040',r,.5,2.5);burst(e.x,e.y,'#bff070',14,120)}}
  const gm=e.reward>0?goldAt(e.x,e.y):1;if(gm>1&&FX)floatText(e.x,e.y-e.r-14,'◆×'+gm,'#ffd24a',FS.f1);
  if(HIT&&!e.dead){const sd=ITEMS[HIT.it.id];if(sd&&sd.soul&&(HIT.it.souls||0)*sd.soul<sd.soulMax){HIT.it.souls=(HIT.it.souls||0)+1; // 魂集め：倒した塔へ魂が飛んでいく
    if(FX)P(e.x,e.y,(HIT.x-e.x)/.5,(HIT.y-e.y)/.5,.5,3.2,sd.c,{drag:0})}}
  e.dead=true;S.manaFrac=(S.manaFrac||0)+e.reward*gm*moonGold();const gain=Math.floor(S.manaFrac+1e-9);S.manaFrac-=gain;S.mana+=gain;
  if(e.final&&!S.enemies.some(o=>o.final&&!o.dead)){S.queue=[]; // 夜の王（2 体なら 2 体とも）を倒すと、残りの敵は消えて、その波は終わり（最後の波ならクリア）
    for(const o of S.enemies)if(!o.dead){o.dead=true;if(FX){smoke(o.x,o.y,'#1a1230',6,o.r,9,.7,.7);burst(o.x,o.y,o.def.rim,8,90)}}}
  if(!FX)return;
  const boss=e.type==='boss';
  if(e.dn>=1)dnumPop(e); // とどめの数字は、ためずにすぐ出す
  stats.kills++;if(boss){const pair=e.final&&S.enemies.some(q=>q!==e&&q.final&&!q.dead); // 夜の王が2体のときは、2体目を倒したときに1回と数える
    if(!pair){stats.bosses++;if(e.final)stats.kings++}
    if(!DAILY){grantAch('firstBoss');if(e.final)grantAch('king')}} // 主・王の実績は、ふつうのステージで倒したときだけ（今日の挑戦は進行に数えない）。合計の数（stats）には挑戦のぶんも入る
  checkAch();
  burst(e.x,e.y,e.def.rim,boss?50:10,boss?260:110);burst(e.x,e.y,'#1a1230',6,60,{ty:'d'});
  if(boss){ring(e.x,e.y,'#ff3b6b',140,.7,5);ring(e.x,e.y,'#ffffff',90,.4,2);sparks(e.x,e.y,'#ffd0d8',40,380);shake(12);sfx.boom();S.flash=.3;S.flashC='#ff3b6b';
    P(e.x,e.y,0,0,.22,e.r*5,'#ffffff');hitStop(e.final?HS_KING:HS_BOSS);buzz(e.final?[30,30,80]:40)}
  else if(e.def.big){ // 大型：白い閃きと輪、軽い揺れ、重い音
    P(e.x,e.y,0,0,.14,e.r*3.4,'#ffffff');ring(e.x,e.y,'#ffffff',e.r*2.8,.22,3,e.r*.6);sparks(e.x,e.y,'#ffffff',8,240);shake(3.5);sfx.thud();hitStop(HS_BIG);buzz(12)}
  else sfx.kill();
  const n=boss?12:Math.min(3,1+(e.reward/6|0));
  for(let i=0;i<n;i++)fx.push({ty:'mana',x:e.x,y:e.y,cx:e.x+rnd(-60,60),cy:e.y+rnd(-70,-20),t:-i*.05,dur:rnd(.5,.75)});
}
// 灯への攻撃：主は 1.1 秒ごとに 1。主は 8 回攻撃すると去る（これまでの「通すと 8 減る」と同じ上限）。
// 夜の王はためが長く、3.5 秒ごとに 5 の重い一撃（2026-11-25。それまでは 1.1 秒ごとに 2）。王は倒すまで去らない
const SIEGE_FIRST=1.4,SIEGE_EVERY=1.1,SIEGE_MAX=8,KING_SIEGE_FIRST=2.6,KING_SIEGE_EVERY=3.5,KING_SIEGE_DMG=5;
const siegeEvery=e=>e.final?KING_SIEGE_EVERY:SIEGE_EVERY;
function siegeHit(e){
  const dmg=e.final?KING_SIEGE_DMG:1;S.lives-=dmg;S.coreHit=1;e.lunge=1;e.hits++;
  if(e.final){shake(16);S.flash=.45;S.flashC='#ff2a4a';sfx.leak();sfx.boom();buzz([60,40,120]);hitStop(HS_BOSS);
    burst(CORE.x,CORE.y,'#ff2a4a',40,280);ring(CORE.x,CORE.y,'#ff2a4a',130,.6,6);ring(CORE.x,CORE.y,'#ffe45c',70,.4,3);floatText(CORE.x-6,CORE.y-40,'−'+dmg,'#ff8a9a',FS.f5)}
  else{shake(6);S.flash=.22;S.flashC='#ff2a4a';sfx.leak();buzz(40);
  burst(CORE.x,CORE.y,'#ff2a4a',16,170);ring(CORE.x,CORE.y,'#ff2a4a',60,.4,4);floatText(CORE.x-6,CORE.y-34,'−'+dmg,'#ff8a9a',FS.f3)}
  if(S.lives<=0){S.lives=0;if(!S.over)gameOver();return} // 陥落したあとに重ねて攻撃されても、灯は 0 より下げない
  if(!e.final&&e.hits>=SIEGE_MAX){e.dead=true;if(FX){burst(e.x,e.y,e.def.rim,20,160);smoke(e.x,e.y,'#1a1230',8,20,10,.8,.7)}}
}
function leak(e){
  S.leaks[e.type]=(S.leaks[e.type]||0)+1; // 種類ごとに、抜けた数を数える（調整用）
  e.dead=true;S.lives-=e.def.life;S.coreHit=1;
  shake(8);S.flash=.3;S.flashC='#ff2a4a';sfx.leak();buzz(60);
  burst(CORE.x,CORE.y,'#ff2a4a',24,180);ring(CORE.x,CORE.y,'#ff2a4a',80,.5,4);
  if(S.lives<=0){S.lives=0;if(!S.over)gameOver()} // 陥落と同じ瞬間にほかの影が抜けても、灯は 0 より下げない
}
function inRange(x,y,R,max){ // 射程内の敵を、ゴールに近い順に
  const a=[];
  for(const e of S.enemies){if(e.dead)continue;const dx=e.x-x,dy=e.y-y;if(dx*dx+dy*dy<=(R+e.r)*(R+e.r))a.push(e)}
  a.sort((p,q)=>(p.P.len-p.d)-(q.P.len-q.d));return max?a.slice(0,max):a;
}
// 支援：魔法陣の上の支援の塔が、広さの中にいる味方の塔を強める。重ならない（いちばん強い 1 つだけ）。支援の塔どうしと罠には効かない
function wardTick(dt=1/30){ // 浄めの霧：広さの中にいる影は、ずっと沈黙（回復と鎧が働かない）。系統の結界の輪もここで集める
  S.amps=[];
  for(const sl of slots){const it=sl.item;if(!it||!sl.field||it.hide>0||it.held)continue;const d=ITEMS[it.id];
    if(d.amp){S.amps.push({f:d.amp,x:sl.x,y:sl.y,r2:d.range*d.range});continue}
    if(d.ward!=='sil'&&!(d.kind==='ward'&&d.slow))continue;
    for(const e of S.enemies){if(e.dead||(e.x-sl.x)**2+(e.y-sl.y)**2>d.range*d.range)continue;
      if(d.slow)applyHit(e,d,1,d.c); // 廃墟：広さの中の影はずっと遅くなる
      if(d.ward!=='sil')continue;if(!(e.silT>0))tag(e,'stSil',d.c);e.silT=Math.max(e.silT||0,.3);if(d.dps)hurt(e,d.dps*enhM(it)*dt,d.fam)}}
}
function goldAt(x,y){ // 竜の宝玉：その場所で倒した影の魔力の倍率
  let g=1;for(const sl of slots){const it=sl.item;if(!it||!sl.field||it.hide>0||it.held)continue;const d=ITEMS[it.id];
    if(d.gold&&(x-sl.x)**2+(y-sl.y)**2<=d.range*d.range)g=Math.max(g,d.gold)}
  return g;
}
function calcBuffs(){
  const sup=[];for(const sl of slots){const it=sl.item;if(!it)continue;it.buff=null;if(sl.field&&isBuffer(it.id)&&!(it.hide>0)&&!it.held)sup.push(sl)}
  if(!sup.length)return;
  for(const sl of slots){const it=sl.item;if(!it||!sl.field||isSupport(it.id))continue;
    for(const sp of sup){if(sp===sl)continue;const b=ITEMS[sp.item.id];if((sl.x-sp.x)**2+(sl.y-sp.y)**2<=b.range*b.range&&(!it.buff||b.buffD>it.buff.buffD))it.buff=b}}
}
// 万華鏡：1 発ごとに 5 属性（炎・氷・雷・光・闇）から 1 つを選ぶ
const KALEIDO=[
  {fam:'flame',c:'#ff6a3d',dmg:260,dot:75,dotT:3,splash:38},
  {fam:'ice',  c:'#8fe6ff',dmg:240,slow:.5,slowT:1.8,splash:38},
  {fam:'volt', c:'#ffe45c',dmg:480,splash:38},
  {fam:'light',c:'#fff2a0',dmg:310,splash:52},
  {fam:'dark', c:'#c070ff',dmg:250,drain:.0225,splash:38},
];
// 鏡：射程内にいる攻撃系タワー（support / trap / mirror 以外）から最もティアが高いものを選ぶ
function findMirrorSrc(sl,R){
  let best=null;
  for(const s of slots){
    const it=s.item;if(!it||s===sl||!s.field||it.hide>0||it.held)continue;
    const d=ITEMS[it.id];if(noAtk(d)||d.kind==='trap'||d.kind==='mirror')continue;
    if((s.x-sl.x)**2+(s.y-sl.y)**2<=R*R&&(!best||d.t>best.t||(d.t===best.t&&dpsOf(d)>dpsOf(best))))best=d;
  }
  return best;
}
// 跳弾：命中した敵の位置から 150px 以内の最も近い「まだこの弾が当たっていない」敵へ新しい弾を飛ばす（威力は跳ねるごとに 0.75 倍）
const RICO_R=150,RICO_M=.75,CHG_EVERY=1.5,CHG_GAP=.12;
function spawnRico(x,y,d,m,rem,hit){
  if(!(rem>0))return;
  let best=null,bd=RICO_R*RICO_R;
  for(const e of S.enemies){if(e.dead||hit.has(e))continue;const q=(e.x-x)**2+(e.y-y)**2;if(q<=bd){bd=q;best=e}}
  if(!best)return;
  const vis=VIS[d.id]||'orb',sh={x,y,tx:best.x,ty:best.y,tg:best,d,m:m*RICO_M,vis,h:0,a:Math.atan2(best.y-y,best.x-x),rot:rnd(TAU),seed:rnd(99),
    spd:d.fast?900:vis==='bullet'?720:vis==='blade'?560:LOB[vis]?310:d.splash?350:560,rico:rem-1,hit,src:HIT};
  if(vis==='snipe'&&FX)fx.push({ty:'line',x,y,ex:best.x,ey:best.y,color:d.c,t:0,dur:.14});
  sh.d0=Math.max(30,Math.hypot(best.x-x,best.y-y));S.shots.push(sh);
}
function idleChg(it,d,dt){ // 波の最中、射程内に敵がいない間、1.5 秒ごとにチャージが 1 溜まる（最大 d.chg）
  it.chgB=0;if(!d.chg||(it.chg||0)>=d.chg){it.chgT=0;return}
  if(!S.active)return; // 波が止まっている間は溜めない（溜まりかけの時間もそのまま止める）
  it.chgT=(it.chgT||0)+dt;while(it.chgT>=CHG_EVERY&&it.chg<d.chg){it.chgT-=CHG_EVERY;it.chg=(it.chg||0)+1;if(FX)ring(it.rx,it.ry,d.c,28,.3,1.8,8)}
}
function useChg(it,d,rate){ // 攻撃を始める際、溜まったチャージを全て消費し、その数だけ追加の高速連射（間隔 0.12 秒）を行う
  if((it.chg||0)>0){it.chgB=(it.chgB||0)+it.chg;it.chg=0;it.chgT=0}
  if((it.chgB||0)>0){it.chgB--;it.cd+=CHG_GAP}else it.cd+=1/rate;
  if(it.cd<0)it.cd=0;
}
function towerFire(sl,it,dt){
  HIT={it,x:sl.x,y:sl.y};
  const d=ITEMS[it.id],b=it.buff,m=(b?1+b.buffD*moonBuff():1)*enhM(it)*soulM(it)*moonTower(),rm=b?1+b.buffR*moonBuff():1,R=d.range,x=sl.x,y=sl.y; // m：ダメージの倍率、rm：攻撃速度の倍率（支援を受けているとき）
  if(noAtk(d)){it.beamT.length=0;return}
  if(d.kind==='beam'&&!d.rate){
    const ts=inRange(x,y,R,d.beams);it.beamT=ts;it.beamC=null;
    if(!ts.length){idleChg(it,d,dt);it.cd=0;return}
    for(const e of ts){applyHit(e,d,m,d.c);hurt(e,d.dmg*m*rm*dt,d.fam);if(FX&&Math.random()<dt*14)sparks(e.x,e.y,d.c,1,90)}
    if((it.chg||0)>0){it.chgB=(it.chgB||0)+it.chg;it.chg=0;it.chgT=0;it.cd=0}
    if((it.chgB||0)>0){it.cd-=dt;if(it.cd<=0){it.chgB--;it.cd+=CHG_GAP;it.kick=1;
      for(const e of ts){applyHit(e,d,m,d.c);hurt(e,d.dmg*.5*m,d.fam);if(FX){fx.push({ty:'line',x,y,ex:e.x,ey:e.y,color:d.c,t:0,dur:.16});sparks(e.x,e.y,d.c,4,130)}}sfx.shoot(d)}}
    if(ts.length){it.kick=Math.max(it.kick,.35);if(Math.random()<dt*6)sfx.shoot(d)}
    return;
  }
  if(it.beamDur>0){it.beamDur-=dt;it.beamT=it.beamT.filter(e=>!e.dead);if(it.beamDur<=0)it.beamT.length=0}else it.beamT.length=0;
  let ts=inRange(x,y,R);
  if(!ts.length){idleChg(it,d,dt);it.cd=Math.max(0,it.cd-dt);return}
  it.cd-=dt;if(it.cd>0)return;
  let ad=d;
  if(d.kind==='mirror'){
    ad=findMirrorSrc(sl,R);
    if(!ad){it.cd=0;return}
  }
  useChg(it,d,d.rate*rm);it.kick=1;
  if(ad.kaleido)ad=Object.assign({},ad,pick(KALEIDO));
  if(ad.kind==='beam'){
    const bts=ts.slice(0,ad.beams||1);it.beamT=bts;it.beamC=ad.c;it.beamDur=.24;
    for(const e of bts){
      if(ad.splash){for(const o of S.enemies){if(!o.dead&&(o.x-e.x)**2+(o.y-e.y)**2<(ad.splash+o.r)**2){applyHit(o,ad,m,ad.c);hurt(o,ad.dmg*m,ad.fam)}}}
      else{applyHit(e,ad,m,ad.c);hurt(e,ad.dmg*m,ad.fam)}
      if(FX){fx.push({ty:'line',x,y,ex:e.x,ey:e.y,color:ad.c,t:0,dur:.22});sparks(e.x,e.y,ad.c,5,130);
        if(ad.splash){ring(e.x,e.y,ad.c,ad.splash,.3,2.5);burst(e.x,e.y,ad.c,8,110)}}
    }
    sfx.shoot(ad);return;
  }
  if(ad.kind==='pulse'){
    for(const e of ts){applyHit(e,ad,m,ad.c);hurt(e,ad.dmg*m,ad.fam)}
    if(ad.echo)(S.echoes=S.echoes||[]).push({t:ad.echo,x,y,R,ad,m,src:HIT}); // 山彦：少し遅れて、もう一度当たる
    if(FX)pulseFx(VIS[ad.id],x,y,R,ad);sfx.shoot(ad);return;
  }
  // 毒・氷・呪いは、まだ効いていない敵を先に狙う
  let tg=ts[0];
  if(ad.kind==='bolt'&&(ad.dot||ad.slow||ad.drain)){
    tg=ts.find(e=>ad.drain?!(e.drainT>0):ad.slow?e.slowT<=0:e.dotT<=0)||ts[0];
  }
  if(ad.kind==='chain'){
    const hit=[tg];let cur=tg,dm=ad.dmg*m;const pts=[[x,y],[tg.x,tg.y]];
    applyHit(tg,ad,m,ad.c);hurt(tg,dm,ad.fam);
    for(let i=1;i<ad.chain;i++){
      let bestE=null,bd=95*95;
      for(const e of S.enemies){if(e.dead||hit.includes(e))continue;const q=(e.x-cur.x)**2+(e.y-cur.y)**2;if(q<bd){bd=q;bestE=e}}
      if(!bestE)break;dm*=.85;hit.push(bestE);pts.push([bestE.x,bestE.y]);applyHit(bestE,ad,m,ad.c);hurt(bestE,dm,ad.fam);cur=bestE;
    }
    if(FX){fx.push({ty:'zap',pts,color:ad.c,t:0,dur:.18,seed:rnd(99)});
      for(const p of pts.slice(1)){sparks(p[0],p[1],ad.c,3,120);
        if(ad.knock)ring(p[0],p[1],ad.c,3,.3,3,26);        // 磁石：輪がすぼまって引き寄せる
        if(ad.slow){flakes(p[0],p[1],2,70);ring(p[0],p[1],'#bfeaff',18,.3,2)}}}
    sfx.shoot(ad);return;
  }
  if(ad.kind==='pierce'){
    const a=Math.atan2(tg.y-y,tg.x-x),L=R*1.25,ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L,pHit=[];
    for(const e of S.enemies){if(e.dead)continue;
      const k=clamp(((e.x-x)*(ex-x)+(e.y-y)*(ey-y))/(L*L),0,1),px=x+(ex-x)*k,py=y+(ey-y)*k;
      if((e.x-px)**2+(e.y-py)**2<(e.r+9)**2){pHit.push(e);applyHit(e,ad,m,ad.c);hurt(e,ad.dmg*m,ad.fam);if(FX)sparks(e.x,e.y,ad.c,3,140)}}
    if(ad.rico&&pHit.length){const hs=new Set(pHit),src=pHit[0];spawnRico(src.x,src.y,ad,m,ad.rico,hs)}
    if(FX)pierceFx(VIS[ad.id],x,y,ex,ey,ad,a);sfx.shoot(ad);return;
  }
  const vis=VIS[ad.id]||'orb',sh={x,y,tx:tg.x,ty:tg.y,tg,d:ad,m,vis,h:0,a:Math.atan2(tg.y-y,tg.x-x),rot:rnd(TAU),seed:rnd(99),
    spd:ad.fast?900:vis==='bullet'?720:vis==='blade'?560:LOB[vis]?310:ad.splash?350:480,rico:ad.rico||0,hit:ad.rico?new Set():null,src:HIT};
  if(vis==='meteor'){sh.x=tg.x-100;sh.y=tg.y-330;sh.spd=640}                 // 終焉：空から落ちてくる
  if(vis==='snipe'&&FX)fx.push({ty:'line',x,y,ex:tg.x,ey:tg.y,color:ad.c,t:0,dur:.14});
  sh.d0=Math.max(30,Math.hypot(tg.x-sh.x,tg.y-sh.y));S.shots.push(sh);
  sfx.shoot(ad);
}
function shotHit(s){HIT=s.src||null;shotHit0(s);HIT=null}
function shotHit0(s){
  const d=s.d,dm=d.dmg*s.m;
  if(d.splash){sfx.hit(d);
    for(const e of S.enemies){if(e.dead)continue;if((e.x-s.x)**2+(e.y-s.y)**2<(d.splash+e.r)**2){if(s.hit)s.hit.add(e);applyHit(e,d,s.m,d.c);hurt(e,dm,d.fam)}}
    if(s.rico>0){if(!s.hit)s.hit=new Set();if(s.tg)s.hit.add(s.tg);spawnRico(s.x,s.y,d,s.m,s.rico,s.hit)}
  }else if(s.tg&&!s.tg.dead){
    const e=s.tg,hx=e.x,hy=e.y;if(s.hit)s.hit.add(e);
    applyHit(e,d,s.m,d.c);hurt(e,dm,d.fam);
    if(s.rico>0){if(!s.hit)s.hit=new Set([e]);spawnRico(hx,hy,d,s.m,s.rico,s.hit)}
  }else return;
  if(FX)impact(s);
}
function update(dt){
  S.time+=dt;
  if(S.echoes&&S.echoes.length){for(const o of S.echoes){o.t-=dt;if(o.t>0)continue;o.done=true;HIT=o.src||null;for(const e of inRange(o.x,o.y,o.R)){applyHit(e,o.ad,o.m,o.ad.c);hurt(e,o.ad.dmg*o.m*ECHO_POW,o.ad.fam)}HIT=null;if(FX){pulseFx(VIS[o.ad.id],o.x,o.y,o.R*.85,o.ad);sfx.shoot(o.ad)}}S.echoes=S.echoes.filter(o=>!o.done)}
  if(S.active){
    S.wt+=dt;
    if(S.bossAt!==null&&!S.warned&&S.wt>=S.bossAt-WARN_LEAD){S.warned=true;if(FX){S.warn=WARN_T;sfx.warn();buzz([60,80,60,80,60])}} // 主が現れる少し前に警告
    while(S.queue.length&&S.queue[0].at<=S.wt)spawnEnemy(S.queue.shift());
    // 夜の王がいる間は、入口から雑魚が少しずつ湧きつづける（魔力は少しだけ）。王を倒すと、残りの敵は消えて波が終わる
    if(S.enemies.some(e=>e.final&&!e.dead)){S.kingCallT=(S.kingCallT??KING_CALL_FIRST)-dt;
      if(S.kingCallT<=0){S.kingCallT+=KING_CALL_EVERY;S.kingCallN=(S.kingCallN||0)+1;S.queue.push({type:S.kingCallN%3?'shade':'wisp',at:S.wt,m:1,free:true,call:true})}}
    else S.kingCallT=null;
  }
  for(const e of S.enemies){
    if(e.dead)continue;
    if(e.knT>0)e.knT-=dt;if(e.kb>0)e.kb-=dt;if(e.rwT>0)e.rwT-=dt;if(e.cfT>0)e.cfT-=dt;if(e.cfRes>0)e.cfRes-=dt;if(e.lrT>0)e.lrT-=dt;if(e.lrRes>0)e.lrRes-=dt;if(e.mirT>0)e.mirT-=dt;if(e.hazT>0)e.hazT-=dt;
    if(e.stopT>0)e.stopT-=dt;if(e.stopRes>0)e.stopRes-=dt;
    if(e.slowT>0&&!(e.stopT>0))e.slowT-=dt; // 停止中は減速タイマーを進めない（停止明けに効く）
    if(e.drainT>0){e.drainT-=dt;const bs=e.type==='boss'||/[主王]$/.test(e.name||'');hurt(e,e.max*e.drain*(bs?DRAIN_BOSS:1)*dt,null);if(e.dead)continue;e.flash=0} // 呪い：最大体力の割合で削るif(e.silT>0)e.silT-=dt;
    if(STAGES[STAGE].aff&&STAGES[STAGE].aff.wet)e.wetT=9;else if(e.wetT>0)e.wetT-=dt;for(const y of SYN)if(y.k!=='wetT'&&e[y.k]>0)e[y.k]-=dt; // 沈んだ都：影はいつも濡れている
    if(e.dotT>0){e.dotT-=dt;hurt(e,e.dot*dt,e.dotF);if(e.dead)continue;e.flash=0;
      if(FX&&Math.random()<dt*10){if(e.dotK)P(e.x+rnd(-e.r,e.r),e.y+rnd(-e.r,e.r)*.5,rnd(-6,6),rnd(-40,-20),.6,rnd(1.8,3),'#a8f06a',{ty:'w',g:-20,drag:.5});else flameP(e.x,e.y-e.r*.3,'#ff7a3a',1,e.r*.7)}}
    if(e.flash>0)e.flash-=dt;
    if(e.dn>0){e.dnT=(e.dnT||0)-dt;if(e.dnT<=0)dnumPop(e)}
    if(e.block>0)e.block-=dt;if(e.healed>0)e.healed-=dt;if(e.pulse>0)e.pulse-=dt*1.6;
    if(e.def.heal&&!(e.silT>0)){e.healT-=dt; // 癒す影：まわりの傷ついた影を治す（沈黙中は回復しない）
      if(e.healT<=0){e.healT=HEAL_EVERY;let n=0;
        for(const o of S.enemies){if(o===e||o.dead||o.def.heal||o.type==='boss'||o.hp>=o.max||(o.x-e.x)**2+(o.y-e.y)**2>HEAL_R*HEAL_R)continue;
          o.hp=Math.min(o.max,o.hp+o.max*e.def.heal);o.healed=.6;n++}
        e.pulse=n?1:.35;if(n&&FX)ring(e.x,e.y,'#9affc8',HEAL_R,.5,2,10)}}
    if(e.born>0)e.born-=dt;if(e.rageT>0)e.rageT-=dt;
    if(e.phase>1&&FX&&Math.random()<dt*(e.phase>2?22:12))flameP(e.x+rnd(-e.r,e.r)*.8,e.y-e.r*.4,e.phase>2?'#ffb040':'#ff5a2a',1,5); // 怒った主は炎をまとう
    const stopped=e.stopT>0||(e.slowT>0&&e.slow>=1);
    if(e.lrT>0){if(!stopped){const dd=e.lrD-e.d,st=e.def.spd*(e.spdM||1)*moonSpd()*dt;e.d+=Math.abs(dd)<=st?dd:Math.sign(dd)*st}} // 誘惑中は塔のそばまで引き返して待つ
    else e.d+=e.def.spd*(e.spdM||1)*moonSpd()*(stopped?0:e.slowT>0?1-e.slow*(1-(e.def.res||0)):1)*(e.cfT>0?-CONF_SPD:1)*dt;if(e.d<0)e.d=0; // 惑わし中は来た道を逆に歩く
    if(e.d>=e.P.len){
      if(e.type!=='boss'){leak(e);continue}
      // 主・王は通り抜けず、灯の前に居すわって攻撃する。その間に倒せば被害はそこまで
      e.d=e.P.len;if(!e.siege){e.siege=true;e.atk=e.final?KING_SIEGE_FIRST:SIEGE_FIRST;e.hits=0;if(FX){floatText(CORE.x-60,CORE.y-46,TT('siege'),'#ff8a9a',FS.f2);sfx.wave(5)}}
      if(!stopped)e.atk-=dt;if(e.lunge>0)e.lunge-=dt*4;
      if(!stopped&&e.atk<=0){e.atk+=e.atkEvery||siegeEvery(e);siegeHit(e);if(e.dead)continue}
    }else e.siege=false;
    const p=pathPoint(e.P,e.d);e.x=p[0];e.y=p[1];
  }
  calcBuffs();wardTick(dt);
  for(const sl of slots){
    const it=sl.item;if(!it)continue;
    if(it.hide>0||it.held||sl.bench){it.beamT.length=0;continue}
    if(sl.path){ // 罠：上を通る敵にかかり続ける
      const d=ITEMS[it.id],tr=d.range*moonTrap(); // 月の恵み：深い罠
      if(d.boom){if(S.enemies.some(e=>!e.dead&&!e.def.fly&&(e.x-sl.x)**2+(e.y-sl.y)**2<(d.range+e.r*.5)**2))explode(sl,d);continue} // 火薬：踏まれたら爆ぜて消える
      for(const e of S.enemies){if(!e.dead&&!e.def.fly){if((e.x-sl.x)**2+(e.y-sl.y)**2<(tr+e.r*.5)**2)applyHit(e,d,enhM(it)*moonTrap(),d.c,sl);else if(e._mirSl===sl)e._mirSl=null}} // 飛ぶ敵は罠にかからない
      continue;
    }
    towerFire(sl,it,dt);HIT=null;
  }
  for(const s of S.shots){
    if(s.tg&&!s.tg.dead){s.tx=s.tg.x;s.ty=s.tg.y}
    const dx=s.tx-s.x,dy=s.ty-s.y,l=Math.hypot(dx,dy),st=s.spd*dt;
    if(l<=st+4){s.x=s.tx;s.y=s.ty;shotHit(s);s.done=true}
    else{s.x+=dx/l*st;s.y+=dy/l*st;s.a=Math.atan2(dy,dx);s.rot+=dt*9;
      s.h=LOB[s.vis]?Math.sin(Math.PI*clamp(1-l/s.d0,0,1))*Math.min(70,s.d0*.42):0;if(FX)shotTrail(s)}
  }
  S.shots=S.shots.filter(s=>!s.done);
  S.enemies=S.enemies.filter(e=>!e.dead);
  if(S.active&&!S.queue.length&&!S.enemies.length&&!S.over)endWave();
}
function endWave(){
  S.active=false;S.warn=0;const bonus=Math.round((12+3*S.wave)*moonWave());S.mana+=bonus;
  if(FX)stats.waves++;
  if(DAILY)dailyRecord(S.wave);
  else if(S.wave>rec().best){prog[pkey()]={best:S.wave,clear:rec().clear||S.wave>=maxWave()};save()}
  if(FX)checkAch();
  floatText(W/2,300,TT('waveDone',S.wave),'#ffe9a0',FS.f4);floatText(W/2,328,TT('manaPlus',bonus),'#e8c36a',FS.f2);
  sfx.waveEnd();
  if(FX)for(let i=0;i<5;i++)fx.push({ty:'mana',x:W/2+rnd(-40,40),y:330,cx:W/2+rnd(-80,80),cy:200,t:-i*.06,dur:.7});
  if(S.wave>=maxWave()&&!S.endless){clearRun();S.newBase=DAILY?null:checkUnlock();if(FX)save();victory()}else{saveRun();if(moonOffer())saveRun()}
}
