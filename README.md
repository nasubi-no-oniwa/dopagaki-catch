# ドパがきにしかできないゲーム

長押しで力をためて、ボールを真上に投げる。落ちてくるボールを「ポーン」に合わせてキャッチ。0.00001秒を争う。

あそぶ: https://nasubi-no-oniwa.github.io/dopagaki-catch/

なすびのお庭: https://nasubi-no-oniwa.github.io/

- 判定の計算は `physics.js`（ゲームとサーバー側の確認で同じものを使う。変えると前の記録が確認で合わなくなる）
- ランキングは furoya-no-onna の Firebase（`dpc/` の下）。ルールも furoya-no-onna の `database.rules.json`
- 管理画面: `admin.html`
