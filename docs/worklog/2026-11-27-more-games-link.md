# メニューに「作者のほかのゲーム」を足す（2026-11-27）

## きっかけ
shinpoyo.com を育てる施策（shinpoyo.github.io の `docs/growth-plan-2026-11.md`）の「ゲームからサイトへ戻る道をつくる」。検索や共有からゲームの URL に直接来た人は、ほかの作品があることを知らない。けしカス・マシマシ打・Bullet Reflector にはリンクがあり、アルケマージにはなかった。

## 変えたこと
- メニューの一番下（「進行をリセット」の下）に「作者のほかのゲーム」（英語は More games by the author）。`https://shinpoyo.com/works/` を別タブで開く
- けしカスと同じく、shinpoyo.com / shinpoyo.github.io で遊んでいるときだけ出す（よそで公開した版には出さない）
- `a.lnk` に `button.lnk` と同じ見た目を当てた

## 確かめたこと
- Playwright で shinpoyo.com のアドレスに手元のファイルを読ませ、メニューを開いて表示とリンク先を確認した
