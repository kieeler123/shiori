2026-02-07

🇯🇵 日本語（エッセイ）
認証フローが「どこかでは動き、どこかでは壊れる」問題を解決するまで

今回の実装で一番時間がかかったのは、
「ログインは成功しているのに、意図したページに戻れない」という問題でした。

Googleログイン後、
セッションは確立されているにもかかわらず、
常にトップページへリダイレクトされる現象が発生しました。

最初はSupabaseの設定ミスや
OAuthコールバック処理の問題だと考えました。
しかし実際の原因はもっと構造的なものでした。

問題の本質

ログイン処理の入口が複数存在していたことです。

ある場所では location.pathname + search

ある場所では query next

ある場所では直接 /

というように、
復帰先（next）の決定ロジックが分散していました。

その結果、

詳細ページでは戻れる

Supportページでは戻れない

ログアウト後は常にトップへ戻る

という「部分的に動く」状態になっていました。

解決アプローチ

私はまず、認証フローを整理しました。

ログインの入口を startGoogleLogin(next) に統一

リダイレクトURLを /auth/callback に固定

nextの保存・復元を authRedirect.ts に集約

RequireAuthOutlet で未ログイン時の保存処理を統一

さらに、OAuthは外部リダイレクトを伴うため、
nextはlocalStorageに保存する構造に変更しました。

優先順位は：

localStorage > query next > "/"


これにより、どのページからログインしても
必ず元のページへ復帰できるようになりました。

学び

今回の経験から学んだことは、

認証は機能ではなく「構造」である

ということです。

どこからでもログインできる設計は便利に見えますが、
統一されていなければ必ず破綻します。

認証処理は単一入口・単一出口に整理する必要があります。

今回の改善により、

リダイレクトの不一致解消

ログイン状態の安定化

将来的なOAuth拡張への準備

責務分離の明確化

を達成できました。

これは単なるバグ修正ではなく、
認証基盤の再設計でした。

🇺🇸 English (Essay)
Fixing the “Works Here, Breaks There” Authentication Issue

The most time-consuming issue I faced was not that login failed.
Login was actually successful.

The problem was that users were always redirected to the homepage,
even when they logged in from a detail page.

At first, I suspected Supabase configuration errors
or mistakes in the OAuth callback handling.

However, the real issue was structural.

Root Cause

There was no unified login entry point.

Different components handled next differently:

Some used location.pathname + search

Some used query next

Some defaulted to /

Because of this inconsistency,
authentication behaved differently depending on the route.

Some pages restored correctly.
Others always redirected to the homepage.

Refactoring Strategy

I redesigned the authentication flow:

Unified login entry to startGoogleLogin(next)

Fixed redirect URL to /auth/callback

Centralized next handling in authRedirect.ts

Standardized protected route logic in RequireAuthOutlet

Since OAuth involves external redirection,
I stored the next path in localStorage.

Priority rule:

localStorage > query next > "/"


This ensured users always returned to the correct page.

Key Lesson

Authentication is not just a feature.
It is infrastructure.

If login logic is distributed across components,
inconsistency is inevitable.

By centralizing authentication responsibility,
I achieved:

Stable redirect behavior

Clean separation of concerns

Expandable OAuth structure

Reduced edge-case bugs

This was not a simple fix.
It was a structural improvement.

🇰🇷 한국어 (에세이)
“어딘 되고 어딘 안 되는” 로그인 문제를 구조적으로 해결한 기록

이번 작업에서 가장 오래 걸린 건
로그인이 안 되는 문제가 아니었습니다.

로그인은 정상적으로 성공했는데,
항상 메인 페이지로 튀는 문제가 있었습니다.

처음에는 Supabase 설정 문제라고 생각했고,
OAuth callback 코드가 잘못됐다고 의심했습니다.

하지만 실제 원인은 훨씬 구조적인 부분이었습니다.

문제의 본질

로그인 진입점이 통일되어 있지 않았습니다.

어떤 곳은 location.pathname + search

어떤 곳은 query next

어떤 곳은 그냥 /

이렇게 복귀 경로 계산 방식이 제각각이었습니다.

그 결과,

상세 페이지에서는 정상 복귀

Support 페이지에서는 메인으로 이동

로그아웃 후 로그인하면 항상 /

같은 “부분적으로만 동작하는 상태”가 발생했습니다.

해결 과정

먼저 인증 흐름을 재설계했습니다.

로그인 진입점을 startGoogleLogin(next)으로 통일

redirect URL을 /auth/callback으로 고정

next 저장/복원을 authRedirect.ts로 모듈화

보호 라우트는 RequireAuthOutlet에서 일괄 처리

그리고 OAuth 특성상 외부 리다이렉트가 발생하기 때문에
next를 localStorage에 저장하는 구조로 변경했습니다.

우선순위는:

localStorage > query next > "/"


이렇게 하니
어디서 로그인하든 해당 페이지로 정확히 복귀했습니다.

이번 경험의 교훈

인증은 기능이 아니라 “구조”다.

로그인을 여러 군데에서 제각각 처리하면
반드시 꼬인다.

그래서 인증 관련 책임을 모듈 단위로 모았고,
단일 진입점 구조로 통일했습니다.

이번 작업은 단순한 버그 수정이 아니라
인증 아키텍처 안정화 작업이었습니다.