# しおり（Shiori）ストレージ・同期アーキテクチャ設計

**策定日:** 2026-09-01\
**目的:**
文書原本の安全な保管、クラウド容量の最適化、オフライン継続利用、自動同期、復旧可能なバックアップを両立する。

------------------------------------------------------------------------

## 1. 基本原則

### 1.1 Markdown を文書の原本（Source of Truth）とする

しおりで作成・管理する文書は、原則として
**Markdown（`.md`）を唯一の文書原本**として扱う。

PDF、DOCX、HTML などは恒久的な原本として重複保存せず、必要になった時点で
Markdown から生成する。

``` text
Markdown 原本
   ├─ アプリ内表示
   ├─ ブラウザ表示
   ├─ PDF 生成・ダウンロード
   ├─ DOCX 生成・ダウンロード
   ├─ HTML 生成・表示
   └─ 印刷
```

> **Tip:** PDF/DOCX/HTML は「原本」ではなく
> **派生ファイル（Derivative）**
> として扱い、再生成可能なデータは長期保存しない。

### 1.2 画像は Markdown とは別の原本資産として管理する

Markdown
は画像そのものではなく画像への参照を保持するため、再生成できない画像は別途原本として保存する。

``` text
document/
├─ article.md
└─ assets/
   ├─ image-001.webp
   ├─ image-002.webp
   └─ chart-001.webp
```

> **Tip:**
> 高品質な画像原本はローカルに保管し、クラウドにはサービス表示に適した
> WebP/AVIF 等の最適化版を同期する方式も採用できる。

------------------------------------------------------------------------

## 2. Local-first + Cloud Sync

しおりは **Local-first**
を基本とする。クラウドを唯一の原本保存場所にはしない。

``` text
                 Shiori
                   │
               文書作成
                   │
                   ▼
              Local Vault
             ★ 原本保存 ★
                   │
             Sync Queue
                   │
          ┌────────┴────────┐
          │                 │
     Cloud available   Cloud unavailable
          │                 │
          ▼                 ▼
     Supabase Sync      Local に保持
          │                 │
          └──── 復旧後に再同期 ────┘
```

### 同期状態

各文書・資産には以下のような同期状態を持たせる。

-   `local_only`
-   `pending`
-   `syncing`
-   `synced`
-   `failed`
-   `conflict`

> **Tip:** クラウド障害や quota
> 制限が発生しても、まずローカル保存を成功させてから同期を試みる。同期失敗によって文書作成そのものを失敗させない。

------------------------------------------------------------------------

## 3. 保存対象の分類

### Source --- 長期保存する原本

-   Markdown
-   再生成できない原本画像
-   必要な添付原本
-   文書メタデータ

### Derived --- 必要時に生成する派生物

-   PDF
-   DOCX
-   HTML
-   印刷用データ
-   Preview
-   Thumbnail

### Cache / Temporary --- 一時データ

-   変換途中のファイル
-   다운로드用一時ファイル
-   レンダリングキャッシュ
-   一時アップロード

> **Tip:** コード上でも `source / derived / cache`
> を明確に区別すると、自動削除や quota 管理を安全に実装しやすい。

------------------------------------------------------------------------

## 4. 文書変換アーキテクチャ

``` text
                       ┌─ Markdown Viewer
                       ├─ HTML Renderer
MD Source ── Parser ───┼─ PDF Exporter
                       ├─ DOCX Exporter
                       └─ Print Renderer
```

共通インターフェース例:

``` ts
exportDocument(documentId, format)
```

`format`:

``` text
md
pdf
docx
html
```

派生ファイルには必要に応じて TTL（Time To
Live）を設定し、一定期間後に自動削除する。

> **Tip:** `source_hash`（例: SHA-256）を保持し、Markdown
> が変更されていなければ既存の変換キャッシュを再利用する。

------------------------------------------------------------------------

## 5. ローカル保存構造

推奨例:

``` text
Shiori/
├─ vault/
│  ├─ documents/
│  │  └─ *.md
│  └─ assets/
│     └─ images/
│
├─ sync/
│  ├─ pending/
│  └─ state/
│
├─ cache/
│  ├─ pdf/
│  ├─ docx/
│  └─ previews/
│
└─ backups/
   ├─ daily/
   ├─ weekly/
   └─ monthly/
```

> **Tip:** ローカルパス自体をクラウド DB の絶対的な識別子にせず、文書 ID
> と論理パスを 사용해 환경変更に耐えられる設計にする。

