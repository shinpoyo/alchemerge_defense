# アルケマージ（Alchemerge / alchemerge_defense）

元素を重ねて新しい元素を錬成し、できた元素で砦を守る **マージ×タワーディフェンス**。ブラウザで動く。

- 公開 URL（`main` を GitHub Pages で公開した場合）：https://shinpoyo.com/alchemerge_defense/
- 動かし方：`index.html` をブラウザで開くだけ。ビルドなし・外部ライブラリなし（フォントだけ Google Fonts。読めなくても動く）

## 遊び方

1. 画面下の一覧から **火・水・土・風** を呼び出す（各 魔力 10）
2. 元素を **重ねる** と新しい元素になる。ちがうもの同士（火＋水＝蒸気）でも、おなじもの同士（水＋水＝池、池＋池＝海）でも変わる
3. できた元素を **魔法陣** に置くと塔になって戦う。沼などの **罠は道の上** に置く
4. **20 の夜波** を退ければクリア。その先はエンドレス
5. ステージは 3 つ（宵の回廊・螺旋の庭・双つの門）。クリアすると次のステージと、難しい「悪夢」が開く。見つけた元素はどのステージにも持ち越される

元素は全 54 種・レシピ 50 個。★はその元素のランク（1〜6）。一度見つけた元素は、画面下の一覧（★ごとのタブ）から直接呼び出せる（値段は 1 ランクごとに 2 倍）。図鑑では見つけた元素とレシピを確認できる。

## そのほかの機能

- **言語**：日本語／English。タイトル画面のボタンで切りかえ（最初は端末の言語に合わせる）
- **共有**：クリア・陥落・図鑑の画面から、結果の文章と盤面の画像を共有できる
- **記録**：ステージ×難易度ごとの最高到達波とクリア、見つけた元素、音と言語の設定を端末内に保存
- **途中保存**：進行中の戦い（ステージ・波・魔力・灯・置いてある元素）を自動で保存。次に開くと、ステージ選択の先頭に「つづきから」が出る。戦闘の途中で閉じた場合は、その波の最初から

## English

**Alchemerge** is a merge × tower defense game that runs in the browser. Stack elements to discover new ones (54 elements, 50 recipes), place them on magic circles as towers, and put traps on the road. Three stages, plus a Nightmare difficulty. No install, no sign-up. Switch the language with the button on the title screen.

## ファイル

| パス | 内容 |
|---|---|
| `index.html` | ゲーム本体（HTML・CSS・JavaScript を 1 ファイルに収めている） |
| `docs/worklog.md` | 作業履歴 |
| `docs/competitors.md` | 競合調査（2026-11-13） |
| `docs/design-critique.md` | デザイン講評（2026-11-13） |

## コードの場所（`index.html` の中）

| 見出しコメント | 内容 |
|---|---|
| 言語 | `TX`（画面の文言。日本語と英語）、`EN`（元素の英語名と説明） |
| 元素（アイテム）の定義 | `ITEMS`（名前・ランク・色・攻撃の種類と数値）と `RECIPES`（組み合わせ） |
| 盤面 | `STAGES`（ステージごとの道・魔法陣・罠マスの位置、体力の倍率）、作業台・ボタンの位置 |
| 敵 | 敵の種類、体力の伸び（`HP0` `HP_GROW`）、波の組み立て（`buildWave`） |
| 元素のアイコン | `ICON`。元素ごとの絵をキャンバスに描く |
| 錬成 / 戦闘 | 重ねたときの処理、塔と罠の攻撃 |
| クリア・ゲームオーバー | 花火・紙吹雪・夜明けの演出 |

元素を足すときは、`ITEMS` に 1 行、`EN` に英語名と説明、`RECIPES` に 1 行、`ICON` に絵を 1 つ足す。

保存は端末内（localStorage）だけ。
