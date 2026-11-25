'use strict';
// 音と音楽（Web Audio で合成）（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 音（Web Audio で合成） ---------------- */
let AC=null,noiseBuf=null,BUS=null,REV=null,MUS=null,REVM=null;
const MUS_VOL=.6; // 音楽は効果音より控えめに
// 音の通り道：効果音(BUS)と音楽(MUS) → まとめ役のコンプレッサー → 出力。残響にも送って奥行きを出す（効果音は REV、音楽は REVM から）
// 音量（0〜100）は 2 乗して掛ける（耳には、そのほうが目盛りどおりに聞こえる）。100 なら今までと同じ大きさ
const volGain=v=>(v/100)**2;
function applyVol(){
  if(!AC)return;
  BUS.gain.value=REV.gain.value=volGain(seVol);
  MUS.gain.value=musicOff?0:MUS_VOL*volGain(bgmVol);REVM.gain.value=musicOff?0:volGain(bgmVol);
}
function buildAudio(ctx){
  AC=ctx;
  const comp=AC.createDynamicsCompressor(),out=AC.createGain();
  comp.threshold.value=-16;comp.knee.value=14;comp.ratio.value=5;comp.attack.value=.004;comp.release.value=.22;out.gain.value=.9;
  comp.connect(out).connect(AC.destination);
  BUS=AC.createGain();BUS.connect(comp);
  MUS=AC.createGain();MUS.connect(comp);
  // 残響：だんだん小さくなる雑音を、広間の響きとして使う（高い音ほど早く消えるようにして暗めに）
  const sr=AC.sampleRate,len=Math.floor(sr*2.4),ir=AC.createBuffer(2,len,sr);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);let lp=0;for(let i=0;i<len;i++){const t=i/len,k=.08+.5*(1-t);lp+=((Math.random()*2-1)-lp)*k;d[i]=lp*(1-t)**2.6*(i<sr*.012?i/(sr*.012):1)}}
  const cv2=AC.createConvolver(),rg=AC.createGain();cv2.buffer=ir;rg.gain.value=.55;REV=AC.createGain();REV.connect(cv2).connect(rg).connect(comp);REVM=AC.createGain();REVM.connect(cv2);applyVol();
  noiseBuf=AC.createBuffer(1,sr*1.2,sr);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
}
function audio(){
  if(AC||muted)return;
  try{buildAudio(new(window.AudioContext||window.webkitAudioContext)());musicStart()}catch(e){AC=null}
}
function audioState(){ // 消音・画面を離れたときは音を止め、戻ったら再開する
  if(!AC||!AC.suspend)return;
  try{if(muted||document.hidden)AC.suspend();else AC.resume()}catch(e){}
  applyVol();
}
document.addEventListener('visibilitychange',audioState);
const sndOK=()=>AC&&!muted&&FX;
// 1 つの音：o.det=少しずらした 2 本目を重ねて厚く / o.a=立ち上がり / o.lp=こもらせる高さ / o.rev=残響の量 / o.dst=出力先
function tone(f,d,type='sine',v=.1,to=null,delay=0,o={}){
  if(!sndOK()||sfxOff&&o.dst!==MUS)return; // 効果音を消しても、音楽（出力先が MUS）は鳴らす
  const t=AC.currentTime+delay,g=AC.createGain(),a=o.a||.006;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);
  if(o.hold){g.gain.setValueAtTime(v,t+d-o.hold);g.gain.linearRampToValueAtTime(0,t+d)}else g.gain.exponentialRampToValueAtTime(.0001,t+d);
  let head=g;
  if(o.lp){const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(o.lp,t);if(o.lpTo)fl.frequency.exponentialRampToValueAtTime(o.lpTo,t+d);fl.Q.value=o.q||.7;fl.connect(g);head=fl}
  for(const c of(o.det?[-o.det,o.det]:[0])){const os=AC.createOscillator();os.type=type;os.detune.value=c;
    os.frequency.setValueAtTime(f,t);if(to)os.frequency.exponentialRampToValueAtTime(to,t+d);
    if(o.vib){const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=o.vib;lg.gain.value=f*.012;l.connect(lg).connect(os.frequency);l.start(t);l.stop(t+d+.05)}
    os.connect(head);os.start(t);os.stop(t+d+.05)}
  g.connect(o.dst||BUS);const rv=o.rev===undefined?.16:o.rev;if(rv>0){const r=AC.createGain();r.gain.value=rv;g.connect(r).connect(o.dst===MUS?REVM:REV)}
}
function noise(d,v=.1,freq=1200,delay=0,o={}){
  if(!sndOK()||sfxOff&&o.dst!==MUS)return;
  const t=AC.currentTime+delay,src=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();
  src.buffer=noiseBuf;f.type=o.type||'lowpass';f.Q.value=o.q||.7;f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(o.to||120,t+d);
  g.gain.setValueAtTime(o.a?0:v,t);if(o.a)g.gain.linearRampToValueAtTime(v,t+o.a);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  src.connect(f).connect(g).connect(o.dst||BUS);const rv=o.rev===undefined?.12:o.rev;if(rv>0){const r=AC.createGain();r.gain.value=rv;g.connect(r).connect(o.dst===MUS?REVM:REV)}
  src.start(t,Math.random()*.5);src.stop(t+d+.02);
}
const N=s=>440*2**(s/12);
// 鐘のような音：基音に、少しずれた倍音を重ねる
function bell(f,d,v,delay=0,rev=.5,dst){
  tone(f,d,'sine',v,null,delay,{rev,dst});tone(f*2.01,d*.7,'sine',v*.45,null,delay,{rev,dst});
  tone(f*3.02,d*.45,'sine',v*.22,null,delay,{rev,dst});tone(f*4.23,d*.25,'sine',v*.12,null,delay,{rev,dst});
}
// 金管のような音：のこぎり波を 2 本重ね、こもらせてから開く
const brass=(f,d,v,delay=0,rev=.35)=>tone(f,d,'sawtooth',v,null,delay,{det:7,a:.04,lp:f*2,lpTo:f*6,q:1.2,rev,hold:d*.35,vib:5});
// 太鼓：低い音がすとんと落ちる＋皮の雑音
function drum(v,delay=0,f=95){tone(f,.38,'sine',v,f*.42,delay,{rev:.3});noise(.16,v*.55,320,delay,{rev:.3})}

