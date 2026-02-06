2026-02-07

🇯🇵 日本語（面接想定 Q&A）
❓ Q1. 認証フローで一番苦労した点は何ですか？

A.

ログイン自体は成功しているのに、
常にトップページへリダイレクトされる問題がありました。

原因は、
OAuthのリダイレクトURLと復帰URL（nextパス）の管理が
コンポーネントごとに分散していたことです。

そのため、
ログイン処理の入口を startGoogleLogin(next) に統一し、
リダイレクト先を /auth/callback に固定しました。

❓ Q2. なぜ next を localStorage に保存したのですか？

A.

OAuth認証は外部リダイレクトが発生するため、
クエリパラメータだけでは状態が失われる可能性があります。

そのため、

localStorage > query next > "/"


という優先順位を定義し、
確実に元のページへ復帰できる構造にしました。

❓ Q3. 保護ルートはどのように実装しましたか？

A.

RequireAuthOutlet を作成し、

未ログイン時：現在のパスを保存

/auth?next=currentPath にリダイレクト

という動作に統一しました。

これにより、
詳細ページからログアウトしても、再ログイン後に
同じページへ復帰できるようになりました。

❓ Q4. この改善で何が変わりましたか？

A.

リダイレクトの不一致が解消

ログイン状態の安定化

将来のソーシャルログイン追加が容易に

認証処理の責務分離が明確化

構造的に安全な認証基盤ができました。

❓ Q5. 今回の経験から学んだことは？

A.

「どこからでもログインできる」設計は危険だということです。

認証フローは必ず単一入口に統一しないと、
どこかで整合性が崩れます。

そのため、
認証関連処理を authActions と authRedirect に集約しました。

🇺🇸 English (Interview Version)
Q1. What was the biggest challenge in your authentication flow?

The login itself was successful,
but users were always redirected to the homepage.

The issue was inconsistent redirect handling across components.

I unified the login entry point into startGoogleLogin(next)
and fixed the redirect target to /auth/callback.

Q2. Why did you use localStorage for next path?

OAuth involves external redirection,
so relying only on query parameters is unreliable.

I defined a priority rule:

localStorage > query next > "/"


This guarantees users return to their original page.

Q3. How did you implement protected routes?

I created RequireAuthOutlet.

If unauthenticated:

Save current path

Redirect to /auth?next=currentPath

This ensures seamless return after login.

Q4. What improvements did this bring?

Stable redirect behavior

Clear separation of auth responsibilities

Easier future expansion (more OAuth providers)

Reduced edge-case bugs

Q5. What did you learn?

Authentication must have a single entry point.

Distributed login triggers create inconsistent states.

So I centralized everything into:

authActions

authRedirect

AuthCallback

🇰🇷 한국어 (면접용)
Q1. 인증 구현하면서 가장 어려웠던 점은?

로그인은 성공했는데
항상 메인으로 튀는 문제가 있었습니다.

원인은
OAuth redirect와 next 경로 관리가
컴포넌트마다 흩어져 있었기 때문입니다.

그래서 로그인 진입점을 하나로 통일하고
redirect를 /auth/callback으로 고정했습니다.

Q2. 왜 localStorage를 사용했나요?

OAuth는 외부 리다이렉트가 발생하기 때문에
query param만으로는 상태 유지가 불안정합니다.

그래서 우선순위를 정했습니다:

localStorage > query next > "/"


이렇게 해서 복귀 경로를 확실하게 보장했습니다.

Q3. 보호 라우트는 어떻게 구현했나요?

RequireAuthOutlet을 만들고,

로그인 안 되어 있으면 현재 경로 저장

/auth?next=현재경로로 이동

하도록 통일했습니다.

Q4. 이번 개선의 핵심 성과는?

로그인 후 상세페이지 유지 가능

리다이렉트 구조 통일

인증 로직 책임 분리

확장 가능 구조 확보

Q5. 이번 경험의 교훈은?

인증은 반드시 단일 진입점이 필요합니다.

분산되면 어디선가 반드시 꼬입니다.

그래서 auth 관련 로직을 모듈 단위로 정리했습니다.