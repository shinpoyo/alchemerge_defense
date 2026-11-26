'use strict';
// エンドレス夜相（maxWave() を超えた波で 5 波ごとに切り替わる環境ルール）
const ENDLESS_PHASES=['bloodMoon','denseFog','starfall','eclipse'];
const EPH_COL={bloodMoon:'#ff6a88',denseFog:'#9ab8e8',starfall:'#ffe45c',eclipse:'#c490ff'};
const endlessPhase=(w=S?S.wave:0)=>{const mw=maxWave();return w>mw?ENDLESS_PHASES[Math.floor((w-mw-1)/5)%ENDLESS_PHASES.length]:null};

addLang({
  eph_bloodMoon:['紅月','Blood Moon'],ephD_bloodMoon:['敵の速度 +20%・獲得魔力 +30%','Foes 20% faster · +30% mana'],
  eph_denseFog:['濃霧','Dense Fog'],ephD_denseFog:['塔の射程 -15%・状態異常の持続 +40%','Tower range -15% · Status duration +40%'],
  eph_starfall:['星雨','Starfall'],ephD_starfall:['攻撃速度 +20%・敵体力 +15%','Attack speed +20% · Foe HP +15%'],
  eph_eclipse:['月蝕','Eclipse'],ephD_eclipse:['属性シナジー 2.0 倍・癒し影の回復 +50%','Synergy ×2.0 · Mender heal +50%'],
});
MODS.towerRate.push(()=>endlessPhase()==='starfall'?1.2:1);
MODS.towerRange.push(sl=>sl&&sl.field&&endlessPhase()==='denseFog'?.85:1);
MODS.enemyHp.push(w=>endlessPhase(w)==='starfall'?1.15:1);
MODS.enemySpd.push(()=>endlessPhase()==='bloodMoon'?1.2:1);
MODS.killMana.push(()=>endlessPhase()==='bloodMoon'?1.3:1);
MODS.statusDur.push(()=>endlessPhase()==='denseFog'?1.4:1);
MODS.waveStart.push(()=>{const ep=endlessPhase();if(ep&&(S.wave-maxWave()-1)%5===0&&FX)fx.push({ty:'text',x:W/2,y:140,txt:'✦ '+TT('eph_'+ep)+' ― '+TT('ephD_'+ep),color:EPH_COL[ep],size:13,t:0,dur:5.5})});
