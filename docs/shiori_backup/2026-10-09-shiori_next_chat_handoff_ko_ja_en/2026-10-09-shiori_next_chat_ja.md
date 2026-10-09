# Shiori 開発の引き継ぎ --- 新しいチャット用プロンプト

> 以下の「新しいチャットに貼り付けるメッセージ」を、そのまま新しい
> ChatGPT
> チャットの最初のメッセージとして使用してください。必要に応じて、関連するソースコードを追加してください。

------------------------------------------------------------------------

## 新しいチャットに貼り付けるメッセージ

私は Windows 環境で個人向け Web アプリ **Shiori**
を開発しています。前回のチャットでは Fastify を使った CRUD とゴミ箱 API
の段階的な移行を進めました。これからは、**既存機能を維持しつつ、クライアントとサーバーを完全に分離し、Windows
上のローカルストレージをメインの保存先にする**作業を少しずつ進めたいです。

### 1. 開発環境

-   プロジェクト: `H:\shiori`
-   フロントエンド: React 19 / Vite 7 / TypeScript
-   バックエンド: Fastify / TypeScript --- `H:\shiori\apps\api`
-   現在の認証: Supabase Auth（JWT Bearer）
-   現在のメイン DB: Supabase PostgreSQL
-   フロントエンドのホスティング: Vercel
-   ローカル環境: Vite `http://localhost:5173`、Fastify
    `http://127.0.0.1:3001`
-   最終目標: React は API のみを利用し、Fastify が DB
    とファイルを管理する。Windows 上の PostgreSQL
    とローカルファイル保存領域をメインにする。
-   既存 UI、認証、データ、機能をできる限り維持する。

### 2. 主なコード

-   `src/lib/supabaseClient.ts`: 既存 Supabase クライアント
-   `src/lib/apiClient.ts`: `apiGet`、`apiPost`、`apiPatch`
    など。認証トークンを送信
-   `src/features/shiori/repo/shioriRepo.ts`:
    記事の一覧・詳細・作成・更新
-   ゴミ箱用 repo: soft delete、一覧、復元、完全削除
-   `src/features/attachments/lib/deleteAttachment.ts`: 保存方式別の削除
-   `src/features/attachments/local/localAttachmentStore.ts`:
    ブラウザーの File System Access API
-   `apps/api/src/modules/shiori/{routes,controller,service,repository,createSchema}.ts`:
    Fastify API
-   `apps/api/src/middleware/requireAuth.ts`: Supabase JWT の検証

### 3. 前回のチャットで実装・確認したこと

-   `GET /api/logs`: 一覧、並び替え、ページング --- HTTP 200
-   `GET /api/logs/:id`: 詳細取得と 404 処理を実装
-   `POST /api/logs`: 実際の記事作成 --- HTTP 201
-   `PATCH /api/logs/:id`: 実際の記事更新 --- HTTP 200
-   `DELETE /api/logs/:id`: ゴミ箱への移動（soft delete）--- HTTP 204
-   `GET /api/logs/trash`: ゴミ箱一覧 --- HTTP 200
-   `DELETE /api/logs/:id/permanent`: 添付ファイルなしの記事の完全削除
    --- HTTP 204
-   ローカル添付ファイル付きの記事では、ゴミ箱へ移した時点ではファイルが残り、ゴミ箱から完全削除すると
    Windows フォルダーのファイルが消えることを確認した。
-   ただし、添付ファイル付き記事の完全削除は、まだ既存の
    React・Supabase／ブラウザー側の処理を利用している。削除責任がすべて
    Fastify に移ったわけではない。

### 4. 重要な技術的背景

-   Fastify の repository はユーザー JWT を Supabase
    クライアントへ渡し、RLS を維持している。
-   読み取りには `shiori_items_v` ビュー、書き込み・更新には
    `shiori_items` テーブルを使用。
-   ビューには非表示、削除、本文の長さなどの条件があり、保存に成功しても一覧に表示されない場合がある。
-   `validateContentBlocks()` は `ReferenceItem[]` を要求する。以前
    `unknown[]` との型不一致が起きたため、Zod
    による入力検証と型の整合性が重要。
-   ローカル添付ファイルの相対パスは主に
    `attachments/YYYY/MM/DD/UUID.ext`。
-   ブラウザーが File System Access API
    で利用できるフォルダーと、Fastify
    が直接アクセスできるフォルダーは同一とは限らない。
-   Windows
    エクスプローラーからの直接削除を現行方式だけで完全には防げない。欠損検知、バックアップ、復元が必要。
-   フロントエンドには Supabase への直接 DB
    アクセスがまだ残っている。ファイル名の重複確認、添付ファイル参照確認、一部のゴミ箱・添付ファイル処理を調査する。
-   **未解決の重要点:** `shioriRepo.ts` の `dbCreate()`
    の非ローカル分岐に、元の Supabase 保存処理の代わりとして
    `throw new Error("Supabase 직접 저장 로직이 아직 복원되지 않았습니다.")`
    が残っている可能性がある。現状を確認し、本番デプロイ前に解決すること。
-   `dbGet()` が Fastify API
    のみを使うバージョンもあるため、ローカル・本番環境で API
    の接続先を確認する。
-   Windows ローカル PostgreSQL は、**まだメイン DB ではない**。

### 5. 今後の優先順位

1.  現状を Git に保存し、残っている直接 Supabase アクセスを洗い出す。
2.  `dbCreate()` の非ローカル分岐と API URL 設定を安全に修正する。
3.  フロントエンドの DB 直接呼び出しを機能ごとに Fastify API へ移す。
4.  ゴミ箱からの復元、完全削除、共有ファイル参照、欠損検知、失敗時の復旧を改善する。
5.  認証と権限を維持したまま Windows ローカル PostgreSQL
    への移行を計画する。
6.  サーバー管理型のローカルファイル保存とバックアップを設計する。
7.  本番構成を整理し、クライアントがサーバー内部の保存方法を知らない構造にする。

### 6. 回答方法の希望

-   **日本語で**説明してください。
-   動作している機能を無駄に作り直さず、既存コードとデータの安全性を優先してください。
-   大規模な一括変更ではなく、**一段階ずつ実装 → 実行 →
    検証**してください。
-   変更するファイルの正確なパス、コード、期待される HTTP
    応答、テスト方法、ロールバック方法を示してください。
-   確認していないコードを推測してファイル全体を書き換えず、必要なファイルを先に尋ねてください。
-   検証済みのことと、まだ計画段階のことを区別してください。
-   Supabase
    Auth、ユーザー権限、既存データ、添付ファイルを守ってください。

**まず、まだ Fastify に移行していないフロントエンドの Supabase
直接呼び出しを調べ、安全な移行順序を決めたいです。必要なファイルを一つずつ指定してください。**

------------------------------------------------------------------------

**ヒント：**
このメッセージを貼り付けた後、`shioriRepo.ts`、`apiClient.ts`、ゴミ箱用
repo
など、最初の作業に必要なファイルだけを共有してください。環境変数の秘密鍵や
JWT は貼り付けないでください。