------------------------------------------------------------------------

## 6. Supabase の役割

Supabase は原本を唯一保持する場所ではなく、主として以下を担当する。

-   DB metadata
-   検索
-   タグ
-   ユーザー認証
-   複数端末同期
-   Markdown 同期
-   サービス用画像
-   必要な共有データ

PDF/DOCX/HTML 等の再生成可能なファイルは原則として恒久保存しない。

> **Tip:** Database と Object Storage
> は別の資源として監視する。文書数だけではなく Storage
> 使用量・通信量も確認する。

------------------------------------------------------------------------

## 7. 同期とバックアップは分離する

**Sync と Backup は同じものではない。**

``` text
Sync
Local ←────────→ Cloud
同じ最新状態を維持

Backup
Local ─────────→ Versioned Backup
過去状態を復旧可能にする
```

ローカルで誤って削除した内容がクラウドにも同期される可能性があるため、別途世代バックアップを保持する。

推奨:

-   Daily backup
-   Weekly backup
-   Monthly backup

> **Tip:**
> バックアップは「ファイルが存在する」だけでなく、件数・サイズ・ハッシュ等を定期的に検証し、実際に復元可能であることを確認する。

------------------------------------------------------------------------

## 8. Storage quota 管理

しおり側で Storage 使用量を可視化し、容量超過を事前に検知する。

例:

``` text
Storage Usage
────────────────
Markdown       18 MB
Images        430 MB
Derived        80 MB
────────────────
Total         528 MB
```

運用ポリシー例:

``` text
70% → Warning
80% → 派生キャッシュ自動整理
90% → 大容量アップロード警告/制限
```

> **Tip:** 文書件数ではなく、実際にコストを発生させる Storage
> bytes、Bandwidth、Compute 等を中心に監視する。

------------------------------------------------------------------------

## 9. 現在の移行・整理方針

既存データを整理する際は、削除よりバックアップを先行する。

``` text
完全バックアップ
      ↓
バックアップ検証
      ↓
重複分析
      ↓
PDF / 派生ファイル分類
      ↓
未参照ファイル分析
      ↓
削除候補確定
      ↓
リモート整理
      ↓
必要データのみ再同期
```

Markdown と必要な画像は保持し、PDF
等はローカル原本の確保後、必要に応じて再生成する。

> **Tip:** 削除理由・代表レコード・重複関係などを manifest
> に残し、後から判断を追跡できるようにする。

------------------------------------------------------------------------

## 10. 最終方針

> **しおりは Local-first を基本とし、Markdown を文書の Source of Truth
> とする。再生成できない画像等は原本資産として別途保管する。Supabase
> は検索・認証・同期・サービス提供のためのクラウド層として利用し、PDF/DOCX/HTML
> 等は必要時に生成する。同期とバックアップを分離し、クラウド障害や quota
> 制限が発生してもローカルで記録を継続できる構造を目指す。**

------------------------------------------------------------------------

# Shiori Storage & Synchronization Architecture

**Defined:** 2026-09-01\
**Goal:** Preserve document originals safely while minimizing cloud
storage, supporting offline continuity, automatic synchronization, and
recoverable backups.

------------------------------------------------------------------------

## 1. Core Principle

### 1.1 Markdown is the Source of Truth

Shiori uses **Markdown (`.md`) as the canonical document source**.

PDF, DOCX, and HTML files are not permanently duplicated. They are
generated from Markdown when needed.

``` text
Markdown Source
   ├─ Open in Shiori
   ├─ Open in Browser
   ├─ Generate / Download PDF
   ├─ Generate / Download DOCX
   ├─ Generate / Open HTML
   └─ Print
```

> **Tip:** Treat PDF, DOCX, and HTML as derivatives rather than
> originals. Avoid permanent storage of anything that can be regenerated
> reliably.

### 1.2 Images are Separate Source Assets

Markdown stores references to images rather than the image bytes
themselves. Images that cannot be regenerated must therefore be
preserved separately.

``` text
document/
├─ article.md
└─ assets/
   ├─ image-001.webp
   ├─ image-002.webp
   └─ chart-001.webp
```

> **Tip:** Keep high-quality image originals locally and optionally
> synchronize optimized WebP/AVIF versions to the cloud for application
> use.

------------------------------------------------------------------------

## 2. Local-first + Cloud Sync

Shiori follows a **Local-first** architecture. The cloud must not be the
only location containing the original data.

