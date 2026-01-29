🇯🇵 日本語（メイン）
1. アーキテクチャの目的

Shioriは「個人ログ」を単なるCRUDではなく、長期的に育つ知識資産として扱う。
そのために v0 では次の2点を最優先した。

拡張可能な構造（localStorage → Supabase / Auth / ルーティング拡張）

検索と分類の土台（タグ・検索・フィルタ・詳細閲覧）

2. 全体像（思想）

Shioriの設計は「原本」と「インデックス」を分けることを中心に置く。

Content（原本）：人が読む内容（title/content/tags/日時）

Index（検索用）：検索・分類に最適化された派生データ（検索文字列、lowercaseタグ等）

UI：読みやすさと探索導線（検索→結果→詳細）

“読むためのデータ” と “探すためのデータ” を分離すると、
後から検索の精度や速度を改善しても原本が壊れない。

3. データモデル（v0）

v0は localStorage を前提に、最小限で壊れにくい形にした。

LogItem / NoteItem

id: string

title: string

content(body): string

tags: string[]

createdAt: string(ISO)

updatedAt?: number | createdAt（将来拡張）

※ DB移行時も基本形は維持し、保存先だけ差し替える。

4. レイヤー構造（責務分離）

Shioriは「変更が起きる場所」を分離する。

4.1 UI（components / pages）

入力・表示・クリック導線

“見た目と操作” の責務のみ

データ永続化や検索ロジックを極力持たない

4.2 Hooks（状態とロジック）

useNoteSearch：検索・タグ絞り込み・ソート・サジェスト生成

UIはhookが返す state と handler を使うだけ

4.3 Utils（純粋関数 / 永続化）

storage.ts：localStorage の load/save（将来repo層に置換）

searchIndex.ts：検索用インデックス生成

recentSearch.ts：最近検索語の保存

“UIを変えてもロジックが壊れない”
“保存先を変えてもUIが壊れない”
を狙った分離。

5. ナビゲーション設計（ルーティング）

ログが増えると「一覧に全部表示」は限界が来るため、Chromeのように

検索 → 結果一覧 → 詳細ページ

の導線を前提にする。

一覧：タイトル + プレビュー1行 + 日付

詳細：全文 + タグ + 関連記事（同タグ優先）

react-router-dom を使い、将来の拡張（認証後のページ分岐、設定画面追加）に備える。

6. DB（Supabase）拡張の方針

v0では localStorage だが、設計は “保存先を差し替える” 形に寄せている。

まずは READ（一覧取得） + Auth を最小構成で導入

その後 CUD（追加/修正/削除）へ拡張

RLS（Row Level Security）で “自分のデータだけ” を保証

保存先が変わっても、UIと検索構造は極力維持する。

7. 多言語（i18n）方針

UI文言：将来的に i18n 対応（EN/JA/KO/ZH）

本文（ユーザー入力）：原文1つを基本とし、必要に応じて翻訳レイヤーを追加

v0では lang（言語タグ）を持たせる余地を確保し、ブラウザ翻訳の精度も上げる

8. 重要な決定（Design Decisions）

Content と Index を分離する（原本を壊さない）

UI / Hooks / Utils を分ける（変更点を局所化）

ルーティング前提（一覧の限界を先に見越す）

DBは “差し替え” を目標に段階導入（まずAuth+READ）

🇺🇸 English
1. Goal

Shiori treats personal logs as long-term knowledge assets, not just CRUD data.
v0 prioritizes:

A scalable structure (localStorage → Supabase/Auth)

A solid foundation for search, filtering, and navigation

2. Core Idea: Separate Content from Index

Content: human-readable source of truth

Index: derived data optimized for search/filtering

UI: discovery flow (search → results → detail)

This separation allows search improvements without breaking original content.

3. Data Model (v0)

LogItem/NoteItem: id, title, content/body, tags, createdAt (+ optional updatedAt)

4. Layered Responsibilities

UI: rendering and interactions

Hooks: state + business logic (useNoteSearch)

Utils: persistence + pure functions (storage, searchIndex, recentSearch)

5. Navigation (Routing)

As logs grow, full rendering becomes impractical.
Shiori adopts a browser-like flow:

search → results list → detail page

6. Supabase Expansion Plan

Introduce Supabase in phases:

Auth + READ

Add CUD

Enforce RLS for per-user data isolation

7. Multilingual Strategy

UI text: i18n later (EN/JA/KO/ZH)

User content: single original text + optional translation layer in the future

Store/allow lang metadata for better translation and filtering

Key Decisions

Separate content and index

Separate UI/hooks/utils

Design around routing early

Swap persistence layer incrementally

🇰🇷 한국어
1. 목표

Shiori는 로그를 단순 CRUD가 아니라 장기적으로 쌓이는 지식 자산으로 본다.
v0에서 우선순위는:

저장소 교체가 가능한 구조(localStorage → Supabase/Auth)

검색/필터/상세 이동까지 이어지는 탐색 기반

2. 핵심 설계: Content와 Index 분리

Content: 사람이 읽는 원본 데이터

Index: 검색/필터를 위한 파생 데이터

UI: 검색→결과→상세 흐름

원본을 건드리지 않고도 검색을 개선할 수 있게 한다.

3. 데이터 모델(v0)

LogItem/NoteItem: id, title, content(body), tags, createdAt (+ optional updatedAt)

4. 레이어 분리

UI: 화면/상호작용

Hooks: 상태+로직(useNoteSearch)

Utils: 저장/순수함수(storage, searchIndex, recentSearch)

5. 라우팅 전제

글이 많아지면 전부 렌더링은 한계가 있으므로
검색→결과→상세 페이지 흐름을 기본으로 둔다.

6. Supabase 확장 계획

1단계: Auth + READ

2단계: CUD

3단계: RLS로 사용자별 데이터 보호

7. 다국어 전략

UI 문구: i18n은 DB/라우팅 안정화 후 진행

본문: 원문 1개 + (필요 시 번역 레이어 추가)

lang 메타를 두어 필터/번역 품질을 높일 여지 확보

핵심 결정

원문/인덱스 분리

UI/훅/유틸 분리

라우팅을 미리 전제

DB는 단계적으로 “교체” 방식으로 도입