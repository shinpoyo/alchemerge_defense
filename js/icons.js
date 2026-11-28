'use strict';
// 元素のアイコンとスプライト（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 元素のアイコン（±14 の枠にベクターで描く） ---------------- */
const poly=(g,p)=>{g.beginPath();for(let i=0;i<p.length;i+=2)g[i?'lineTo':'moveTo'](p[i],p[i+1]);g.closePath()};
const line=(g,...p)=>{g.beginPath();for(let i=0;i<p.length;i+=2)g[i?'lineTo':'moveTo'](p[i],p[i+1]);g.stroke()};
const dot=(g,x,y,r)=>{g.beginPath();g.arc(x,y,r,0,TAU);g.fill()};
const flame=g=>{g.beginPath();g.moveTo(0,-14);g.bezierCurveTo(2,-7,10,-3,9,5);g.bezierCurveTo(8,13,-8,13,-9,5);g.bezierCurveTo(-10,0,-5,-2,-4,-7);g.bezierCurveTo(-2,-6,-1,-10,0,-14);g.closePath()};
const cloud=(g,y)=>{g.beginPath();g.arc(-6,y+1,5.5,0,TAU);g.arc(0,y-3,7,0,TAU);g.arc(7,y+1,5.5,0,TAU);g.rect(-6,y+1,13,5.5);g.fill()};
const DARK='#0a0814';
// 音の元素のアイコンで使う部品（音符・きらめき・弧）
const note=(g,x,y,s=1)=>{g.beginPath();g.ellipse(x,y,5*s,3.6*s,-.45,0,TAU);g.fill();g.fillRect(x+3.6*s,y-15*s,2*s,15.5*s);g.beginPath();g.moveTo(x+5.6*s,y-15*s);g.bezierCurveTo(x+12*s,y-12*s,x+13*s,y-6*s,x+9*s,y-3*s);g.lineTo(x+8.8*s,y-6*s);g.bezierCurveTo(x+11*s,y-9*s,x+9*s,y-11*s,x+5.6*s,y-11*s);g.closePath();g.fill()};
const spark=(g,x,y,s)=>{poly(g,[x,y-s,x+s*.3,y-s*.3,x+s,y,x+s*.3,y+s*.3,x,y+s,x-s*.3,y+s*.3,x-s,y,x-s*.3,y-s*.3]);g.fill()};
const arc=(g,x,y,r,a,b)=>{g.beginPath();g.arc(x,y,r,a,b);g.stroke()};
const ICON={
  // 崩れてできる元素：聖灰（小さな灰の山と光の十字）・錆（錆びた歯車）・浄めの霧（霧と光の輪）・竜の宝玉（爪につかまれた玉）
  fushoku(g,c){g.save();for(let i=0;i<8;i++){g.rotate(TAU/8);g.fillRect(-2.4,-13,4.8,4.5)}g.restore();dot(g,0,0,9);g.fillStyle=DARK;dot(g,0,0,3.2);g.fillStyle='#bff070';dot(g,-5,-3,2.2);dot(g,5,4,1.8);dot(g,6,-4,1.3);g.fillRect(-1,9,2,4)},
  seiiki(g,c){g.strokeStyle=c;g.lineWidth=1.8;g.beginPath();g.arc(0,0,12,0,TAU);g.stroke();g.lineWidth=1.2;g.beginPath();g.arc(0,0,7.5,0,TAU);g.stroke();g.fillStyle='#fffbe8';g.fillRect(-1.3,-10,2.6,20);g.fillRect(-6.5,-3.5,13,2.6)},
  seihai(g,c){poly(g,[-13,12,-7,3,-2,6,3,0,8,5,13,12]);g.fill();g.fillStyle='#00000035';poly(g,[3,0,8,5,13,12,1,12]);g.fill();g.fillStyle='#fffbe8';g.fillRect(-1.3,-14,2.6,11);g.fillRect(-5,-10.5,10,2.4)},
  kayaku(g,c){g.beginPath();g.ellipse(0,4,10,9,0,0,TAU);g.fill();g.fillStyle='#00000040';g.beginPath();g.ellipse(3,6,6,6,0,0,TAU);g.fill();g.fillStyle='#3a2418';g.fillRect(-4,-9,8,5);g.strokeStyle='#d8b878';g.lineWidth=1.6;g.beginPath();g.moveTo(0,-9);g.quadraticCurveTo(4,-13,2,-15);g.stroke();g.fillStyle='#ffe45c';dot(g,2,-15,2.2);g.fillStyle='#fffbe8';dot(g,2,-15,1)},
  ekibyo(g,c){dot(g,0,0,7.5);g.strokeStyle=c;g.lineWidth=2;for(let i=0;i<8;i++){const a=i*TAU/8,cx=Math.cos(a),sy=Math.sin(a);g.beginPath();g.moveTo(cx*7,sy*7);g.lineTo(cx*12,sy*12);g.stroke();dot(g,cx*12.5,sy*12.5,2)}g.fillStyle=DARK;dot(g,-2.5,-2,2);dot(g,3,2.5,1.6);dot(g,2,-3,1)},
  barbwire(g,c){g.strokeStyle=c;g.lineWidth=2;g.beginPath();g.moveTo(-14,-3);g.bezierCurveTo(-7,-9,-2,5,4,-2);g.bezierCurveTo(8,-7,11,2,14,-3);g.stroke();g.beginPath();g.moveTo(-14,6);g.bezierCurveTo(-6,0,0,13,6,6);g.lineTo(14,6);g.stroke();g.lineWidth=1.6;for(const[x,y]of[[-8,-4],[7,-3],[-6,4],[8,6]]){g.beginPath();g.moveTo(x-3,y-3);g.lineTo(x+3,y+3);g.moveTo(x+3,y-3);g.lineTo(x-3,y+3);g.stroke()}g.fillStyle='#7a3a18';dot(g,-1,0,1.6);dot(g,3,7,1.3)},
  kosenjo(g,c){g.fillStyle='#4a3e3a';poly(g,[-14,13,-10,8,-3,10,4,7,10,9,14,13]);g.fill();g.fillStyle=c;g.save();g.translate(-5,4);g.rotate(-.35);g.fillRect(-1.4,-15,2.8,15);g.fillRect(-4.5,-4,9,2.4);g.restore();g.save();g.translate(6,6);g.rotate(.3);g.fillRect(-1.3,-12,2.6,12);g.fillRect(-4,-3.5,8,2.2);g.restore();g.fillStyle='#7a3a18';dot(g,-7,-5,1.5);dot(g,7,-2,1.3)},
  haikyo(g,c){g.fillRect(-12,-6,5,18);g.fillRect(6,-12,5,24);g.fillRect(-1,2,5,10);g.beginPath();g.moveTo(-12,-6);g.lineTo(-7,-6);g.lineTo(-7,-10);g.lineTo(-9,-8);g.closePath();g.fill();g.fillStyle='#00000040';g.fillRect(9,-12,2,24);g.fillRect(-9,-6,2,18);g.fillStyle='#6aa84a';dot(g,-3,11,2.4);dot(g,12,9,2);dot(g,-12,11,1.8)},
  sabi(g,c){g.save();for(let i=0;i<8;i++){g.rotate(TAU/8);g.fillRect(-2.6,-13,5.2,5)}g.restore();dot(g,0,0,9.5);g.fillStyle=DARK;dot(g,0,0,3.5);g.fillStyle='#7a3a18';dot(g,-5,-4,2);dot(g,4,5,1.6);dot(g,6,-3,1.2)},
  kiyome(g,c){g.strokeStyle=c;g.lineWidth=1.6;g.beginPath();g.arc(0,-6,7,0,TAU);g.stroke();for(const[y,w]of[[3,12],[7.5,9],[12,11]]){g.beginPath();g.moveTo(-w,y);g.bezierCurveTo(-w/2,y-3,w/2,y+3,w,y);g.stroke()}g.fillStyle='#fffbe8';dot(g,0,-6,2.2)},
  hougyoku(g,c){dot(g,0,-2,8.5);g.fillStyle='#ffffffb0';dot(g,-3,-5,2.4);g.strokeStyle='#c8b8a0';g.lineWidth=2;for(const a of[-1,0,1]){g.beginPath();g.moveTo(a*9,12);g.quadraticCurveTo(a*12,4,a*7.5,-1);g.stroke()}},
  // 支援の塔：灯籠（石の灯籠）・篝火（かごの火）・月灯（三日月に抱かれた灯）
  lantern(g,c){poly(g,[-11,-5,0,-12,11,-5]);g.fill();dot(g,0,-12.5,1.6);g.fillRect(-6.5,-5,13,10);g.fillRect(-8,5,16,2);g.fillRect(-2,7,4,5);g.fillRect(-7,11.5,14,2.5);g.fillStyle='#fffbe8';g.fillRect(-3.5,-3,7,6);g.fillStyle=DARK;g.fillRect(-.5,-3,1,6)},
  bonfire(g,c){g.save();g.translate(0,-4);g.scale(.72,.72);flame(g);g.fill();g.translate(0,5);g.scale(.5,.5);flame(g);g.fillStyle='#ffe9a0';g.fill();g.restore();g.strokeStyle='#c8b8a0';g.lineWidth=1.8;line(g,-5,7,7,14);line(g,5,7,-7,14);g.fillStyle='#4a3c3a';poly(g,[-9,3,9,3,6,8,-6,8]);g.fill();g.stroke()},
  moonlamp(g,c){g.beginPath();g.arc(-1,0,12,0,TAU);g.arc(4,-3,10,0,TAU,true);g.fill('evenodd');g.fillStyle='#fffbe8';dot(g,5,-2,3.2);g.strokeStyle='#fffbe8';g.lineWidth=1.2;for(let i=0;i<6;i++){const a=i/6*TAU+.5;line(g,5+Math.cos(a)*5,-2+Math.sin(a)*5,5+Math.cos(a)*7.2,-2+Math.sin(a)*7.2)}},
  wood(g,c){g.fillStyle='#8a5a3a';g.fillRect(-3,0,6,14);g.fillStyle=c;dot(g,0,-5,8);dot(g,-6,0,5);dot(g,6,0,5);g.fillStyle='#ffffff40';dot(g,-3,-8,2.5)},
  light(g,c){g.fillStyle='#fffbe8';dot(g,0,0,5.5);g.lineWidth=2;for(let i=0;i<8;i++){const a=i/8*TAU,r1=8,r2=i%2?11.5:14.5;line(g,Math.cos(a)*r1,Math.sin(a)*r1,Math.cos(a)*r2,Math.sin(a)*r2)}},
  dark(g,c){g.beginPath();g.arc(0,0,12,0,TAU);g.arc(5,-3,10,0,TAU,true);g.fill('evenodd');g.fillStyle='#fff';dot(g,-11,-9,1.2);dot(g,9,10,1);dot(g,12,-11,1.3)},
  thicket(g,c){for(const[x,y,r]of[[-7,4,6],[7,4,6],[0,-2,7],[-2,8,5],[4,9,5]])dot(g,x,y,r);g.strokeStyle='#3a6a2a';g.lineWidth=1.2;line(g,-7,4,-4,1);line(g,6,5,3,2);line(g,0,-1,1,-5)},
  charcoal(g,c){g.fillStyle='#2a2028';poly(g,[-11,6,-8,-4,2,-7,11,-1,9,8,-3,10]);g.fill();g.strokeStyle=c;g.lineWidth=1.4;line(g,-6,-1,-1,3,4,-2);line(g,0,6,5,4);
    g.fillStyle=c;dot(g,-3,-11,1.6);dot(g,4,-13,1.3);dot(g,8,-9,1.2)},
  flower(g,c){g.strokeStyle='#6ac84a';g.lineWidth=2;line(g,0,3,0,14);g.fillStyle='#6ac84a';g.beginPath();g.ellipse(4,10,4,1.8,-.5,0,TAU);g.fill();g.fillStyle=c;
    for(let i=0;i<5;i++){const a=i/5*TAU-TAU/4;g.beginPath();g.ellipse(Math.cos(a)*5.5,-3+Math.sin(a)*5.5,4.2,3,a,0,TAU);g.fill()}g.fillStyle='#ffe070';dot(g,0,-3,3)},
  root(g,c){g.lineWidth=2.6;g.lineCap='round';for(const[x,a]of[[-6,-.5],[0,0],[6,.5]]){g.beginPath();g.moveTo(x,-12);g.bezierCurveTo(x+a*10,-4,x-a*8,4,x+a*12,13);g.stroke()}
    g.lineWidth=1.4;line(g,-4,0,-10,3);line(g,3,4,9,7)},
  leaves(g,c){for(const[x,y,a]of[[-5,-4,-.6],[5,2,.7],[-3,8,-.2]]){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.ellipse(0,0,7,3.6,0,0,TAU);g.fill();
    g.strokeStyle='#2a5a1a';g.lineWidth=.9;line(g,-6,0,6,0);g.restore()}},
  flash(g,c){g.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU-TAU/4,r=i%2?4:14;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.fillStyle='#fff';dot(g,0,0,3)},
  ray(g,c){g.lineWidth=4;line(g,-13,8,13,-8);g.strokeStyle='#fff';g.lineWidth=1.6;line(g,-13,8,13,-8);g.fillStyle='#fff';dot(g,-11,7,3)},
  rainbow(g,c){g.lineWidth=2.3;['#ff6a6a','#ffb04a','#ffe45c','#6ae08a','#5ab0ff','#a88aff'].forEach((col,i)=>{g.strokeStyle=col;g.beginPath();g.arc(0,8,14-i*2.3,Math.PI,0);g.stroke()})},
  gem(g,c){poly(g,[-11,-3,-6,-10,6,-10,11,-3,0,12]);g.fill();g.strokeStyle='#ffffffb0';g.lineWidth=1;line(g,-11,-3,11,-3);line(g,-6,-10,-3,-3,0,12);line(g,6,-10,3,-3,0,12);
    g.fillStyle='#fff';dot(g,-5,-6,1.4)},
  aurora(g,c){g.lineWidth=3;[[c,-6],['#8ad8ff',0],['#c8a8ff',6]].forEach(([col,o])=>{g.strokeStyle=col;g.beginPath();g.moveTo(-14,o-2);g.bezierCurveTo(-5,o-10,3,o+6,14,o-4);g.stroke()});
    g.fillStyle='#fff';dot(g,-10,10,1);dot(g,8,11,1.2)},
  firefly(g,c){g.fillStyle='#3a3a2a';g.beginPath();g.ellipse(0,-3,3,5,0,0,TAU);g.fill();g.fillStyle='#ffffff70';g.beginPath();g.ellipse(-5,-6,5,2.5,-.5,0,TAU);g.fill();g.beginPath();g.ellipse(5,-6,5,2.5,.5,0,TAU);g.fill();
    g.fillStyle=c;dot(g,0,5,4.5);g.fillStyle='#fff';dot(g,0,5,2);g.fillStyle=c;dot(g,-10,8,1.4);dot(g,9,10,1.2)},
  shadow(g,c){g.fillStyle=rgba(c,.5);g.beginPath();g.ellipse(2,9,13,4,0,0,TAU);g.fill();g.fillStyle=c;dot(g,-2,-7,4.5);poly(g,[-9,9,-7,-2,3,-2,5,9]);g.fill();
    g.fillStyle='#ff6a8a';dot(g,-3.5,-7,1);dot(g,-.5,-7,1)},
  blackflame(g,c){flame(g);g.fillStyle='#2a1038';g.fill();g.lineWidth=1.6;g.stroke();g.translate(0,5);g.scale(.52,.52);flame(g);g.fillStyle=c;g.fill()},
  venom(g,c){g.beginPath();g.moveTo(0,-13);g.bezierCurveTo(3,-6,9,-1,9,4);g.arc(0,4,9,0,Math.PI);g.bezierCurveTo(-9,-1,-3,-6,0,-13);g.fill();
    g.fillStyle=DARK;dot(g,-3,3,2);dot(g,3,3,2);g.fillRect(-3,7,6,1.6)},
  tomb(g,c){g.fillStyle='#5a5470';g.beginPath();g.moveTo(-9,13);g.lineTo(-9,-4);g.arc(0,-4,9,Math.PI,0);g.lineTo(9,13);g.fill();g.lineWidth=1.4;g.stroke();
    g.strokeStyle=c;g.lineWidth=2;line(g,0,-8,0,6);line(g,-4,-3,4,-3);g.fillStyle='#3a6a2a';g.fillRect(-13,12,26,2)},
  bat(g,c){g.beginPath();g.moveTo(0,-3);g.quadraticCurveTo(-6,-10,-14,-6);g.quadraticCurveTo(-11,-2,-12,3);g.quadraticCurveTo(-8,0,-6,4);g.quadraticCurveTo(-3,1,0,5);
    g.quadraticCurveTo(3,1,6,4);g.quadraticCurveTo(8,0,12,3);g.quadraticCurveTo(11,-2,14,-6);g.quadraticCurveTo(6,-10,0,-3);g.fill();g.fillStyle='#ff6a8a';dot(g,-1.6,-2,1);dot(g,1.6,-2,1)},
  twilight(g,c){g.fillStyle='#ffb070';g.beginPath();g.arc(0,4,9,Math.PI,0);g.fill();g.fillStyle='#4a3a6a';g.fillRect(-14,4,28,9);g.strokeStyle=c;g.lineWidth=1.6;line(g,-14,4,14,4);
    g.strokeStyle='#ffd8a0';g.lineWidth=1.3;line(g,-9,8,-3,8);line(g,2,11,9,11);g.fillStyle='#fff';dot(g,-9,-9,1);dot(g,10,-11,1.2)},
  thorn(g,c){g.lineWidth=2.4;g.beginPath();g.moveTo(-14,8);g.bezierCurveTo(-6,-10,4,14,14,-6);g.stroke();
    for(const[x,y,a]of[[-9,1,-2],[-3,2,1],[3,4,-1.2],[9,1,2]]){poly(g,[x-1.5,y,x+1.5,y,x+Math.cos(a)*5,y+Math.sin(a)*5]);g.fill()}},
  jungle(g,c){for(const[x,y,r]of[[-8,0,7],[8,0,7],[0,-6,8],[0,5,7]])dot(g,x,y,r);g.strokeStyle='#2a6a2a';g.lineWidth=1.8;
    g.beginPath();g.moveTo(-12,14);g.quadraticCurveTo(-4,4,-2,-4);g.stroke();g.beginPath();g.moveTo(12,14);g.quadraticCurveTo(5,6,6,-2);g.stroke()},
  diamond(g,c){poly(g,[-12,-4,-7,-11,7,-11,12,-4,0,13]);g.fill();g.strokeStyle='#5ab0d8';g.lineWidth=1;line(g,-12,-4,12,-4);line(g,-7,-11,-4,-4,0,13);line(g,7,-11,4,-4,0,13);line(g,-4,-4,0,-11,4,-4);
    g.fillStyle='#fff';for(const[x,y]of[[-13,-12],[13,9],[11,-13]])dot(g,x,y,1.3)},
  holylight(g,c){g.globalAlpha=.6;for(let i=0;i<12;i++){const a=i/12*TAU;g.beginPath();g.moveTo(0,0);g.arc(0,0,14,a-.12,a+.12);g.fill()}g.globalAlpha=1;
    g.fillStyle='#fff';dot(g,0,0,5);g.strokeStyle=c;g.lineWidth=1.8;line(g,0,-3,0,3);line(g,-3,0,3,0)},
  laser(g,c){g.fillStyle='#5a4a6a';g.beginPath();g.ellipse(-8,6,6,4,-.5,0,TAU);g.fill();g.lineWidth=4.5;line(g,-6,4,13,-10);g.strokeStyle='#fff';g.lineWidth=1.6;line(g,-6,4,13,-10);
    g.fillStyle='#fff';dot(g,12,-9,2.4)},
  nightfall(g,c){g.fillStyle='#2a2048';dot(g,0,0,13);g.fillStyle='#fff3c0';g.beginPath();g.arc(-3,-2,7,0,TAU);g.arc(0,-4,6,0,TAU,true);g.fill('evenodd');
    g.fillStyle='#fff';for(const[x,y]of[[6,4],[3,9],[-7,7],[8,-6]])dot(g,x,y,1);g.lineWidth=1.4;g.beginPath();g.arc(0,0,13,0,TAU);g.stroke()},
  vampire(g,c){g.fillStyle='#2a1020';poly(g,[-13,-8,0,14,13,-8,6,-4,0,-10,-6,-4]);g.fill();g.fillStyle='#f0e0e8';dot(g,0,-3,5);
    g.fillStyle=c;dot(g,-2,-4,1.1);dot(g,2,-4,1.1);g.fillStyle='#fff';poly(g,[-1.8,0,-1,3,-.2,0]);g.fill();poly(g,[.2,0,1,3,1.8,0]);g.fill()},
  toxin(g,c){g.fillStyle=rgba(c,.35);g.fillRect(-7,-2,14,13);g.lineWidth=1.8;g.strokeRect(-7,-2,14,13);g.fillRect(-3,-9,6,7);g.strokeRect(-3,-9,6,7);
    g.fillStyle=c;g.fillRect(-7,4,14,7);g.fillStyle=DARK;dot(g,-2.2,6.5,1.4);dot(g,2.2,6.5,1.4);g.fillStyle=c;dot(g,-9,-10,1.6);dot(g,8,-12,1.4)},
  thornwall(g,c){g.lineWidth=2.2;for(const o of[-6,0,6]){g.beginPath();g.moveTo(-14,o+4);g.bezierCurveTo(-5,o-6,5,o+10,14,o);g.stroke()}
    for(const[x,y]of[[-9,-4],[-2,-3],[6,-1],[-6,4],[3,6],[9,8]]){poly(g,[x-1.4,y,x+1.4,y,x,y-4.5]);g.fill()}},
  hotaru(g,c){for(const[x,y,r]of[[-7,-6,3],[6,-8,2.5],[0,0,4],[-8,7,2.6],[8,6,3]]){g.globalAlpha=.4;dot(g,x,y,r*2);g.globalAlpha=1;g.fillStyle='#fff';dot(g,x,y,r*.55);g.fillStyle=c}},
  gokuen(g,c){g.fillStyle='#14061c';dot(g,0,4,10);for(const[x,k]of[[-6,.5],[6,.5],[0,.8]]){g.save();g.translate(x,0);g.scale(k,k);flame(g);g.fillStyle=c;g.fill();g.restore()}
    g.fillStyle='#ffe0ff';g.save();g.translate(0,4);g.scale(.3,.3);flame(g);g.fill();g.restore()},
  shinso(g,c){poly(g,[-11,-6,-11,-13,-6,-9,0,-14,6,-9,11,-13,11,-6]);g.fill();g.fillStyle='#2a1020';poly(g,[-13,-4,0,14,13,-4]);g.fill();g.fillStyle='#f0e0e8';dot(g,0,1,5);
    g.fillStyle=c;dot(g,-2,0,1.1);dot(g,2,0,1.1);g.fillStyle='#fff';poly(g,[-1.8,4,-1,7,-.2,4]);g.fill();poly(g,[.2,4,1,7,1.8,4]);g.fill()},
  tenkou(g,c){g.fillStyle='#e8e0f0';cloud(g,-9);g.globalAlpha=.85;for(const x of[-5,5]){g.beginPath();g.moveTo(x-2,-4);g.lineTo(x+2,-4);g.lineTo(x+4.5,14);g.lineTo(x-4.5,14);g.fill()}
    g.globalAlpha=1;g.fillStyle='#fff';for(const x of[-5,5])g.fillRect(x-.8,-4,1.6,18)},
  jukai(g,c){g.fillStyle='#5a3a2a';for(const x of[-9,-3,3,9])g.fillRect(x-1,4,2,10);g.fillStyle=c;for(const[x,y]of[[-9,-1],[-3,-5],[3,-2],[9,-6]]){poly(g,[x,y-9,x+5,y+6,x-5,y+6]);g.fill()}
    g.fillStyle='#ffffff50';g.fillRect(-14,9,28,2)},
  ryugu(g,c){g.strokeStyle=rgba(c,.8);g.lineWidth=2;g.beginPath();g.moveTo(-14,-9);for(let x=-14;x<14;x+=7){g.quadraticCurveTo(x+1.75,-13,x+3.5,-9);g.quadraticCurveTo(x+5.25,-5,x+7,-9)}g.stroke();
    g.fillStyle=c;poly(g,[-13,1,0,-5,13,1]);g.fill();g.fillStyle='#e8c870';g.fillRect(-9,1,18,9);poly(g,[-8,-2,0,-9,8,-2]);g.fill();
    g.fillStyle=DARK;g.beginPath();g.moveTo(-2.5,10);g.lineTo(-2.5,5.5);g.arc(0,5.5,2.5,Math.PI,0);g.lineTo(2.5,10);g.fill();g.fillStyle=c;g.fillRect(-14,10,28,3)},
  thunderstorm(g,c){g.fillStyle='#8a94b0';cloud(g,-7);g.strokeStyle='#8ab8ff';g.lineWidth=1.6;for(const[x,y]of[[-10,4],[-6,8],[8,4],[11,9]])line(g,x,y,x-2,y+4);
    g.fillStyle='#ffe45c';poly(g,[3,-1,-4,7,0,7,-3,14,6,4,2,4]);g.fill()},
  particle(g,c){g.save();g.rotate(-.6);g.fillStyle='#4a3a6a';g.fillRect(-14,-3.5,14,7);g.fillStyle=c;g.fillRect(-1,-5,4,10);g.restore();
    g.globalAlpha=.85;g.lineWidth=3;line(g,1,-1,14,-9);g.globalAlpha=1;g.fillStyle='#fff';for(const[x,y]of[[5,-4],[9,-6.5],[13,-9]])dot(g,x,y,1.6);
    g.strokeStyle=c;g.lineWidth=1;g.beginPath();g.ellipse(-6,4,6,2.5,.5,0,TAU);g.stroke()},
  icespear(g,c){g.save();g.rotate(.75);g.fillStyle='#8a6a4a';g.fillRect(-1.3,-2,2.6,17);g.fillStyle=rgba(c,.9);poly(g,[0,-16,4.5,-4,0,-1,-4.5,-4]);g.fill();
    g.strokeStyle='#fff';g.lineWidth=1;line(g,0,-14,0,-3);g.restore()},
  foxfire(g,c){for(const[x,y,k]of[[-7,4,.55],[7,4,.55],[0,-4,.7]]){g.save();g.translate(x,y);g.scale(k,k);flame(g);g.fillStyle=c;g.fill();g.translate(0,5);g.scale(.5,.5);flame(g);g.fillStyle='#e8fff8';g.fill();g.restore()}
    g.fillStyle=c;poly(g,[-4,11,-2,7,0,10,2,7,4,11]);g.fill()},
  bottomless(g,c){g.fillStyle=rgba(c,.75);g.beginPath();g.ellipse(0,4,14.5,8.5,0,0,TAU);g.fill();g.fillStyle='#1a1408';g.beginPath();g.ellipse(0,4,9,5,0,0,TAU);g.fill();
    g.strokeStyle=c;g.lineWidth=1.3;g.beginPath();g.ellipse(0,4,5.5,3,0,.4,5.5);g.stroke();g.fillStyle=c;dot(g,-11,-6,1.8);dot(g,10,-8,1.6);g.strokeStyle='#d8c8a0';g.lineWidth=1.6;line(g,6,-1,9,-11)},
  seaserpent(g,c){g.strokeStyle=rgba(c,.6);g.lineWidth=2;g.beginPath();g.moveTo(-14,10);for(let x=-14;x<14;x+=7)g.quadraticCurveTo(x+3.5,6,x+7,10);g.stroke();
    g.lineWidth=5;g.strokeStyle=c;g.beginPath();g.moveTo(-10,8);g.quadraticCurveTo(-10,-4,-3,-3);g.quadraticCurveTo(4,-2,4,6);g.moveTo(4,6);g.quadraticCurveTo(5,-12,12,-8);g.stroke();
    g.fillStyle=DARK;dot(g,11,-9,1.3);g.fillStyle=c;poly(g,[-8,-6,-5,-12,-3,-5]);g.fill()},
  galaxy(g,c){for(let k=0;k<2;k++)for(let i=0;i<18;i++){const t=i/18,a=k*Math.PI+t*4.2,r=2+t*12.5;g.globalAlpha=1-t*.6;dot(g,Math.cos(a)*r,Math.sin(a)*r*.75,2.2-t*1.2)}
    g.globalAlpha=1;g.fillStyle='#fff';dot(g,0,0,3.2)},
  poseidon(g,c){g.lineWidth=2.4;line(g,0,-6,0,15);g.beginPath();g.moveTo(-9,-13);g.lineTo(-9,-5);g.quadraticCurveTo(-9,0,0,0);g.quadraticCurveTo(9,0,9,-5);g.lineTo(9,-13);g.moveTo(0,-15);g.lineTo(0,-1);g.stroke();
    for(const x of[-9,0,9]){poly(g,[x-2.6,-11,x,-16,x+2.6,-11]);g.fill()}g.strokeStyle='#e8c870';g.lineWidth=2;line(g,-3,6,3,6)},
  absolutezero(g,c){g.lineWidth=1.6;g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;g.lineTo(Math.cos(a)*14,Math.sin(a)*14)}g.closePath();g.stroke();
    g.lineWidth=1.8;g.strokeStyle='#fff';for(let i=0;i<6;i++){g.rotate(TAU/6);line(g,0,0,0,-9);line(g,-2.5,-6.5,0,-4,2.5,-6.5)}},
  solarflare(g,c){g.fillStyle='#ffc040';dot(g,-2,3,8.5);g.fillStyle='#fff3c0';dot(g,-3.5,1.5,3.5);
    g.lineWidth=3.2;g.strokeStyle=c;g.beginPath();g.moveTo(3,-4);g.bezierCurveTo(8,-17,16,-12,10,-1);g.stroke();g.lineWidth=2;g.beginPath();g.moveTo(-8,-3);g.bezierCurveTo(-12,-13,-4,-16,-3,-6);g.stroke()},
  kyoshin(g,c){dot(g,0,-9,4.5);poly(g,[-11,-2,11,-2,13,9,7,9,6,3,3,15,-3,15,-6,3,-7,9,-13,9]);g.fill();g.fillStyle='#ffe9a0';g.fillRect(-2.6,-10,5.2,1.6);
    g.fillStyle='#00000040';poly(g,[2,-2,11,-2,13,9,7,9,6,3,3,15,1,15]);g.fill()},
  fujinraijin(g,c){g.strokeStyle='#a8f0c8';g.lineWidth=2.4;g.beginPath();g.arc(-6,0,7,.5,5.8);g.stroke();g.beginPath();g.arc(-6,0,3.5,1.5,6.5);g.stroke();
    g.strokeStyle='#ffd84a';g.lineWidth=1.6;g.beginPath();g.arc(7,0,6.5,0,TAU);g.stroke();g.fillStyle='#ffd84a';for(let i=0;i<6;i++){const a=i/6*TAU;dot(g,7+Math.cos(a)*6.5,Math.sin(a)*6.5,1.8)}
    poly(g,[8,-4,4,1,7,1,5,5,10,0,7,0]);g.fill()},
  ninetails(g,c){for(let i=0;i<9;i++){const a=Math.PI+.25+i/8*(Math.PI-.5);g.globalAlpha=.75;g.lineWidth=3;line(g,0,5,Math.cos(a)*15,5+Math.sin(a)*12);g.globalAlpha=1;dot(g,Math.cos(a)*15,5+Math.sin(a)*12,1.9)}
    g.fillStyle='#fff8e8';poly(g,[-6,1,-7,-8,-2,-3,2,-3,7,-8,6,1,0,9]);g.fill();g.fillStyle=DARK;dot(g,-2.6,1,1.2);dot(g,2.6,1,1.2);g.fillStyle=c;dot(g,0,6,1.2)},
  photon(g,c){g.lineWidth=2;g.beginPath();g.arc(-6,0,7,0,TAU);g.stroke();g.fillStyle='#fff';dot(g,-6,0,3);
    g.lineWidth=3;for(const y of[-4,4])line(g,0,y,14,y);g.strokeStyle='#fff';g.lineWidth=1.2;for(const y of[-4,4])line(g,1,y,14,y)},
  naraku(g,c){for(const[r,a]of[[14,.25],[10.5,.45],[7,.7],[3.5,1]]){g.globalAlpha=a;g.beginPath();g.ellipse(0,2+(14-r)*.35,r,r*.62,0,0,TAU);g.fillStyle=r===3.5?'#05040a':rgba(c,.5);g.fill();g.lineWidth=1.3;g.stroke()}
    g.globalAlpha=1;g.fillStyle='#ff6a8a';dot(g,-1.5,7,.9);dot(g,1.5,7,.9)},
  paradise(g,c){g.fillStyle=rgba('#7ad8e8',.55);g.beginPath();g.ellipse(0,9,14,4.5,0,0,TAU);g.fill();g.fillStyle=c;
    for(let i=0;i<5;i++){const a=i/5*TAU-TAU/4;g.beginPath();g.ellipse(Math.cos(a)*5.5,-3+Math.sin(a)*5.5,4,2.6,a,0,TAU);g.fill()}
    g.fillStyle='#ffe9a0';dot(g,0,-3,2.8);g.strokeStyle='#8ae08a';g.lineWidth=1.6;line(g,0,3,0,9)},
  cosmos(g,c){g.fillStyle=c;dot(g,0,0,7.5);g.fillStyle='#ffffff60';dot(g,-2.5,-2.5,2.6);g.lineWidth=2;g.strokeStyle='#fff3cf';g.beginPath();g.ellipse(0,0,14,4,-.35,0,TAU);g.stroke();
    g.fillStyle=c;dot(g,0,0,0);g.fillStyle='#fff';for(const[x,y]of[[-11,-10],[11,-11],[12,9],[-12,10]])dot(g,x,y,1.2)},
  kamikaze(g,c){g.lineWidth=2.6;for(let k=0;k<3;k++){g.beginPath();for(let i=0;i<=14;i++){const t=i/14,r=3+t*11,a=k*TAU/3+t*3;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.stroke()}
    g.fillStyle='#ffe45c';poly(g,[3,-8,-3,0,0,0,-2,8,4,-1,1,-1]);g.fill()},
  rinne(g,c){g.lineWidth=2.4;g.beginPath();g.arc(0,0,12,.4,TAU-.3);g.stroke();poly(g,[12,-5,7.5,1,15,1]);g.fill();
    g.save();g.translate(0,1);g.scale(.55,.55);flame(g);g.fill();g.translate(0,5);g.scale(.5,.5);flame(g);g.fillStyle='#fff3c0';g.fill();g.restore()},
  gaia(g,c){g.fillStyle='#4a8ad8';dot(g,0,2,11);g.fillStyle=c;g.beginPath();g.ellipse(-4,0,4.5,6,.4,0,TAU);g.fill();g.beginPath();g.ellipse(5,5,4,3,0,0,TAU);g.fill();
    g.strokeStyle='#8ae08a';g.lineWidth=1.8;line(g,0,-9,0,-14);g.fillStyle='#8ae08a';g.beginPath();g.ellipse(3.5,-13.5,3.5,1.8,-.4,0,TAU);g.fill();g.beginPath();g.ellipse(-3,-12,3,1.6,.4,0,TAU);g.fill()},
  chaos(g,c){g.fillStyle='#ff6a3a';g.beginPath();g.arc(0,0,13,-Math.PI/2,Math.PI/2);g.arc(0,6.5,6.5,Math.PI/2,-Math.PI/2,true);g.arc(0,-6.5,6.5,Math.PI/2,-Math.PI/2);g.fill();
    g.fillStyle='#8ad8ff';g.beginPath();g.arc(0,0,13,Math.PI/2,-Math.PI/2);g.arc(0,-6.5,6.5,-Math.PI/2,Math.PI/2,true);g.arc(0,6.5,6.5,-Math.PI/2,Math.PI/2);g.fill();
    g.fillStyle='#8ad8ff';dot(g,0,-6.5,2.2);g.fillStyle='#ff6a3a';dot(g,0,6.5,2.2);g.lineWidth=1.4;g.beginPath();g.arc(0,0,13,0,TAU);g.stroke()},
  mugen(g,c){g.fillStyle='#14060c';dot(g,0,0,10);for(let i=0;i<8;i++){const a=i/8*TAU;g.save();g.translate(Math.cos(a)*11,Math.sin(a)*11);g.rotate(a+Math.PI/2);g.scale(.32,.32);flame(g);g.fill();g.restore()}
    g.strokeStyle='#a8a0b8';g.lineWidth=2;line(g,-6,-6,6,6);line(g,6,-6,-6,6);g.fillStyle=c;dot(g,0,0,2)},
  hotspring(g,c){g.fillStyle=rgba(c,.55);g.beginPath();g.ellipse(0,8,13.5,6,0,0,TAU);g.fill();g.lineWidth=1.6;g.stroke();
    g.strokeStyle='#eef4fb';g.lineWidth=2.2;for(const x of[-6,0,6]){g.beginPath();g.moveTo(x,4);g.bezierCurveTo(x-4,-1,x+4,-5,x,-12);g.stroke()}},
  raincloud(g,c){g.fillStyle='#b9c4dc';cloud(g,-6);g.strokeStyle=c;g.lineWidth=2;for(const[x,y]of[[-8,5],[-2,8],[4,5],[10,8],[-5,12],[7,13]])line(g,x,y,x-2,y+4)},
  plasma(g,c){g.lineWidth=1.8;for(let i=0;i<5;i++){const a=i/5*TAU+.3;g.beginPath();g.moveTo(Math.cos(a)*5,Math.sin(a)*5);
      g.lineTo(Math.cos(a+.35)*9,Math.sin(a+.35)*9);g.lineTo(Math.cos(a-.1)*11.5,Math.sin(a-.1)*11.5);g.lineTo(Math.cos(a+.25)*14,Math.sin(a+.25)*14);g.stroke()}
    dot(g,0,0,6);g.fillStyle='#fff';dot(g,0,0,3)},
  glacier(g,c){g.fillStyle=rgba(c,.8);poly(g,[-14,9,-7,-6,-2,-1,4,-12,14,9]);g.fill();g.lineWidth=1.4;g.stroke();
    g.fillStyle='#ffffff';poly(g,[4,-12,8,-4,5,-6,2,-3,1,-6]);g.fill();g.fillStyle='#4a8ad8';g.fillRect(-14,9,28,4);g.strokeStyle='#fff';g.lineWidth=1;line(g,-10,11,-4,11);line(g,3,11,10,11)},
  volcano(g,c){g.fillStyle='#4a2418';poly(g,[-14,13,-4,-3,4,-3,14,13]);g.fill();g.fillStyle=c;poly(g,[-4,-3,4,-3,2.5,3,0,0,-2.5,3]);g.fill();
    g.fillStyle='#5a5060';dot(g,-3,-9,4);dot(g,3,-11,5);dot(g,8,-8,3.5);g.fillStyle=c;dot(g,-9,-6,1.6);dot(g,10,-14,1.5)},
  mud(g,c){g.fillStyle=rgba(c,.75);g.beginPath();g.ellipse(0,6,14,7,0,0,TAU);g.fill();g.lineWidth=1.4;g.stroke();
    g.fillStyle='#5a4028';g.beginPath();g.ellipse(-5,5,3.5,2,0,0,TAU);g.fill();g.beginPath();g.ellipse(5,8,3,1.6,0,0,TAU);g.fill();
    g.strokeStyle='#f0dcc0';g.lineWidth=1.1;g.beginPath();g.arc(2,2,2.2,0,TAU);g.stroke();g.fillStyle=c;dot(g,-9,-6,2);dot(g,8,-8,1.6)},
  thunderbird(g,c){g.beginPath();g.moveTo(0,-4);g.quadraticCurveTo(-8,-14,-15,-8);g.quadraticCurveTo(-7,-7,-3,0);g.lineTo(3,0);g.quadraticCurveTo(7,-7,15,-8);g.quadraticCurveTo(8,-14,0,-4);g.fill();
    dot(g,0,-4,3);poly(g,[1,1,-5,8,-1,8,-3,14,5,5,1,5]);g.fill()},
  blueflame(g,c){flame(g);g.fill();g.translate(0,5);g.scale(.52,.52);flame(g);g.fillStyle='#e8f6ff';g.fill()},
  geyser(g,c){g.fillStyle='#5a4a3a';g.beginPath();g.ellipse(0,11,13,4,0,0,TAU);g.fill();g.fillStyle=rgba(c,.85);g.beginPath();g.moveTo(-4,11);g.lineTo(-3,-6);
    g.quadraticCurveTo(0,-14,3,-6);g.lineTo(4,11);g.closePath();g.fill();g.fillStyle='#fff';for(const[x,y]of[[-9,-6],[8,-9],[-7,-12],[10,-2],[-11,1]])dot(g,x,y,1.4)},
  icicle(g,c){g.fillRect(-13,-13,26,3.5);g.fillStyle=rgba(c,.85);for(const[x,h]of[[-9,13],[-3,22],[3,17],[9,25]]){poly(g,[x-3.5,-10,x+3.5,-10,x,-10+h]);g.fill()}
    g.strokeStyle='#fff';g.lineWidth=1;line(g,-3.8,-8,-3.2,4);line(g,8.4,-8,9,7)},
  eel(g,c){g.lineWidth=5.5;g.beginPath();g.moveTo(-14,4);g.bezierCurveTo(-8,-6,-2,10,4,0);g.quadraticCurveTo(8,-6,13,-3);g.stroke();
    g.fillStyle=DARK;dot(g,11,-4,1.4);g.strokeStyle='#ffe45c';g.lineWidth=1.6;line(g,-6,-6,-3,-10,-6,-12);line(g,4,8,7,12,4,14)},
  tank(g,c){g.fillStyle='#3a3a2a';g.beginPath();g.ellipse(0,9,14,4.5,0,0,TAU);g.fill();g.fillStyle=c;g.fillRect(-12,0,24,7);g.beginPath();g.arc(-1,0,6.5,Math.PI,0);g.fill();
    g.fillRect(4,-4,12,3);g.fillStyle='#ece4c8';for(const x of[-9,-3,3,9])dot(g,x,9,1.6)},
  wraith(g,c){g.beginPath();g.moveTo(-10,12);g.lineTo(-10,-2);g.arc(0,-2,10,Math.PI,0);g.lineTo(10,12);for(let i=0;i<4;i++)g.quadraticCurveTo(7.5-i*5,7,5-i*5,12);g.closePath();g.fill();
    g.fillStyle=DARK;g.beginPath();g.ellipse(-4,-2,2,3.5,0,0,TAU);g.fill();g.beginPath();g.ellipse(4,-2,2,3.5,0,0,TAU);g.fill();g.beginPath();g.ellipse(0,5,2.5,1.6,0,0,TAU);g.fill()},
  forest(g,c){g.fillStyle='#7a5a3a';for(const x of[-8,0,8])g.fillRect(x-1.3,7,2.6,6);g.fillStyle=c;
    for(const[x,y,w]of[[-8,-3,6.5],[8,-3,6.5],[0,-8,8]]){poly(g,[x,y-8,x+w,y+10,x-w,y+10]);g.fill();g.fillStyle=rgba(c,.75)}},
  iceage(g,c){g.lineWidth=1.6;g.beginPath();g.arc(0,0,14,0,TAU);g.stroke();g.lineWidth=1.8;for(let i=0;i<6;i++){g.rotate(TAU/6);line(g,0,0,0,-9);line(g,-3,-7,0,-4.5,3,-7)}
    g.fillStyle='#fff';dot(g,0,0,2)},
  eruption(g,c){g.fillStyle='#4a2418';poly(g,[-14,13,-4,0,4,0,14,13]);g.fill();g.save();g.translate(0,-3);g.scale(.85,.85);flame(g);g.fillStyle=c;g.fill();g.translate(0,5);g.scale(.5,.5);flame(g);g.fillStyle='#ffe9a0';g.fill();g.restore();
    g.fillStyle='#ff9a50';dot(g,-11,-9,1.8);dot(g,11,-11,1.6);dot(g,-9,-2,1.3);dot(g,10,-4,1.3)},
  raijin(g,c){g.lineWidth=1.8;g.beginPath();g.arc(0,0,13,0,TAU);g.stroke();for(let i=0;i<8;i++){const a=i/8*TAU;g.beginPath();g.arc(Math.cos(a)*13,Math.sin(a)*13,2.6,0,TAU);g.fill()}
    poly(g,[3,-9,-6,1,-1,1,-4,9,6,-2,1,-2]);g.fill()},
  katana(g,c){g.save();g.rotate(-.7);g.fillStyle='#f4f8ff';g.beginPath();g.moveTo(-3,-16);g.quadraticCurveTo(1,-6,1.6,6);g.lineTo(-1.6,6);g.quadraticCurveTo(-1.8,-6,-3,-16);g.fill();
    g.fillStyle='#c8a050';g.fillRect(-4.5,6,9,2.2);g.fillStyle='#2a1a3a';g.fillRect(-1.8,8.2,3.6,8);g.strokeStyle='#c8a050';g.lineWidth=1;for(const y of[10,13])line(g,-1.8,y,1.8,y+1.5);g.restore()},
  fortress(g,c){g.fillRect(-12,-2,24,15);for(const x of[-12,-4.5,3])g.fillRect(x,-7,6,5);g.fillRect(-15,-10,6,23);g.fillRect(9,-10,6,23);
    g.fillStyle=DARK;g.beginPath();g.moveTo(-4,13);g.lineTo(-4,5);g.arc(0,5,4,Math.PI,0);g.lineTo(4,13);g.fill();g.fillRect(-13.5,-3,3,4);g.fillRect(10.5,-3,3,4)},
  thunderlord(g,c){poly(g,[-12,-2,-12,-12,-6,-6,0,-14,6,-6,12,-12,12,-2]);g.fill();g.fillStyle='#ff6a8a';dot(g,0,-7,1.8);g.fillStyle=c;poly(g,[3,0,-6,8,-1,8,-4,15,6,5,1,5]);g.fill()},
  hyakki(g,c){for(const[x,y,k]of[[-8,3,.5],[8,3,.5],[0,-3,.65]]){g.save();g.translate(x,y);g.scale(k,k);flame(g);g.fillStyle=c;g.fill();g.fillStyle=DARK;dot(g,-3.5,4,2.2);dot(g,3.5,4,2.2);g.restore()}},
  yggdrasil(g,c){g.fillStyle='#8a6a4a';poly(g,[-2.5,13,-2,-2,2,-2,2.5,13]);g.fill();g.strokeStyle='#8a6a4a';g.lineWidth=1.8;line(g,-2,11,-9,14);line(g,2,11,9,14);line(g,0,4,-6,-2);
    g.fillStyle=c;dot(g,0,-7,8);dot(g,-7,-3,5.5);dot(g,7,-3,5.5);g.fillStyle='#fff3c0';dot(g,-3,-9,1.4);dot(g,4,-6,1.4);dot(g,-7,-2,1.2)},
  holysword(g,c){g.fillStyle='#fffbe8';poly(g,[0,-15,3,-12,2.5,6,-2.5,6,-3,-12]);g.fill();g.fillStyle=c;g.fillRect(-8,6,16,2.6);g.fillStyle='#7a5a2a';g.fillRect(-1.6,8.6,3.2,5.5);
    g.fillStyle=c;dot(g,0,15,2);g.strokeStyle='#fff';g.lineWidth=1.2;for(const a of[-2.4,-.7,.7,2.4])line(g,Math.cos(a)*7,-6+Math.sin(a)*4,Math.cos(a)*11,-6+Math.sin(a)*7)},
  myth(g,c){for(const sx of[-1,1]){g.save();g.scale(sx,1);poly(g,[5,-2,15,-10,13,-4,16,-1,13,2,15,6,6,4]);g.fill();g.restore()}
    g.fillStyle='#fffbe8';dot(g,0,0,6.5);g.fillStyle=c;dot(g,0,0,3.5);g.strokeStyle=c;g.lineWidth=1.4;g.beginPath();g.arc(0,0,9,0,TAU);g.stroke()},
  eternity(g,c){g.lineWidth=3.6;g.beginPath();for(let i=0;i<=60;i++){const t=i/60*TAU,d=1+Math.sin(t)**2;g.lineTo(13*Math.cos(t)/d,13*Math.sin(t)*Math.cos(t)/d)}g.closePath();g.stroke();
    g.strokeStyle='#fff';g.lineWidth=1.2;g.stroke()},
  iron(g,c){poly(g,[-13,-9,9,-9,14,-5,9,-2,5,-2,3,4,8,8,8,12,-8,12,-8,8,-3,4,-5,-2,-13,-2]);g.fill();g.strokeStyle='#fff';g.lineWidth=1.4;line(g,-11,-7,8,-7);
    g.fillStyle='#ff9a5a';dot(g,-9,-13,1.3);dot(g,-4,-14,1);dot(g,2,-13,1.2)},
  mist(g,c){g.lineWidth=3.4;[[-12,-9,6],[-6,-3,13],[-13,3,4],[-4,9,12]].forEach(([a,y,b],i)=>{g.globalAlpha=1-i*.17;line(g,a,y,b,y)})},
  golem(g,c){g.fillRect(-10,-13,20,16);g.fillRect(-14,5,28,8);g.fillStyle='#00000045';g.fillRect(-10,-1,20,2);poly(g,[4,-13,10,-13,10,-6]);g.fill();
    g.fillStyle='#ffe9a0';g.fillRect(-6.5,-8,4.5,3.2);g.fillRect(2,-8,4.5,3.2);g.strokeStyle=DARK;g.lineWidth=1.3;line(g,-4,-1.5,4,-1.5);line(g,-9,6,-5,9,-7,13)},
  sandstorm(g,c){g.lineWidth=2.4;g.beginPath();g.arc(0,0,12.5,.2,2.5);g.stroke();g.beginPath();g.arc(0,0,7.5,3.2,5.7);g.stroke();g.beginPath();g.arc(0,0,3,0,4.2);g.stroke();
    dot(g,10,-9,1.5);dot(g,-11,-6,1.3);dot(g,-9,9,1.2);dot(g,12,3,1);dot(g,3,-13,1.1)},
  wisp(g,c){flame(g);g.fill();g.fillStyle='#ffffffb0';g.save();g.translate(0,5);g.scale(.5,.5);flame(g);g.fill();g.restore();g.fillStyle=DARK;dot(g,-3.4,3,2);dot(g,3.4,3,2);
    g.beginPath();g.ellipse(0,8,2,1.4,0,0,TAU);g.fill()},
  magnet(g,c){g.lineWidth=6.5;g.lineCap='butt';g.beginPath();g.moveTo(-8,-11);g.lineTo(-8,3);g.arc(0,3,8,Math.PI,0,true);g.lineTo(8,-11);g.stroke();
    g.strokeStyle='#f4f0ff';line(g,-8,-11,-8,-6);line(g,8,-11,8,-6);g.lineCap='round';g.strokeStyle='#ffe45c';g.lineWidth=1.4;line(g,-3,-12,-1,-9,-3,-7);line(g,3,-13,1.5,-10,3,-8)},
  spore(g,c){g.fillStyle='#f0ead8';g.fillRect(-3,-1,6,12);g.fillStyle=c;g.beginPath();g.ellipse(0,0,12.5,10.5,0,Math.PI,TAU);g.closePath();g.fill();
    g.fillStyle='#ffffffc0';dot(g,-5,-5,2);dot(g,3,-7,1.6);dot(g,7,-3,1.3);g.fillStyle=c;dot(g,-11,7,1.3);dot(g,10,9,1.2);dot(g,12,3,1)},
  heat(g,c){g.lineWidth=2.4;[-7.5,0,7.5].forEach((y,i)=>{g.globalAlpha=i===1?1:.75;g.beginPath();g.moveTo(-13,y);g.bezierCurveTo(-8,y-6,-3,y+6,3,y);g.lineTo(11,y);g.stroke();line(g,11,y,7,y-3.2);line(g,11,y,7,y+3.2)})},
  mire(g,c){g.fillStyle=rgba(c,.55);g.beginPath();g.ellipse(0,9,15,6,0,0,TAU);g.fill();g.lineWidth=1.4;g.stroke();
    g.fillStyle=c;g.beginPath();g.arc(0,-5,8.5,0,TAU);g.fill();g.fillRect(-4.5,1,9,6);g.fillStyle=DARK;dot(g,-3.4,-5,2.4);dot(g,3.4,-5,2.4);poly(g,[0,-2,1.5,1,-1.5,1]);g.fill();
    g.strokeStyle=DARK;g.lineWidth=1.1;line(g,-1.6,3.5,-1.6,7);line(g,1.6,3.5,1.6,7);g.fillStyle=c;dot(g,-11,-9,2);dot(g,11,-7,1.6);dot(g,-9,1,1.3);dot(g,10,2,1.4)},
  antlion(g,c){g.lineWidth=2;for(const[y,w,h]of[[-2,14.5,7],[1,10.5,5],[4,6.5,3.2]]){g.beginPath();g.ellipse(0,y,w,h,0,0,TAU);g.stroke()}
    g.fillStyle=DARK;g.beginPath();g.ellipse(0,6,3.4,1.8,0,0,TAU);g.fill();g.strokeStyle='#fff3cf';g.lineWidth=2.2;g.beginPath();g.arc(-4,10,5.5,-1.5,.2);g.stroke();g.beginPath();g.arc(4,10,5.5,Math.PI-.2,Math.PI+1.5);g.stroke()},
  purgatory(g,c){for(const[x,y,k,r]of[[-9,6,.5,-.3],[9,6,.5,.3],[-4.5,2,.72,-.12],[4.5,2,.72,.12],[0,-2,.95,0]]){g.save();g.translate(x,y);g.rotate(r);g.scale(k,k);flame(g);g.fill();g.restore()}
    g.translate(0,4);g.scale(.5,.5);flame(g);g.fillStyle='#fff3c0';g.fill()},
  permafrost(g,c){g.fillStyle=rgba(c,.45);g.beginPath();g.ellipse(0,10,15,5,0,0,TAU);g.fill();g.fillStyle=rgba(c,.85);g.lineWidth=1.3;
    for(const[x,h,w]of[[-9,13,4],[-3,20,5],[4,24,5.5],[10,15,4]]){poly(g,[x-w,10,x,10-h,x+w,10]);g.fill();g.stroke()}g.strokeStyle='#fff';line(g,2.5,2,4,-8);line(g,-4,3,-3,-5)},
  hellmouth(g,c){g.fillStyle='#200808';g.beginPath();g.moveTo(-12,13);g.lineTo(-12,-2);g.arc(0,-2,12,Math.PI,0);g.lineTo(12,13);g.closePath();g.fill();g.lineWidth=2;g.stroke();
    g.fillStyle=c;g.save();g.translate(0,5);g.scale(.62,.62);flame(g);g.fill();g.restore();g.fillStyle='#ffe9a0';g.save();g.translate(0,8);g.scale(.32,.32);flame(g);g.fill();g.restore();
    g.fillStyle='#fff3cf';for(const x of[-8,-4,4,8]){poly(g,[x-2,-9+Math.abs(x)*.35,x+2,-9+Math.abs(x)*.35,x,-4+Math.abs(x)*.35]);g.fill()}},
  stasis(g,c){g.lineWidth=1.6;g.beginPath();g.arc(0,0,13.5,0,TAU);g.stroke();for(let i=0;i<12;i++){const a=i/12*TAU;line(g,Math.cos(a)*11,Math.sin(a)*11,Math.cos(a)*13.5,Math.sin(a)*13.5)}
    g.lineWidth=2.2;g.strokeStyle='#fff';line(g,0,0,0,-9);line(g,0,0,6,3);g.fillStyle='#fff';dot(g,0,0,1.8);g.strokeStyle=c;g.lineWidth=1.2;for(const x of[-7,7])line(g,x,-11.5,x,11.5)},
  frost(g,c){g.fillStyle=rgba(c,.5);g.beginPath();g.ellipse(0,7,14,6.5,0,0,TAU);g.fill();g.lineWidth=1.5;g.stroke();g.strokeStyle='#fff';g.lineWidth=1.1;line(g,-8,7,-2,5,3,9,9,6);
    g.lineWidth=1.8;g.strokeStyle=c;g.translate(0,-7);for(let i=0;i<3;i++){g.rotate(TAU/6);line(g,0,-6,0,6)}},
  railgun(g,c){g.save();g.rotate(-.4);g.fillRect(-13,-4.5,27,3);g.fillRect(-13,1.5,27,3);g.fillRect(-14,-6.5,9,13);g.strokeStyle='#fff';g.lineWidth=1.6;line(g,-4,0,15,0);g.restore();
    g.fillStyle='#fff';dot(g,13.5,-6,2.2);g.strokeStyle=c;g.lineWidth=1.2;line(g,10,-11,12,-8.5);line(g,17,-9,15,-7)},
  reaper(g,c){g.strokeStyle='#a08060';g.lineWidth=2.6;line(g,-7,14,6,-11);g.beginPath();g.moveTo(7,-13);g.quadraticCurveTo(-9,-18,-15,-3);g.quadraticCurveTo(-6,-9,5,-8);g.closePath();g.fill();
    g.strokeStyle='#fff';g.lineWidth=1;g.beginPath();g.moveTo(6,-12);g.quadraticCurveTo(-8,-16,-14,-4);g.stroke()},
  colossus(g,c){dot(g,0,-8.5,5.5);poly(g,[-13,13,-10,-1,10,-1,13,13]);g.fill();g.fillStyle='#00000045';poly(g,[3,-1,10,-1,13,13,6,13]);g.fill();
    g.fillStyle='#ffe9a0';g.fillRect(-3.5,-9.5,7,1.8);g.strokeStyle=DARK;g.lineWidth=1.3;line(g,-4,4,4,4);line(g,0,4,0,13)},
  earth(g,c){g.beginPath();g.ellipse(0,10,14,13,0,Math.PI,TAU);g.closePath();g.fill();g.fillStyle='#00000050';dot(g,-6,4,2);dot(g,3,6,1.6);dot(g,6,1,1.3);dot(g,-1,0,1.2);
    g.strokeStyle='#8be04a';g.lineWidth=2;line(g,0,-3,0,-9);g.fillStyle='#8be04a';g.beginPath();g.ellipse(3.5,-10.5,4,2,-.5,0,TAU);g.fill();g.beginPath();g.ellipse(-3.5,-9,3.2,1.7,.5,0,TAU);g.fill()},
  flame(g,c){g.strokeStyle='#a06a3a';g.lineWidth=3.4;line(g,-10,13,10,8);line(g,-10,8,10,13);g.translate(0,-4);g.scale(.86,.86);flame(g);g.fill();g.translate(0,5);g.scale(.52,.52);flame(g);g.fillStyle='#ffe9a0';g.fill()},
  inferno(g,c){for(const[x,y,k,r]of[[-8,4,.62,-.25],[8,4,.62,.25],[0,-1,.98,0]]){g.save();g.translate(x,y);g.rotate(r);g.scale(k,k);flame(g);g.fill();g.restore()}
    g.translate(0,5);g.scale(.5,.5);flame(g);g.fillStyle='#ffe9a0';g.fill()},
  sun(g,c){dot(g,0,0,7.5);g.lineWidth=2.4;for(let i=0;i<8;i++){const a=i/8*TAU;line(g,Math.cos(a)*10.5,Math.sin(a)*10.5,Math.cos(a)*(i%2?13:15),Math.sin(a)*(i%2?13:15))}g.fillStyle='#fff6d8';dot(g,-2,-2,3)},
  river(g,c){g.lineWidth=5.5;g.strokeStyle=rgba(c,.75);g.beginPath();g.moveTo(-14,-11);g.bezierCurveTo(4,-10,-10,2,4,3);g.bezierCurveTo(14,4,4,12,14,13);g.stroke();
    g.strokeStyle='#ffffffb0';g.lineWidth=1.2;g.beginPath();g.moveTo(-9,-10);g.bezierCurveTo(0,-9,-5,-3,1,-1);g.stroke()},
  pond(g,c){g.fillStyle=rgba(c,.6);g.beginPath();g.ellipse(-1,5,13,7.5,0,0,TAU);g.fill();g.lineWidth=1.8;g.stroke();
    g.strokeStyle='#ffffffb0';g.lineWidth=1.2;g.beginPath();g.ellipse(-4,5,5.5,2.6,0,0,TAU);g.stroke();
    g.strokeStyle='#8be04a';g.lineWidth=1.8;line(g,8,5,9,-11);line(g,11,6,13,-5);g.lineWidth=4;g.strokeStyle='#a06a3a';line(g,9,-11,9.3,-6)},
  sea(g,c){g.lineWidth=2.6;[-7,1,9].forEach((y,i)=>{g.globalAlpha=1-i*.22;g.beginPath();g.moveTo(-14,y);for(let x=-14;x<13;x+=9.33){g.quadraticCurveTo(x+2.3,y-6,x+4.67,y);g.quadraticCurveTo(x+7,y+6,x+9.33,y)}g.stroke()})},
  tsunami(g,c){g.beginPath();g.moveTo(-14,13);g.lineTo(-14,3);g.bezierCurveTo(-11,-13,4,-17,11,-8);g.bezierCurveTo(5,-10,1,-6,3,0);g.bezierCurveTo(5,6,10,9,14,13);g.closePath();g.fill();
    g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(-9,-7);g.bezierCurveTo(-3,-14,6,-14,11,-8);g.stroke();g.fillStyle='#fff';dot(g,12,-3,1.4);dot(g,8,-1,1.1);dot(g,13,2,1)},
  rock(g,c){poly(g,[-11,10,-13,0,-5,-10,6,-11,13,-2,10,10]);g.fill();g.fillStyle='#00000050';poly(g,[6,-11,13,-2,10,10,2,10,4,0]);g.fill();
    g.strokeStyle='#ffffff90';g.lineWidth=1.3;line(g,-9,0,-4,-7,3,-8);g.strokeStyle='#00000070';line(g,-5,3,-1,6,-3,10)},
  peak(g,c){g.lineWidth=1.5;g.globalAlpha=.6;g.beginPath();g.arc(0,-4,12.5,0,TAU);g.stroke();g.globalAlpha=1;poly(g,[-14,12,0,-14,14,12]);g.fill();
    g.fillStyle='#00000055';poly(g,[0,-14,14,12,5,12,1.5,0]);g.fill();g.fillStyle='#fff';poly(g,[0,-14,4.8,-5,2,-7,0,-3.5,-2,-7,-4.8,-5]);g.fill()},
  gust(g,c){g.lineWidth=2.6;g.beginPath();for(let i=0;i<=30;i++){const t=i/30,a=t*TAU*1.8+1,r=1.5+t*11.5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.stroke();g.globalAlpha=.6;line(g,-14,12,-6,13)},
  typhoon(g,c){g.lineWidth=3.2;for(let k=0;k<2;k++){g.beginPath();for(let i=0;i<=14;i++){const t=i/14,r=5.5+t*8.5,a=k*Math.PI+t*2.3;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.stroke()}
    g.lineWidth=2.4;g.beginPath();g.arc(0,0,4.5,0,TAU);g.stroke()},
  cataclysm(g,c){g.lineWidth=2.2;g.globalAlpha=.75;g.beginPath();g.arc(0,0,13.5,.5,2.3);g.stroke();g.beginPath();g.arc(0,0,13.5,3.6,5.5);g.stroke();g.globalAlpha=1;
    poly(g,[4,-14,-8,2,-1,2,-5,14,9,-3,2,-3]);g.fill();g.fillStyle='#fff';dot(g,-10,-8,1.5);dot(g,11,7,1.5);dot(g,-11,9,1.1);dot(g,10,-9,1.1)},
  swamp(g,c){g.fillStyle=rgba(c,.65);g.beginPath();g.ellipse(-1,7,14,7,0,0,TAU);g.fill();g.lineWidth=1.6;g.stroke();
    g.strokeStyle=DARK;g.lineWidth=1.3;g.beginPath();g.arc(-6,6,2.6,0,TAU);g.stroke();g.beginPath();g.arc(2,9,1.8,0,TAU);g.stroke();
    g.strokeStyle=c;g.lineWidth=1.8;line(g,7,5,8,-10);line(g,10,6,12,-4);line(g,-9,2,-10,-6);g.lineWidth=4;g.strokeStyle='#a06a3a';line(g,8,-11,8.3,-6)},
  quicksand(g,c){g.lineWidth=2;for(const[y,w,h]of[[1,14,9.5],[2.5,9.5,6],[4,5,3]]){g.beginPath();g.ellipse(0,y,w,h,0,0,TAU);g.stroke()}g.fillStyle=DARK;g.beginPath();g.ellipse(0,5,2,1.2,0,0,TAU);g.fill();
    g.fillStyle=c;dot(g,-8,-10,1.3);dot(g,6,-12,1.1);dot(g,11,-8,1.2)},
  crater(g,c){g.fillStyle='#3a1812';g.beginPath();g.ellipse(0,8,15,6.5,0,0,TAU);g.fill();g.fillStyle='#ffb040';g.beginPath();g.ellipse(0,8,11.5,4.2,0,0,TAU);g.fill();g.lineWidth=1.5;g.stroke();
    g.fillStyle=c;for(const[x,y,k]of[[-7,-1,.45],[7,-1,.45],[0,-5,.62]]){g.save();g.translate(x,y);g.scale(k,k);flame(g);g.fill();g.restore()}},
  phoenix(g,c){for(const sx of[-1,1]){g.save();g.scale(sx,1);poly(g,[0,3,14,-12,10,-3,14,1,6,4]);g.fill();g.restore()}
    g.beginPath();g.ellipse(0,3,3.2,6.5,0,0,TAU);g.fill();dot(g,0,-6,2.8);g.lineWidth=2;line(g,0,8,-6,15);line(g,0,8,0,16);line(g,0,8,6,15);
    g.fillStyle='#ffe9a0';g.beginPath();g.ellipse(0,3,1.5,4,0,0,TAU);g.fill();poly(g,[0,-10,1.6,-8,-1.6,-8]);g.fill()},
  dragon(g,c){g.lineWidth=4;g.beginPath();g.moveTo(10,13);g.bezierCurveTo(-16,12,14,0,-3,-5);g.stroke();poly(g,[-13,-7,-3,-12,0,-3,-6,-1]);g.fill();
    g.lineWidth=1.8;line(g,-4,-11,2,-15);line(g,-1,-8,6,-11);g.fillStyle='#fff';dot(g,-6,-7,1.3);g.fillStyle=c;dot(g,2,3.5,1.6);dot(g,-3,8.5,1.6);dot(g,6,12,1.4)},
  genesis(g,c){g.lineWidth=1.5;for(const r of[.6,-.6]){g.beginPath();g.ellipse(0,0,14.5,5.5,r,0,TAU);g.stroke()}g.beginPath();g.ellipse(0,0,14.5,5.5,Math.PI/2,0,TAU);g.stroke();
    g.fillStyle='#fff';dot(g,0,0,5);g.fillStyle='#ffe9a0';dot(g,12,8,1.6);dot(g,-12,-8,1.6);dot(g,0,-14.5,1.6)},
  fire(g,c){flame(g);g.fill();g.translate(0,5);g.scale(.52,.52);flame(g);g.fillStyle='#ffe9a0';g.fill()},
  water(g,c){g.beginPath();g.moveTo(0,-14);g.bezierCurveTo(3,-7,9.5,-1,9.5,4.5);g.arc(0,4.5,9.5,0,Math.PI);g.bezierCurveTo(-9.5,-1,-3,-7,0,-14);g.fill();
    g.strokeStyle='#ffffffcc';g.lineWidth=2;g.beginPath();g.arc(0,4.5,5.5,Math.PI*.55,Math.PI*1.05);g.stroke()},
  mountain(g,c){poly(g,[-14,11,-6,-6,-1,1,5,-11,14,11]);g.fill();g.fillStyle='#00000055';poly(g,[5,-11,14,11,7,11,2,-3]);g.fill();poly(g,[-6,-6,-1,1,-3,11,-6,11]);g.fill();
    g.fillStyle='#fff';poly(g,[5,-11,8,-4,5,-6,3,-4,2.2,-6.5]);g.fill()},
  wind(g,c){g.lineWidth=2.6;g.beginPath();g.moveTo(-13,-4);g.lineTo(4,-4);g.arc(4,-8.5,4.5,Math.PI/2,-Math.PI*.85,true);g.stroke();
    g.beginPath();g.moveTo(-13,2);g.lineTo(8,2);g.arc(8,6.5,4.5,-Math.PI/2,Math.PI*.85);g.stroke();line(g,-9,8,-1,8)},
  steam(g,c){g.lineWidth=2.8;for(const x of[-8,0,8]){g.beginPath();g.moveTo(x,9);g.bezierCurveTo(x-6,3,x+6,-3,x,-11);g.stroke()}
    g.lineWidth=2;g.globalAlpha=.6;line(g,-12,13,12,13)},
  lava(g,c){g.fillStyle='#3a1812';poly(g,[-14,12,-5,-3,5,-3,14,12]);g.fill();g.stroke();
    g.fillStyle='#ffb040';poly(g,[-5,-3,5,-3,3.5,3,1.5,0,0,8,-2,1,-3.5,3]);g.fill();g.fillStyle=c;dot(g,-5,-9,1.8);dot(g,2,-12,1.6);dot(g,7,-8,1.4)},
  bolt(g,c){poly(g,[4,-14,-8,2,-1,2,-5,14,9,-3,2,-3]);g.fill();g.strokeStyle='#ffffffaa';g.lineWidth=1;g.stroke()},
  bog(g,c){g.fillStyle=rgba(c,.5);g.beginPath();g.ellipse(0,11,14,4.5,0,0,TAU);g.fill();g.fillStyle=c;g.translate(0,-3);g.scale(.78,.78);g.beginPath();g.arc(0,-3,10.5,0,TAU);g.fill();g.beginPath();g.rect(-5.5,5,11,7.5);g.fill();
    g.fillStyle=DARK;dot(g,-4.2,-3,3);dot(g,4.2,-3,3);poly(g,[0,1,1.8,4.5,-1.8,4.5]);g.fill();g.strokeStyle=DARK;g.lineWidth=1.3;line(g,-2,8,-2,12.5);line(g,2,8,2,12.5)},
  ice(g,c){g.fillStyle=rgba(c,.75);poly(g,[0,-13,11,-6.5,0,0,-11,-6.5]);g.fill();g.fillStyle=rgba(c,.4);poly(g,[-11,-6.5,0,0,0,13,-11,6.5]);g.fill();
    g.fillStyle=rgba(c,.2);poly(g,[11,-6.5,0,0,0,13,11,6.5]);g.fill();g.lineWidth=1.6;poly(g,[0,-13,11,-6.5,11,6.5,0,13,-11,6.5,-11,-6.5]);g.stroke();line(g,-11,-6.5,0,0,11,-6.5);line(g,0,0,0,13);
    g.strokeStyle='#fff';line(g,-7,-1,-7,4)},
  sand(g,c){g.beginPath();g.moveTo(-14,12);g.quadraticCurveTo(-8,-1,0,-3);g.quadraticCurveTo(8,-1,14,12);g.closePath();g.fill(); // 砂の山と、こぼれる粒
    g.fillStyle='#00000040';for(const[x,y]of[[-7,8],[-2,4],[3,8],[8,10],[-10,11],[0,10],[5,4]])dot(g,x,y,1.1);g.fillStyle=c;for(const[x,y,r]of[[-2,-8,1.5],[3,-11,1.2],[6,-6,1.3],[-6,-6,1.1],[1,-14,1]])dot(g,x,y,r)},
  engine(g,c){g.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU;for(const[r,o]of[[10,-.2],[14,-.11],[14,.11],[10,.2]])g.lineTo(Math.cos(a+o)*r,Math.sin(a+o)*r)}g.closePath();g.fill();
    g.fillStyle=DARK;dot(g,0,0,4.5);g.lineWidth=1.5;g.beginPath();g.arc(0,0,4.5,0,TAU);g.stroke()},
  blizzard(g,c){g.lineWidth=2;for(let i=0;i<6;i++){g.rotate(TAU/6);line(g,0,0,0,-14);line(g,-4,-12.5,0,-8.5,4,-12.5);line(g,-2.5,-6,0,-3.5,2.5,-6)}},
  glass(g,c){g.fillStyle=rgba(c,.22);poly(g,[0,-12,12,9,-12,9]);g.fill();g.lineWidth=2;g.stroke();
    g.lineWidth=1.8;g.strokeStyle='#fff';line(g,-16,3,-5,-1);for(const[y,k]of[[-6,'#ff6a6a'],[1,'#ffe45c'],[8,'#6ab0ff']]){g.strokeStyle=k;line(g,5.5,0,16,y)}},
  miasma(g,c){g.globalAlpha=.85;cloud(g,-3);g.globalAlpha=1;g.strokeStyle=DARK;g.lineWidth=1.6;g.beginPath();g.arc(0,-2,3.5,.5,TAU*.8);g.stroke();
    dot(g,-6,8.5,2.4);dot(g,1.5,12,1.8);dot(g,7.5,8,1.5)},
  inazuma(g,c){g.fillStyle='#b9c2d8';cloud(g,-6);g.fillStyle=c;poly(g,[2.5,1,-5,8.5,-.5,8.5,-3,15,6,6,1.5,6]);g.fill()},
  storm(g,c){g.fillStyle='#b9c4dc';cloud(g,-7);g.lineWidth=2;for(const[x,y]of[[-9,3],[-3,6],[3,3],[9,6],[-6,10],[6,11]])line(g,x,y,x-5,y+4)},
  fujin(g,c){g.lineWidth=2.6;g.beginPath();g.arc(0,0,12.5,.7,TAU-.7);g.stroke();for(let k=0;k<2;k++){g.beginPath();for(let i=0;i<=12;i++){const t=i/12,r=2+t*7.5,a=k*Math.PI+t*2.6;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.stroke()}},
  crystal(g,c){g.lineWidth=1.6;g.fillStyle=rgba(c,.45);poly(g,[1,-15,7,-8,7,7,1,12,-5,7,-5,-8]);g.fill();g.stroke();line(g,1,-15,1,12);
    poly(g,[-9.5,1,-6,5,-6,12,-13,12,-13,5]);g.fill();g.stroke();g.strokeStyle='#fff';line(g,4,-6,4,3)},
  curse(g,c){g.fillStyle=rgba(c,.22);g.beginPath();g.moveTo(-15,1);g.quadraticCurveTo(0,-12,15,1);g.quadraticCurveTo(0,14,-15,1);g.fill();g.lineWidth=2;g.stroke();
    g.fillStyle=c;dot(g,0,1,6);g.fillStyle=DARK;g.beginPath();g.ellipse(0,1,1.9,5.6,0,0,TAU);g.fill();g.lineWidth=1.8;line(g,0,-14,0,-10);line(g,-8,-12,-6,-8.5);line(g,8,-12,6,-8.5)},
  obsidian(g,c){g.fillStyle='#17112e';poly(g,[2,-15,8,1,3,14,-7,7,-5,-5]);g.fill();g.lineWidth=1.8;g.stroke();
    g.lineWidth=1;g.strokeStyle=rgba(c,.75);line(g,2,-15,0,3,8,1);line(g,-7,7,0,3,3,14);g.fillStyle=rgba(c,.45);poly(g,[2,-15,0,3,-5,-5]);g.fill()},
  tornado(g,c){g.lineWidth=2.2;[[0,13.5],[2,10.5],[-1.5,7.5],[1.5,4.8],[0,2.4]].forEach(([x,w],i)=>{g.beginPath();g.ellipse(x,-11+i*5.6,w,2.5,0,0,TAU);g.stroke()});dot(g,-12,5,1.4);dot(g,11,9,1.4)},
  star(g,c){g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-TAU/4,r=i%2?5.8:14;g.lineTo(Math.cos(a)*r,Math.sin(a)*r+1)}g.closePath();g.fill();
    g.fillStyle='#ffffffcc';g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-TAU/4,r=i%2?2.6:6.5;g.lineTo(Math.cos(a)*r,Math.sin(a)*r+1)}g.fill()},
  abyss(g,c){g.lineWidth=2.2;for(let k=0;k<3;k++){g.beginPath();for(let i=0;i<=14;i++){const t=i/14,r=5+t*9.5,a=k*TAU/3+t*2.7;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.stroke()}
    g.fillStyle='#030207';dot(g,0,0,5.5);g.lineWidth=1.5;g.beginPath();g.arc(0,0,5.5,0,TAU);g.stroke()},
  titan(g,c){g.save();g.translate(-2,3);g.rotate(-.5);g.fillRect(-7,-5.5,20,11);g.fillStyle='#ffe0c0';g.fillRect(11,-7,4,14);g.restore();
    g.fillStyle='#1a1430';dot(g,-4,8,6.5);g.lineWidth=2;g.beginPath();g.arc(-4,8,6.5,0,TAU);g.stroke();g.fillStyle=c;dot(g,-4,8,2)},
  stone(g,c){g.lineWidth=1.6;g.beginPath();g.arc(0,0,14.5,0,TAU);g.stroke();poly(g,[0,-14.5,12.6,7.2,-12.6,7.2]);g.stroke();g.strokeRect(-5.7,-4.2,11.4,11.4);
    g.fillStyle=rgba(c,.75);dot(g,0,1.5,5.7);g.fillStyle='#fff';dot(g,-1.5,0,1.6)},
  ragnarok(g,c){g.fillStyle='#ff8a3080';poly(g,[-15,-15,10,-2,-2,10]);g.fill();g.fillStyle='#ffe9a0';poly(g,[-10,-10,8,0,0,8]);g.fill();
    g.fillStyle=c;dot(g,5,5,7.5);g.lineWidth=1.2;g.strokeStyle='#fff';g.beginPath();g.arc(5,5,7.5,0,TAU);g.stroke();g.fillStyle='#00000055';dot(g,3,3,1.8);dot(g,8,7,1.5)},
  mirror(g,c){g.fillStyle='#4a6490';g.beginPath();g.ellipse(0,0,9.5,12.5,0,0,TAU);g.fill();g.lineWidth=2.4;g.strokeStyle=c;g.stroke();
    g.strokeStyle='#ffffffcc';g.lineWidth=1.8;line(g,-4.5,-6.5,3,-1);line(g,-2.5,2,4,6.5);
    g.fillStyle='#fff';for(const[x,y]of[[0,-13.5],[0,13.5],[-10.5,0],[10.5,0]])dot(g,x,y,1.6)},
  mirage(g,c){g.fillStyle=rgba(c,.55);poly(g,[-10,1,-3,-8,3,-4,8,-9,12,1]);g.fill();g.fillStyle=rgba(c,.28);poly(g,[-8,2,-2,8,3,5,7,9,10,2]);g.fill();
    g.lineWidth=1.8;g.strokeStyle=c;for(const y of[2,7,11]){g.beginPath();g.moveTo(-13,y);g.bezierCurveTo(-5,y-3,5,y+3,13,y);g.stroke()}
    g.fillStyle='#ffe9a0';dot(g,-7,-10,2.4)},
  kaleidoscope(g,c){const cols=['#ff6a3d','#ffe45c','#7df0c0','#8fe6ff','#c070ff','#ff9ae8'];
    for(let i=0;i<6;i++){const a=i/6*TAU,b=(i+1)/6*TAU;g.fillStyle=cols[i];poly(g,[0,0,Math.cos(a)*13,Math.sin(a)*13,Math.cos(b)*13,Math.sin(b)*13]);g.fill()}
    g.lineWidth=1.6;g.strokeStyle='#fff';g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;g[i?'lineTo':'moveTo'](Math.cos(a)*13,Math.sin(a)*13)}g.closePath();g.stroke();
    g.fillStyle='#fff';poly(g,[0,-5,2,-2,5,0,2,2,0,5,-2,2,-5,0,-2,-2]);g.fill()},
  desert(g,c){g.fillStyle='#ffc85a';dot(g,-6,-9,3.5);
    g.fillStyle=rgba(c,.6);g.beginPath();g.moveTo(-14,6);g.quadraticCurveTo(-5,-4,4,2);g.quadraticCurveTo(10,-3,14,4);g.lineTo(14,12);g.lineTo(-14,12);g.closePath();g.fill();
    g.fillStyle=c;g.beginPath();g.moveTo(-14,12);g.quadraticCurveTo(-4,-2,6,5);g.quadraticCurveTo(11,2,14,7);g.lineTo(14,13);g.lineTo(-14,13);g.closePath();g.fill();
    g.fillStyle='#00000038';g.beginPath();g.moveTo(-2,2);g.quadraticCurveTo(2,4,6,5);g.lineTo(2,13);g.lineTo(-5,13);g.closePath();g.fill();
    g.strokeStyle='#fff3cf';g.lineWidth=1.4;g.beginPath();g.moveTo(-14,12);g.quadraticCurveTo(-4,-2,6,5);g.stroke()},
  kagerou(g,c){g.lineWidth=2.2;
    for(const[x,col]of[[-7,c],[0,'#a8e8ff'],[7,c]]){g.strokeStyle=col;g.beginPath();g.moveTo(x,10);g.bezierCurveTo(x-5,4,x+5,-2,x-2,-7);g.quadraticCurveTo(x+3,-11,x,-13);g.stroke()}
    g.strokeStyle=rgba(c,.65);g.lineWidth=1.6;line(g,-12,12,12,12);g.fillStyle='#fff';dot(g,-4,-3,1.2);dot(g,5,-8,1.2)},
  hai(g,c){poly(g,[-13,11,-8,2,-3,5,2,-3,8,3,13,11]);g.fill();g.fillStyle='#00000045';poly(g,[2,-3,8,3,13,11,0,11]);g.fill();
    g.strokeStyle='#ffffff70';g.lineWidth=1.2;line(g,-8,2,-3,5,2,-3);
    g.fillStyle=c;for(const[x,y,r]of[[-6,-5,1.5],[1,-9,1.3],[7,-5,1.4],[-2,-3,1.1],[5,-11,1]])dot(g,x,y,r);
    g.fillStyle='#ff7a4a';dot(g,-2,7,1.4);dot(g,3,8,1.1)},
  sekken(g,c){g.save();g.rotate(-.22);g.fillStyle=c;rr(g,-11,-5.5,20,12,4.5);g.fill();g.strokeStyle='#ffffffb8';g.lineWidth=1.3;rr(g,-8,-3,14,7,2.5);g.stroke();g.restore();
    for(const[x,y,r]of[[8,-7,4],[11,0,2.8],[3,-10,2.5],[-9,8,3.2],[-4,10,2.2]]){g.fillStyle='#ffffffd8';dot(g,x,y,r);g.strokeStyle=c;g.lineWidth=1;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke()}},
  cement(g,c){g.fillStyle=rgba(c,.65);g.beginPath();g.ellipse(0,6,14,7,0,0,TAU);g.fill();g.lineWidth=1.5;g.stroke();
    g.fillStyle=c;g.beginPath();g.ellipse(0,3,10,4.6,0,0,TAU);g.fill();g.strokeStyle='#00000055';g.lineWidth=1.4;g.beginPath();g.arc(0,3,6.5,.2,Math.PI-.2);g.stroke();
    g.fillStyle='#dfe6ee';poly(g,[-1,-2,8,-11,12,-7,3,2]);g.fill();g.strokeStyle='#fff';g.lineWidth=1.4;line(g,8,-11,12,-14)},
  awa(g,c){for(const[x,y,r]of[[-7,5,5.5],[7,5,5.5],[-9,-2,4.5],[9,-2,4.5],[-4,-7,5],[4,-7,5],[0,6,6],[0,-1,6.5]]){
    g.fillStyle=rgba(c,.72);dot(g,x,y,r);g.strokeStyle='#ffffffd8';g.lineWidth=1.3;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();g.fillStyle='#fff';dot(g,x-r*.35,y-r*.35,r*.24)}},
  concrete(g,c){poly(g,[0,-13,13,-6,13,7,0,14,-13,7,-13,-6]);g.fill();
    g.fillStyle='#ffffff30';poly(g,[0,-13,13,-6,0,1,-13,-6]);g.fill();g.fillStyle='#00000045';poly(g,[0,1,13,-6,13,7,0,14]);g.fill();
    g.strokeStyle=DARK;g.lineWidth=1.3;line(g,0,-13,0,1,13,-6);line(g,0,1,-13,-6);line(g,0,1,0,14);
    g.fillStyle=DARK;for(const[x,y]of[[-6,2],[-6,7],[6,2],[6,7]])dot(g,x,y,1.3)},
  shabondama(g,c){g.fillStyle=rgba(c,.24);dot(g,-2,1,10.5);g.lineWidth=2;g.strokeStyle=c;g.beginPath();g.arc(-2,1,10.5,0,TAU);g.stroke();
    g.lineWidth=2.2;g.strokeStyle='#ff9ae8';g.beginPath();g.arc(-2,1,8.8,-2.5,-1.2);g.stroke();
    g.strokeStyle='#ffe45c';g.beginPath();g.arc(-2,1,8.8,.4,1.5);g.stroke();
    g.fillStyle='#fff';g.beginPath();g.ellipse(-6,-4,3,1.5,-.7,0,TAU);g.fill();dot(g,3,6,1.3);
    for(const[x,y,r]of[[10,-9,3.4],[-11,10,2.2]]){g.fillStyle=rgba(c,.3);dot(g,x,y,r);g.lineWidth=1.2;g.strokeStyle='#fff';g.beginPath();g.arc(x,y,r,0,TAU);g.stroke()}},
  // 音の元素：音符・花火・波紋・楽器など
  sound(g,c){note(g,-5,9,1.3);spark(g,9,-9,3);dot(g,11,2,1.4)},
  hanabi(g,c){g.lineWidth=2;for(let i=0;i<10;i++){const a=i*TAU/10,ca=Math.cos(a),sa=Math.sin(a);line(g,ca*4,sa*4,ca*10,sa*10);dot(g,ca*12,sa*12,i%2?1.5:2.2)}dot(g,0,0,2.6)},
  hamon(g,c){g.lineWidth=1.8;for(const[rx,ry]of[[4,2],[8.5,4.2],[13,6.5]]){g.beginPath();g.ellipse(0,4,rx,ry,0,0,TAU);g.stroke()}dot(g,0,4,1.6);g.beginPath();g.moveTo(0,-12);g.quadraticCurveTo(4.5,-6,0,-2);g.quadraticCurveTo(-4.5,-6,0,-12);g.fill()},
  jibiki(g,c){g.lineWidth=2.4;line(g,-14,8,-7,5,-3,11,3,4,8,10,14,7);g.lineWidth=1.8;arc(g,0,5,8,Math.PI*1.15,Math.PI*1.85);arc(g,0,5,13,Math.PI*1.2,Math.PI*1.8);g.fillRect(-10,11,3,3);g.fillRect(8,12,3,2.5)},
  fue(g,c){g.save();g.rotate(-.6);g.fillRect(-14,-3.2,28,6.4);g.fillStyle=DARK;for(const x of[-5,-1,3,7])dot(g,x,0,1.4);g.fillRect(-14,-3.2,2.4,6.4);g.restore();g.fillStyle=c;dot(g,9,-11,1.5);dot(g,12,-6,1.1);dot(g,-10,10,1.3)},
  koto(g,c){poly(g,[-14,-1,11,-9,14,-5,-11,6]);g.fill();g.strokeStyle=DARK;g.lineWidth=1;for(let i=1;i<=5;i++){const t=i/6;line(g,-14+3*t,-1+7*t,11+3*t,-9+4*t)}g.strokeStyle=c;g.lineWidth=2;line(g,-9,6,-9,13);line(g,10,-4,10,11)},
  suzu(g,c){g.beginPath();g.arc(0,-1,9.5,Math.PI,0);g.lineTo(12,8);g.lineTo(-12,8);g.closePath();g.fill();g.fillRect(-13,8,26,2.4);dot(g,0,12.5,2.4);g.fillStyle=DARK;g.fillRect(-9,3,18,1.2);g.lineWidth=2;g.beginPath();g.arc(0,-13,2.4,0,TAU);g.stroke()},
  juka(g,c){note(g,-5,9,1);g.strokeStyle=c;g.lineWidth=1.8;g.beginPath();g.moveTo(5,-12);g.bezierCurveTo(14,-8,-2,-2,9,3);g.stroke();g.beginPath();g.moveTo(9,3);g.bezierCurveTo(4,6,10,10,5,13);g.stroke();dot(g,12,-3,1.6)},
  wakon(g,c){for(const y of[9,2,-5]){g.beginPath();g.ellipse(-3,y,5,3.4,-.45,0,TAU);g.fill()}g.fillRect(1,-14,2,23);g.beginPath();g.moveTo(3,-14);g.bezierCurveTo(9,-12,10,-7,7,-4);g.lineTo(6.5,-7);g.bezierCurveTo(8,-9,6,-10,3,-10);g.closePath();g.fill()},
  shakudama(g,c){g.lineWidth=2;g.beginPath();g.arc(0,0,5.5,0,TAU);g.stroke();for(let i=0;i<14;i++){const a=i*TAU/14,ca=Math.cos(a),sa=Math.sin(a),r=i%2?11:13.5;line(g,ca*8,sa*8,ca*r,sa*r)}dot(g,0,0,2.6)},
  furin(g,c){g.beginPath();g.arc(0,-3,9,Math.PI,0);g.lineTo(10,3);g.lineTo(-10,3);g.closePath();g.fill();dot(g,0,5,2);g.lineWidth=1.4;line(g,0,5,0,9);g.fillRect(-4,9,8,5.5);g.fillStyle=DARK;g.fillRect(-2,11,4,.9);g.lineWidth=2;g.beginPath();g.arc(0,-13,2.4,0,TAU);g.stroke()},
  kusabue(g,c){g.beginPath();g.moveTo(-13,8);g.bezierCurveTo(-12,-6,2,-12,12,-10);g.bezierCurveTo(12,2,2,10,-13,8);g.closePath();g.fill();g.strokeStyle=DARK;g.lineWidth=1.2;line(g,-12,7,8,-7);g.strokeStyle=c;g.lineWidth=1.6;arc(g,8,8,4,-.2,1.3);arc(g,8,8,8,-.1,1.2)},
  taiko(g,c){g.beginPath();g.ellipse(0,-5,11,4.5,0,0,TAU);g.fill();g.fillRect(-11,-5,22,12);g.beginPath();g.ellipse(0,7,11,4.5,0,0,Math.PI);g.fill();g.strokeStyle=DARK;g.lineWidth=1.2;g.beginPath();g.ellipse(0,-5,8,3,0,0,TAU);g.stroke();for(const x of[-6,0,6])line(g,x,0,x,4);g.strokeStyle=c;g.lineWidth=2;line(g,-13,-13,-3,-6);line(g,13,-13,3,-6)},
  seseragi(g,c){g.lineWidth=2.2;for(const y of[-8,0,8]){g.beginPath();g.moveTo(-13,y);g.bezierCurveTo(-8,y-5,-4,y-5,0,y);g.bezierCurveTo(4,y+5,8,y+5,13,y);g.stroke()}dot(g,-9,11,1.5);dot(g,8,-12,1.5)},
  komoriuta(g,c){dot(g,-2,0,10);g.fillStyle=DARK;dot(g,2.5,-3.5,8.5);g.fillStyle=c;note(g,5,11,.7);dot(g,8,-10,1.4)},
  choonpa(g,c){dot(g,-10,0,2.6);g.lineWidth=2.2;for(const r of[7,12,17])arc(g,-10,0,r,-.8,.8)},
  chinkonka(g,c){g.beginPath();g.moveTo(-9,12);g.lineTo(-9,-3);g.bezierCurveTo(-9,-14,9,-14,9,-3);g.lineTo(9,12);g.lineTo(4.5,8);g.lineTo(0,12);g.lineTo(-4.5,8);g.closePath();g.fill();g.fillStyle=DARK;dot(g,-3.5,-3,1.9);dot(g,3.5,-3,1.9);g.beginPath();g.ellipse(0,3,1.6,2.2,0,0,TAU);g.fill()},
  sanbika(g,c){g.lineWidth=2;g.beginPath();g.ellipse(0,-11,6,2.4,0,0,TAU);g.stroke();g.fillRect(-1.5,-5,3,19);g.fillRect(-7,0,14,3);g.fillStyle='#fffbe8';spark(g,-11,5,2.6);spark(g,11,-2,2.2)},
  orgel(g,c){g.fillRect(-12,3,24,10);g.lineWidth=1.8;poly(g,[-12,3,-8,-10,8,-10,12,3]);g.stroke();g.fillStyle=DARK;g.fillRect(-9,6,14,1.2);g.fillRect(-9,9,14,1.2);g.fillStyle=c;dot(g,8,7.5,2.4);dot(g,0,-4,1.6);dot(g,-3,-7,1.2)},
  raimei(g,c){poly(g,[-2,-14,-9,2,-3,2,-6,14,7,-3,1,-3,6,-14]);g.fill();g.lineWidth=1.8;arc(g,0,0,13,-.45,.45);arc(g,0,0,13,Math.PI-.45,Math.PI+.45)},
  yamabiko(g,c){poly(g,[-14,12,-5,-5,0,3,5,-9,14,12]);g.fill();g.fillStyle='#ffffff55';poly(g,[5,-9,2.6,-4.5,5,-5,7.4,-4]);g.fill();g.strokeStyle=c;g.lineWidth=1.6;arc(g,-5,-5,6,3.3,4.7);arc(g,-5,-5,10,3.3,4.7)},
  matsuribayashi(g,c){g.beginPath();g.ellipse(0,0,9,11,0,0,TAU);g.fill();g.fillRect(-5,-14,10,3.5);g.fillRect(-5,10.5,10,3.5);g.strokeStyle=DARK;g.lineWidth=1.2;for(const y of[-6,-2,2,6]){const w=9*Math.sqrt(1-(y/11)**2);line(g,-w,y,w,y)}g.fillStyle=DARK;g.fillRect(-.6,-10,1.2,20)},
  siren(g,c){g.beginPath();g.moveTo(0,12);g.arc(0,12,22,-2.2,-.94);g.closePath();g.fill();g.strokeStyle=DARK;g.lineWidth=1.2;for(let i=0;i<5;i++){const a=-2.2+i*(1.26/4);line(g,0,12,Math.cos(a)*22,12+Math.sin(a)*22)}g.fillRect(-4,12,8,2.5)},
  kyoumei(g,c){poly(g,[0,-12,7,-3,0,12,-7,-3]);g.fill();g.strokeStyle=DARK;g.lineWidth=1;line(g,-7,-3,7,-3);line(g,0,-12,-2.5,-3);line(g,0,-12,2.5,-3);line(g,-2.5,-3,0,12);line(g,2.5,-3,0,12);g.strokeStyle=c;g.lineWidth=1.8;arc(g,0,0,11,-.5,.5);arc(g,0,0,11,Math.PI-.5,Math.PI+.5);arc(g,0,0,14,-.4,.4);arc(g,0,0,14,Math.PI-.4,Math.PI+.4)},
  soukyoku(g,c){g.beginPath();g.moveTo(-8,12);g.lineTo(-8,-4);g.arc(0,-4,8,Math.PI,0);g.lineTo(8,12);g.closePath();g.fill();g.fillRect(-12,12,24,2.2);g.fillStyle=DARK;note(g,-2.5,6,.55)},
  shukufuku(g,c){g.beginPath();g.arc(0,-1,8.5,Math.PI,0);g.lineTo(11,7);g.lineTo(-11,7);g.closePath();g.fill();g.fillRect(-12,7,24,2.2);dot(g,0,11.5,2.4);g.lineWidth=2;g.beginPath();g.arc(0,-12,2.4,0,TAU);g.stroke();g.fillStyle='#fffbe8';spark(g,-11,-9,3);spark(g,11,-6,2.4)},
  shirabe(g,c){g.lineWidth=2.2;g.beginPath();g.moveTo(-14,-5);g.bezierCurveTo(-4,-9,6,-9,8,-4);g.bezierCurveTo(10,1,4,3,3,-1);g.stroke();g.beginPath();g.moveTo(-14,3);g.bezierCurveTo(-2,0,8,1,11,6);g.bezierCurveTo(12,11,5,12,4,8);g.stroke();line(g,-11,10,-2,10);dot(g,-9,-11,1.4);dot(g,12,-9,1.4)},
  tengaku(g,c){g.lineWidth=2.6;g.beginPath();g.moveTo(-8,12);g.lineTo(-8,-4);g.bezierCurveTo(-8,-12,4,-12,6,-5);g.lineTo(9,12);g.stroke();line(g,-8,12,9,12);g.lineWidth=1.2;for(const[x,y]of[[-4,-9],[-.5,-10],[3,-8],[6,-5]])line(g,x,y,x,12);g.fillStyle='#fffbe8';spark(g,-12,-10,2.6)},
  goon(g,c){poly(g,[-13,-3.5,-5,-3.5,5,-10,5,10,-5,3.5,-13,3.5]);g.fill();g.lineWidth=2.2;arc(g,6,0,6,-.9,.9);arc(g,6,0,11,-.8,.8)},
  mateki(g,c){g.save();g.rotate(-.6);g.fillRect(-14,-2.6,26,5.2);g.fillStyle=DARK;for(const x of[-7,-3,1])dot(g,x,0,1.2);g.restore();g.fillStyle=c;spark(g,8,-8,4.5);g.lineWidth=1.8;g.beginPath();g.moveTo(-10,10);g.bezierCurveTo(-4,14,0,6,5,10);g.stroke()},
  tenchi(g,c){g.lineWidth=2;for(let i=0;i<7;i++){const a=Math.PI+(i+.5)*Math.PI/7,ca=Math.cos(a),sa=Math.sin(a);line(g,ca*9,2+sa*9,ca*14,2+sa*14)}g.beginPath();g.arc(0,2,5,0,TAU);g.fill();g.lineWidth=1.8;arc(g,0,2,9,0,Math.PI);g.lineWidth=2.2;line(g,-14,8,-8,5,-3,11,3,5,8,11,14,7)},
};

