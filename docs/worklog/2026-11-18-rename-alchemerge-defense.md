# 2026-11-18 ゲーム名を「アルケマージ・ディフェンス」に変更

## 依頼
「アルケマージディフェンスだな」（shinji）。ゲーム名を「アルケマージ・ディフェンス」（英字 Alchemerge Defense）にする。

## やったこと（名前が表示される箇所だけ）
- `index.html`
  - `<title>` と `og:title`、言語切替時の `docTitle`（日・英）
  - タイトル画面の大見出し：「アルケマージ／ディフェンス」「ALCHEMERGE／DEFENSE」の 2 行にした（1 行だと画面幅に収まらないため）。`spanify()` が `\n` を `<br>` にするよう 1 か所だけ変更
  - 共有の文章・共有画像に出る名前（`title`）
  - キャンバス用フォントの先読み文字列に「・ディフェンス」を追加
  - 冒頭コメントの名前
- `README.md`：見出しと英語の説明の名前

## 変えていないもの
- 保存キー（`yoiyami-alchemy-v1`）、デイリーの種（`alchemerge:`）、共有画像のファイル名、URL（`/alchemerge_defense/`）。変えると記録が消える・日替わりが変わるため
- ジャンル表記「MERGE × TOWER DEFENSE」
- 紹介サイト（shinpoyo.github.io）側の名前（別リポジトリ）

## 確認（Playwright、450×800）
- 日本語・英語ともタイトル画面で 2 行の見出しが枠内に収まり、ページエラーなし。`document.title` も新名称になった

## 名前の被り（Web 検索で軽く確認）
- 「Alchemerge」と完全一致するゲームは見つからなかった
- 似た名前：『AlchiMerge: Merge & Craft』（iOS/Android のマージパズル）、『Alchemage』（Steam/itch.io。カタカナだと「アルケメイジ」で音が近い）
- 米国商標で「ALCHEMERGY」（85955909）の登録情報あり。区分・現状は未確認
- 日本の商標（J-PlatPat）は未確認
