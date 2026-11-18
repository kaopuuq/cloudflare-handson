# ひとこと掲示板（Cloudflareハンズオン用）

Cloudflare PagesとWorkersの使い方を学ぶためのデモです。手順はハンズオン資料（mainブランチの`docs/guide.html`）にまとめています。ブラウザで開いて読んでください。

## 段階
| ブランチ | 内容 | 公開先 |
|---|---|---|
| `step-a` | Astroで作った静的なページ | Cloudflare Pages |
| `step-b` | 同じサイトをWorkersに移したもの | Cloudflare Workers |
| `step-c` | 投稿APIとD1を足して掲示板にしたもの | Cloudflare Workers |

途中でつまずいたときは、次の段階のブランチから始めてください。

## 必要なもの
- Node.js 22.23.4以上（LTSのバージョンを推奨）
- Git
- CloudflareとGitHubのアカウント

## ローカルで動かす
```sh
npm install
npm run dev      # http://localhost:4321で表示する
npm run build    # dist/に公開用のファイルを作る
npm run preview  # ビルドしてからWorkersのローカル環境で動かす（http://localhost:8787）
npm run deploy   # ビルドしてからWorkersにデプロイする（wrangler loginが必要）
```

## ファイルの構成
- `src/pages/`：ページ。ファイル名がそのままURLになる（`about.astro` → `/about`）
- `src/layouts/Layout.astro`：全ページで共通の枠
- `public/`：加工せずに公開するファイル（CSS、画像、`_headers`、`_redirects`）
- `wrangler.jsonc`：Workersの設定（名前、公開するディレクトリなど）
