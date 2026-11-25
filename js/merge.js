'use strict';
// 錬成・呼び出し・戻す（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 錬成 ---------------- */
function tryCombine(a,b){
  const r=RECIPE[rkey(a.id,b.id)];
  if(r)return rankOpen(ITEMS[r].t)?{id:r}:{fail:TT('rankWait')};
  return{fail:TT('noReact')}; // ★の数がちがうものどうしは錬成できない（決まりはタイトル画面と図鑑に書いてある）
}
function dropOn(from,to){dropOn0(from,to);if(!S.active)saveRun()}
const nearCore=(x,y)=>(x-CORE.x)**2+(y-CORE.y)**2<=42*42;
function explode(sl,d){ // 火薬：まわりの影すべてに大きな威力。罠は消える
  sl.item=null;
  for(const e of S.enemies)if(!e.dead&&(e.x-sl.x)**2+(e.y-sl.y)**2<(d.splash+e.r)**2)hurt(e,d.boom,d.fam);
  if(FX){ring(sl.x,sl.y,'#ffe45c',d.splash,.45,4);ring(sl.x,sl.y,d.c,d.splash*.6,.35,3);burst(sl.x,sl.y,d.c,28,220);sparks(sl.x,sl.y,'#ffd27a',24,300);shake(6);sfx.boom();buzz(30);floatText(sl.x,sl.y-26,TT('stBoom'),'#ffd27a',FS.f2)}
}
function useRelic(sl){ // 聖灰：砦へ運ぶと消えて灯がもどる
  const it=sl.item,d=it&&ITEMS[it.id];if(!d||d.kind!=='relic')return false;
  sl.item=null;S.lives+=d.heal;S.coreHit=0;sfx.disc();buzz(20);
  if(FX){ring(CORE.x,CORE.y,d.c,70,.5,4);ring(CORE.x,CORE.y,'#ffe9a0',40,.35,2);burst(CORE.x,CORE.y,d.c,24,160);sparks(CORE.x,CORE.y,'#fffbe8',14,220)}
  floatText(CORE.x-6,CORE.y-34,TT('livesUp',d.heal),'#ffe9a0',FS.f3);
  if(!S.active)saveRun();return true;
}
function dropOn0(from,to){
  const it=from.item;if(!it)return;
  if(!to||to===from){sfx.drop();return}
  if(!to.item){
    if(!fits(it.id,to)){it.shake=.35;sfx.fail();floatText(to.x,to.y-30,TT(ITEMS[it.id].kind==='relic'?'useOnCore':to.path?'onlyTrap':'trapOnPath'),'#b9b1d0',FS.f2);return}
    to.item=it;from.item=null;it.s=1.3;it.sv=-2;it.cd=Math.max(it.cd,.15);it.chg=0;it.chgT=0;it.chgB=0;
    sfx.drop();ring(to.x,to.y,ITEMS[it.id].c,38,.3,2);buzz(8);
    if(!to.bench)S.started=true;
    if(to.field&&S.tut<2)S.tut=2;
    return;
  }
  const res=tryCombine(it,to.item);
  if(res.fail){
    it.shake=.35;to.item.shake=.35;sfx.fail();buzz([10,40,10]);
    floatText(to.x,to.y-34,res.fail,'#b9b1d0',FS.f2);return;
  }
  // できたものが置けない場所なら、運んできた側のマスに残す
  const dst=fits(res.id,to)?to:fits(res.id,from)?from:null;
  if(!dst){it.shake=.35;sfx.fail();floatText(to.x,to.y-34,TT('mergeOnBench'),'#b9b1d0',FS.f2);return}
  const n=mkItem(res.id,dst.x,dst.y);n.hide=.3;n.s=.01;
  const isNew=!disc.has(res.id);
  if(isNew){disc.add(res.id);save()}
  const doBurst=S.active&&!dst.bench;
  if(FX)fx.push({ty:'merge',x:dst.x,y:dst.y,a:{id:it.id,x:it.rx,y:it.ry},b:{id:to.item.id,x:to.item.rx,y:to.item.ry},t:0,dur:.3,res:n,isNew,burst:doBurst});
  else{n.hide=0;n.s=1;if(doBurst)mergeBurst(dst.x,dst.y,ITEMS[res.id])}
  const rk=rkey(it.id,to.item.id); // to.item を null にする前にキーを作る
  if(RECIPE[rk]&&!madeR.has(rk)){madeR.add(rk);save()} // ★合成など、レシピ表にない組み合わせは記録しない
  from.item=null;to.item=null;dst.item=n;
  S.made.add(res.id); // 錬成した時点で「この戦いで作ったもの」に入れる（演出が終わるのを待つと、その前に取った途中保存に入らない）
  if(FX){stats.merges++;checkAch()}
}
function mergeBurst(x,y,d){ // 戦闘中に盤面（魔法陣・罠マス）で錬成すると、周囲の敵へ衝撃波ダメージ＋押し戻し
  if(!S.active||S.over)return;
  const R=85+d.t*14,dmg=Math.round(waveHp(S.wave)*(.18+d.t*.08)),kb=18+d.t*6;
  let hit=0;
  for(const e of S.enemies){
    if(e.dead||(e.x-x)**2+(e.y-y)**2>(R+e.r)**2)continue;
    hit++;
    if(e.type!=='boss'&&!e.def.fly){e.d=Math.max(0,e.d-kb);const p=pathPoint(e.P,e.d);e.x=p[0];e.y=p[1];e.kb=.3}
    hurt(e,dmg,d.fam);
  }
  if(!hit)return;
  if(FX){
    ring(x,y,'#ffe9a0',R,.42,3.5,12);ring(x,y,d.c,R*.82,.35,2.5,8);
    sparks(x,y,'#ffe9a0',12+d.t*3,240);shake(3+d.t*.8);
    tone(180+d.t*40,.22,'triangle',.12,80);noise(.14,.08,1600);
    floatText(x,y-52,TT('mergeBurst'),'#ffe9a0',FS.f2);
  }
}
function enhance(sl){ // 選んでいる最高ランクを魔力で +1
  const n=sl.item;if(!canEnh(n))return;const cost=enhCost(n),d=ITEMS[n.id];
  if(S.mana<cost){S.manaErr=.5;sfx.fail();floatText(sl.x,sl.y-40,TT('noMana'),'#ff8a9a',FS.f1);return}
  S.mana-=cost;S.manaBump=1;n.lv=(n.lv||0)+1;n.s=.6;n.sv=7;n.kick=1;
  if(FX){burst(sl.x,sl.y,d.c,26,190);sparks(sl.x,sl.y,'#ffffff',16,280);ring(sl.x,sl.y,d.c,110,.5,3.5);ring(sl.x,sl.y,'#ffe9a0',64,.35,2);shake(4);buzz(25)}
  sfx.merge(d.t);floatText(sl.x,sl.y-36,'+'+n.lv,'#ffe9a0',FS.f3);floatText(W-74,48,'−'+cost,'#ffb89a',FS.f2);
  if(!S.active)saveRun();
}
function mergeDone(f){
  const n=f.res,d=ITEMS[n.id];
  n.s=.25;n.sv=9;
  burst(f.x,f.y,d.c,18+d.t*6,130+d.t*30);sparks(f.x,f.y,'#ffffff',8+d.t*3,220+d.t*30);
  burst(f.x,f.y,ITEMS[f.a.id].c,8,90);burst(f.x,f.y,ITEMS[f.b.id].c,8,90);
  ring(f.x,f.y,d.c,46+d.t*14,.45,3);ring(f.x,f.y,'#ffffff',30+d.t*8,.28,1.5);
  shake(2+d.t*1.2);buzz(15+d.t*6);sfx.merge(d.t-1);
  floatText(f.x,f.y-36,'★'.repeat(d.t),'#ffe9a0',FS.f2);
  if(f.burst)mergeBurst(f.x,f.y,d);
  if(S.tut===0)S.tut=1;
  if(f.isNew&&disc.size>=TOTAL){S.allFound=8;fx.push({ty:'wave',t:-2.4,dur:3.2,txt:TT('allFound',TOTAL)});setTimeout(()=>sfx.clear(),2400)}
  if(f.isNew){shopShow(n.id);SHOP.dotT[d.t]=6;S.banner={id:n.id,t:0,dur:2.6};S.slowmo=1.1;sfx.disc();S.flash=.35;S.flashC=d.c;}
}
function checkUnlock(){ // クリアしたステージの基本元素を解放する。解放したものを 1 つ返す
  let got=null;
  for(const id in UNLOCK)if(!disc.has(id)&&rec(UNLOCK[id],false).clear){disc.add(id);got=got||id}
  if(got)save();return got;
}
function tutDone(){S.tut=9;if(TUT<9&&FX){TUT=9;save()}}
function spawnBase(id,b,to){ // 失敗したら理由（'full'／'mana'）を返す。to：置く場所（つかんで運んだとき。空いていて置けるマス）
  const free=to||slots.find(s=>s.bench&&!s.item),cost=itemValue({id});
  if(!free){S.benchShake=.4;sfx.fail();floatText(W/2,LY.top+14,TT('benchFull'),'#ff8a9a',FS.f2);return'full'}
  if(S.mana<cost){S.manaErr=.5;sfx.fail();floatText(W-110,48,TT('noMana'),'#ff8a9a',FS.f1);return'mana'}
  S.mana-=cost;
  const it=mkItem(id,to?ptr.x:b?b.x+b.w/2:free.x,to?ptr.y:b?b.y+b.h/2:free.y);it.s=.4;it.sv=6;free.item=it;
  if(S.tut===3)tutDone();
  if(to){if(!to.bench)S.started=true;if(to.field&&S.tut<2)S.tut=2}
  else it.fly=.55; // ボタンから作業台へ、光の尾を引いて飛ぶ
  sfx.spawn(Math.max(0,BASES.indexOf(id))+ITEMS[id].t-1);tone(N(12+ITEMS[id].t*2),.18,'sine',.06,null,.16);buzz(10);
  if(FX){sparks(it.rx,it.ry,ITEMS[id].c,10,160);fx.push({ty:'land',x:free.x,y:free.y,color:ITEMS[id].c,t:to?0:-.22,dur:.7})}
  floatText(W-74,48,'−'+cost,'#ffb89a',FS.f2);S.manaBump=1;S.started2=true;
  if(!S.active)saveRun();
  return'';
}
// 一覧からつかんで運んだ元素を、離した場所で呼び出す（空いたマスならそこへ置き、元素の上なら呼び出してそのまま重ねる）
function buyDrop(id,p,touch){
  const ty=p.y-(touch?26:0),d=ITEMS[id],to=slotAt(p.x,ty);
  if(!to){
    if(d.kind==='relic'&&nearCore(p.x,ty)){const tmp={x:p.x,y:ty,bench:true};if(!spawnBase(id,null,tmp))useRelic(tmp);return}
    sfx.drop();return} // 何もないところで離したら、呼び出さない
  const fail=(txt,c='#b9b1d0')=>{sfx.fail();floatText(to.x,to.y-34,txt,c,FS.f2)};
  if(!to.item){
    if(!fits(id,to))return fail(TT(d.kind==='relic'?'useOnCore':to.path?'onlyTrap':'trapOnPath'));
    spawnBase(id,null,to);return}
  const res=tryCombine({id},to.item);
  if(res.fail){to.item.shake=.35;buzz([10,40,10]);return fail(res.fail)}
  if(!fits(res.id,to))return fail(TT('mergeOnBench'));
  const tmp={x:to.x,y:to.y,bench:true}; // 呼び出した元素をいったん置く仮のマス
  if(!spawnBase(id,null,tmp))dropOn(tmp,to);
}
// 戻す：直前の 1 操作（移動・錬成・還す・呼び出し・工房レベル・強化・聖灰）だけを取り消す。
// 操作の前後でマスの中身を覚えておき、いまの盤面が操作した直後のままのときだけ戻せる（罠が弾けた、などで変わっていたら戻さない）。
// 魔力と灯は、その操作で増減した分だけを戻す（波の最中に倒して得た魔力は残す）。
// 波が始まった・終わったあとは戻せない（波の間だけ塔を置いて、終わってから戻して魔力を取り返す、ができないように）
const undoSnap=()=>({items:slots.map(s=>s.item),lv:slots.map(s=>s.item&&s.item.lv||0),mana:S.mana,lives:S.lives,ws:S.ws,made:new Set(S.made)});
function undoable(fn){
  const b=undoSnap(),r=fn(),a=undoSnap();
  if(a.items.some((x,i)=>x!==b.items[i])||a.lv.some((v,i)=>v!==b.lv[i])||a.ws!==b.ws||a.mana!==b.mana||a.lives!==b.lives)UNDO={b,a,dm:a.mana-b.mana,dl:a.lives-b.lives,w:S.wave,act:S.active};
  return r;
}
const canUndo=()=>!!UNDO&&!S.over&&S.wave===UNDO.w&&S.active===UNDO.act&&!(S.cleared&&!S.endless)&&slots.every((s,i)=>s.item===UNDO.a.items[i]&&(s.item&&s.item.lv||0)===UNDO.a.lv[i])&&S.ws===UNDO.a.ws&&S.mana-UNDO.dm>=0&&S.lives-UNDO.dl>0;
function undo(){
  const b0=btn('undo'),bx=b0.x+b0.w/2;
  if(!canUndo()){UNDO=null;sfx.fail();floatText(clamp(bx,70,W-70),b0.y-8,TT('noUndo'),'#b9b1d0',FS.f1);return}
  const{b,a,dm,dl}=UNDO;UNDO=null;sel=null;
  slots.forEach((s,i)=>{const it=b.items[i];s.item=it;if(!it)return;
    if(b.lv[i])it.lv=b.lv[i];else delete it.lv;
    if(a.items[i]!==it||a.lv[i]!==b.lv[i]){it.held=false;it.hide=0;it.fly=0;it.s=.6;it.sv=6;it.shake=0}});
  S.mana-=dm;S.lives-=dl;S.ws=b.ws;S.made=b.made;S.manaBump=1;
  if(dm)floatText(W-74,48,(dm>0?'−':'+')+Math.abs(dm),dm>0?'#ffb89a':'#e8c36a',FS.f2);
  sfx.drop();tone(520,.12,'sine',.05,330);buzz(8);floatText(clamp(bx,70,W-70),b0.y-8,TT('undone'),'#cfc8e6',FS.f1);
  if(!S.active)saveRun();
}
function sell(slot){
  const it=slot.item;if(!it)return;
  const v=Math.floor(itemValue(it)/2);S.mana+=v;slot.item=null;
  const b=btn('trash');burst(b.x+b.w/2,b.y+b.h/2,'#8d86a3',14,100);floatText(b.x+b.w/2,b.y-8,'+'+v,'#e8c36a',FS.f2);
  sfx.drop();tone(240,.2,'sine',.06,90);
  if(!S.active)saveRun();
}
