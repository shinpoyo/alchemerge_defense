'use strict';
// 土台：画面の大きさ・よく使う小さな関数（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ============================================================
   アルケマージ・ディフェンス（Alchemerge Defense） — マージ×タワーディフェンス
   画面は 450×800 の論理座標で描き、表示サイズに合わせて拡大する
   ============================================================ */
const W=450,TAU=Math.PI*2,H_MIN=800,H_MAX=940;
let H=800; // 縦に長い端末では H を伸ばし、下の操作部（作業台・タブ・一覧・ボタン）を大きくする
var ready=false;
const $=s=>document.querySelector(s);
const cv=$('#c'),ctx=cv.getContext('2d');
const rnd=(a=1,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const pick=a=>a[Math.random()*a.length|0];
const FS={f1:12.5,f2:14,f3:18,f4:22,f5:30}; // 文字の大きさの段階（HTML の --f1〜--f5 と同じ値）
const FONT=(px,w=700)=>`${w} ${px}px "Shippori Mincho","Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP","Noto Serif JP",serif`;
const rgba=(hex,a)=>{const n=parseInt(hex.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`};
let SC=1;
function resize(){
  const st=$('#stage'),vw=window.innerWidth,vh=window.innerHeight,dpr=Math.min(window.devicePixelRatio||1,2);
  const w=Math.min(vw,vh*W/H_MIN),h=Math.min(vh,w*H_MAX/W);
  st.style.width=w+'px';st.style.height=h+'px';H=W*h/w;
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);SC=cv.width/W;
  st.style.setProperty('--u',w/W+'px');
  if(ready)layout();
}
addEventListener('resize',resize);resize();