/* ---------------- 音楽（その場で合成する、暗めの環境音楽） ----------------
   0.5 秒を 1 拍として先の分を予約していく。8 拍ごとに和音が変わり、戦闘中は鼓動と低音が加わる */
const CHORDS=[[-19,-7,-4,0],[-23,-11,-7,-4],[-26,-14,-11,-7],[-24,-12,-8,-5]]; // Dm → B♭ → Gm → A（A=440 からの半音）
const SCALE=[5,8,10,12,15,17,20];                                              // 鐘が鳴らす音（D の短調の五音）
let musT=0,musStep=0,musTimer=null,musBattle=0;
function musicSchedule(until,battle){
  const o=s=>({dst:MUS,...s});
  while(musT<until){
    const dly=Math.max(0,musT-AC.currentTime),bar=Math.floor(musStep/8)%4,beat=musStep%8,ch=CHORDS[bar];
    musBattle+=((battle?1:0)-musBattle)*.25;const B=musBattle;
    if(beat===0){ // 和音：ゆっくり立ち上がって、次の和音に重なりながら消える
      tone(N(ch[0]),5.2,'sawtooth',.03,null,dly,o({det:9,a:1.4,lp:240,lpTo:150,rev:.4,hold:1.6}));
      for(const n of ch.slice(1))tone(N(n),5.4,'triangle',.02,null,dly,o({det:5,a:1.8,rev:.7,hold:2.2}));
      tone(N(ch[3]+12),5,'sine',.008,null,dly,o({a:2.2,rev:.9,hold:2}));
    }
    if(beat%2===0&&Math.random()<(B>.5?.35:.6))bell(N(pick(SCALE)+(Math.random()<.3?12:0)),2.6,.018+Math.random()*.01,dly+(Math.random()<.5?0:.25),.8,MUS);
    if(B>.15){ // 戦闘中：鼓動と、和音の根音を刻む低音
      if(beat%2===0){tone(62,.3,'sine',.11*B,34,dly,o({rev:.15}));if(beat%4===0)tone(62,.3,'sine',.07*B,34,dly+.19,o({rev:.15}))}
      tone(N(ch[0]),.22,'sawtooth',.035*B,null,dly,o({lp:420,lpTo:180,rev:.2}));tone(N(ch[0]),.2,'sawtooth',.022*B,null,dly+.25,o({lp:360,lpTo:180,rev:.2}));
      noise(.05,.012*B,7000,dly+.25,o({type:'highpass',to:5000,rev:.1}));
    }
    musT+=.5;musStep++;
  }
}
function musicStart(){
  if(musTimer||!AC)return;musT=AC.currentTime+.15;
  musTimer=setInterval(()=>{if(sndOK()&&!musicOff&&AC.state==='running')musicSchedule(AC.currentTime+.9,S&&S.active&&!S.over);else if(AC)musT=Math.max(musT,AC.currentTime+.1)},300);
}
let lastKill=0,lastShot=0,lastHit=0;
/* 元素の系統：音色の土台（波形・基準音程・ノイズの帯域） */
const FAM={
  flame:{w:'sawtooth',f:280,nf:1800},water:{w:'sine',f:420,nf:900},
  earth:{w:'triangle',f:150,nf:500}, wind:{w:'sine',f:640,nf:3200},
  volt: {w:'square',  f:880,nf:5200},ice:  {w:'sine',f:980,nf:4200},
  poison:{w:'sawtooth',f:200,nf:700},dark: {w:'triangle',f:180,nf:600},
  metal:{w:'square',  f:240,nf:2600},light:{w:'sine',f:760,nf:3600},
  dragon:{w:'sawtooth',f:130,nf:1100},sound:{w:'sine',f:520,nf:2200},
  wood:{w:'triangle',f:330,nf:1200},time:{w:'triangle',f:600,nf:2800},dream:{w:'sine',f:340,nf:1400},soul:{w:'sine',f:440,nf:1800},void:{w:'triangle',f:260,nf:900},
};
const FAMOF={fire:'flame',flame:'flame',inferno:'flame',lava:'flame',sun:'flame',ragnarok:'flame',phoenix:'flame',crater:'flame',heat:'flame',wisp:'flame',
  water:'water',pond:'water',sea:'water',steam:'water',tsunami:'water',mist:'water',
  earth:'earth',rock:'earth',mountain:'earth',peak:'earth',sand:'earth',quicksand:'earth',sandstorm:'earth',golem:'earth',colossus:'earth',swamp:'earth',
  wind:'wind',gust:'wind',tornado:'wind',typhoon:'wind',storm:'wind',fujin:'wind',
  bolt:'volt',inazuma:'volt',cataclysm:'volt',magnet:'volt',railgun:'volt',
  ice:'ice',blizzard:'ice',frost:'ice',crystal:'light',glass:'light',
  miasma:'poison',spore:'poison',bog:'poison',abyss:'poison',
  curse:'dark',reaper:'dark',obsidian:'earth',
  iron:'metal',titan:'metal',engine:'metal',
  star:'light',stone:'light',genesis:'light',dragon:'dragon',
  hotspring:'water',raincloud:'water',geyser:'water',plasma:'volt',thunderbird:'volt',eel:'volt',raijin:'volt',thunderlord:'volt',eternity:'dark',
  glacier:'ice',icicle:'ice',iceage:'ice',volcano:'flame',eruption:'flame',blueflame:'flame',mud:'earth',
  tank:'metal',katana:'metal',fortress:'metal',wraith:'dark',hyakki:'dark',forest:'poison',yggdrasil:'light',holysword:'light',myth:'light',
  ryugu:'water',seaserpent:'water',poseidon:'water',paradise:'water',thunderstorm:'volt',fujinraijin:'volt',kamikaze:'volt',particle:'light',photon:'light',galaxy:'light',cosmos:'light',
  icespear:'ice',absolutezero:'ice',foxfire:'flame',solarflare:'flame',ninetails:'flame',rinne:'flame',
  seihai:'light',kiyome:'light',sabi:'metal',hougyoku:'dragon',fushoku:'poison',seiiki:'light',kayaku:'flame',ekibyo:'poison',barbwire:'metal',kosenjo:'dark',haikyo:'earth',
  wood:'wood',thicket:'wood',root:'wood',thorn:'wood',thornwall:'wood',leaves:'wind',charcoal:'flame',blackflame:'flame',gokuen:'flame',
  flower:'poison',venom:'poison',toxin:'poison',jungle:'wood',jukai:'wood',diamond:'light',
  light:'light',flash:'light',ray:'light',rainbow:'light',gem:'light',aurora:'light',firefly:'light',hotaru:'light',holylight:'light',laser:'light',tenkou:'light',
  dark:'dark',shadow:'dark',tomb:'dark',bat:'dark',twilight:'dark',nightfall:'dark',vampire:'dark',shinso:'dark',bottomless:'earth',kyoshin:'earth',gaia:'earth',naraku:'dark',chaos:'dark',mugen:'dark'};
