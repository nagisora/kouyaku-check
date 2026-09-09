# 公約チェック

国会議員の主張と国会での行動を **一致 / ズレ / 不明** だけで対照する静的サイトです。信頼スコア、偏差値、ランキングは置きません。

## Gate

判定は各コマンドの終了コードで行う。パイプすると最後の段のコードだけが見える。

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`（`astro check`。ever-better 既定の `tsc --noEmit` は `.astro` を読めない）
- `pnpm test`
- `pnpm validate` / `pnpm build` / `pnpm check`

## プロダクト制約

- ラベルは 一致 / ズレ / 不明 のみ。
- `src/components/Disclaimer.astro` と layout の description の意味を変えない。
- `data/politicians/hc-7025005.yaml` の内容・意味を書き換えない。
- 公開リポジトリに秘密情報を置かない。
- Cloudflare への切り替えと新規議員追加は、この品質作業の範囲外。

## テスト

Vitest。ファイルは `test/`。YAML スキーマは `scripts/validate-data.mjs`。

## ever-better 生成物（手で本文を編集しない）

`QUALITY.md`（`<!-- ever-better:notes:start -->` の中だけ残る）、`.ever-better/state.json`、`eslint-suppressions.json`。

## ルール例外

- `id-length` は製品ラベル **一致 / ズレ / 不明**（いずれも2文字）を許可する。英語キーへ置き換えると公開ラベルが変わる。

## Astro

ever-better 0.5.0 は `.astro` を lint しない。偽の Astro ESLint スタックは入れない。ベースラインは `.ts` / `.js` のみ。
