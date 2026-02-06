2026-02-07

🇯🇵 日本語版（面接・設計説明用）
🏗 Shiori 認証アーキテクチャ v1
1. 設計目的

Shiori の認証構造は、以下を目的として設計された。

OAuth / Magic Link の統合

Redirect 処理の一元化

保護ルートの統一管理

セッション状態の中央管理

将来拡張可能な基盤構築

2. 認証フロー
Login Button
   ↓
startGoogleLogin(next)
   ↓
Supabase OAuth
   ↓
/auth/callback
   ↓
exchangeCodeForSession()
   ↓
loadNext()
   ↓
navigate(next)

3. レイヤー構造
① Presentation Layer

AuthButton

AuthPanel

責任:

UI 表示

ログイン / ログアウト操作

② Routing Layer

/auth

/auth/callback

RequireAuthOutlet

責任:

認証必須ページの保護

未認証時の redirect 制御

③ Auth Domain Layer
useSession.ts

セッション管理

onAuthStateChange 監視

isAuthed 判定

authActions.ts

startGoogleLogin()

logout()

authRedirect.ts

buildNext()

saveNext()

loadNext()

clearNext()

callbackUrl()

責任:

redirect ポリシー統一

ロジック分離

セッション復元制御

4. Redirect Policy

優先順位:

localStorage

query parameter (next)

"/"

この統一により:

詳細ページでログイン後にトップへ戻る問題を解決

ページごとに挙動が異なる問題を解決

code/hash 混在による不整合を排除

5. アーキテクチャの意義

今回の実装は単なるログイン機能ではなく、

認証構造の統合

責任分離設計の確立

redirect 戦略の明確化

拡張可能な基盤の構築

である。

🇺🇸 English Version (Portfolio / Technical Explanation)
🏗 Shiori Authentication Architecture v1
1. Design Goals

The authentication system was designed to:

Integrate OAuth and Magic Link login

Centralize redirect handling

Protect routes consistently

Manage session state centrally

Provide a scalable foundation

2. Authentication Flow
Login Click
   ↓
startGoogleLogin(next)
   ↓
Supabase OAuth
   ↓
/auth/callback
   ↓
exchangeCodeForSession()
   ↓
loadNext()
   ↓
navigate(next)

3. Layered Structure
1) Presentation Layer

AuthButton

AuthPanel

Handles:

UI interaction

Login / Logout triggers

2) Routing Layer

/auth

/auth/callback

RequireAuthOutlet

Handles:

Route protection

Session validation

Redirect control

3) Auth Domain Layer

useSession.ts

Central session state

Auth state subscription

Derived auth flags

authActions.ts

OAuth trigger

Logout handling

authRedirect.ts

next builder

localStorage persistence

callback URL policy

4. Redirect Policy

Priority:

localStorage

query next

"/"

This unified approach solved:

Returning to homepage unexpectedly

Inconsistent login behavior across routes

OAuth code/hash mismatch issues

5. Architectural Significance

This implementation is not just login functionality.

It establishes:

A unified authentication system

Clear responsibility separation

Stable redirect policy

Extensible infrastructure

🇰🇷 한국어 버전 (개인 기록 / 구조 정리용)
🏗 Shiori 인증 아키텍처 v1
1. 설계 목적

OAuth / Magic Link 통합

redirect 정책 통일

보호 라우트 일관성 확보

세션 중앙 관리

확장 가능한 기반 확보

2. 인증 흐름
로그인 클릭
   ↓
startGoogleLogin(next)
   ↓
Supabase OAuth
   ↓
/auth/callback
   ↓
exchangeCodeForSession()
   ↓
loadNext()
   ↓
next 페이지 이동

3. 레이어 구조
① UI Layer

AuthButton

AuthPanel

→ 사용자 인터랙션 처리

② Routing Layer

/auth

/auth/callback

RequireAuthOutlet

→ 인증 필요 라우트 보호

③ Auth Domain Layer

useSession.ts

세션 상태 중앙 관리

auth 구독 처리

authActions.ts

로그인/로그아웃 실행

authRedirect.ts

next 저장/복원

redirect 정책 통일

4. Redirect 정책

우선순위:

localStorage

query next

"/"

이 구조로 해결한 문제:

로그인 후 메인으로 튕김 현상

일부 페이지에서만 로그인 유지

code/hash 혼선 문제

5. 아키텍처 의의

이번 작업은 단순 로그인 구현이 아니라

인증 구조 통합

책임 분리 설계

redirect 정책 정립

유지보수성 향상

을 달성한 아키텍처 작업이다.