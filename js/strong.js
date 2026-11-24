'use strict';
// 確認専用：URL に ?strong=1 を付けたときだけ「強いデータ」で始める（全ステージ・悪夢・深淵を開く、全元素と全レシピを発見済みに、戦闘中のマナを 99999 に固定）。
// 本物の保存データは書きかえない（この間は保存しない）。マージ前に、このファイルと index.html の読みこみ行を消す。
if(new URLSearchParams(location.search).get('strong')==='1'){
  save=function(){};
  for(const i of ORDER)for(const n of [0,1,2])prog[pkey(i,n)]={best:20,clear:true};
  disc=new Set(Object.keys(ITEMS));madeR=new Set(Object.keys(RECIPE));TUT=9;
  const inf=()=>{if(S){S.mana=99999;S.manaShow=99999}};
  const upd=update;update=function(dt){inf();return upd(dt)};
  const rs=reset;reset=function(){const r=rs.apply(this,arguments);inf();return r};
}