Object.assign(FAMOF,{lantern:'light',bonfire:'flame',moonlamp:'light',mire:'poison',antlion:'earth',purgatory:'flame',permafrost:'ice',hellmouth:'flame',stasis:'ice',mirror:'light',mirage:'light',kaleidoscope:'light',desert:'earth',kagerou:'light',sekken:'water',cement:'earth',awa:'water',concrete:'earth',shabondama:'water'});
Object.assign(FAMOF,{sound:'sound',hanabi:'sound',hamon:'sound',jibiki:'sound',fue:'sound',koto:'sound',suzu:'sound',juka:'sound',wakon:'sound',shakudama:'sound',furin:'sound',kusabue:'sound',taiko:'sound',seseragi:'sound',komoriuta:'sound',choonpa:'sound',chinkonka:'sound',sanbika:'sound',orgel:'sound',raimei:'sound',yamabiko:'sound',matsuribayashi:'sound',siren:'sound',kyoumei:'sound',soukyoku:'sound',shukufuku:'sound',shirabe:'sound',tengaku:'sound',goon:'sound',mateki:'sound',tenchi:'sound'}); // 音の系統：鎧の影が防ぐ系統にはない（鎧で弱められない）
Object.assign(FAMOF,{flameward:'flame',waterward:'water',earthward:'earth',windward:'wind',voltward:'volt',iceward:'ice',poisonward:'poison',darkward:'dark',lightward:'light',woodward:'wood'});
Object.assign(FAMOF,{time:'time',shio:'time',fossil:'time',fuka:'time',nenrin:'time',hidokei:'time',boukyaku:'time',tokei:'time',sunadokei:'time',kohaku:'time',chisou:'time',shinshoku:'time',setsuna:'time',yuukyuu:'time',nendo:'time',tokeitou:'time',kaichu:'time',zanzou:'time',gyakkou:'time',oodokei:'time',ancient:'time',jikuu:'time',sekka:'time',iseki:'time',chronos:'time',doomsday:'time'});
Object.assign(FAMOF,{dream:'dream',gentou:'dream',nemurigusa:'dream',hakuchumu:'dream',muma:'dream',yochimu:'dream',maboroshi:'dream',poppy:'dream',kanashibari:'dream',kagee:'dream',genshi:'dream',muyuu:'dream',senrigan:'dream',mugenyume:'dream',yumenokuni:'dream',nemurinomori:'dream',shintaku:'dream',hypnos:'dream',morpheus:'dream',slumber:'dream'});
Object.assign(FAMOF,{soul:'soul',hitodama:'soul',reikon:'soul',yuurei:'soul',kinosei:'soul',shugorei:'soul',akuryo:'soul',yousei:'soul',tenshi:'soul',shinrei:'soul',zombie:'soul',daitenshi:'soul',youseinowa:'soul',akuma:'soul',succubus:'soul',seraphim:'soul',maou:'soul',datenshi:'soul',lilith:'soul',lucifer:'soul'});
Object.assign(FAMOF,{void:'void',shinkuu:'void',seijaku:'void',kanbatsu:'void',ana:'void',nukegara:'void',kuukyo:'void',shinkuuha:'void',doukutsu:'void',kouya:'void',mummy:'void',kyomu:'void',kokuu:'void',blackhole:'void'});
// 鋼・竜の系統はなくした（無系統）。発射音の音色だけは元のまま残す
const TONE={};for(const k in FAMOF)if(FAMOF[k]==='metal'||FAMOF[k]==='dragon'){TONE[k]=FAMOF[k];delete FAMOF[k]}
// 2 つの系統を持つ元素（先に書いたほうが音色の系統）。鎧・結界・属性シナジーは、どれか 1 つが当てはまれば働く
const MULTI={blackflame:['flame','dark'],wisp:['flame','dark'],plasma:['volt','flame'],blueflame:['flame','ice'],hotspring:['water','flame'],
  cataclysm:['volt','ice'],typhoon:['wind','water'],storm:['wind','water'],sun:['flame','light'],
  forest:['wood','poison'],abyss:['poison','dark'],yggdrasil:['wood','light'],kagerou:['light','flame'],
  photon:['light','volt'],hellmouth:['flame','poison'],chaos:['flame','ice'],fujinraijin:['volt','wind'],eternity:['dark','volt'],mugen:['dark','ice'],
  sandstorm:['earth','wind'],heat:['flame','wind'],thunderbird:['volt','wind'],kamikaze:['volt','wind'],stasis:['ice','time'],
  leaves:['wood','wind'],flower:['wood','poison'],nemurigusa:['wood','dream'],poppy:['wood','dream'],nemurinomori:['wood','dream']}; // 木の系統（2026-11-23）：植物そのもので、攻め方が別の系統のものは 2 系統 // 時の檻は、時から作る別ルートもあるので時の系統も持つ
