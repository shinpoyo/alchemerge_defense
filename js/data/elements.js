'use strict';
// 元素の定義・レシピ・基本元素の解放（index.html から読みこむ。読みこむ順番に意味があるので、index.html の並びを変えないこと）
/* ---------------- 元素（アイテム）の定義 ----------------
   kind: bolt=弾 / chain=連鎖する稲妻 / pulse=周囲への波動 / beam=照射 / pierce=貫通 / trap=道に置く罠
         support=支援（攻撃しない。range 内の味方の塔を、ダメージ +buffD・攻撃速度 +buffR だけ強める）
   t がランク（★の数）。値段は 1 ランクごとに 2 倍 */
const ITEMS={
  // ★1
  fire:    {name:'火',      t:1,c:'#ff6a3d',kind:'bolt', dmg:7,  rate:1,   range:105,dot:3,dotT:2,              desc:'当てた敵を燃やす'},
  water:   {name:'水',      t:1,c:'#4aa8ff',kind:'bolt', dmg:4,  rate:1,   range:105,slow:.25,slowT:1.5,        desc:'当てた敵を遅くする'},
  earth:   {name:'土',      t:1,c:'#c08a4a',kind:'bolt', dmg:13, rate:.5,  range:95, splash:34,                 desc:'重い一撃。まわりも巻きこむ'},
  wind:    {name:'風',      t:1,c:'#7df0c0',kind:'bolt', dmg:2.2,rate:3.2, range:125,                           desc:'弱いが、とても速く撃つ'},
  // ★1（図鑑を集めると解放される基本元素）
  wood:    {name:'木',      t:1,c:'#7ac85a',kind:'bolt', dmg:5,  rate:1.2, range:110,slow:.15,slowT:1,         desc:'絡みついて少し遅くする'},
  light:   {name:'光',      t:1,c:'#fff2a0',kind:'beam', dmg:9,            range:110,beams:1,                   desc:'細い光で照らし続ける'},
  dark:    {name:'闇',      t:1,c:'#9a7ad8',kind:'bolt', dmg:6,  rate:1,   range:110,desc:'闇の弾を撃つ'},
  // ★2
  flame:   {name:'炎',      t:2,c:'#ff8a3d',kind:'bolt', dmg:16, rate:1.1, range:110,dot:6,dotT:2,              desc:'強く燃やす'},
  pond:    {name:'池',      t:2,c:'#5ab8ff',kind:'pulse',dmg:5,  rate:1,   range:85, slow:.35,slowT:1.2,        desc:'まわりの敵を遅くする'},
  rock:    {name:'岩',      t:2,c:'#b89a78',kind:'bolt', dmg:34, rate:.5,  range:100,splash:40,                 desc:'大きな岩を投げつける'},
  gust:    {name:'旋風',    t:2,c:'#9af0d0',kind:'bolt', dmg:4.2,rate:4.5, range:135,                           desc:'風の刃を連射する'},
  steam:   {name:'蒸気',    t:2,c:'#cfd8e8',kind:'pulse',dmg:10, rate:1,   range:80,                            desc:'まわりの敵すべてを蒸す'},
  lava:    {name:'溶岩',    t:2,c:'#ff4a1a',kind:'bolt', dmg:22, rate:.55, range:110,splash:42,dot:6,dotT:3,    desc:'爆ぜて、広く燃やす'},
  bolt:    {name:'雷',      t:2,c:'#ffe45c',kind:'chain',dmg:13, rate:1,   range:120,chain:3,                   desc:'敵から敵へ跳ねる稲妻'},
  ice:     {name:'氷',      t:2,c:'#8fe6ff',kind:'bolt', dmg:9,  rate:1.1, range:115,slow:.45,slowT:2,          desc:'敵を強く凍えさせる'},
  sand:    {name:'砂',      t:2,c:'#e6c88a',kind:'bolt', dmg:3.6,rate:5,   range:125,                           desc:'砂つぶての連射'},
  swamp:   {name:'沼',      t:2,c:'#9cbc4e',kind:'trap',                   range:34, slow:.35,slowT:.3,         desc:'罠：踏んだ敵が遅くなる'},
  thicket: {name:'茂み',    t:2,c:'#5ab84a',kind:'pulse',dmg:6,  rate:1,   range:85, slow:.3,slowT:1,           desc:'まわりの敵の足を取る'},
  charcoal:{name:'炭',      t:2,c:'#ff8a5a',kind:'bolt', dmg:12, rate:.9,  range:110,splash:30,dot:6,dotT:3,    desc:'燃えさしを投げて焼く'},
  flower:  {name:'花',      t:2,c:'#ff9ad0',kind:'pulse',dmg:8,  rate:1,   range:90, dot:5,dotT:3,desc:'花粉でむしばむ'},
  root:    {name:'根',      t:2,c:'#a87a4a',kind:'trap',                   range:34, slow:.4,slowT:.3,          desc:'罠：根が足に絡む'},
  leaves:  {name:'木の葉',  t:2,c:'#8ad86a',kind:'bolt', dmg:3.5,rate:4.5, range:125,                           desc:'木の葉を連射する'},
  flash:   {name:'閃光',    t:2,c:'#fff8c8',kind:'beam', dmg:22,           range:120,beams:1,                   desc:'光を当て続ける'},
  ray:     {name:'光線',    t:2,c:'#ffe08a',kind:'pierce',dmg:20,rate:1,   range:145,rico:2,                    desc:'一直線の光が2回跳弾する'},
  rainbow: {name:'虹',      t:2,c:'#ff9ae8',kind:'pulse',dmg:9,  rate:1,   range:100,desc:'七色の光で照らす'}, // 名前に合わない効き目を外した（2026-11-29）
  gem:     {name:'宝石',    t:2,c:'#7af0e8',kind:'bolt', dmg:45, rate:.45, range:170,fast:1,rico:1,             desc:'遠くを撃ち抜き、跳弾する'},
  aurora:  {name:'オーロラ',t:2,c:'#8af8c8',kind:'pulse',dmg:11, rate:1,   range:110,           desc:'光の帯で包みこむ'}, // 名前に合わない効き目を外した（2026-11-29）
  firefly: {name:'蛍',      t:2,c:'#d8ff7a',kind:'chain',dmg:10, rate:1.3, range:125,chain:3,                   desc:'光が3体に飛び移る'},
  shadow:  {name:'影',      t:2,c:'#8a6ac8',kind:'bolt', dmg:7,  rate:1.3, range:120,desc:'影を落として撃つ'},
  blackflame:{name:'黒炎',  t:2,c:'#c05aff',kind:'bolt', dmg:8,  rate:1.1, range:115,dot:12,dotT:3,             desc:'消えにくい黒い炎'},
  venom:   {name:'毒',      t:2,c:'#8be04a',kind:'bolt', dmg:4,  rate:1.2, range:115,dot:10,dotT:4,             desc:'じわじわ効く毒'},
  tomb:    {name:'墓',      t:2,c:'#a8a0c0',kind:'pulse',dmg:9,  rate:.9,  range:85, curse:1.25,                desc:'まわりの敵を呪う'},
  bat:     {name:'蝙蝠',    t:2,c:'#b07ad8',kind:'bolt', dmg:5,  rate:3,   range:130,                           desc:'群れで飛びかかる'},
  twilight:{name:'黄昏',    t:2,c:'#ffa87a',kind:'pulse',dmg:7,  rate:1,   range:105,desc:'薄闇で包みこむ'}, // 名前に合わない効き目を外した（2026-11-29）
  thorn:   {name:'茨',      t:2,c:'#6aa84a',kind:'trap',                   range:34, dot:12,dotT:2,             desc:'罠：踏んだ敵を刺し続ける'},
  hai:     {name:'灰',      t:2,c:'#9a958c',kind:'bolt', dmg:18, rate:1,   range:110,                           desc:'燃え尽きたもの'},
  // ★3
  inferno: {name:'業火',    t:3,c:'#ff5a2a',kind:'pulse',dmg:22, rate:1,   range:90, dot:14,dotT:3,             desc:'まわりを焼きつくす'},
  sea:     {name:'海',      t:3,c:'#3a90ff',kind:'bolt', dmg:40, rate:.7,  range:120,splash:55,slow:.4,slowT:1.5,desc:'大波をぶつけて遅くする'},
  mountain:{name:'山',      t:3,c:'#c8935a',kind:'bolt', dmg:110,rate:.45, range:110,splash:55,                 desc:'山のような一撃'},
  tornado: {name:'竜巻',    t:3,c:'#7df0c0',kind:'pulse',dmg:20, rate:1.6, range:100,                           desc:'まわりを切り刻む'},
  engine:  {name:'機関',    t:3,c:'#ffb070',kind:'bolt', dmg:6.5,rate:9,   range:135,                           desc:'止まらない機関砲'},
  blizzard:{name:'吹雪',    t:3,c:'#bfeaff',kind:'pulse',dmg:16, rate:.9,  range:95, slow:.5,slowT:1.5,         desc:'まわりを凍てつかせる'},
  glass:   {name:'硝子',    t:3,c:'#ff9ae0',kind:'beam', dmg:50,           range:140,beams:1,                   desc:'光を集めて焼き続ける'},
  miasma:  {name:'瘴気',    t:3,c:'#b06aff',kind:'pulse',dmg:6,  rate:1,   range:100,dot:16,dotT:4,sil:2,       desc:'毒の霧で包み、力を封じる'},
  inazuma: {name:'稲妻',    t:3,c:'#ffd23c',kind:'chain',dmg:30, rate:1.1, range:135,chain:6,                   desc:'6体に跳ねる大稲妻'},
  crystal: {name:'水晶',    t:3,c:'#9ad0ff',kind:'bolt', dmg:150,rate:.35, range:190,fast:1,rico:2,             desc:'遠くを撃ち抜き、2回跳弾する'},
  curse:   {name:'呪い',    t:3,c:'#d05aff',kind:'bolt', dmg:14, rate:1.5, range:130,curse:1.5,                 desc:'呪った敵の命を削る'},
  obsidian:{name:'黒曜石',  t:3,c:'#9a8cff',kind:'pierce',dmg:40,rate:.8,  range:150,                           desc:'一直線に貫く刃'},
  bog:     {name:'毒沼',    t:3,c:'#8be04a',kind:'trap',                   range:34, slow:.35,slowT:.3,dot:16,dotT:2,desc:'罠：遅くして毒にする'},
  quicksand:{name:'流砂',   t:3,c:'#e0b060',kind:'trap',                   range:36, slow:.6,slowT:.3,          desc:'罠：足をとられて大きく遅くなる'},
  crater:  {name:'火口',    t:3,c:'#ff6a2a',kind:'trap',                   range:34, dot:32,dotT:2,             desc:'罠：踏んだ敵を焼く'},
  iron:    {name:'鉄',      t:3,c:'#b8c4d8',kind:'bolt', dmg:60, rate:.9,  range:115,                           desc:'重い鉄塊を撃ちこむ'},
  mist:    {name:'霧',      t:3,c:'#a8c8e8',kind:'pulse',dmg:8,  rate:1,   range:115,slow:.4,slowT:1.5,sil:2,desc:'遅くし、力を封じる'},
  golem:   {name:'ゴーレム',t:3,c:'#d0a070',kind:'pulse',dmg:55, rate:.6,  range:70, knock:14,                  desc:'近くの敵を殴って押し戻す'},
  sandstorm:{name:'砂嵐',   t:3,c:'#e8c070',kind:'pulse',dmg:14, rate:1.5, range:105,slow:.3,slowT:1,           desc:'まわりを削り、遅くする'},
  wisp:    {name:'鬼火',    t:3,c:'#6af0e0',kind:'bolt', dmg:10, rate:1.4, range:135,dot:22,dotT:4,             desc:'消えない火で焼き続ける'},
  magnet:  {name:'磁石',    t:3,c:'#ff5a6a',kind:'chain',dmg:20, rate:.6,  range:120,chain:4,knock:20,          desc:'敵を引き戻す'},
  spore:   {name:'胞子',    t:3,c:'#c8e06a',kind:'bolt', dmg:6,  rate:1,   range:125,splash:50,dot:12,dotT:4,   desc:'毒の胞子をまき散らす'},
  heat:    {name:'熱風',    t:3,c:'#ff9a5a',kind:'pierce',dmg:32,rate:1,   range:140,dot:8,dotT:2,              desc:'一直線に焼く風'},
  frost:   {name:'氷床',    t:3,c:'#a8ecff',kind:'trap',                   range:36, slow:.7,slowT:.3,          desc:'罠：凍った道で動けなくする'},
  jungle:  {name:'密林',    t:3,c:'#4ac85a',kind:'pulse',dmg:30, rate:1,   range:105,slow:.4,slowT:1.2,desc:'絡みつく密林'}, // 名前に合わない効き目を外した（2026-11-29）
  diamond: {name:'金剛石',  t:3,c:'#d8f8ff',kind:'bolt', dmg:170,rate:.35, range:195,fast:1,rico:3,             desc:'最も硬い一撃。3回跳弾する'},
  holylight:{name:'聖光',   t:3,c:'#fff4b8',kind:'pulse',dmg:26, rate:1,   range:110,desc:'まわりを清める光'},
  laser:   {name:'レーザー',t:3,c:'#ff7a9a',kind:'beam', dmg:55,           range:150,beams:1,                   desc:'焼き切る光線'},
  nightfall:{name:'闇夜',   t:3,c:'#7a5ac8',kind:'pulse',dmg:21, rate:1,   range:120,sil:2.5,desc:'闇で包み、力を封じる'}, // 名前に合わない効き目を外した（2026-11-29）
  vampire: {name:'吸血鬼',  t:3,c:'#e05a7a',kind:'bolt', dmg:20, rate:1.6, range:135,curse:1.3,   desc:'血を吸い、呪う'}, // 名前に合わない効き目を外した（2026-11-29）
  toxin:   {name:'猛毒',    t:3,c:'#a8f04a',kind:'bolt', dmg:6,  rate:1.2, range:125,dot:22,dotT:4,             desc:'強い毒で倒す'},
  thornwall:{name:'荊棘',   t:3,c:'#5a9a3a',kind:'trap',                   range:38, slow:.4,slowT:.3,dot:30,dotT:2,desc:'罠：棘が絡みつく'},
  hotaru:  {name:'蛍火',    t:3,c:'#e8ff8a',kind:'chain',dmg:22, rate:1.4, range:140,chain:5,                   desc:'光が5体に飛び移る'},
  gokuen:  {name:'獄炎',    t:3,c:'#b04aff',kind:'bolt', dmg:16, rate:1.1, range:130,splash:35,dot:26,dotT:3,   desc:'地獄の黒い炎'},
  hotspring:{name:'温泉',   t:3,c:'#7ad8e8',kind:'pulse',dmg:12, rate:1,   range:95, slow:.3,slowT:1.2,dot:8,dotT:2,desc:'まわりを茹でて遅くする'},
  raincloud:{name:'雨雲',   t:3,c:'#8aa8d8',kind:'pulse',dmg:10, rate:1.3, range:115,slow:.35,slowT:1.2,      desc:'広く雨を降らせて遅くする'},
  plasma:  {name:'プラズマ',t:3,c:'#ff7ae0',kind:'chain',dmg:24, rate:1,   range:125,chain:4,dot:8,dotT:2,chg:5,desc:'4体に跳ねる稲妻。蓄電し連射'},
  glacier: {name:'氷河',    t:3,c:'#9ad8ff',kind:'bolt', dmg:55, rate:.5,  range:110,splash:45,slow:.45,slowT:1.5,desc:'氷塊を落として凍えさせる'},
  volcano: {name:'火山',    t:3,c:'#ff6a3a',kind:'bolt', dmg:60, rate:.5,  range:120,splash:55,dot:10,dotT:3,  desc:'火山弾を降らせて焼く'},
  mud:     {name:'泥',      t:3,c:'#b08a5a',kind:'trap',                   range:36, slow:.45,slowT:.3,desc:'罠：ぬかるみで遅くする'},
  thunderbird:{name:'雷鳥', t:3,c:'#ffe070',kind:'chain',dmg:18, rate:1.5, range:145,chain:4,                  desc:'空から4体に雷を落とす'},
  blueflame:{name:'蒼炎',   t:3,c:'#6ab8ff',kind:'bolt', dmg:9,  rate:1.2, range:125,dot:16,dotT:3,slow:.2,slowT:1,desc:'冷たい炎で焼き、凍えさせる'},
  geyser:  {name:'間欠泉',  t:3,c:'#a8e8ff',kind:'pulse',dmg:22, rate:.7,  range:80, knock:12,               desc:'噴き上げて押し戻す'},
  icicle:  {name:'氷柱',    t:3,c:'#c8f0ff',kind:'pierce',dmg:28,rate:.9,  range:145,slow:.3,slowT:1.2,         desc:'一直線に貫いて凍えさせる'},
  eel:     {name:'雷魚',    t:3,c:'#7af0d8',kind:'chain',dmg:15, rate:1.2, range:115,chain:3,slow:.25,slowT:1, desc:'しびれさせて遅くする'},
  lantern: {name:'灯籠',    t:3,c:'#ffd08a',kind:'support',                range:140,buffD:.15,buffR:.10,       desc:'灯りでまわりの塔を強める'},
  sekken:  {name:'石鹸',    t:3,c:'#98e4f8',kind:'trap',                   range:36, slow:.5,slowT:.3,          desc:'罠：踏むと滑って遅くなる'},
  cement:  {name:'セメント',t:3,c:'#a4acb4',kind:'trap',                   range:36, slow:.5,slowT:.3,          desc:'罠：踏むと固まって遅くなる'},
  // ★4
  tank:    {name:'戦車',    t:4,c:'#a8b070',kind:'bolt', dmg:130,rate:.8,  range:150,splash:50,                 desc:'砲撃で吹き飛ばす'},
  wraith:  {name:'怨霊',    t:4,c:'#a890ff',kind:'bolt', dmg:40, rate:1.3, range:140,curse:1.5,   desc:'呪いと祟りでむしばむ'}, // 名前に合わない効き目を外した（2026-11-29）
  forest:  {name:'原生林',      t:4,c:'#6ad86a',kind:'pulse',dmg:20, rate:1,   range:125,dot:30,dotT:4,slow:.3,slowT:1.2,desc:'胞子と根で絡めとる'},
  iceage:  {name:'氷河期',  t:4,c:'#d0f4ff',kind:'pulse',dmg:45, rate:.8,  range:120,slow:.6,slowT:1.5,stop:1,stopP:.3,desc:'まわりを凍りつかせる'},
  eruption:{name:'噴火',    t:4,c:'#ff5a2a',kind:'bolt', dmg:170,rate:.6,  range:150,splash:70,dot:30,dotT:3,   desc:'大噴火で広く焼く'},
  raijin:  {name:'万雷',    t:4,c:'#ffd84a',kind:'chain',dmg:85, rate:1.2, range:155,chain:8,                  desc:'8体に大雷を落とす'},
  katana:  {name:'名刀',    t:4,c:'#e0e8f8',kind:'pierce',dmg:150,rate:1.2,range:160,                          desc:'一閃で斬り抜ける'},
  ryugu:   {name:'竜宮',    t:4,c:'#5ac8e8',kind:'pulse',dmg:40, rate:1,   range:125,slow:.45,slowT:1.5,        desc:'海の底へ引きこみ、遅くする'},
  thunderstorm:{name:'スーパーセル',t:4,c:'#b8c8ff',kind:'chain',dmg:60, rate:1.2, range:150,chain:7,slow:.3,slowT:1,  desc:'雨と雷が7体を打つ'},
  particle:{name:'粒子砲',  t:4,c:'#ff8af0',kind:'beam', dmg:90,           range:160,beams:1,chg:5,             desc:'光の粒で焼き、蓄電して連射'},
  icespear:{name:'氷槍',    t:4,c:'#b0e8ff',kind:'pierce',dmg:140,rate:.9, range:175,slow:.4,slowT:1.5,          desc:'氷の槍で貫き、凍えさせる'},
  foxfire: {name:'狐火',    t:4,c:'#5af0c8',kind:'bolt', dmg:30, rate:1.6, range:150,dot:40,dotT:3,             desc:'妖しい火がまとわりつく'},
  bottomless:{name:'底なし沼',t:4,c:'#8a7a4a',kind:'trap',                range:40, slow:.7,slowT:.3,desc:'罠：沈めて遅くする'},
  seaserpent:{name:'海蛇',  t:4,c:'#4ab8c8',kind:'chain',dmg:55, rate:1.2, range:140,chain:6,slow:.35,slowT:1, desc:'6体に巻きついてしびれさせる'},
  shinso:  {name:'真祖',    t:4,c:'#ff4a6a',kind:'bolt', dmg:60, rate:1.6, range:150,curse:1.5,   desc:'吸血鬼の祖'}, // 名前に合わない効き目を外した（2026-11-29）
  tenkou:  {name:'天光',    t:4,c:'#fff8d0',kind:'beam', dmg:120,          range:175,beams:2,                   desc:'天から降る二筋の光'},
  jukai:   {name:'樹海',    t:4,c:'#3ab85a',kind:'pulse',dmg:70, rate:1,   range:135,slow:.5,slowT:1.5,desc:'迷わせて閉じこめる'}, // 名前に合わない効き目を外した（2026-11-29）
  mire:    {name:'腐海',    t:4,c:'#7ad63a',kind:'trap',                   range:38, slow:.45,slowT:.3,dot:60,dotT:2.5,desc:'罠：猛毒で蝕み、遅くする'},
  antlion: {name:'蟻地獄',  t:4,c:'#e8a850',kind:'trap',                   range:38, slow:.75,slowT:.3,knock:8,   desc:'罠：引きずり戻し、大きく遅くする'},
  purgatory:{name:'煉獄',   t:4,c:'#ff5a1a',kind:'trap',                   range:38, dot:110,dotT:2.5,          desc:'罠：踏んだ敵を激しく焼く'},
  permafrost:{name:'永久凍土',t:4,c:'#c8f4ff',kind:'trap',                 range:40, slow:.8,slowT:.3,          desc:'罠：ほとんど進めなくする'},
  railgun: {name:'電磁砲',  t:4,c:'#8ad8ff',kind:'pierce',dmg:300,rate:.5, range:230,chg:5,                     desc:'蓄電し、画面の端まで貫く'},
  reaper:  {name:'死神',    t:4,c:'#b8a0ff',kind:'bolt', dmg:90, rate:1,   range:150,curse:1.6,   desc:'呪い、命を削る'}, // 名前に合わない効き目を外した（2026-11-29）
  colossus:{name:'巨像',    t:4,c:'#e0b888',kind:'pulse',dmg:190,rate:.6,  range:85, knock:18,                  desc:'近くの敵をまとめて叩き返す'},
  sun:     {name:'太陽',    t:4,c:'#ffc23c',kind:'pulse',dmg:60, rate:1,   range:130,dot:40,dotT:3,             desc:'広くまわりを灼く'},
  tsunami: {name:'津波',    t:4,c:'#4a9cff',kind:'pierce',dmg:130,rate:.8, range:170,slow:.5,slowT:2,           desc:'一直線に押し流す'},
  peak:    {name:'霊峰',    t:4,c:'#d8b890',kind:'bolt', dmg:340,rate:.45, range:130,splash:75,                 desc:'すべてを押しつぶす'},
  typhoon: {name:'台風',    t:4,c:'#8af0d8',kind:'pulse',dmg:55, rate:2,   range:125,slow:.3,slowT:1,           desc:'まわりを吹き荒らす'},
  storm:   {name:'嵐',      t:4,c:'#9ab8d8',kind:'pulse',dmg:40, rate:2,   range:120,slow:.3,slowT:1,knock:10,  desc:'雨風が吹き荒れ、押し戻す'},
  cataclysm:{name:'天災',   t:4,c:'#fff08a',kind:'chain',dmg:70, rate:1.3, range:150,chain:9,slow:.4,slowT:1.5, desc:'凍てつく稲妻が9体を撃つ'},
  star:    {name:'星',      t:4,c:'#ffc0f0',kind:'beam', dmg:85,           range:165,beams:3,                   desc:'3本の光で焼き払う'},
  abyss:   {name:'冥府',    t:4,c:'#c070ff',kind:'pulse',dmg:50, rate:1,   range:120,dot:60,dotT:4,curse:1.4,   desc:'毒と呪いをまき散らす'},
  titan:   {name:'巨砲',    t:4,c:'#ff8a4a',kind:'bolt', dmg:150,rate:1.1, range:160,splash:60,                 desc:'大爆発を撃ちこむ'},
  bonfire: {name:'篝火',    t:4,c:'#ff9a5a',kind:'support',                range:150,buffD:.25,buffR:.15,       desc:'燃える火でまわりの塔を強める'},
  mirror:  {name:'鏡',      t:4,c:'#e8f0ff',kind:'mirror',     rate:1,   range:150,                           desc:'隣の塔の力を映して放つ'},
  desert:  {name:'砂漠',    t:4,c:'#e2c078',kind:'bolt', dmg:75, rate:1,   range:130,splash:25,slow:.25,slowT:1.5,desc:'熱砂を浴びせて足を奪う'}, // 材料の熱風（★3）より弱かったので、威力と小さな爆風を足した
  kagerou: {name:'陽炎',    t:4,c:'#ffd9a0',kind:'trap',                   range:90, slow:.35,slowT:.3,stun:1,stunP:.3,stunCd:4,desc:'罠：ゆらめく熱気で遅くし、ときに足を止める'},
  awa:     {name:'泡',      t:4,c:'#c0f0ff',kind:'pulse',dmg:30, rate:1,   range:120,slow:.4,slowT:1.2,         desc:'まわりを泡で包みこむ'},
  concrete:{name:'コンクリート',t:4,c:'#9aa4b2',kind:'bolt',dmg:120,rate:.55,range:120,splash:45,knock:10,      desc:'固まった塊で押しつぶす'},
  // ★5
  fortress:{name:'要塞',    t:5,c:'#c8a870',kind:'bolt', dmg:400,rate:1.1, range:185,splash:75,                 desc:'砲台が一斉に火を噴く'},
  thunderlord:{name:'雷神', t:5,c:'#fff08a',kind:'chain',dmg:250,rate:1.3, range:180,chain:12,                 desc:'12体を雷で撃つ'},
  hyakki:  {name:'百鬼夜行',t:5,c:'#c88aff',kind:'pulse',dmg:70, rate:1,   range:140,dot:80,dotT:4,curse:1.5,   desc:'妖が群れをなして襲う'},
  yggdrasil:{name:'世界樹', t:5,c:'#8af08a',kind:'pulse',dmg:175,rate:1,   range:150,slow:.35,slowT:1.2,desc:'根で縛りつける'}, // 名前に合わない効き目を外した（2026-11-29）
  holysword:{name:'聖剣',   t:5,c:'#fff2b0',kind:'pierce',dmg:620,rate:1.1,range:210,                          desc:'光の刃で貫く'},
  galaxy:  {name:'銀河',    t:5,c:'#c8a8ff',kind:'beam', dmg:260,          range:200,beams:3,                   desc:'星の帯で焼き払う'},
  poseidon:{name:'海神',    t:5,c:'#3a9cff',kind:'pierce',dmg:560,rate:1,  range:205,slow:.5,slowT:2,           desc:'大波で一直線に押し流す'},
  absolutezero:{name:'絶対零度',t:5,c:'#e0f8ff',kind:'pulse',dmg:160,rate:.8,range:150,slow:.75,slowT:1.5,stop:1.5,desc:'すべてを止める冷気'},
  solarflare:{name:'紅炎',  t:5,c:'#ff7a3a',kind:'pulse',dmg:200,rate:.8,  range:155,dot:70,dotT:3,             desc:'灼熱の炎を噴き上げる'},
  kyoshin: {name:'巨神',    t:5,c:'#d8b080',kind:'pulse',dmg:450,rate:.6,  range:100,knock:20,                  desc:'大地を踏みならし、押し返す'},
  fujin:   {name:'風神',    t:5,c:'#9af8e0',kind:'pulse',dmg:90, rate:2.4, range:170,slow:.4,slowT:1.2,knock:16,desc:'大風で広く吹き荒らし、押し戻す'},
  fujinraijin:{name:'風神雷神',t:6,c:'#a8f0c8',kind:'chain',dmg:560,rate:1.5,range:210,chain:14,slow:.4,slowT:1,desc:'風と雷で14体を撃つ'},
  ninetails:{name:'九尾',   t:5,c:'#7af8d8',kind:'bolt', dmg:140,rate:1.8, range:180,dot:90,dotT:3,curse:1.4,   desc:'九つの狐火で呪い焼く'},
  photon:  {name:'光子砲',  t:5,c:'#ffb0f8',kind:'beam', dmg:320,          range:220,beams:2,                   desc:'二筋の光で貫く'},
  naraku:  {name:'奈落',    t:5,c:'#6a5aa8',kind:'trap',                   range:42, slow:.8,slowT:.3,dot:150,dotT:2.5,curse:1.4,desc:'罠：底へ引きずりこむ'},
  paradise:{name:'楽園',    t:5,c:'#ffa8d8',kind:'pulse',dmg:290,rate:1,   range:160,desc:'花と水で包みこむ'}, // 名前に合わない効き目を外した（2026-11-29）
  hellmouth:{name:'地獄門', t:5,c:'#ff3a2a',kind:'trap',                   range:40, dot:300,dotT:2.5,curse:1.5,desc:'罠：業火で焼き、呪う'},
  stasis:  {name:'時の檻',  t:5,c:'#b8c8ff',kind:'trap',                   range:42, slow:.86,slowT:.3,stop:2,knock:8, desc:'罠：時がほとんど止まる'},
  stone:   {name:'賢者の石',t:5,c:'#ffe9a0',kind:'beam', dmg:220,          range:190,beams:4,sil:3,desc:'すべてを照らし、敵の力を封じる'}, // 名前に合わない効き目を外した（2026-11-29）
  ragnarok:{name:'終焉',    t:5,c:'#ff5a7a',kind:'bolt', dmg:420,rate:1.3, range:190,splash:80,dot:60,dotT:3,   desc:'夜ごと焼きつくす'},
  phoenix: {name:'不死鳥',  t:5,c:'#ff9a3c',kind:'bolt', dmg:260,rate:2,   range:180,splash:50,dot:80,dotT:3,   desc:'炎の羽を降らせる'},
  dragon:  {name:'竜',      t:5,c:'#5ad0c0',kind:'pierce',dmg:520,rate:1,  range:200,dot:100,dotT:3,           desc:'炎の息吹で貫き、焼く'}, // 遅くするを外し、燃やすに置きかえた（2026-11-29）
  moonlamp:{name:'月灯',    t:5,c:'#d8e4ff',kind:'support',                range:160,buffD:.40,buffR:.25,       desc:'月の光でまわりの塔を大きく強める'},
  kaleidoscope:{name:'万華鏡',t:5,c:'#ffb0e8',kind:'beam',dmg:260,rate:1.2,range:190,splash:38,kaleido:1,       desc:'撃つたび属性が変わる虹の光'},
  mirage:  {name:'蜃気楼',  t:5,c:'#a8d8e8',kind:'trap',                   range:90, slow:.4,slowT:.3,warp:120,warpP:.5,warpCd:3,desc:'罠：熱気で遅くし、幻に惑わせて後戻りさせる'}, // 陽炎（★4）の広さと減速を受け継ぎ、後戻りを強めた
  shabondama:{name:'泡の檻',t:5,c:'#a8f0ff',kind:'trap',               range:60, slow:.6,slowT:.3,stun:1.5,stunP:.4,stunCd:3,desc:'罠：包んだ敵を止める'}, // 材料の泡（★4）や陽炎（★4）より弱かったので強めた
  // ★6
  myth:    {name:'神話',    t:6,c:'#ffe0a0',kind:'bolt', dmg:900,rate:1.4, range:220,splash:90,dot:80,dotT:3,   desc:'神々の一撃'},
  eternity:{name:'永劫',    t:6,c:'#d8b0ff',kind:'chain',dmg:600,rate:1.4, range:210,chain:16,desc:'終わらない雷'}, // 名前に合わない効き目を外した（2026-11-29）
  cosmos:  {name:'宇宙',    t:6,c:'#c0b0ff',kind:'beam', dmg:820,          range:230,beams:5,                   desc:'星々の光で焼きつくす'},
  kamikaze:{name:'神嵐',    t:6,c:'#c8fff0',kind:'chain',dmg:700,rate:1.4, range:220,chain:18,slow:.4,slowT:1,  desc:'神の嵐が18体を撃つ'},
  rinne:   {name:'輪廻',    t:6,c:'#ffa060',kind:'bolt', dmg:850,rate:1.6, range:210,splash:70,dot:150,dotT:3, desc:'焼かれては蘇る炎'},
  gaia:    {name:'地母神',  t:6,c:'#b8e08a',kind:'pulse',dmg:420,rate:.8,  range:175,slow:.5,slowT:1.5,dot:100,dotT:3,desc:'大地が敵を飲みこむ'},
  chaos:   {name:'混沌',    t:6,c:'#e08aff',kind:'pulse',dmg:500,rate:.8,  range:175,dot:120,dotT:3,slow:.6,slowT:1.2,desc:'炎と氷が渦を巻く'},
  mugen:   {name:'無間地獄',    t:6,c:'#ff4a6a',kind:'trap',                   range:44, slow:.88,slowT:.3,dot:400,dotT:2.5,curse:1.6,knock:8,desc:'罠：抜け出せない地獄'},
  // 特別な効果を持つ元素。聖灰・浄めの霧・竜の宝玉は浄めたり宝が残ったりして★が上がり、錆は崩れて★が下がる
  seihai:  {name:'聖灰',    t:5,c:'#f4e6c8',kind:'relic',range:0,heal:3,desc:'砦へ運ぶと灯が 3 もどる'},
  kayaku:  {name:'火薬',    t:3,c:'#e8503a',kind:'trap', range:30,boom:150,splash:70, desc:'罠：踏まれると大きく爆ぜて、消える'},
  ekibyo:  {name:'疫病',    t:4,c:'#a0d040',kind:'pulse',dmg:8, rate:1, range:105,dot:36,dotT:4,plague:70, desc:'毒で倒れた影から、まわりへ毒がうつる'},
  barbwire:{name:'有刺鉄線',t:3,c:'#b8865a',kind:'trap', range:36,slow:.4,slowT:.3,dot:18,dotT:2,rust:1, desc:'罠：絡めて遅くし、刺し続け、鎧を朽ちさせる'},
  kosenjo: {name:'古戦場',  t:3,c:'#a89080',kind:'pulse',dmg:12, rate:.9, range:95,curse:1.3,rust:1, desc:'錆びた剣が眠る地。まわりの影を呪い、鎧を朽ちさせる'},
  haikyo:  {name:'廃墟',    t:3,c:'#c09a7a',kind:'ward', range:140,slow:.35,slowT:.3, desc:'まわりの影の足を、ずっと鈍らせる'},
  sabi:    {name:'錆',      t:2,c:'#c8783a',kind:'bolt', dmg:14, rate:1,   range:110,rust:1,           desc:'当てた影の鎧を朽ちさせる'},
  fushoku: {name:'腐蝕',    t:3,c:'#9ad04a',kind:'bolt', dmg:22, rate:1,   range:115,dot:14,dotT:4,rust:1,         desc:'鎧を朽ちさせ、毒を流しこむ'},
  seiiki:  {name:'聖域',    t:6,c:'#fff8d8',kind:'ward', range:190,ward:'sil',dps:70,                      desc:'踏みこんだ影の力を封じ、焼き清める'},
  kiyome:  {name:'浄めの霧',t:5,c:'#d8f0ff',kind:'ward', range:150,ward:'sil',                       desc:'まわりの影の力を封じつづける'},
  hougyoku:{name:'竜の宝玉',t:6,c:'#ffd24a',kind:'ward', range:160,gold:2,                           desc:'まわりで倒した影の魔力が 2 倍'},
  // 要石と系統の結界：輪の中の影が、その系統の攻撃を AMP_MUL 倍受ける（影の側にかかる。同じ系統は重ならない）
  kaname:  {name:'要石',    t:3,c:'#e8dcb8',kind:'bolt', dmg:75, rate:.6,  range:130,splash:30,                 desc:'地を鎮める重い石を落とす'},
  flameward:{name:'炎の結界',t:4,c:'#ff6a3d',kind:'ward',range:170,amp:'flame',desc:'輪の中の影は、炎の系統の攻撃を 1.2 倍受ける'},
  waterward:{name:'水の結界',t:4,c:'#4aa8ff',kind:'ward',range:170,amp:'water',desc:'輪の中の影は、水の系統の攻撃を 1.2 倍受ける'},
  earthward:{name:'土の結界',t:4,c:'#c08a4a',kind:'ward',range:170,amp:'earth',desc:'輪の中の影は、土の系統の攻撃を 1.2 倍受ける'},
  windward:{name:'風の結界',t:4,c:'#7df0c0',kind:'ward',range:170,amp:'wind',desc:'輪の中の影は、風の系統の攻撃を 1.2 倍受ける'},
  voltward:{name:'雷の結界',t:4,c:'#ffe45c',kind:'ward',range:170,amp:'volt',desc:'輪の中の影は、雷の系統の攻撃を 1.2 倍受ける'},
  iceward:{name:'氷の結界',t:4,c:'#8fe6ff',kind:'ward',range:170,amp:'ice',desc:'輪の中の影は、氷の系統の攻撃を 1.2 倍受ける'},
  poisonward:{name:'毒の結界',t:4,c:'#8be04a',kind:'ward',range:170,amp:'poison',desc:'輪の中の影は、毒の系統の攻撃を 1.2 倍受ける'},
  darkward:{name:'闇の結界',t:4,c:'#9a7ad8',kind:'ward',range:170,amp:'dark',desc:'輪の中の影は、闇の系統の攻撃を 1.2 倍受ける'},
  lightward:{name:'光の結界',t:4,c:'#fff2a0',kind:'ward',range:170,amp:'light',desc:'輪の中の影は、光の系統の攻撃を 1.2 倍受ける'},
  woodward:{name:'木の結界',t:4,c:'#7ac85a',kind:'ward',range:170,amp:'wood',desc:'輪の中の影は、木の系統の攻撃を 1.2 倍受ける'},
  genesis: {name:'創世',    t:6,c:'#fff6d8',kind:'beam', dmg:700,          range:210,beams:6,desc:'夜そのものを終わらせる'}, // 名前に合わない効き目を外した（2026-11-29）
  // 音（三叉の谷をクリアすると届く基本元素）と、音から作る元素
  sound:   {name:'音',      t:1,c:'#ff8ec8',kind:'pulse',dmg:3,  rate:1,   range:90, stop:.3,stopP:.25,         desc:'範囲の敵全員に当たる波。少しひるませる'},
  hanabi:  {name:'花火',    t:2,c:'#ff9a8a',kind:'pulse',dmg:11, rate:1,   range:85, dot:4,dotT:2,             desc:'周りで弾けて小さな範囲ダメージ'},
  hamon:   {name:'波紋',    t:2,c:'#8ac8ff',kind:'pulse',dmg:5,  rate:1,   range:95, slow:.3,slowT:1.2,        desc:'周りの敵を少し遅くする'},
  jibiki:  {name:'地響き',  t:2,c:'#d8a070',kind:'pulse',dmg:9,  rate:.9,  range:80, stop:.4,stopP:.3,         desc:'周りの敵を一瞬ひるませる'},
  fue:     {name:'笛',      t:2,c:'#a8f0d0',kind:'bolt', dmg:4,  rate:2.2, range:140,                          desc:'遠くまで届く、速い音の弾'},
  koto:    {name:'琴',      t:2,c:'#c8e08a',kind:'support',                range:120,buffD:0,buffR:.15,        desc:'近くの塔の攻撃速度を上げる'},
  suzu:    {name:'鈴',      t:2,c:'#ffe090',kind:'pulse',dmg:6,  rate:1,   range:90, desc:'鳴るたびに周りの敵を打つ'}, // 名前に合わない効き目を外した（2026-11-29）
  juka:    {name:'呪歌',    t:2,c:'#c890ff',kind:'chain',dmg:9,  rate:1,   range:120,chain:3,curse:1.2,        desc:'当てた敵を呪いながら跳ねる'},
  wakon:   {name:'和音',    t:2,c:'#ffa8d8',kind:'support',                range:120,buffD:.12,buffR:0,        desc:'近くの塔のダメージを上げる'},
  shakudama:{name:'尺玉',   t:3,c:'#ff8aa0',kind:'pulse',dmg:26, rate:.9,  range:105,dot:12,dotT:3,            desc:'大きな花火で広い範囲を焼く'},
  furin:   {name:'風鈴',    t:3,c:'#a8e8e0',kind:'pulse',dmg:16, rate:1,   range:105,knock:10,                 desc:'鳴るたびに風が起き、周りの敵を少し押し戻す'},
  kusabue: {name:'草笛',    t:3,c:'#90e090',kind:'chain',dmg:20, rate:1.5, range:140,chain:4,                 desc:'敵から敵へ跳ねる音'},
  taiko:   {name:'太鼓',    t:3,c:'#e0a070',kind:'pulse',dmg:38, rate:.7,  range:85, stop:.5,stopP:.35,        desc:'一定の間隔で大きくひるませる'},
  seseragi:{name:'せせらぎ',t:3,c:'#7ad0f0',kind:'pulse',dmg:8,  rate:1.1, range:115,slow:.4,slowT:1.3,        desc:'川の音で周りの敵を少し遅くする'},
  komoriuta:{name:'子守唄', t:3,c:'#b8b0ff',kind:'pulse',dmg:14, rate:.8,  range:110,slow:.35,slowT:1,stop:1.2,stopP:.25,desc:'周りの敵をまどろませて遅くし、短く眠らせる'}, // 材料の黄昏（★2）より弱かったので、威力と減速を足した
  choonpa: {name:'超音波',  t:3,c:'#d0b8ff',kind:'pierce',dmg:34,rate:1,   range:150,                          desc:'一直線に貫く音'},
  chinkonka:{name:'鎮魂歌', t:3,c:'#b8a8e8',kind:'pulse',dmg:12, rate:1,   range:110,slow:.3,slowT:1,desc:'範囲の敵を鎮めて遅くする'},
  sanbika: {name:'讃美歌',  t:3,c:'#ffe8b0',kind:'support',                range:140,buffD:.16,buffR:.08,      desc:'範囲内の塔を強める'},
  orgel:   {name:'オルゴール',t:3,c:'#ffb8c8',kind:'support',              range:135,buffD:.05,buffR:.20,      desc:'範囲内の塔の攻撃速度を上げる'},
  raimei:  {name:'雷鳴',    t:3,c:'#ffe45c',kind:'chain',dmg:24, rate:1,   range:130,chain:4,stop:.4,stopP:.25,desc:'稲妻とひるみを同時に'},
  yamabiko:{name:'山彦',    t:4,c:'#c8b090',kind:'pulse',dmg:50, rate:.8,  range:120,echo:.4,                 desc:'攻撃が少し遅れてもう一度当たる'},
  matsuribayashi:{name:'祭囃子',t:4,c:'#ff7a6a',kind:'support',            range:150,buffD:.22,buffR:.22,      desc:'範囲内の塔を大きく強める'},
  siren:   {name:'セイレーン',t:4,c:'#6ac8d8',kind:'pulse',dmg:30, rate:.9, range:130,slow:.5,slowT:1.5,knock:14,desc:'歌で敵を足止めし、引き寄せる'},
  kyoumei: {name:'共鳴',    t:4,c:'#c8e8ff',kind:'chain',dmg:55, rate:1.2, range:145,chain:7,                 desc:'当てたダメージが近くの敵にも広がる'},
  soukyoku:{name:'葬送曲',  t:4,c:'#a090c8',kind:'pulse',dmg:50, rate:1,   range:125,desc:'重い調べで範囲の敵を打つ'}, // 名前に合わない効き目を外した（2026-11-29）
  shukufuku:{name:'祝福の鐘',t:4,c:'#ffe090',kind:'support',              range:155,buffD:.28,buffR:.18,      desc:'強い支援。ダメージと速度の両方'},
  shirabe: {name:'風の調べ',t:4,c:'#9af0d0',kind:'chain',dmg:45, rate:2,   range:150,chain:6,                 desc:'とても速い連鎖'},
  tengaku: {name:'天楽',    t:5,c:'#fff0c8',kind:'support',                range:175,buffD:.45,buffR:.30,      desc:'広い範囲の塔をすべて強める'},
  goon:    {name:'轟音',    t:5,c:'#ff9060',kind:'pulse',dmg:130,rate:.8,  range:150,stop:.8,stopP:.35,        desc:'広い範囲の敵をまとめてひるませる'},
  mateki:  {name:'魔笛',    t:5,c:'#c070ff',kind:'pulse',dmg:110,rate:.9,  range:150,stop:1.5,stopP:.3,desc:'魔性の音色で敵を止める'},
  tenchi:  {name:'天地鳴動',t:6,c:'#ffd0f0',kind:'pulse',dmg:480,rate:.8,  range:185,stop:1,stopP:.3,buffD:.30,buffR:.20,desc:'天と地が鳴り響く。広い範囲への攻撃と支援を兼ねる'},
  // 時（砂時計の峠をクリアすると届く基本元素）と、時から作る元素。rew：巻き戻し（その秒数ぶん前にいた場所へ戻す）
  time:    {name:'時',      t:1,c:'#c8d4ff',kind:'pulse',dmg:3,  rate:.8,  range:90, rew:.6,                   desc:'周りの敵を少し前の場所へ戻す'},
  shio:    {name:'潮',      t:2,c:'#8ab8ff',kind:'pulse',dmg:5,  rate:1,   range:95, slow:.35,slowT:1.5,       desc:'満ち引きで周りの敵を遅くする'},
  fossil:  {name:'化石',    t:2,c:'#c8b090',kind:'bolt', dmg:16, rate:.7,  range:110,        desc:'硬い化石をぶつける'}, // 名前に合わない効き目を外した（2026-11-29）
  fuka:    {name:'風化',    t:2,c:'#b8b0a0',kind:'pulse',dmg:6,  rate:1,   range:90, desc:'周りの敵にひびを入れる'},
  nenrin:  {name:'年輪',    t:2,c:'#c8a070',kind:'support',                range:120,buffD:.12,buffR:0,        desc:'近くの塔のダメージを上げる'},
  hidokei: {name:'日時計',  t:2,c:'#ffe8a0',kind:'beam', dmg:14,           range:120,beams:1,slow:.2,slowT:1,  desc:'影の針がのびて敵を焼き、遅くする'},
  boukyaku:{name:'忘却',    t:2,c:'#a8a0d8',kind:'chain',dmg:8,  rate:1,   range:120,chain:3,rew:.5,           desc:'当てた敵が少し前の場所へ戻る。敵から敵へ跳ねる'},
  tokei:   {name:'時計',    t:2,c:'#e0f0ff',kind:'bolt', dmg:9,  rate:2,   range:120,                          desc:'チクタクと時を刻むように、休まず撃つ'},
  setsuna: {name:'刹那',    t:2,c:'#f0f6ff',kind:'bolt', dmg:3,  rate:5,   range:125,                          desc:'ほんの一瞬。とても速い連射'},
  sunadokei:{name:'砂時計', t:3,c:'#e8d0a0',kind:'trap',                   range:36, slow:.75,slowT:.3,         desc:'罠：踏んだ敵の時をほとんど止める'},
  kohaku:  {name:'琥珀',    t:3,c:'#ffb040',kind:'bolt', dmg:40, rate:.7,  range:120,stop:.9,stopP:.3,         desc:'当てた敵を閉じ込めて止める'},
  chisou:  {name:'地層',    t:3,c:'#c89a70',kind:'pulse',dmg:50, rate:.6,  range:75, knock:14,                 desc:'重い一撃で押し戻す'},
  shinshoku:{name:'侵食',   t:3,c:'#9ab8c8',kind:'pulse',dmg:12, rate:1,   range:110,desc:'周りの敵を削り、ひびを入れる'},
  tokeitou:{name:'時計塔',  t:3,c:'#d8c8a8',kind:'support',                range:140,buffD:.05,buffR:.22,      desc:'範囲内の塔の攻撃速度を大きく上げる'},
  kaichu:  {name:'懐中時計',t:3,c:'#e8d890',kind:'bolt', dmg:70, rate:.6,  range:160,fast:1,stop:.4,stopP:.3,  desc:'正確に撃ち抜き、少し止める'},
  zanzou:  {name:'残像',    t:3,c:'#d0e0ff',kind:'pierce',dmg:30,rate:1,   range:150,rew:.4,                   desc:'一直線に貫き、敵を少し前の場所へ戻す'},
  yuukyuu: {name:'悠久',    t:3,c:'#c8c0ff',kind:'pulse',dmg:16, rate:.7,  range:115,rew:1.5,                  desc:'一瞬が積み重なった果てしない時の流れ。周りの敵を大きく巻き戻す'},
  nendo:   {name:'粘土',    t:3,c:'#c89878',kind:'trap',                   range:36, slow:.55,slowT:.8,         desc:'罠：踏んだ敵の足をとって大きく遅くする'},
  gyakkou: {name:'逆行',    t:3,c:'#b8a8ff',kind:'pulse',dmg:14, rate:.8,  range:110,rew:1.2,                  desc:'周りの敵を巻き戻す'},
  oodokei: {name:'大時計',  t:4,c:'#f0e0b0',kind:'support',                range:155,buffD:.26,buffR:.22,      desc:'強い支援。ダメージと速度の両方'},
  ancient: {name:'太古',    t:4,c:'#c8a070',kind:'pulse',dmg:200,rate:.55, range:90, knock:18,                 desc:'大地の重みで叩き返す'},
  jikuu:   {name:'時空',    t:4,c:'#a0a8ff',kind:'pulse',dmg:40, rate:.9,  range:135,slow:.45,slowT:1.5,rew:1.2,desc:'広く遅くし、巻き戻す'},
  sekka:   {name:'石化',    t:4,c:'#c8b8a0',kind:'trap',                 range:40, slow:.8,slowT:.3,stop:1.5, desc:'罠：踏んだ敵を石に変えて止める'},
  iseki:   {name:'遺跡',    t:4,c:'#b8a888',kind:'pulse',dmg:35, rate:1,   range:130,desc:'広い範囲の敵にひびを入れる'},
  chronos: {name:'クロノス',t:5,c:'#d0d8ff',kind:'pulse',dmg:120,rate:.8,  range:160,slow:.4,slowT:1.5,rew:1,buffD:0,buffR:.30,desc:'広い範囲の敵の時を遅らせ、味方の塔の時を速める（攻撃と支援を兼ねる）'},
  doomsday:{name:'終末時計',t:6,c:'#ffb0c0',kind:'pulse',dmg:460,rate:.8,  range:185,rew:2,stop:1,stopP:.3,      desc:'広い範囲の敵を大きく巻き戻し、止める'},
  // 夢（王の間をクリアすると届く基本元素）と、夢から作る元素。conf：惑わし（その秒数、来た道を逆に歩く）。眠りは停止（stop）を長めに使う
  dream:   {name:'夢',      t:1,c:'#e0a8ff',kind:'bolt', dmg:5,  rate:1,   range:110,conf:.8,confP:.2,         desc:'当てた敵をときどき惑わせる'},
  gentou:  {name:'幻灯',    t:2,c:'#ffc890',kind:'pulse',dmg:8,  rate:1,   range:85, dot:4,dotT:2,conf:1,confP:.15,desc:'周りの敵を惑わせ、少し焼く'},
  nemurigusa:{name:'眠り草',t:2,c:'#a8e0a0',kind:'pulse',dmg:5,  rate:1,   range:95, slow:.25,slowT:1,stop:.8,stopP:.15,desc:'周りの敵を遅くし、ときどき眠らせる'},
  hakuchumu:{name:'白昼夢', t:2,c:'#fff0d0',kind:'beam', dmg:14,           range:120,beams:1,conf:.8,confP:.1, desc:'光線で敵を惑わせる'},
  muma:    {name:'夢魔',    t:2,c:'#b880e0',kind:'chain',dmg:9,  rate:1,   range:120,chain:3,curse:1.25,       desc:'当てた敵の命を吸いながら跳ねる'},
  yochimu: {name:'予知夢',  t:2,c:'#c8e0ff',kind:'bolt', dmg:30, rate:.6,  range:170,fast:1,                   desc:'遠くまで届く、外れない一撃'},
  maboroshi:{name:'幻',     t:2,c:'#e8c0ff',kind:'pulse',dmg:5,  rate:.9,  range:95, conf:1,confP:.2,          desc:'周りの敵をまとめて惑わせる'},
  poppy:   {name:'ポピー',  t:3,c:'#ff7a8a',kind:'pulse',dmg:12, rate:.8,  range:110,stop:1.2,stopP:.3,        desc:'周りの敵を眠らせる'},
  kanashibari:{name:'金縛り',t:3,c:'#9a70d0',kind:'chain',dmg:20,rate:1,   range:125,chain:3,stop:.8,stopP:.3,desc:'当てた敵を止める'},
  kagee:   {name:'影絵',    t:3,c:'#c8a0e0',kind:'pulse',dmg:14, rate:.9,  range:110,conf:1.5,confP:.25,       desc:'周りの敵を長く惑わせる'},
  genshi:  {name:'幻視',    t:3,c:'#fff0b0',kind:'pierce',dmg:30,rate:1,   range:150,conf:1,confP:.2,          desc:'一直線に貫き、惑わせる'},
  muyuu:   {name:'夢遊',    t:3,c:'#c0b0ff',kind:'pulse',dmg:10, rate:.7,  range:110,conf:2.2,confP:.25,       desc:'眠ったまま来た道を戻らせる（長い惑わし）'},
  senrigan:{name:'千里眼',  t:3,c:'#a8f0ff',kind:'bolt', dmg:140,rate:.35, range:220,fast:1,                   desc:'とても遠くまで届く強い一撃'},
  mugenyume:{name:'夢幻',   t:3,c:'#e0b0ff',kind:'pulse',dmg:16, rate:.9,  range:115,conf:1.8,confP:.3,        desc:'周りの敵を長く惑わせる'},
  yumenokuni:{name:'夢の国',t:4,c:'#f0b8ff',kind:'pulse',dmg:50, rate:.9,  range:140,conf:2,confP:.4,          desc:'夢の中の世界へ迷いこませる。広い範囲の敵を惑わせる'},
  nemurinomori:{name:'眠りの森',t:4,c:'#80c890',kind:'pulse',dmg:35,rate:.8,range:140,slow:.35,slowT:1.2,stop:1.4,stopP:.3,desc:'広い範囲の敵を眠らせる'},
  shintaku:{name:'神託',    t:4,c:'#fff4c0',kind:'pierce',dmg:160,rate:.9, range:200,                          desc:'遠くの敵を貫く強い光'},
  hypnos:  {name:'ヒュプノス',t:5,c:'#b0a0ff',kind:'pulse',dmg:110,rate:.8,range:160,stop:2,stopP:.35,         desc:'広い範囲の敵を長く眠らせる'},
  morpheus:{name:'モルフェウス',t:5,c:'#e890ff',kind:'pulse',dmg:120,rate:.85,range:160,conf:2,confP:.35,desc:'広い範囲の敵を惑わせる'},
  slumber: {name:'永遠の眠り',t:6,c:'#d8c8ff',kind:'pulse',dmg:450,rate:.8,range:185,stop:2.2,stopP:.35,conf:2,confP:.4,desc:'広い範囲の敵を長く眠らせ、目覚めても惑わせる'},

  // 魂（砂時計の峠をクリアすると届く基本元素）と、魂から作る元素。soul：魂集め（倒すたびに威力 +soul、上限 soulMax、その戦いの間だけ）。lure：誘惑（塔のいちばん近くまで引き返して立ち止まる）
  soul:    {name:'魂',      t:1,c:'#bfe8ff',kind:'bolt', dmg:5,  rate:1,   range:110,soul:.03,soulMax:.45,      desc:'倒すたびに少しずつ強くなる（魂集め）'},
  hitodama:{name:'人魂',    t:2,c:'#8ad0ff',kind:'bolt', dmg:8,  rate:1,   range:115,dot:6,dotT:2.5,           desc:'燃える魂。当てた敵を焼き続ける'},
  reikon:  {name:'霊魂',    t:2,c:'#d0f0ff',kind:'bolt', dmg:9,  rate:1,   range:115,soul:.05,soulMax:.6,       desc:'魂が集まったもの。魂集めが速い'},
  yuurei:  {name:'幽霊',    t:2,c:'#e0e8ff',kind:'pierce',dmg:14,rate:1,   range:140,                          desc:'壁も敵もすり抜けて、一直線に当たる'},
  kinosei: {name:'木の精',  t:2,c:'#9ae08a',kind:'pulse',dmg:6,  rate:1,   range:95, slow:.3,slowT:1.2,         desc:'木に宿る魂。周りの敵を絡めて遅くする'},
  shugorei:{name:'守護霊',  t:2,c:'#fff0c0',kind:'support',                range:120,buffD:.15,buffR:0,        desc:'近くの塔を守り、ダメージを上げる'},
  akuryo:  {name:'悪霊',    t:3,c:'#9a7ad8',kind:'chain',dmg:20, rate:1,   range:125,chain:3,curse:1.35,       desc:'当てた敵を呪いながら跳ねる'},
  yousei:  {name:'妖精',    t:3,c:'#b8ffd8',kind:'bolt', dmg:14, rate:2.2, range:130,conf:.8,confP:.15,        desc:'すばやく飛び回って撃ち、少し惑わせる'},
  tenshi:  {name:'天使',    t:3,c:'#fff6d0',kind:'beam', dmg:24,           range:130,beams:1,buffD:.12,buffR:0, desc:'光で撃ちながら、周りの塔を強める'},
  shinrei: {name:'神霊',    t:3,c:'#e8f8ff',kind:'bolt', dmg:40, rate:.8,  range:140,soul:.04,soulMax:1,       desc:'神々しい霊。強い弾で撃ち、魂集めの上限が高い'},
  zombie:  {name:'ゾンビ',  t:3,c:'#9ac878',kind:'bolt', dmg:24, rate:.8,  range:110,dot:12,dotT:3,slow:.3,slowT:1.5,desc:'墓からよみがえった死体。当てた敵を蝕み、遅くする'},
  daitenshi:{name:'大天使', t:4,c:'#fff0b0',kind:'beam', dmg:70,           range:150,beams:2,buffD:.2,buffR:0,  desc:'強い光で撃ち、広く塔を強める'},
  youseinowa:{name:'妖精の輪',t:4,c:'#c8f0a0',kind:'trap',                 range:38, slow:.5,slowT:.3,stop:1.2, desc:'罠：輪に入った敵を踊らせて止める'},
  akuma:   {name:'悪魔',    t:4,c:'#ff5a7a',kind:'chain',dmg:60, rate:1,   range:135,chain:4,dot:30,dotT:3,curse:1.45,desc:'地獄の炎で焼きながら、敵から敵へ跳ねて呪う'},
  succubus:{name:'サキュバス',t:4,c:'#ff8ad0',kind:'bolt',dmg:50, rate:.8,  range:140,lure:2.2,lureP:.35,       desc:'当てた敵を誘惑して引き戻し、立ち止まらせる'},
  seraphim:{name:'セラフィム',t:5,c:'#ffe8a0',kind:'beam',dmg:150,         range:165,beams:3,dot:40,dotT:2,buffD:.3,buffR:0,desc:'燃える光で広く焼き、塔をすべて強める'},
  maou:    {name:'魔王',    t:5,c:'#e04a6a',kind:'pulse',dmg:130,rate:.85, range:160,dot:50,dotT:3,curse:1.5,  desc:'冥府を治める悪魔の王。広い範囲の敵を焼き、呪う'},
  datenshi:{name:'堕天使',  t:5,c:'#a090c0',kind:'beam', dmg:150,          range:170,beams:2,desc:'悪に堕ちた天使。黒い光で貫く'},
  lilith:  {name:'リリス',  t:5,c:'#ff70b0',kind:'pulse',dmg:110,rate:.8,  range:160,lure:2.5,lureP:.3,desc:'サキュバスたちの母。広い範囲の敵を誘惑して引き戻す'},
  lucifer: {name:'ルシファー',t:6,c:'#fff0f8',kind:'pulse',dmg:480,rate:.8, range:185,dot:80,dotT:3,desc:'悪魔の王になった堕天使。光と闇で広く焼き払う'},
  // 無（最果ての祭壇をクリアすると届く基本元素）と、無から作る元素。「X＋無＝X がない状態」。erase：体力が最大の erase 割以下の敵を消し去る（主・王には効かない）
  void:    {name:'無',      t:1,c:'#d0d0e0',kind:'bolt', dmg:6,  rate:1,   range:110,erase:.08,                desc:'体力の少ない敵を消し去る弾'},
  shinkuu: {name:'真空',    t:2,c:'#c0e0f0',kind:'pulse',dmg:6,  rate:1,   range:95, slow:.3,slowT:1.2,         desc:'空気のない空間。周りの敵の動きを鈍らせる'},
  seijaku: {name:'静寂',    t:2,c:'#c8c8e8',kind:'pulse',dmg:5,  rate:.9,  range:100,sil:2,                    desc:'音が消える。周りの敵を沈黙させ、守りや癒しを封じる'},
  kanbatsu:{name:'干ばつ',  t:2,c:'#e8c080',kind:'pulse',dmg:6,  rate:1,   range:95, dot:5,dotT:3,             desc:'水がない。周りの敵をじわじわ弱らせる'},
  ana:     {name:'穴',      t:2,c:'#a09080',kind:'trap',                   range:34, slow:.5,slowT:.3,stop:.8,  desc:'罠：落ちた敵が少し止まる'},
  nukegara:{name:'抜け殻',  t:2,c:'#d8c8a8',kind:'bolt', dmg:10, rate:1,   range:115,desc:'魂の抜けた器。敵に打ちつける'}, // 名前に合わない効き目を外した（2026-11-29）
  kuukyo:  {name:'空虚',    t:2,c:'#b8b8d0',kind:'pulse',dmg:6,  rate:.9,  range:95, erase:.1,                 desc:'何もない。周りの体力の少ない敵を消し去る'},
  shinkuuha:{name:'真空刃', t:3,c:'#b0f0e0',kind:'pierce',dmg:34,rate:1,   range:150,                          desc:'風の刃で一直線に切り裂く'},
  doukutsu:{name:'洞窟',    t:3,c:'#9a8a78',kind:'trap',                   range:38, slow:.65,slowT:.3,         desc:'罠：迷いこんだ敵が大きく遅くなる'},
  kouya:   {name:'荒野',    t:3,c:'#d8a868',kind:'pulse',dmg:12, rate:1,   range:110,dot:12,dotT:3,desc:'乾ききった地。周りの敵をじわじわ削る'},
  mummy:   {name:'ミイラ',  t:3,c:'#e0d0a8',kind:'chain',dmg:20, rate:1,   range:125,chain:3,slow:.35,slowT:1.5,desc:'包帯で縛って遅くする'},
  kyomu:   {name:'虚無',    t:3,c:'#a8a8c8',kind:'pulse',dmg:14, rate:.9,  range:115,erase:.14,                desc:'すべてが無になる。周りの体力の少ない敵を消し去る'},
  kokuu:   {name:'虚空',    t:4,c:'#8888b8',kind:'pulse',dmg:40, rate:.9,  range:140,erase:.18,                desc:'どこまでも暗い何もない空間。広い範囲の体力の少ない敵を消し去る'},
  blackhole:{name:'ブラックホール',t:5,c:'#b090ff',kind:'pulse',dmg:120,rate:.8,range:160,knock:16,erase:.22,   desc:'すべてを吸いこみ、引き戻して砕く'},
};
for(const k in ITEMS)ITEMS[k].id=k;
/* 呪い：命を削る（毎秒、最大体力の一定割合）。curse の値（1.2〜1.6）から割合を決める。ほかの元素には「受ける傷が増える」効果はない（2026-11-23 に廃止） */
const DRAIN_K=.05,DRAIN_BOSS=.3,DRAIN_T=4;
for(const k of['tomb','curse','vampire','wraith','shinso','reaper','abyss','hyakki','naraku','hellmouth','eternity','mugen','kosenjo','ninetails','juka','muma','akuryo','akuma','maou']){const d=ITEMS[k];d.drain=+((d.curse-1)*DRAIN_K).toFixed(4);delete d.curse}
const RECIPES=[
  // おなじもの同士
  ['fire','fire','flame'],['water','water','pond'],['earth','earth','rock'],['wind','wind','gust'],
  ['flame','flame','inferno'],['pond','pond','sea'],['rock','rock','mountain'],['gust','gust','tornado'],
  ['bog','bog','mire'],['quicksand','quicksand','antlion'],['crater','crater','purgatory'],['frost','frost','permafrost'],
  ['purgatory','mire','hellmouth'],['permafrost','jikuu','stasis'],
  ['swamp','swamp','bog'],['sand','sand','quicksand'],['lava','lava','crater'],
  ['inferno','inferno','sun'],['sea','sea','tsunami'],['mountain','mountain','peak'],['tornado','tornado','typhoon'],
  // ちがうもの同士
  ['fire','water','steam'],['fire','earth','lava'],['fire','wind','bolt'],
  ['water','earth','swamp'],['water','wind','ice'],['earth','wind','sand'],
  ['steam','bolt','engine'],['steam','ice','blizzard'],['lava','sand','glass'],['lava','swamp','miasma'],
  ['bolt','sand','glass'],['ice','sand','crystal'],['swamp','bolt','curse'],['lava','ice','obsidian'],
  ['inazuma','blizzard','cataclysm'],['glass','crystal','star'],['miasma','curse','abyss'],['engine','obsidian','titan'],
  // ★2 どうしの、もうひとつの組み合わせ
  ['flame','rock','iron'],['pond','gust','mist'],['rock','sand','golem'],['gust','sand','sandstorm'],['flame','swamp','wisp'],
  ['bolt','rock','magnet'],['swamp','gust','spore'],['flame','gust','heat'],['pond','ice','frost'],
  ['iron','magnet','railgun'],['golem','mountain','colossus'],
  ['star','abyss','stone'],['cataclysm','titan','ragnarok'],['sun','typhoon','phoenix'],['tsunami','peak','dragon'],
  ['stone','ragnarok','genesis'],
  // 図鑑の追加分
  ['pond','flame','hotspring'],['steam','gust','raincloud'],['bolt','flame','plasma'],['rock','ice','glacier'],['lava','rock','volcano'],
  ['sand','pond','mud'],['gust','bolt','thunderbird'],['flame','ice','blueflame'],['steam','rock','geyser'],['ice','gust','icicle'],['bolt','pond','eel'],
  ['engine','iron','tank'],['spore','mist','forest'],['blizzard','glacier','iceage'],['volcano','inferno','eruption'],
  ['thunderbird','inazuma','raijin'],['obsidian','iron','katana'],
  ['tank','titan','fortress'],['raijin','cataclysm','thunderlord'],['wraith','reaper','hyakki'],['forest','sun','yggdrasil'],['katana','railgun','holysword'],
  ['yggdrasil','holysword','myth'],['thunderlord','hyakki','eternity'],
  ['hotspring','sea','ryugu'],['raincloud','inazuma','thunderstorm'],['raincloud','tornado','storm'],['plasma','magnet','particle'],['icicle','crystal','icespear'],['blueflame','wisp','foxfire'],
  ['mud','quicksand','bottomless'],['eel','sea','seaserpent'],
  ['star','sun','galaxy'],['tsunami','seaserpent','poseidon'],['iceage','icespear','absolutezero'],['eruption','sun','solarflare'],['colossus','peak','kyoshin'],
  ['thunderstorm','raijin','thunderlord'],['typhoon','storm','fujin'],['typhoon','typhoon','fujin'],['fujin','thunderlord','fujinraijin'],['foxfire','wraith','ninetails'],['particle','railgun','photon'],['ryugu','forest','paradise'],
  ['galaxy','galaxy','cosmos'],['poseidon','fujin','kamikaze'],['ninetails','phoenix','rinne'],['kyoshin','yggdrasil','gaia'],['absolutezero','solarflare','chaos'],
  ['naraku','stasis','mugen'],
  // もう 1 つの作り方（名前から想像できる組み合わせ）
  ['venom','swamp','bog'],['venom','steam','miasma'],['tomb','shadow','curse'],['tomb','flame','wisp'],['thicket','swamp','spore'],
  ['gem','ice','crystal'],['sand','swamp','quicksand'],['steam','pond','mist'],['twilight','shadow','nightfall'],['bat','tomb','vampire'],
  ['blackflame','lava','gokuen'],['gem','rock','diamond'],['thicket','leaves','jungle'],['flash','ray','laser'],['ice','ice','glacier'],
  ['steam','steam','raincloud'],['bolt','bolt','inazuma'],
  ['bog','toxin','mire'],['jungle','jungle','forest'],['nightfall','curse','abyss'],['holylight','nightfall','star'],['holylight','inferno','sun'],
  ['holylight','laser','tenkou'],['jungle','mist','jukai'],['sea','tornado','typhoon'],['volcano','volcano','eruption'],['glacier','glacier','iceage'],
  ['thunderbird','thunderbird','raijin'],
  ['forest','jukai','yggdrasil'],['sun','sun','solarflare'],['star','star','galaxy'],['tsunami','tsunami','poseidon'],['raijin','raijin','thunderlord'],
  // 木・光・闇（あとから解放される基本元素）
  ['wood','wood','thicket'],['wood','fire','charcoal'],['wood','water','flower'],['wood','earth','root'],['wood','wind','leaves'],
  ['light','light','flash'],['light','fire','ray'],['light','water','rainbow'],['light','earth','gem'],['light','wind','aurora'],['light','wood','firefly'],
  ['dark','dark','shadow'],['dark','fire','blackflame'],['dark','water','venom'],['dark','earth','tomb'],['dark','wind','bat'],['dark','light','twilight'],['dark','wood','thorn'],
  ['thicket','thicket','jungle'],['gem','gem','diamond'],['flash','flash','holylight'],['ray','ray','laser'],['shadow','shadow','nightfall'],
  ['bat','bat','vampire'],['venom','venom','toxin'],['root','thorn','thornwall'],['firefly','firefly','hotaru'],['blackflame','blackflame','gokuen'],
  ['vampire','curse','shinso'],['laser','glass','tenkou'],['jungle','spore','jukai'],
  // 支援の塔（攻撃せず、まわりの塔を強める）
  ['rock','charcoal','lantern'],['iron','lantern','bonfire'],['tenkou','bonfire','moonlamp'],
  // 鏡・蜃気楼の系統
  ['glass','iron','mirror'],['mirror','mirror','kaleidoscope'],
  ['heat','heat','kagerou'],['kagerou','desert','mirage'],
  // 灰・石鹸・セメントの系統
  ['vampire','holylight','hai'],['hai','flower','sekken'],['hai','rock','cement'],
  ['sekken','sekken','awa'],['cement','raincloud','concrete'],['awa','awa','shabondama'],
  // 浄めたり、宝が残ったりするもの（特別な効果。錬成でしか作れない）
  ['shinso','tenkou','seihai'],['wraith','tenkou','kiyome'],['dragon','holysword','hougyoku'],
  ['sabi','venom','fushoku'],['charcoal','flame','kayaku'],['sabi','thorn','barbwire'],['sabi','tomb','kosenjo'],['sabi','twilight','haikyo'],['miasma','bog','ekibyo'],['kiyome','holysword','seiiki'],
  // 誰でも知っている弱点・結末で崩れて、★が下がるもの（吸血鬼＋聖光＝灰 の仲間）
  ['iron','raincloud','sabi'],['iron','yuukyuu','sabi'],['iceage','sun','water'],['golem','raincloud','earth'],
  // 音（基本元素）と、音から作る元素
  ['sound','fire','hanabi'],['sound','water','hamon'],['sound','earth','jibiki'],['sound','wind','fue'],['sound','wood','koto'],['sound','light','suzu'],['sound','dark','juka'],['sound','sound','wakon'],
  ['hanabi','flame','shakudama'],['suzu','gust','furin'],['fue','leaves','kusabue'],['jibiki','koto','taiko'],['hamon','pond','seseragi'],['koto','twilight','komoriuta'],
  ['juka','bat','choonpa'],['juka','tomb','chinkonka'],['wakon','flash','sanbika'],['suzu','gem','orgel'],['hanabi','bolt','raimei'],
  ['taiko','mountain','yamabiko'],['taiko','shakudama','matsuribayashi'],['komoriuta','sea','siren'],['choonpa','crystal','kyoumei'],['chinkonka','curse','soukyoku'],['sanbika','holylight','shukufuku'],['furin','kusabue','shirabe'],
  ['shukufuku','tenkou','tengaku'],['yamabiko','kyoumei','goon'],['siren','soukyoku','mateki'],['tengaku','goon','tenchi'],
  // 要石と系統の結界：要石（★3）＋ 系統ごとに決まった★3
  ['rock','flash','kaname'],
  ['kaname','crater','flameward'],['kaname','sea','waterward'],['kaname','mountain','earthward'],['kaname','tornado','windward'],['kaname','inazuma','voltward'],['kaname','frost','iceward'],['kaname','bog','poisonward'],['kaname','curse','darkward'],['kaname','holylight','lightward'],['kaname','jungle','woodward'],
  // 時
  ['time','water','shio'],['time','earth','fossil'],['time','wind','fuka'],['time','wood','nenrin'],['time','light','hidokei'],['time','dark','boukyaku'],['time','sound','tokei'],['time','time','setsuna'],
  ['sand','tokei','sunadokei'],['fossil','leaves','kohaku'],['fossil','rock','chisou'],['fuka','shio','shinshoku'],['tokei','rock','tokeitou'],['tokei','gem','kaichu'],['flash','setsuna','zanzou'],['setsuna','setsuna','yuukyuu'],['fuka','rock','nendo'],['tokei','boukyaku','gyakkou'],
  ['tokeitou','kaichu','oodokei'],['chisou','mountain','ancient'],['gyakkou','zanzou','jikuu'],['chisou','kohaku','sekka'],['shinshoku','haikyo','iseki'],['haikyo','yuukyuu','iseki'],
  ['frost','chisou','permafrost'],['oodokei','jikuu','chronos'],['sekka','jikuu','stasis'],['chronos','stasis','doomsday'],
  // 夢
  ['dream','fire','gentou'],['dream','wood','nemurigusa'],['dream','light','hakuchumu'],['dream','dark','muma'],['dream','time','yochimu'],['dream','dream','maboroshi'],
  ['nemurigusa','flower','poppy'],['muma','shadow','kanashibari'],['gentou','shadow','kagee'],['hakuchumu','flash','genshi'],['maboroshi','nemurigusa','muyuu'],['yochimu','ray','senrigan'],
  ['maboroshi','maboroshi','mugenyume'],['poppy','jungle','nemurinomori'],['genshi','senrigan','shintaku'],['mugenyume','muyuu','yumenokuni'],
  ['yumenokuni','nemurinomori','hypnos'],['yumenokuni','shintaku','morpheus'],['hypnos','morpheus','slumber'],
  // 魂
  ['soul','fire','hitodama'],['soul','soul','reikon'],['soul','dark','yuurei'],['soul','wood','kinosei'],['soul','light','shugorei'],
  ['yuurei','shadow','akuryo'],['kinosei','flower','yousei'],['shugorei','flash','tenshi'],['reikon','reikon','shinrei'],['tomb','hitodama','zombie'],
  ['tenshi','holylight','daitenshi'],['yousei','spore','youseinowa'],['akuryo','gokuen','akuma'],['kanashibari','akuryo','succubus'],
  ['akuryo','curse','wraith'],['akuryo','kosenjo','reaper'],['akuryo','miasma','reaper'],['akuryo','nightfall','abyss'],
  ['daitenshi','tenkou','seraphim'],['akuma','abyss','maou'],['daitenshi','akuma','datenshi'],['succubus','akuma','lilith'],['maou','datenshi','lucifer'],
  // 無
  ['void','wind','shinkuu'],['void','sound','seijaku'],['void','water','kanbatsu'],['void','earth','ana'],['void','soul','nukegara'],['void','void','kuukyo'],
  ['shinkuu','gust','shinkuuha'],['ana','rock','doukutsu'],['kanbatsu','sand','kouya'],['nukegara','tomb','mummy'],['kuukyo','kuukyo','kyomu'],
  ['kyomu','nightfall','kokuu'],['kouya','sandstorm','desert'],['kokuu','star','blackhole'],['bottomless','kokuu','naraku'],['galaxy','blackhole','cosmos'],
];
const rkey=(a,b)=>a<b?a+'+'+b:b+'+'+a;
const RECIPE={},MADE_BY={};
for(const[a,b,r]of RECIPES){RECIPE[rkey(a,b)]=r;(MADE_BY[r]=MADE_BY[r]||[]).push([a,b])} // 1 つの元素に作り方が複数あってよい
const BASES=['fire','water','earth','wind'];
// 図鑑の発見数が増えると解放される基本元素（解放後は ◆10 で呼び出せる）
const UNLOCK={wood:0,light:1,dark:14,sound:2,time:6,dream:11,soul:3,void:15}; // 基本元素は、このステージ（STAGES の番号。通常の難易度）をクリアすると届く。図鑑の数では開かない
// 並び順では 宵の回廊→木、螺旋の庭→光、十字の辻→闇、双つの門→音、砂時計の峠→時、光の届かぬ森→夢、三叉の谷→魂、星降りの道→無。王の間と最果ての祭壇は空き
// ★ごとの威力の倍率（2026-11-26）：★が上がるごとの強さの差をなだらかにする。攻撃する塔のダメージ（dmg）と燃やすダメージ（dot）だけにかける。射程・速さ・遅くする効果・値段は変えない
// それまでは魔力あたりの威力が ★1〜3 でほぼ横ばい、★4 から急に強かった（雑魚が出口の近くで消えて、低い★を並べる意味がなかった）
const TIER_POW={1:1.2,2:1.15,3:1.05,4:.85,5:.75,6:.55};
for(const id in ITEMS){const d=ITEMS[id];if(['bolt','pulse','beam','chain','pierce'].includes(d.kind)){const m=TIER_POW[d.t]||1;if(d.dmg)d.dmg*=m;if(d.dot)d.dot*=m}}
const BASE_COST=10,TOTAL=Object.keys(ITEMS).length;
// 最高ランク（いまは★6）：これより上の錬成がない★。エンドレスでは盤面で選ぶと魔力で「+1」ずつ強化できる（上限なし）
// +n の威力は (1+ENH_POW×n) 倍。+n から +n+1 への値段は ENH_COST+ENH_STEP×n（段ごとに少しずつ上がる）
const MAX_T=Math.max(...Object.values(ITEMS).map(d=>d.t));
let ENH_POW=.5,ENH_COST=10,ENH_STEP=40;
const enhM=it=>1+ENH_POW*(it.lv||0),enhCost=it=>ENH_COST+ENH_STEP*(it.lv||0),enhSpent=it=>{const n=it.lv||0;return ENH_COST*n+ENH_STEP*n*(n-1)/2};
const canEnh=it=>S.endless&&!!it&&ITEMS[it.id].t===MAX_T&&ITEMS[it.id].kind!=='relic'; // 強化はエンドレス（20波を退けた後）だけ。通常の20波の難しさは変えない
const itemValue=it=>{const d=ITEMS[it.id],m=typeof dailyMut==='function'&&dailyMut()==='trapMaster'?(d.kind==='trap'?.5:d.kind==='relic'?1:1.3):1;return Math.round(BASE_COST*2**(d.t-1)*m)+(it.lv?enhSpent(it):0)};
const isTrap=id=>ITEMS[id].kind==='trap',isSupport=id=>ITEMS[id].kind==='support',isBuffer=id=>ITEMS[id].buffD!=null; // 支援の塔のほか、攻撃しながらまわりを強める元素（天地鳴動）も強める側
const noAtk=d=>d.kind==='support'||d.kind==='ward'||d.kind==='relic'; // 攻撃しない（支援・結界・砦で使うもの）
// 置ける場所：魔法陣には塔、道の上には罠、作業台にはなんでも
const fits=(id,sl)=>sl.bench||(ITEMS[id].kind!=='relic'&&(sl.path?isTrap(id):!isTrap(id))); // 聖灰などは作業台にだけ置ける（砦へ運んで使う）