/* ---------------- 元素のスプライト ---------------- */
let orbCache=new Map();
// 系統の結界の絵：点線の輪の中に、その系統の元素の絵を小さく
// 時・夢の元素のアイコンで使う部品（時計・砂時計・三日月・眠りの Z・渦・目）
const clk=(g,x,y,r,a=-1.2,b=.5)=>{g.lineWidth=2;g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();g.lineWidth=1.8;line(g,x,y,x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55);line(g,x,y,x+Math.cos(b)*r*.8,y+Math.sin(b)*r*.8);dot(g,x,y,1.6)};
const hglass=(g,x,y,s)=>{g.lineWidth=1.8;line(g,x-7*s,y-12*s,x+7*s,y-12*s);line(g,x-7*s,y+12*s,x+7*s,y+12*s);poly(g,[x-5.5*s,y-12*s,x+5.5*s,y-12*s,x+1.2*s,y,x+5.5*s,y+12*s,x-5.5*s,y+12*s,x-1.2*s,y]);g.stroke();poly(g,[x-4.5*s,y+11*s,x+4.5*s,y+11*s,x,y+5*s]);g.fill();poly(g,[x-3*s,y-9*s,x+3*s,y-9*s,x,y-4.5*s]);g.fill()};
const moon=(g,x,y,r)=>{const f=g.fillStyle;dot(g,x,y,r);g.fillStyle=DARK;dot(g,x+r*.48,y-r*.32,r*.82);g.fillStyle=f};
const zz=(g,x,y,s)=>{g.lineWidth=1.5;line(g,x,y,x+4*s,y,x,y+4*s,x+4*s,y+4*s)};
const swirl=(g,n,k,r0,w)=>{g.lineWidth=w;g.beginPath();for(let i=0;i<n;i++){const a=i*k,r=r0+i*(13-r0)/n;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.stroke()};
const eye=(g,w,h)=>{g.lineWidth=2;g.beginPath();g.moveTo(-w,0);g.quadraticCurveTo(0,-h,w,0);g.quadraticCurveTo(0,h,-w,0);g.stroke();dot(g,0,0,h*.38);g.fillStyle='#fff';dot(g,1.4,-1.4,1.3)};
Object.assign(ICON,{
  time(g,c){clk(g,0,0,11.5,-1.9,-.3);g.lineWidth=1.4;for(let i=0;i<4;i++){const a=i/4*TAU;line(g,Math.cos(a)*9,Math.sin(a)*9,Math.cos(a)*11.5,Math.sin(a)*11.5)}},
  shio(g,c){g.lineWidth=2.2;for(const y of[-2,5,12]){g.beginPath();g.moveTo(-13,y);g.quadraticCurveTo(-6.5,y-5,0,y);g.quadraticCurveTo(6.5,y+5,13,y);g.stroke()}g.fillStyle='#fff6c0';moon(g,6,-10,4)},
  fossil(g,c){g.fillStyle=rgba(c,.35);dot(g,0,0,13);g.strokeStyle=c;swirl(g,42,.36,1,2.4)},
  fuka(g,c){poly(g,[-12,12,-11,-1,-5,-6,1,-2,7,-8,12,0,12,12]);g.fill();g.fillStyle=DARK;dot(g,-3,4,2);dot(g,5,6,1.5);dot(g,-7,8,1.1);g.strokeStyle='#ffffffb0';g.lineWidth=1.4;line(g,-14,-11,-5,-13);line(g,-11,-7,-1,-10)},
  nenrin(g,c){g.fillStyle=rgba(c,.4);dot(g,0,0,13);g.lineWidth=1.5;for(const r of[12,8.5,5.2,2.2]){g.beginPath();g.arc(r>3?.6:0,r>3?.4:0,r,0,TAU);g.stroke()}g.strokeStyle=DARK;g.lineWidth=1.2;line(g,0,0,9,-8)},
  hidokei(g,c){g.lineWidth=2;g.beginPath();g.ellipse(0,6,13,5.5,0,0,TAU);g.stroke();poly(g,[-1.5,6,1.5,6,5,-10]);g.fill();g.fillStyle=DARK;poly(g,[0,6,-10,8,-9,5]);g.fill();g.fillStyle='#fff6c0';dot(g,-8,-9,3.2)},
  boukyaku(g,c){clk(g,0,1,9,-1.6,.9);g.lineWidth=2;arc(g,0,1,13,-2.2,1.3);poly(g,[-8.6,-10.5,-4,-13.5,-9.5,-15]);g.fill()},
  tokei(g,c){clk(g,0,1,11.5,-1.2,.6);g.lineWidth=2;line(g,-8,-12,-11,-9);line(g,8,-12,11,-9);g.fillStyle='#ffffff';for(let i=0;i<12;i+=3){const a=i/12*TAU;dot(g,Math.cos(a)*8.6,1+Math.sin(a)*8.6,1)}},
  sunadokei(g,c){hglass(g,0,0,1);g.fillStyle=c;dot(g,0,2.5,.9)},
  kohaku(g,c){poly(g,[0,-13,10,-6,9,8,-5,12,-11,1,-7,-9]);g.fill();g.fillStyle='#ffffff60';poly(g,[-6,-8,-1,-11,-4,-3]);g.fill();g.fillStyle=DARK;g.beginPath();g.ellipse(0,2,2.2,3.6,.4,0,TAU);g.fill();g.strokeStyle=DARK;g.lineWidth=1;line(g,-4,-2,4,6);line(g,4,-1,-4,5)},
  chisou(g,c){for(let i=0;i<4;i++){g.fillStyle=rgba(c,1-i*.18);rr(g,-13,-12+i*6.4,26,5.6,1.2);g.fill()}g.strokeStyle='#fff3cf';g.lineWidth=1.2;g.beginPath();g.arc(4,-3,2.4,0,TAU*.8);g.stroke()},
  shinshoku(g,c){poly(g,[-13,-12,-1,-12,-4,-5,1,1,-3,7,0,12,-13,12]);g.fill();g.strokeStyle='#8ad0ff';g.lineWidth=2.4;g.beginPath();g.moveTo(13,-13);g.quadraticCurveTo(3,-2,6,4);g.quadraticCurveTo(9,9,5,13);g.stroke();g.fillStyle=DARK;dot(g,-6,-2,1.6)},
  tokeitou(g,c){poly(g,[-7,14,7,14,7,-4,0,-14,-7,-4]);g.fill();g.fillStyle=DARK;dot(g,0,0,4.6);g.fillRect(-2,8,4,6);g.strokeStyle=c;g.lineWidth=1.3;line(g,0,0,0,-3.2);line(g,0,0,2.6,1.2)},
  kaichu(g,c){clk(g,0,3,9.5,-1.3,.3);g.lineWidth=2;g.beginPath();g.arc(0,-9.5,2.7,0,TAU);g.stroke();g.lineWidth=1.2;line(g,2,-12,7,-14);g.fillStyle='#7af0e8';dot(g,0,3,1.6)},
  zanzou(g,c){for(const[x,a]of[[-8,.25],[-3,.55],[3,1]]){g.globalAlpha=a;dot(g,x,0,6.5)}g.globalAlpha=1;g.fillStyle='#ffffff';dot(g,4.5,-2,1.6)},
  gyakkou(g,c){clk(g,0,0,7.5,-2.4,1.1);g.lineWidth=2;arc(g,0,0,12.5,-.4,2.4);arc(g,0,0,12.5,2.74,5.5);poly(g,[11.6,-4.6,7.4,-7.8,13.6,-9]);g.fill();poly(g,[-11.6,4.6,-7.4,7.8,-13.6,9]);g.fill()},
  oodokei(g,c){clk(g,0,0,12.5,-1.57,.1);for(let i=0;i<12;i++){const a=i/12*TAU;dot(g,Math.cos(a)*9.6,Math.sin(a)*9.6,i%3?.8:1.4)}},
  ancient(g,c){poly(g,[-13,12,-6,-5,-1,2,5,-11,13,12]);g.fill();g.strokeStyle=DARK;g.save();g.translate(3,5);g.scale(.42,.42);swirl(g,30,.4,1,3);g.restore();g.fillStyle='#ffffff55';poly(g,[5,-11,2.6,-6.5,5,-7,7.4,-6]);g.fill()},
  jikuu(g,c){for(let i=0;i<3;i++){g.lineWidth=1.6;g.beginPath();g.ellipse(0,0,13-i*3.2,4.5+i*1.6,i*.7-.4,0,TAU);g.stroke()}g.fillStyle='#ffffff';dot(g,0,0,2.4)},
  sekka(g,c){g.fillStyle=rgba(c,.9);dot(g,0,-6,5.5);poly(g,[-9,12,-7,0,7,0,9,12]);g.fill();g.strokeStyle=DARK;g.lineWidth=1.3;line(g,-2,-11,1,-6,-1,-2,3,4,1,11);line(g,-7,6,-3,8);g.fillStyle='#ffffff55';dot(g,-2,-8,1.6)},
  iseki(g,c){g.fillRect(-13,9,26,4);g.fillRect(-11,-5,5,14);poly(g,[5,9,10,9,10,-2,7,-4,5,0]);g.fill();g.fillRect(-13,-9,12,3.4);g.fillStyle=DARK;g.fillRect(-9,-1,1.2,8);g.fillRect(7,2,1.2,6)},
  chronos(g,c){clk(g,0,0,8.5,-1,1.2);g.lineWidth=1.6;arc(g,0,0,12.8,0,TAU);g.fillStyle='#fff6c0';for(let i=0;i<4;i++){const a=i/4*TAU-TAU/4;spark(g,Math.cos(a)*12.8,Math.sin(a)*12.8,3.6)}},
  doomsday(g,c){g.fillStyle=rgba('#ff4a5a',.85);g.beginPath();g.moveTo(0,1);g.arc(0,1,12,-1.57,-1.02);g.closePath();g.fill();g.fillStyle=c;clk(g,0,1,12,-1.62,-1.72);for(let i=0;i<12;i++){const a=i/12*TAU;dot(g,Math.cos(a)*9.4,1+Math.sin(a)*9.4,.8)}},
  dream(g,c){moon(g,-1,1,10);g.strokeStyle=c;zz(g,6,-13,1)},
  gentou(g,c){rr(g,-8,-8,16,19,3);g.stroke();g.fillStyle=rgba(c,.45);rr(g,-6,-6,12,15,2);g.fill();g.fillStyle='#fff';spark(g,0,1.5,5);g.lineWidth=1.6;line(g,0,-8,0,-13);line(g,-4,-13,4,-13)},
  nemurigusa(g,c){g.lineWidth=1.6;line(g,0,13,0,-11);for(const y of[-8,-2,4])for(const sx of[-1,1]){g.beginPath();g.ellipse(sx*4.5,y+2,4.2,1.8,sx*.5,0,TAU);g.fill()}g.strokeStyle='#ffffffb0';zz(g,6,-14,.7)},
  hakuchumu(g,c){g.fillStyle='#fff6c0';dot(g,-3,-3,6);g.strokeStyle='#fff6c0';g.lineWidth=1.4;for(let i=0;i<8;i++){const a=i/8*TAU;line(g,-3+Math.cos(a)*8,-3+Math.sin(a)*8,-3+Math.cos(a)*11,-3+Math.sin(a)*11)}g.fillStyle=c;cloud(g,7)},
  muma(g,c){poly(g,[-14,-7,-7,-2,-3,-11,0,-6,3,-11,7,-2,14,-7,11,7,0,3,-11,7]);g.fill();g.fillStyle='#ff6a9a';dot(g,-3,-2,1.6);dot(g,3,-2,1.6);g.strokeStyle=c;zz(g,-2,8,.8)},
  yochimu(g,c){eye(g,13,11);g.fillStyle='#fff6c0';spark(g,9,-10,3.4)},
  maboroshi(g,c){g.strokeStyle=c;swirl(g,48,.3,1.5,2);g.fillStyle='#ffffff';dot(g,8,-8,1.4);dot(g,-9,7,1.2);dot(g,-7,-9,1)},
  poppy(g,c){g.lineWidth=1.6;g.strokeStyle='#8ad86a';line(g,0,13,1,3);for(let i=0;i<5;i++){const a=i/5*TAU-TAU/4;dot(g,Math.cos(a)*5.5,-3+Math.sin(a)*5.5,5)}g.fillStyle=DARK;dot(g,0,-3,3);g.fillStyle='#ffffff90';dot(g,0,-3,1)},
  kanashibari(g,c){dot(g,-8,5,3.8);rr(g,-4,2,17,6,2.5);g.fill();g.strokeStyle='#e6f9ff';g.lineWidth=1.5;for(const x of[-9,-2,5,11])line(g,x,-12,x,12);g.fillStyle=c;zz(g,-6,-11,.7)},
  kagee(g,c){g.fillStyle=rgba('#fff6c0',.35);dot(g,0,0,13);g.fillStyle=c;poly(g,[-12,11,-6,-3,-8,-13,-2,-6,4,-13,4,-3,12,2,4,6,0,11]);g.fill();g.fillStyle='#fff6c0';dot(g,1,-2,1.3)},
  genshi(g,c){eye(g,12,9);g.strokeStyle=c;g.lineWidth=1.3;for(const a of[-2.2,-1.57,-.94])line(g,Math.cos(a)*9,Math.sin(a)*9,Math.cos(a)*14,Math.sin(a)*14)},
  muyuu(g,c){moon(g,6,-6,6.5);for(const[x,y,r]of[[-9,10,2.6],[-4,6,2.2],[-9,2,2],[-4,-2,1.7]])dot(g,x,y,r);g.strokeStyle=c;g.lineWidth=1.6;arc(g,-2,4,11,1.2,2.6)},
  senrigan(g,c){eye(g,9,8);g.strokeStyle=c;g.lineWidth=1.4;arc(g,0,0,11,-.6,.6);arc(g,0,0,13.5,-.5,.5);arc(g,0,0,11,2.54,3.74);arc(g,0,0,13.5,2.64,3.64)},
  mugenyume(g,c){moon(g,0,1,11);g.fillStyle='#ffffff';spark(g,-7,-9,3.4);spark(g,9,8,3);spark(g,10,-6,2)},
  nemurinomori(g,c){for(const[x,s]of[[-7,1],[2,1.2],[10,.8]]){g.fillStyle=c;poly(g,[x-6*s,10,x,10-18*s,x+6*s,10]);g.fill()}g.fillRect(-13,10,26,3);g.fillStyle='#fff6c0';moon(g,-8,-9,4)},
  shintaku(g,c){g.lineWidth=2;poly(g,[0,-13,13,11,-13,11]);g.stroke();g.save();g.translate(0,3);g.scale(.55,.55);eye(g,12,10);g.restore();g.fillStyle='#fff6c0';spark(g,0,-13,3)},
  hypnos(g,c){g.fillStyle=rgba(c,.6);g.beginPath();g.ellipse(-8,0,7,4,-.5,0,TAU);g.fill();g.beginPath();g.ellipse(8,0,7,4,.5,0,TAU);g.fill();g.fillStyle=c;moon(g,0,2,7.5);g.strokeStyle='#ffffff';zz(g,4,-13,.8)},
  morpheus(g,c){g.strokeStyle=c;swirl(g,40,.32,3,1.8);g.fillStyle=c;moon(g,0,0,5.5);g.fillStyle='#ffffff';spark(g,10,-10,3)},
  slumber(g,c){moon(g,-2,2,11.5);g.fillStyle='#fff6c0';spark(g,9,-9,3.4);spark(g,11,6,2.4);dot(g,-10,-10,1.2);g.strokeStyle='#ffffff';zz(g,3,-4,.9)},
});
// 魂・無の元素のアイコンで使う部品（魂の形・おばけ・羽・光の輪・ハート・角）
const soulS=(g,x,y,s)=>{g.beginPath();g.moveTo(x+7.5*s,y+3*s);g.arc(x,y+3*s,7.5*s,0,Math.PI);g.bezierCurveTo(x-7.5*s,y-4*s,x-9*s,y-9*s,x-6*s,y-14*s);g.bezierCurveTo(x-3*s,y-7*s,x+7.5*s,y-6*s,x+7.5*s,y+3*s);g.fill()};
const ghost=(g,x,y,s)=>{g.beginPath();g.moveTo(x-9*s,y+12*s);g.lineTo(x-9*s,y-3*s);g.arc(x,y-3*s,9*s,Math.PI,0);g.lineTo(x+9*s,y+12*s);for(let i=1;i<=6;i++)g.lineTo(x+9*s-i*3*s,y+(i%2?9:12)*s);g.closePath();g.fill()};
const wing=(g,x,y,s,dir)=>{g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+dir*10*s,y-12*s,x+dir*14*s,y-8*s);g.quadraticCurveTo(x+dir*11*s,y-4*s,x+dir*12*s,y-1*s);g.quadraticCurveTo(x+dir*8*s,y,x+dir*9*s,y+3*s);g.quadraticCurveTo(x+dir*5*s,y+3*s,x,y);g.fill()};
const halo=(g,x,y,w)=>{const l=g.lineWidth;g.lineWidth=1.8;g.beginPath();g.ellipse(x,y,w,w*.32,0,0,TAU);g.stroke();g.lineWidth=l};
const heart=(g,x,y,s)=>{g.beginPath();g.moveTo(x,y+7*s);g.bezierCurveTo(x-9*s,y+1*s,x-8*s,y-7*s,x-3.5*s,y-7*s);g.bezierCurveTo(x-1.5*s,y-7*s,x,y-5*s,x,y-3.5*s);g.bezierCurveTo(x,y-5*s,x+1.5*s,y-7*s,x+3.5*s,y-7*s);g.bezierCurveTo(x+8*s,y-7*s,x+9*s,y+1*s,x,y+7*s);g.fill()};
const horns=(g,x,y,s)=>{poly(g,[x-6*s,y-2*s,x-11*s,y-13*s,x-2*s,y-6*s]);g.fill();poly(g,[x+6*s,y-2*s,x+11*s,y-13*s,x+2*s,y-6*s]);g.fill()};
const batW=(g,x,y,s,dir)=>{poly(g,[x,y,x+dir*6*s,y-6*s,x+dir*13*s,y-4*s,x+dir*11*s,y+1*s,x+dir*8*s,y-1*s,x+dir*6*s,y+3*s]);g.fill()};
Object.assign(ICON,{
  setsuna(g,c){clk(g,4,0,8.5,-1.57,-.9);g.lineWidth=1.8;for(const[y,l]of[[-5,9],[0,12],[5,9]])line(g,-14,y,-14+l,y);g.fillStyle='#ffffff';spark(g,10,-9,3)},
  yuukyuu(g,c){g.lineWidth=2.6;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(5,-8,13,-8,13,0);g.bezierCurveTo(13,8,5,8,0,0);g.bezierCurveTo(-5,-8,-13,-8,-13,0);g.bezierCurveTo(-13,8,-5,8,0,0);g.stroke();g.fillStyle='#ffffff';spark(g,0,-11,2.6)},
  nendo(g,c){g.beginPath();g.moveTo(-12,10);g.bezierCurveTo(-14,0,-8,-10,0,-9);g.bezierCurveTo(9,-10,14,-1,12,10);g.closePath();g.fill();g.strokeStyle='#00000055';g.lineWidth=1.2;for(const r of[2.5,5,7.5]){g.beginPath();g.arc(2,2,r,-2.6,.4);g.stroke()}},
  yumenokuni(g,c){g.fillStyle='#ffffffb0';cloud(g,8);g.fillStyle=c;g.fillRect(-7,-2,14,9);poly(g,[-9,-2,-6,-10,-3,-2]);g.fill();poly(g,[3,-2,6,-10,9,-2]);g.fill();poly(g,[-3,-2,0,-13,3,-2]);g.fill();g.fillStyle=DARK;g.fillRect(-1.5,2,3,5);g.fillStyle='#fff6c0';moon(g,-11,-11,3.5)},
  soul(g,c){soulS(g,0,0,1);g.fillStyle='#ffffffb0';dot(g,-2,4,2.8)},
  hitodama(g,c){soulS(g,1,0,1);g.fillStyle='#ffffffc0';soulS(g,1,3,.5);g.strokeStyle=c;g.lineWidth=1.4;g.globalAlpha=.6;arc(g,1,3,11.5,.3,2.8);g.globalAlpha=1},
  reikon(g,c){soulS(g,-6,4,.62);soulS(g,6,4,.62);soulS(g,0,-3,.72);g.fillStyle='#ffffffb0';dot(g,0,0,1.6)},
  yuurei(g,c){g.globalAlpha=.85;ghost(g,0,0,1);g.globalAlpha=1;g.fillStyle=DARK;dot(g,-3.4,-3,1.8);dot(g,3.4,-3,1.8);g.beginPath();g.ellipse(0,3,2,2.6,0,0,TAU);g.fill()},
  kinosei(g,c){g.beginPath();g.ellipse(0,1,8,12.5,.45,0,TAU);g.fill();g.strokeStyle=DARK;g.lineWidth=1.2;line(g,-5,10,5,-9);g.fillStyle='#ffffff';dot(g,-2.5,-1,1.6);dot(g,2.5,1.5,1.6)},
  shugorei(g,c){g.lineWidth=2;poly(g,[-11,-11,11,-11,11,1,0,13,-11,1]);g.stroke();g.fillStyle=c;soulS(g,0,0,.62)},
  akuryo(g,c){ghost(g,0,1,1);horns(g,0,-6,.6);g.fillStyle='#ff4a6a';poly(g,[-6,-4,-1.5,-2,-5,-1]);g.fill();poly(g,[6,-4,1.5,-2,5,-1]);g.fill();g.fillStyle=DARK;poly(g,[-4,4,4,4,0,7]);g.fill()},
  yousei(g,c){g.globalAlpha=.55;for(const[dx,dy,a]of[[-1,-1,-.6],[1,-1,.6]]){g.beginPath();g.ellipse(dx*6,dy*4,6,3.4,a,0,TAU);g.fill();g.beginPath();g.ellipse(dx*5,5,4,2.4,-a,0,TAU);g.fill()}g.globalAlpha=1;dot(g,0,-8,3);g.beginPath();g.ellipse(0,2,2.4,7,0,0,TAU);g.fill();g.fillStyle='#ffffff';spark(g,10,-11,2.6);spark(g,-11,10,2)},
  tenshi(g,c){g.globalAlpha=.8;wing(g,-2,2,.95,-1);wing(g,2,2,.95,1);g.globalAlpha=1;dot(g,0,-4,4);poly(g,[-4,13,4,13,2,0,-2,0]);g.fill();g.strokeStyle='#fff2a0';halo(g,0,-11,5.5)},
  shinrei(g,c){g.fillStyle=rgba(c,.3);dot(g,0,0,13.5);g.fillStyle=c;soulS(g,0,1,1.05);g.strokeStyle='#fff2a0';halo(g,-1,-12.5,5);g.fillStyle='#ffffff';spark(g,9,-6,3)},
  zombie(g,c){g.fillStyle='#7a6450';g.fillRect(-13,9,26,4);g.fillStyle=c;g.fillRect(-2.5,-2,6,12);g.fillRect(-4.5,-6,10,6);for(const[x,h]of[[-4.5,6],[-2,8],[.6,8.5],[3.2,7]])g.fillRect(x,-6-h,2.2,h);g.fillRect(5.5,-6,2.4,4);g.fillStyle='#7a6450';dot(g,-8,9,2.5);dot(g,8,9,3)},
  daitenshi(g,c){g.globalAlpha=.75;wing(g,-2,-1,1.05,-1);wing(g,2,-1,1.05,1);g.globalAlpha=.5;wing(g,-2,6,.8,-1);wing(g,2,6,.8,1);g.globalAlpha=1;dot(g,0,-4,4.2);poly(g,[-4.5,13,4.5,13,2,0,-2,0]);g.fill();g.strokeStyle='#ffe070';halo(g,0,-11.5,6.5)},
  youseinowa(g,c){for(let i=0;i<7;i++){const a=i/7*TAU,x=Math.cos(a)*10.5,y=Math.sin(a)*6+2;g.fillStyle='#f0e8d8';g.fillRect(x-.9,y,1.8,3.4);g.fillStyle=c;g.beginPath();g.arc(x,y,3,Math.PI,0);g.fill()}g.fillStyle='#ffffff';spark(g,0,1,4)},
  akuma(g,c){horns(g,0,0,1);dot(g,0,2,9);g.fillStyle='#ffd04a';poly(g,[-6.5,-1,-1.5,1,-6,2.5]);g.fill();poly(g,[6.5,-1,1.5,1,6,2.5]);g.fill();g.fillStyle=DARK;poly(g,[-4.5,6,4.5,6,3,8.5,0,7.4,-3,8.5]);g.fill()},
  succubus(g,c){batW(g,-4,-1,1,-1);batW(g,4,-1,1,1);heart(g,0,1,1.1);g.fillStyle='#ffffffb0';dot(g,-3,-3,1.6);g.strokeStyle=c;g.lineWidth=1.5;g.beginPath();g.moveTo(0,9);g.quadraticCurveTo(5,13,9,11);g.stroke();poly(g,[9,9,12,11,9,13]);g.fill()},
  seraphim(g,c){g.globalAlpha=.65;for(const[y,s]of[[-6,.9],[1,1],[8,.8]]){wing(g,-2,y,s,-1);wing(g,2,y,s,1)}g.globalAlpha=1;g.fillStyle='#ff9a3a';g.save();g.translate(0,1);g.scale(.42,.48);flame(g);g.fill();g.restore();g.fillStyle='#ffffff';dot(g,0,3,1.8)},
  maou(g,c){horns(g,0,1,1.1);dot(g,0,3,8.5);g.fillStyle='#ffd04a';poly(g,[-7,-5,-7,-11,-3.5,-7,0,-12,3.5,-7,7,-11,7,-5]);g.fill();g.fillStyle='#ff2a3a';dot(g,-3.4,2.5,1.7);dot(g,3.4,2.5,1.7);g.fillStyle=DARK;g.fillRect(-3.5,7,7,1.6)},
  datenshi(g,c){g.fillStyle='#3a3050';wing(g,-2,1,1,-1);wing(g,2,1,1,1);g.fillStyle=c;dot(g,0,-4,4);poly(g,[-4,13,4,13,2,0,-2,0]);g.fill();g.strokeStyle='#8a80a0';g.lineWidth=1.8;g.beginPath();g.ellipse(0,-11,5.5,1.8,0,.4,2.6);g.stroke();g.beginPath();g.ellipse(0,-11,5.5,1.8,0,3.4,5.6);g.stroke();g.fillStyle='#3a3050';g.beginPath();g.ellipse(-10,12,1.6,3,.6,0,TAU);g.fill()},
  lilith(g,c){g.fillStyle='#fff6c0';moon(g,6,-7,6);g.fillStyle=c;batW(g,-5,2,.9,-1);heart(g,-2,4,1);g.fillStyle='#ffffff';spark(g,-9,-9,2.6)},
  lucifer(g,c){g.fillStyle='#fff6e0';wing(g,-2,1,1.05,-1);g.fillStyle='#3a3050';wing(g,2,1,1.05,1);g.fillStyle='#ffffff';spark(g,0,0,9);g.fillStyle=c;dot(g,0,0,2.4)},
  void(g,c){g.lineWidth=2.4;g.beginPath();g.arc(0,0,11,0,TAU);g.stroke();g.fillStyle=DARK;dot(g,0,0,8.5);g.save();g.setLineDash([2,3]);g.lineWidth=1.3;g.beginPath();g.arc(0,0,5,0,TAU);g.stroke();g.restore()},
  shinkuu(g,c){g.save();g.setLineDash([3,3]);g.lineWidth=1.6;g.beginPath();g.arc(0,0,12,0,TAU);g.stroke();g.restore();for(let i=0;i<4;i++){const a=i/4*TAU+TAU/8,x=Math.cos(a),y=Math.sin(a);poly(g,[x*9,y*9,x*4-y*2.6,y*4+x*2.6,x*4+y*2.6,y*4-x*2.6]);g.fill()}},
  seijaku(g,c){note(g,-3,7,.85);g.strokeStyle='#ff8a9a';g.lineWidth=2.4;line(g,-12,-12,12,12)},
  kanbatsu(g,c){poly(g,[-13,13,-13,1,13,1,13,13]);g.fill();g.strokeStyle=DARK;g.lineWidth=1.3;line(g,-9,1,-6,6,-9,10);line(g,-6,6,-1,8,1,13);line(g,4,1,6,6,11,8);line(g,6,6,4,11);g.fillStyle='#ffb040';dot(g,5,-8,4.5)},
  ana(g,c){g.fillStyle=rgba(c,.55);g.beginPath();g.ellipse(0,3,14,8,0,0,TAU);g.fill();g.fillStyle=DARK;g.beginPath();g.ellipse(0,4,10,5.5,0,0,TAU);g.fill()},
  nukegara(g,c){g.save();g.setLineDash([3,2.4]);g.lineWidth=1.8;g.beginPath();g.moveTo(-9,12);g.lineTo(-9,-3);g.arc(0,-3,9,Math.PI,0);g.lineTo(9,12);for(let i=1;i<=6;i++)g.lineTo(9-i*3,(i%2?9:12));g.closePath();g.stroke();g.restore();g.strokeStyle=c;g.lineWidth=1.4;line(g,-4,-5,-2,-3);line(g,4,-5,2,-3)},
  kuukyo(g,c){g.save();g.lineWidth=1.8;g.setLineDash([3,3]);g.beginPath();g.arc(0,0,12,0,TAU);g.stroke();g.setLineDash([2,3]);g.beginPath();g.arc(0,0,7,0,TAU);g.stroke();g.restore();dot(g,0,0,1.4)},
  shinkuuha(g,c){g.beginPath();g.arc(-2,0,12,-1.2,1.2);g.arc(-7,0,10,1.1,-1.1,true);g.closePath();g.fill();g.strokeStyle=c;g.lineWidth=1.4;g.globalAlpha=.6;for(const y of[-6,0,6])line(g,-14,y,-8,y);g.globalAlpha=1},
  doukutsu(g,c){poly(g,[-14,13,-8,-6,-2,-11,6,-8,14,13]);g.fill();g.fillStyle=DARK;g.beginPath();g.moveTo(-6,13);g.lineTo(-6,4);g.quadraticCurveTo(0,-5,6,4);g.lineTo(6,13);g.closePath();g.fill()},
  kouya(g,c){g.fillRect(-14,7,28,6);g.strokeStyle=DARK;g.lineWidth=1.2;line(g,-10,7,-8,11);line(g,3,7,5,12,8,10);g.strokeStyle=c;g.lineWidth=1.8;line(g,-3,7,-3,-7);line(g,-3,-1,-8,-6);line(g,-3,-4,2,-10);line(g,-8,-6,-10,-5);g.lineWidth=1.4;g.beginPath();g.arc(8,1,4,0,TAU);g.stroke()},
  mummy(g,c){rr(g,-9,-12,18,24,8);g.fill();g.strokeStyle='#00000055';g.lineWidth=1.3;for(const y of[-8,-3,3,8])line(g,-9,y,9,y+2.5);g.fillStyle=DARK;g.fillRect(-7,-3,14,4);g.fillStyle='#ffe070';dot(g,-3,-1,1.4);dot(g,3,-1,1.4)},
  kyomu(g,c){g.fillStyle=DARK;dot(g,0,0,11);g.strokeStyle=c;g.lineWidth=1.8;g.beginPath();g.arc(0,0,11,0,TAU);g.stroke();g.fillStyle=c;for(let i=0;i<8;i++){const a=i/8*TAU;dot(g,Math.cos(a)*13.5,Math.sin(a)*13.5,i%2?.8:1.3)}},
  kokuu(g,c){g.fillStyle=DARK;dot(g,0,0,13);g.strokeStyle=c;swirl(g,40,.32,2,1.6);g.fillStyle='#ffffff';dot(g,8,-8,1);dot(g,-9,6,.8);dot(g,-5,-10,.7)},
  blackhole(g,c){g.lineWidth=2.4;g.beginPath();g.ellipse(0,0,14,5,-.35,0,TAU);g.stroke();g.fillStyle=DARK;dot(g,0,0,7.5);g.strokeStyle='#ffd0a0';g.lineWidth=1.4;g.beginPath();g.arc(0,0,7.8,0,TAU);g.stroke();g.strokeStyle=c;g.lineWidth=2.4;g.beginPath();g.ellipse(0,0,14,5,-.35,Math.PI*1.05,Math.PI*1.95);g.stroke()},
});
const wardIcon=f=>(g,c)=>{g.save();g.setLineDash([3.2,2.6]);g.lineWidth=1.7;g.beginPath();g.arc(0,0,15.5,0,TAU);g.stroke();g.restore();g.save();g.scale(.6,.6);ICON[ELEM[f].icon](g,c);g.restore()};
for(const k in ITEMS)if(ITEMS[k].amp)ICON[k]=wardIcon(ITEMS[k].amp);
ICON.kaname=(g,c)=>{g.beginPath();g.ellipse(0,3,13,10.5,0,0,TAU);g.fill();g.fillStyle='#00000055';g.beginPath();g.ellipse(4,7,7,4.5,0,0,TAU);g.fill(); // 要石：注連縄を巻いた丸い石
  g.strokeStyle='#fffbe8';g.lineWidth=2.4;g.beginPath();g.moveTo(-12.5,-1);g.quadraticCurveTo(0,4.5,12.5,-1);g.stroke();g.lineWidth=1.6;for(const x of[-5,0,5]){g.beginPath();g.moveTo(x,2.6);g.lineTo(x,8.5);g.stroke()}};
