'use strict';
// 入力（タッチ・マウス）（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 入力 ---------------- */
let drag=null,sel=null,pressed=null,strip=null,ptr={x:0,y:0},lpT=null,INFO_R=null,ENH_R=null,ENH_R0p=0,EARLY_R=null;
const LONG_MS=480; // これだけ押し続けると詳細を開く
const lpClear=()=>{if(lpT){clearTimeout(lpT);lpT=null}};
function pos(ev){const r=cv.getBoundingClientRect();return{x:(ev.clientX-r.left)/r.width*W,y:(ev.clientY-r.top)/r.height*H}}
const slotAt=(x,y,need)=>{let b=null,bd=40*40;for(const s of slots){if(need&&!s.item)continue;const q=(s.x-x)**2+(s.y-y)**2;if(q<bd){bd=q;b=s}}return b};
const inBtn=(b,x,y)=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h;
// 2 本目以降の指は無視する（1 本目でつまんでいる間に別の元素へ触れると、先の元素が「つまんだまま」になって攻撃しなくなるため）
const extraPtr=ev=>!!ev&&ev.isPrimary===false;
cv.addEventListener('pointerdown',ev=>{
  audio();if(extraPtr(ev))return;
  const p=pos(ev);ptr=p;
  try{cv.setPointerCapture(ev.pointerId)}catch(e){}
  if(S.over||(S.cleared&&!S.endless))return;
  if(S.kingIntro){if(S.kingIntro.t>=.45)S.kingIntro.t=Math.max(S.kingIntro.t,S.kingIntro.dur-.3);return}
  if(S.banner&&S.banner.t>.4){S.banner.t=Math.max(S.banner.t,S.banner.dur-.25)}
  ring(p.x,p.y,'#8b5cf6',18,.3,1.5,2);
  if(EARLY_R&&canEarlyCall()&&inBtn(EARLY_R,p.x,p.y)){buzz(12);earlyCall();return}
  if(INFO_R&&sel&&sel.item&&inBtn(INFO_R,p.x,p.y)){buzz(12);openDetail(INFO_R.id,'game');return}
  if(ENH_R&&sel&&canEnh(sel.item)&&inBtn(ENH_R,p.x,p.y)){ENH_R0p=1;undoable(()=>enhance(sel));return}
  const tb=p.y>=TABS[0].y-3&&p.y<TABS[0].y+TABS[0].h+2&&TABS.find(t=>p.x>=t.x-3&&p.x<=t.x+t.w+3);
  if(tb){if(tb.t==='f'){sfx.ui();openFilter();return}sfx.ui();if(FLT.rank.size===1&&FLT.rank.has(tb.t))setRank([]);else{setRank([tb.t]);wsHint(tb.t)}return}
  if(inBtn(SHOP,p.x,p.y)){strip={sx:p.x,sy:p.y,s0:SHOP.scroll[SHOP.tab],moved:false,touch:ev.pointerType==='touch',i:Math.floor((p.x-SHOP.x+SHOP.scroll[SHOP.tab])/SHOP.pitch)};
    SHOP.press=strip.i;SHOP.pressT=1;
    lpClear();lpT=setTimeout(()=>{if(strip&&!strip.moved){const d=shopList(SHOP.tab)[strip.i];if(d&&!d.ws&&disc.has(d.id)){strip=null;SHOP.press=null;buzz(12);openDetail(d.id,'game')}}},LONG_MS);
    return}
  const b=buttons.find(b=>inBtn(b,p.x,p.y));
  if(b){pressed=b;b.p=1;return}
  const s=slotAt(p.x,p.y,true);
  if(s&&s.item.hide<=0){drag={slot:s,item:s.item,sx:p.x,sy:p.y,moved:false,touch:ev.pointerType==='touch'};s.item.held=true;s.item.sv=5;sfx.pick();buzz(5);
    lpClear();lpT=setTimeout(()=>{if(drag&&!drag.moved){const id=drag.item.id;drag.item.held=false;drag=null;sel=null;buzz(12);openDetail(id,'game')}},LONG_MS);
    return}
  if(sel){const t=slotAt(p.x,p.y),f=sel;undoable(()=>{if(t)dropOn(f,t);else if(nearCore(p.x,p.y))useRelic(f)});sel=null}
});
cv.addEventListener('pointermove',ev=>{
  if(extraPtr(ev))return;
  const p=pos(ev);ptr=p;
  if(strip){const dx=p.x-strip.sx,dy=p.y-strip.sy;
    // 縦に引いたら、その元素をつかむ（横に引いたら列を流す）。流せない列ならどちらへ引いてもつかむ。
    // 斜めに引いて列が流れはじめても、指が列の上へ出たらつかむ（列は指について動くので、押した元素が指の下にある）
    if(!strip.moved&&Math.hypot(dx,dy)>10&&(Math.abs(dy)>Math.abs(dx)*.6||shopMax(SHOP.tab)<1)||strip.moved&&p.y<SHOP.y-12){
      const d=shopList(SHOP.tab)[strip.i];
      if(d&&!d.ws&&canBuy(d.id)){const st=strip;strip=null;SHOP.press=null;lpClear();
        if(S.mana<itemValue(d)){S.manaErr=.5;sfx.fail();floatText(W-110,48,TT('noMana'),'#ff8a9a',FS.f1);return}
        const it=mkItem(d.id,p.x,p.y);it.held=true;it.sv=5;drag={shop:d.id,slot:{x:shopBtnX(st.i)+SHOP.bw/2,y:SHOP.y+SHOP.h/2,item:it},item:it,sx:p.x,sy:p.y,moved:true,touch:st.touch};sfx.pick();buzz(5);return}}}
  if(strip){const dx=p.x-strip.sx;if(Math.abs(dx)>8){strip.moved=true;SHOP.press=null;lpClear()}
    if(strip.moved)SHOP.scroll[SHOP.tab]=clamp(strip.s0-dx,0,shopMax(SHOP.tab))}
  if(drag&&!drag.moved&&Math.hypot(p.x-drag.sx,p.y-drag.sy)>9){drag.moved=true;sel=null;lpClear()}
});
function release(ev,cancel){
  lpClear();
  const p=ev?pos(ev):ptr;
  if(strip){const st=strip;strip=null;SHOP.press=null;
    if(cancel||st.moved)return;
    const d=shopList(SHOP.tab)[st.i];if(!d)return;
    const bx={x:shopBtnX(st.i),y:SHOP.y,w:SHOP.bw,h:SHOP.h};
    if(d.ws){undoable(()=>upgradeWs(d.ws,bx));return}
    if(disc.has(d.id)&&!canBuy(d.id)){sfx.fail();floatText(clamp(p.x,70,W-70),SHOP.y-10,TT('needMake',d.t),'#b9b1d0',FS.f1);return}
    if(!disc.has(d.id)){sfx.fail();floatText(clamp(p.x,70,W-70),SHOP.y-10,UNLOCK[d.id]!==undefined?TT('unlockAt',sn(STAGES[UNLOCK[d.id]])):TT('findFirst'),'#b9b1d0',FS.f1);return}
    sfx.ui();floatText(clamp(p.x,90,W-90),SHOP.y-10,TT('dragBuy'),'#cfc8e6',FS.f1);return} // 押しただけでは呼び出さない（つかんで運ぶ）
  if(pressed){const b=pressed;pressed=null;if(!cancel&&inBtn(b,p.x,p.y))press(b);return}
  if(!drag)return;
  const d=drag;drag=null;d.item.held=false;
  if(cancel)return;
  if(d.shop){const tb=btn('trash');if(inBtn(tb,p.x,p.y)){sfx.drop();return}undoable(()=>buyDrop(d.shop,p,d.touch));return} // 一覧からつかんだ元素
  if(!d.moved){ // タップ：選択の切りかえ、または選択中の元素をここへ
    if(sel&&sel!==d.slot){const f=sel;undoable(()=>dropOn(f,d.slot));sel=null}
    else sel=sel===d.slot?null:d.slot;
    return;
  }
  const tb=btn('trash');
  if(inBtn(tb,p.x,p.y)){undoable(()=>sell(d.slot));return}
  const ty=p.y-(d.touch?26:0);
  if(ITEMS[d.item.id].kind==='relic'&&!slotAt(p.x,ty)&&nearCore(p.x,ty)){undoable(()=>useRelic(d.slot));return}
  undoable(()=>dropOn(d.slot,slotAt(p.x,ty)));
}
cv.addEventListener('pointerup',ev=>{if(!extraPtr(ev))release(ev,false)});
cv.addEventListener('pointercancel',ev=>{if(!extraPtr(ev))release(null,true)});
document.addEventListener('contextmenu',e=>e.preventDefault()); // 長押しの画像メニューを出さない
cv.addEventListener('wheel',ev=>{const p=pos(ev);if(p.y>=TABS[0].y&&p.y<=SHOP.y+SHOP.h){ev.preventDefault();
  SHOP.scroll[SHOP.tab]=clamp(SHOP.scroll[SHOP.tab]+(Math.abs(ev.deltaX)>Math.abs(ev.deltaY)?ev.deltaX:ev.deltaY),0,shopMax(SHOP.tab))}},{passive:false});
addEventListener('keydown',e=>{
  if(S&&S.kingIntro&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();if(S.kingIntro.t>=.45)S.kingIntro.t=Math.max(S.kingIntro.t,S.kingIntro.dur-.3);return}
  if(e.code==='Space'&&!$('.ov.on')){e.preventDefault();startWave()}
  if(e.code==='KeyZ'&&(e.ctrlKey||e.metaKey)&&!$('.ov.on')&&S&&!drag){e.preventDefault();undo()}});
function press(b){
  if(b.id==='undo'){undo();return}
  if(b.id==='trash'){if(sel){const f=sel;undoable(()=>sell(f));sel=null}else floatText(b.x+b.w/2,b.y-8,TT('trashHint'),'#b9b1d0',FS.f1);return}
  if(b.id==='wave'){startWave();return}
  sfx.ui();
  if(b.id==='speed')S.speed=S.speed>=3?1:S.speed+1; // ×1 → ×2 → ×3 → ×1
  if(b.id==='menu'){openMenu();shownAt=performance.now()}
}