``` text
                 Shiori
                   │
               Create
                   │
                   ▼
              Local Vault
            ★ Source Data ★
                   │
               Sync Queue
                   │
          ┌────────┴────────┐
          │                 │
     Cloud available   Cloud unavailable
          │                 │
          ▼                 ▼
     Supabase Sync      Keep Local
          │                 │
          └──── Retry Later ────┘
```

Synchronization states may include:

-   `local_only`
-   `pending`
-   `syncing`
-   `synced`
-   `failed`
-   `conflict`

> **Tip:** Save locally first. A cloud outage or quota restriction
> should delay synchronization, not prevent the user from creating a
> document.

------------------------------------------------------------------------

## 3. Data Classification

### Source

Permanently preserve:

-   Markdown
-   Irreplaceable source images
-   Required original attachments
-   Document metadata

### Derived

Generate when needed:

-   PDF
-   DOCX
-   HTML
-   Print output
-   Preview
-   Thumbnail

### Cache / Temporary

Short-lived:

-   Conversion intermediates
-   Temporary download files
-   Rendering caches
-   Temporary uploads

> **Tip:** Represent `source`, `derived`, and `cache` explicitly in the
> code and metadata so automated retention policies remain safe.

------------------------------------------------------------------------

## 4. Document Conversion Architecture

``` text
                       ┌─ Markdown Viewer
                       ├─ HTML Renderer
MD Source ── Parser ───┼─ PDF Exporter
                       ├─ DOCX Exporter
                       └─ Print Renderer
```

Common interface:

``` ts
exportDocument(documentId, format)
```

Supported formats can include `md`, `pdf`, `docx`, and `html`.

Derived files may use a TTL and be automatically removed after
expiration.

> **Tip:** Store a `source_hash`, such as SHA-256. Reuse a cached
> derivative only when it was generated from the current Markdown
> source.

------------------------------------------------------------------------

## 5. Local Storage Layout

``` text
Shiori/
├─ vault/
│  ├─ documents/
│  │  └─ *.md
│  └─ assets/
│     └─ images/
├─ sync/
│  ├─ pending/
│  └─ state/
├─ cache/
│  ├─ pdf/
│  ├─ docx/
│  └─ previews/
└─ backups/
   ├─ daily/
   ├─ weekly/
   └─ monthly/
```

> **Tip:** Use stable document IDs and logical paths rather than making
> a machine-specific absolute filesystem path the permanent cloud
> identifier.

------------------------------------------------------------------------

## 6. Role of Supabase

Supabase primarily provides:

-   Database metadata
-   Search
-   Tags
-   Authentication
-   Multi-device synchronization
-   Markdown synchronization
-   Service-optimized images
-   Shared data

Regenerable PDF/DOCX/HTML files should normally not be stored
permanently.

> **Tip:** Monitor Database and Object Storage separately. Storage
> bytes, bandwidth, and compute can matter more than the raw number of
> documents.

------------------------------------------------------------------------

## 7. Sync Is Not Backup

``` text
Sync
Local ←────────→ Cloud
Maintain current state

Backup
Local ─────────→ Versioned Backup
Recover historical state
```

Recommended retention layers:

-   Daily
-   Weekly
-   Monthly

> **Tip:** Validate backups using counts, byte sizes, and hashes. A
> backup is valuable only if it can actually be restored.

------------------------------------------------------------------------

## 8. Storage Quota Management

Shiori should expose storage usage before quotas become critical.

``` text
Storage Usage
────────────────
Markdown       18 MB
Images        430 MB
Derived        80 MB
────────────────
Total         528 MB
```

Example policy:

``` text
70% → Warning
80% → Automatically clean derivative cache
90% → Warn/restrict large uploads
```

> **Tip:** Monitor the resources that create real infrastructure cost:
> storage bytes, bandwidth, compute, and request volume.

------------------------------------------------------------------------

## 9. Migration and Cleanup Policy

``` text
Complete Backup
      ↓
Verify Backup
      ↓
Analyze Duplicates
      ↓
Classify PDF / Derivatives
      ↓
Analyze Unreferenced Objects
      ↓
Confirm Deletion Candidates
      ↓
Clean Remote Storage
      ↓
Resync Only Required Data
```

Preserve Markdown and required images. After local preservation,
regenerate PDF and other derivatives when needed.

> **Tip:** Keep a manifest recording deletion reasons, representative
> records, and duplicate relationships so cleanup decisions remain
> auditable.

------------------------------------------------------------------------

## 10. Final Architecture Decision