function orb(id,named){
  const key=named?id+'@':id;
  let c=orbCache.get(key);if(c)return c;
  const d=ITEMS[id],R=40,k=3;c=document.createElement('canvas');c.width=c.height=R*2*k;
  const g=c.getContext('2d');g.scale(k,k);g.translate(R,R);
  if(named){ // 名前は玉の下に小さく
    g.font=FONT(LANG==='ja'?12:11,800);g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
    g.lineWidth=3;g.strokeStyle='#05040a';g.strokeText(nm(d),0,27.5);g.fillStyle='#ece7f7';g.fillText(nm(d),0,27.5);
    g.translate(0,-6);g.scale(.86,.86);
  }
  let gr=g.createRadialGradient(0,0,14,0,0,38);gr.addColorStop(0,rgba(d.c,.3+d.t*.05));gr.addColorStop(1,rgba(d.c,0));
  g.fillStyle=gr;g.fillRect(-R,-R,R*2,R*2);
  gr=g.createRadialGradient(-6,-8,2,0,0,25);gr.addColorStop(0,'#2a2444');gr.addColorStop(1,'#07060d');
  g.fillStyle=gr;g.beginPath();g.arc(0,0,24,0,TAU);g.fill();
  // 質感：元素色の芯、左上のつや、下からの反射光
  gr=g.createRadialGradient(-4,-5,1,0,0,23);gr.addColorStop(0,rgba(d.c,.38));gr.addColorStop(.55,rgba(d.c,.13));gr.addColorStop(1,rgba(d.c,0));
  g.fillStyle=gr;g.beginPath();g.arc(0,0,24,0,TAU);g.fill();
  g.save();g.beginPath();g.arc(0,0,23,0,TAU);g.clip();
  gr=g.createRadialGradient(-9,-13,0,-9,-13,15);gr.addColorStop(0,'rgba(255,255,255,.34)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr;g.fillRect(-24,-24,48,48);
  g.strokeStyle=rgba(d.c,.4);g.lineWidth=5;g.beginPath();g.arc(0,0,21.5,Math.PI*.25,Math.PI*.75);g.stroke();
  g.restore();
  g.strokeStyle=d.c;g.lineWidth=2;g.stroke();
  g.lineWidth=1;g.globalAlpha=.55;
  if(d.t>=2){g.beginPath();g.arc(0,0,20,0,TAU);g.stroke()}
  if(d.t>=3){for(let i=0;i<6;i++){const a=i/6*TAU;g.beginPath();g.moveTo(Math.cos(a)*20,Math.sin(a)*20);g.lineTo(Math.cos(a)*24,Math.sin(a)*24);g.stroke()}}
  if(d.t>=4){for(let j=0;j<2;j++){g.beginPath();for(let i=0;i<4;i++){const a=i/4*TAU+j*TAU/8;g[i?'lineTo':'moveTo'](Math.cos(a)*27,Math.sin(a)*27)}g.closePath();g.stroke()}}
  if(d.t>=5){g.strokeStyle='#ffe9a0';g.globalAlpha=.9;g.beginPath();g.arc(0,0,29,0,TAU);g.stroke();
    for(let i=0;i<12;i++){const a=i/12*TAU;g.beginPath();g.moveTo(Math.cos(a)*30,Math.sin(a)*30);g.lineTo(Math.cos(a)*(i%2?34:38),Math.sin(a)*(i%2?34:38));g.stroke()}}
  g.globalAlpha=1;g.lineWidth=2;g.lineJoin='round';g.lineCap='round';g.strokeStyle=d.c;g.fillStyle=d.c;
  g.shadowColor=d.c;g.shadowBlur=7;g.scale(1.08,1.08);
  ICON[id](g,d.c);
  orbCache.set(key,c);return c;
}
if(document.fonts&&document.fonts.load){
  document.fonts.load('800 25px "Shippori Mincho"',Object.values(ITEMS).map(d=>d.name).join('')+'第波アルケマージ・ディフェンス').then(()=>{orbCache=new Map();bgCanvas=null}).catch(()=>{});
}
function drawItem(it,x,y,sc=1,alpha=1){
  const d=ITEMS[it.id],s=sc*it.s*(1+it.kick*.14);
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x+(it.shake>0?Math.sin(it.shake*60)*it.shake*14:0),y);
  ctx.scale(s*(1+it.kick*.05),s*(1-it.kick*.05));
  ctx.drawImage(orb(it.id,true),-40,-40,80,80);
  for(let i=0;i<d.t;i++){ // ランクを★の数で（◆は魔力の記号なので使わない）
    const px=(i-(d.t-1)/2)*(d.t>4?8:9.5),py=14.5,star=(R,r)=>{ctx.beginPath();for(let j=0;j<10;j++){const a=j/10*TAU-TAU/4,q=j%2?r:R;ctx.lineTo(px+Math.cos(a)*q,py+Math.sin(a)*q)}ctx.closePath();ctx.fill()};
    ctx.fillStyle='#07060d';star(6.6,3.6);ctx.fillStyle=d.t>=5?'#fff1b8':'#e8c36a';star(4.8,2.1);
  }
  if(it.lv>0){ // 強化の段（+n）を右上に
    ctx.font=FONT(13,800);ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=4;ctx.strokeStyle='#07060d';
    ctx.strokeText('+'+it.lv,19,-19);ctx.fillStyle='#ffe9a0';ctx.fillText('+'+it.lv,19,-19);
  }
  ctx.restore();
}
