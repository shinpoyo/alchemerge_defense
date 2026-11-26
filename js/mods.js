'use strict';
// ルール倍率・イベントのフック登録（各機能ファイルがここに登録し、battle.js / enemies.js への直書きを避ける）
const MODS={
  towerDmg:[],   // (sl, it) => 倍率（塔の与ダメージ）
  towerRate:[],  // (sl, it) => 倍率（塔の攻撃速度）
  towerRange:[], // (sl, it) => 倍率（塔の射程・射程プレビュー共通）
  enemyHp:[],    // (w)      => 倍率（波ごとの敵HP）
  enemySpd:[],   // (e)      => 倍率（敵の移動速度）
  killMana:[],   // (e)      => 倍率（撃破時の獲得魔力）
  statusDur:[],  // ()       => 倍率（状態異常の持続時間）
  waveStart:[],  // ()       => 波開始時の演出・告知など
};
const modMul=(k,...a)=>{let v=1;for(const f of MODS[k])v*=f(...a);return v};
const modRun=(k,...a)=>{for(const f of MODS[k])f(...a)};
