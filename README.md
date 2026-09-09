# 言行チェック

国会議員の**主張**と**国会での行動**を、短い要約と公式リンクで対照する静的サイトです。リポジトリのスラッグは `kouyaku-check` です。

ラベルは **一致 / ズレ / 不明** だけです。信頼スコア、偏差値、ランキングはありません。

## プロダクトルール

- データベースは使いません。`data/politicians/*.yaml` をビルド時に読み、Astro で静的生成します。
- 議員は1人1ページ。インデックスには掲載対象のみを出します。
- 出典は公開資料（選挙公報、党公式、国会会議録、本会議表決）に限ります。
- 長文の verbatim 転載はしません。約40字の言い換えと公式URLだけを置きます。
- 生のスクレイプダンプ、非公開メモ、秘密情報はリポジトリに入れません。
- すべてのページに「公開資料の対照であり、断罪・判決・法律相談ではない」旨の注意書きを出します。
- 就任前の表決は作りません。安野貴博は2025-07-20当選、2025-07-29就任。観察開始は第218回国会（2025-08-01召集）以降です。

## 技術

- Astro（SSG）+ TypeScript
- パッケージ管理は `pnpm`
- Vercel に静的ホストする想定。`vercel.json` は不要です（Astro を自動検出）

```bash
pnpm install
pnpm dev      # http://127.0.0.1:4321
pnpm build    # dist/ を生成し YAML を検証
pnpm preview
```

## YAML の追加方法

1. `data/politicians/{id}.yaml` を追加します。ファイル名と `id` を一致させてください。参議院は `hc-{議員番号}` を推奨します。
2. 必須フィールド:

```yaml
id: hc-xxxxxxxx
name: 氏名
name_kana: しめい
house: 参議院（比例）
party: 会派名
profile_url: https://www.sangiin.go.jp/...
updated_at: YYYY-MM-DD
window:
  from: YYYY-MM-DD
  to: null          # 継続中なら null
entries:
  - id: L01
    topic: political-funds
    claim:
      summary: 約40字の言い換え
      date: YYYY-MM-DD
      source_url: https://...
      source_type: bulletin   # bulletin | party | minutes | vote | none
    action:
      summary: 約40字の言い換え
      date: YYYY-MM-DD        # なければ null
      source_url: https://... # なければ ""
      source_type: vote
      diet_session: 221       # なければ null
    label: 一致               # 一致 | ズレ | 不明
    notes: 判断理由と出典の補足
```

3. 任意で `slug`（例: `anno-takahiro`）を置くと `/politicians/{slug}` でも同じページが出ます。
4. `source_url` は実在する公式ページだけを書いてください。公報の安定URLが無いときは、選管の公式掲載ページや党公式ページを使い、`notes` にその旨を書きます。架空URLは禁止です。
5. `pnpm validate` でスキーマと件数を確認してからコミットします。

## オープンリポジトリの衛生

- APIトークン、`.env`、cookie、非公開スクレイプ結果をコミットしない。
- 会議録はリンクし、長文を貼らない。
- 秘密情報や個人の連絡先を YAML に書かない。
- 依存関係は lockfile（`pnpm-lock.yaml`）で固定する。

## Vercel へのつなぎ方（トークンは貼らない）

ダッシュボード操作だけです。CLI トークンや秘密鍵をチャットや README に貼らないでください。

1. [Vercel](https://vercel.com/) に GitHub アカウントでログインする。
2. **Add New… → Project** を開き、`nagisora/kouyaku-check` を Import する。
3. Framework Preset が **Astro** になっていればそのまま。Build Command は `pnpm run build`、Output は `dist`。
4. ルートディレクトリはリポジトリ直下。環境変数は不要です。
5. **Deploy** する。プレビューURLで `/` と `/politicians/hc-7025005` を確認する。
6. 問題なければ Production に昇格（または main マージ後の自動デプロイ）する。

GitHub 側で Vercel GitHub App のアクセスをこのリポジトリに許可する必要があります。トークンを発行して README に書く必要はありません。

## ライセンスと免責

掲載内容は公開資料の整理です。正確性の保証はなく、投票判断や法的判断の根拠として使うものではありません。