> **Shiori will use a Local-first architecture with Markdown as the
> document Source of Truth. Irreplaceable images and similar assets will
> be preserved separately as source assets. Supabase will act as the
> cloud layer for search, authentication, synchronization, and
> application delivery. PDF, DOCX, HTML, and other regenerable formats
> will be generated on demand. Synchronization and backup will remain
> separate so recording can continue locally even during cloud outages
> or quota restrictions.**

------------------------------------------------------------------------

# 시오리(Shiori) 저장소·동기화 아키텍처 설계

**정의일:** 2026-09-01\
**목적:** 문서 원본을 안전하게 보존하면서 클라우드 저장공간을
최소화하고, 오프라인 지속 사용·자동 동기화·복구 가능한 백업을 함께
지원한다.

------------------------------------------------------------------------

## 1. 핵심 원칙

### 1.1 Markdown을 문서의 원본(Source of Truth)으로 사용한다

시오리에서 작성하고 관리하는 문서는 원칙적으로 **Markdown(`.md`)을
유일한 문서 원본**으로 취급한다.

PDF, DOCX, HTML 등의 형식은 원본으로 중복 보관하지 않고 필요할 때
Markdown으로부터 생성한다.

``` text
Markdown 원본
   ├─ 시오리 앱에서 열기
   ├─ 브라우저에서 열기
   ├─ PDF 생성 / 다운로드
   ├─ DOCX 생성 / 다운로드
   ├─ HTML 생성 / 열기
   └─ 인쇄
```

> **팁:** PDF/DOCX/HTML은 원본이 아니라 **파생파일(Derivative)** 로
> 정의한다. 안정적으로 다시 만들 수 있는 파일은 장기 보관하지 않는 것을
> 기본으로 한다.

### 1.2 이미지는 Markdown과 별도의 원본 자산으로 관리한다

Markdown에는 이미지 자체가 아니라 이미지에 대한 참조가 들어가므로, 다시
만들 수 없는 이미지는 별도 원본으로 보존한다.

``` text
document/
├─ article.md
└─ assets/
   ├─ image-001.webp
   ├─ image-002.webp
   └─ chart-001.webp
```

> **팁:** 고품질 이미지 원본은 로컬에 보존하고, 클라우드에는 서비스
> 표시용으로 최적화한 WebP/AVIF 등을 동기화하는 방식도 사용할 수 있다.

------------------------------------------------------------------------

## 2. Local-first + Cloud Sync

시오리는 **Local-first**를 기본 아키텍처로 사용한다. 클라우드를 유일한
원본 저장소로 만들지 않는다.

``` text
                 Shiori
                   │
                문서 작성
                   │
                   ▼
              Local Vault
             ★ 원본 저장 ★
                   │
               Sync Queue
                   │
          ┌────────┴────────┐
          │                 │
      Cloud 정상         Cloud 장애
          │                 │
          ▼                 ▼
     Supabase Sync       로컬 유지
          │                 │
          └──── 복구 후 재시도 ────┘
```

각 문서 및 자산은 다음과 같은 동기화 상태를 가질 수 있다.

-   `local_only`
-   `pending`
-   `syncing`
-   `synced`
-   `failed`
-   `conflict`

> **팁:** 항상 로컬 저장을 먼저 성공시키고 클라우드 동기화를 시도한다.
> 클라우드 장애나 quota 제한이 문서 작성 실패로 이어지지 않도록 한다.

------------------------------------------------------------------------

## 3. 데이터 분류

### Source --- 장기 보존

-   Markdown
-   다시 만들 수 없는 원본 이미지
-   필요한 원본 첨부파일
-   문서 메타데이터

### Derived --- 필요 시 생성

-   PDF
-   DOCX
-   HTML
-   인쇄 데이터
-   Preview
-   Thumbnail

### Cache / Temporary --- 일시 데이터

-   변환 중간 파일
-   다운로드용 임시파일
-   렌더링 캐시
-   임시 업로드

> **팁:** 코드와 DB에서도 `source / derived / cache`를 명시적으로
> 구분하면 자동 삭제 정책과 quota 관리가 훨씬 안전해진다.

------------------------------------------------------------------------

## 4. 문서 변환 아키텍처

``` text
                       ┌─ Markdown Viewer
                       ├─ HTML Renderer
MD Source ── Parser ───┼─ PDF Exporter
                       ├─ DOCX Exporter
                       └─ Print Renderer
```

공통 인터페이스 예:

``` ts
exportDocument(documentId, format)
```

지원 형식은 `md`, `pdf`, `docx`, `html` 등으로 확장한다.

파생파일에는 필요에 따라 TTL(Time To Live)을 적용하여 일정 시간이 지나면
자동 삭제한다.

> **팁:** SHA-256 등의 `source_hash`를 저장해 현재 Markdown과 동일한
> 버전에서 만들어진 파생파일만 캐시로 재사용하면 된다.

------------------------------------------------------------------------

## 5. 로컬 저장 구조

``` text
Shiori/
├─ vault/
│  ├─ documents/
│  │  └─ *.md
│  └─ assets/
│     └─ images/
├─ sync/
│  ├─ pending/
│  └─ state/
├─ cache/
│  ├─ pdf/
│  ├─ docx/
│  └─ previews/
└─ backups/
   ├─ daily/
   ├─ weekly/
   └─ monthly/
```

> **팁:** 특정 PC의 절대경로를 클라우드 식별자로 사용하기보다 안정적인
> `document_id`와 논리 경로를 사용해야 다른 PC나 드라이브로 이동하기
> 쉽다.

------------------------------------------------------------------------

## 6. Supabase의 역할

Supabase는 유일한 원본 저장소가 아니라 다음과 같은 서비스 계층을
담당한다.

-   DB 메타데이터
-   검색
-   태그
-   사용자 인증
-   다중 기기 동기화
-   Markdown 동기화
-   서비스용 최적화 이미지
-   공유에 필요한 데이터

PDF/DOCX/HTML처럼 다시 만들 수 있는 파일은 원칙적으로 영구 저장하지
않는다.

> **팁:** Database와 Object Storage를 별도 자원으로 관리한다. 문서
> 개수뿐 아니라 Storage 사용량, Bandwidth, Compute 등을 함께 관찰한다.

------------------------------------------------------------------------

## 7. 동기화와 백업은 분리한다

**Sync와 Backup은 목적이 다르다.**

``` text
Sync
Local ←────────→ Cloud
현재 상태를 동일하게 유지

Backup
Local ─────────→ Versioned Backup
과거 상태를 복구 가능하게 보존
```

권장 백업 계층:

-   Daily
-   Weekly
-   Monthly

> **팁:** 파일이 존재하는 것만 확인하지 말고 개수, 바이트 크기, 해시
> 등을 검증한다. 실제로 복원 가능한 상태여야 백업이라고 볼 수 있다.

------------------------------------------------------------------------

## 8. Storage quota 관리

시오리 내부에서 Storage 사용량을 시각화하여 제한에 도달하기 전에
대응한다.

``` text
Storage Usage
────────────────
Markdown       18 MB
Images        430 MB
Derived        80 MB
────────────────
Total         528 MB
```

운영 정책 예:

``` text
70% → 경고
80% → 파생 캐시 자동 정리
90% → 대용량 업로드 경고/제한
```

> **팁:** 문서 개수보다는 실제 인프라 비용과 연결되는 Storage bytes,
> Bandwidth, Compute, 요청량 등을 중심으로 모니터링한다.

------------------------------------------------------------------------

## 9. 기존 데이터 이전·정리 정책

``` text
완전 백업
    ↓
백업 검증
    ↓
중복 분석
    ↓
PDF / 파생파일 분류
    ↓
미참조 파일 분석
    ↓
삭제 후보 확정
    ↓
원격 저장소 정리
    ↓
필요 데이터만 재동기화
```

Markdown과 필요한 이미지는 보존한다. PDF 등의 파생파일은 로컬 보존
필요성을 확인한 뒤 향후 필요할 때 다시 생성한다.

> **팁:** 삭제 사유, 대표 레코드, 중복 관계 등을 manifest에 남겨 나중에
> 정리 판단을 추적할 수 있도록 한다.

------------------------------------------------------------------------

## 10. 최종 아키텍처 결정

> **시오리는 Local-first를 기본으로 하고 Markdown을 문서의 Source of
> Truth로 사용한다. 다시 만들 수 없는 이미지 등의 자산은 별도의 원본
> 자산으로 보존한다. Supabase는 검색·인증·동기화·서비스 제공을 위한
> 클라우드 계층으로 사용하며, PDF/DOCX/HTML 등 재생성 가능한 형식은
> 필요할 때 생성한다. 동기화와 백업을 분리하여 클라우드 장애나 quota
> 제한 중에도 로컬에서 기록을 계속할 수 있도록 한다.**