for(const k in ITEMS){const d=ITEMS[k];d.fam=MULTI[k]||(FAMOF[k]?[FAMOF[k]]:[]);d.tone=d.fam[0]||TONE[k]} // fam：系統の配列（灰・鋼・竜の元素は空＝無系統）。音色のほか、鎧の影が防ぐ攻撃の判定にも使う
const famL=f=>Array.isArray(f)?f:f&&f!=='none'?[f]:[]; // 系統を配列にそろえる（万華鏡の 1 発などは文字列）
const hsh=s=>{let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h};
const sfx={
  pick(){tone(560,.1,'triangle',.17,880,0,{rev:.25});noise(.03,.06,5000,0,{type:'highpass',rev:0})},
  drop(){tone(190,.16,'sine',.3,85,0,{rev:.25});noise(.07,.1,700,0,{rev:.1})},
  spawn(i){const f=N(i*2-7);bell(f,.55,.15,0,.45);tone(f/2,.14,'sine',.14,f,0,{rev:.2})},
  merge(t){ // 吸いこむ音 → 低い一打 → 鐘の和音が開く。ランクが高いほど音が増え、長く響く
    noise(.22,.05,600,0,{type:'bandpass',to:5200,q:2.5,a:.15,rev:.3});
    tone(120,.3,'sine',.16+t*.02,48,.02,{rev:.3});
    [0,4,7,12,16,19].slice(0,3+Math.min(t,3)).forEach((n,i)=>bell(N(n+t*2-10),.9+t*.15,.07,.04+i*.05,.6));
    if(t>=3)tone(N(t*2-22),1.4,'sawtooth',.035,null,.05,{det:8,a:.2,lp:500,rev:.7,hold:.6});
  },
  disc(){ // 新発見：和音がふくらみ、鐘が駆け上がって、きらめきが残る
    [-10,-3,2,6].forEach(n=>tone(N(n),2.2,'sawtooth',.03,null,0,{det:9,a:.25,lp:700,lpTo:2400,rev:.8,hold:.9}));
    [0,4,7,11,14,19,23,26].forEach((n,i)=>bell(N(n-5),1.3,.06,.08+i*.075,.75));
    noise(1.4,.02,9000,.3,{type:'highpass',to:6000,a:.4,rev:.9});tone(73,1.2,'sine',.13,55,0,{a:.02,rev:.4});
  },
  fail(){tone(150,.12,'square',.2,105,0,{lp:500,rev:.1});tone(120,.14,'square',.17,85,.1,{lp:420,rev:.1})},
  thud(){if(S.time-lastKill<.05)return;lastKill=S.time;tone(120,.24,'sine',.2,42,0,{rev:.3});noise(.1,.11,900,0,{rev:.2});tone(rnd(420,560),.1,'triangle',.07,160,0,{rev:.3})}, // 大型を倒した重い音
  kill(){if(S.time-lastKill<.05)return;lastKill=S.time;const f=rnd(520,900);tone(f,.1,'triangle',.11,f*.3,0,{rev:.3});noise(.04,.05,3500,0,{rev:.1})},
  shoot(d){ // アイテムごとの発射音：系統×攻撃タイプ×ティアで合成する
    if(S.time-lastShot<.05)return;lastShot=S.time;
    const F=FAM[d.tone||famL(d.fam)[0]]||FAM.earth,t=d.t;
    const f=F.f*2**(((hsh(d.id)%7)-3-(t-1)*1.5)/12),v=Math.min(.13,.055+t*.013);
    if(t>=4)tone(f/2,.16,'sine',v*.7,f/3); // 高ティアは低音の芯を足す
    if(famL(d.fam).includes('sound')&&d.kind!=='chain'&&d.kind!=='pierce'){bell(f*1.5,.35,v*1.1,0,.4);return} // 音の元素：鐘のような音
    switch(d.kind){
      case 'chain':for(let i=0;i<3;i++)noise(.03,v*1.1,F.nf,i*.028);tone(f*2,.07,'square',v*.6,f*.5);break;
      case 'pulse':tone(f*.9,.22,'sine',v*1.7,f*.3);noise(.18,v*.8,F.nf);break;
      case 'beam':tone(f,.08,'sine',v*.8);tone(f*1.5,.08,'sine',v*.45);if(t>=5)tone(f*2,.1,'sine',v*.3);break;
      case 'pierce':noise(.11,v,F.nf);tone(f*.7,.1,F.w,v,f*1.9);break;
      case 'mirror':bell(f*1.5,.18,v*.8,0,.35);tone(f*2,.1,'sine',v*.5,f*1.2);break;
      default:tone(f*1.35,.09,F.w,v,f*.75);noise(.05,v*.6,F.nf);
        if(d.splash){noise(.16,v*1.2,420);tone(f*.5,.18,'sine',v*1.1,f*.22)}
    }
  },
  hit(d){ // 範囲攻撃の着弾音
    if(S.time-lastHit<.07)return;lastHit=S.time;
    const v=Math.min(.2,.09+d.t*.02);noise(.14,v,380);tone(90+d.t*8,.16,'sine',v,40);
  },
  leak(){tone(82,.9,'sine',.24,30,0,{rev:.5});tone(87,.7,'sawtooth',.06,40,0,{lp:300,rev:.5});noise(.55,.13,480,0,{rev:.5});bell(N(-22),1.6,.07,.05,.8)},
  wave(n){ // 波の開始：角笛と太鼓。5 波ごとの主は低く長く
    const boss=n%5===0,b=boss?-5:0;
    brass(N(-31+b),1.5,.075);brass(N(-24+b),1.5,.06,.14);if(boss)brass(N(-19+b),1.6,.05,.3);
    drum(.2,0);drum(.16,.42);if(boss){drum(.22,.84,80);drum(.22,1.05,70)}
  },
  waveEnd(){[0,7,12,16].forEach((n,i)=>bell(N(n-9),1.1,.06,i*.09,.7));tone(N(-21),.9,'sine',.07,null,0,{a:.02,rev:.5})},
  boom(){noise(.7,.2,1100,0,{rev:.6});tone(66,.7,'sine',.24,28,0,{rev:.5});tone(48,.9,'sine',.14,24,.05,{rev:.5});bell(N(-19),2,.06,.1,.9)},
  fw(){ // 花火：どん、のあとにぱらぱら
    tone(rnd(90,130),.35,'sine',.22,45,0,{rev:.6});noise(.3,.16,rnd(1800,3200),0,{type:'bandpass',q:1,rev:.7});
    for(let i=0;i<7;i++)noise(.03,.07,rnd(4000,9000),.12+rnd(.5),{type:'highpass',rev:.6});
  },
  clear(){ // クリア：金管のファンファーレ → 長い和音と鐘、太鼓
    [[-7,0,.22],[-3,.2,.22],[0,.4,.22],[5,.6,.5],[2,1.05,.22],[5,1.25,1.9]].forEach(([n,t,d])=>{brass(N(n),d,.085,t,.5);brass(N(n-12),d,.05,t,.5)});
    [-19,-12,-7,-3].forEach(n=>tone(N(n),3,'sawtooth',.03,null,1.25,{det:9,a:.3,lp:900,lpTo:2600,rev:.8,hold:1.4}));
    [5,9,12,17,21,24,29].forEach((n,i)=>bell(N(n),1.6,.05,1.3+i*.09,.85));
    drum(.2,0);drum(.2,.6);drum(.24,1.25,80);noise(1.6,.03,8000,1.25,{type:'highpass',to:5000,a:.2,rev:.9});
  },
  base(){ // 新しい基本元素：短い金管のファンファーレと、駆け上がる鐘（クリアの和音＝ニ長調に合わせる）
    [[5,0,.16],[9,.14,.16],[12,.28,.16],[17,.42,.8]].forEach(([n,t,d])=>{brass(N(n),d,.07,t,.5);brass(N(n-12),d,.04,t,.5)});
    [-7,-3,0,5].forEach(n=>tone(N(n),2,'sawtooth',.025,null,.4,{det:9,a:.2,lp:800,lpTo:2200,rev:.8,hold:.8}));
    [17,21,24,29,33,36].forEach((n,i)=>bell(N(n),1.4,.05,.45+i*.08,.8));
    noise(1,.02,9000,.5,{type:'highpass',to:6000,a:.3,rev:.9});drum(.18,.4,85);
  },
  over(){[0,-1,-5,-12].forEach((n,i)=>brass(N(n-19),.9,.07,i*.34,.7));bell(N(-31),3.2,.12,1.3,.95);drum(.22,1.3,70);noise(1.2,.05,300,1.3,{rev:.8})},
  warn(){for(let i=0;i<3;i++){tone(N(-17),.34,'sawtooth',.07,N(-12),i*.44,{det:6,lp:900,rev:.3});tone(N(-29),.34,'sine',.12,null,i*.44,{rev:.3});drum(.13,i*.44,70)}}, // 主が近づく警告
  rage(){brass(N(-33),1.1,.09);brass(N(-27),1.1,.07,.08);drum(.24,0,70);drum(.2,.22,60);noise(.6,.1,900,0,{rev:.5})},                                                       // 主の怒り
  ach(){bell(N(2),.9,.05,0,.7);bell(N(9),1.1,.05,.13,.7);bell(N(14),1.4,.04,.26,.8)}, // 実績：控えめな鐘
  ui(){tone(880,.06,'sine',.13,1100,0,{rev:.15});noise(.015,.04,6000,0,{type:'highpass',rev:0})},
};
const buzz=ms=>{try{if(FX&&!vibOff&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}};
