2026-02.01

🇯🇵 日本語（開発エッセイログ）

今日は単なる機能追加の日ではなく、
「運用レベルの壁」に初めて正面からぶつかった日だった。

Shioriにログイン機能を入れるだけのつもりだったが、
実際にやってみると、技術というより**「システムのつながり」**を理解しないと前に進めないことを思い知らされた。

最初の問題は、Googleログイン時に出た
「このアプリのリクエストは無効です」というエラーだった。
コードは正しく、Supabase設定も合っていたのに動かない。
原因はコードではなく、Google Cloud ConsoleのOAuthクライアントの種類ミスだった。

“Web application”ではないClient IDでは
Redirect URIが存在せず、認証フローが成立しなかった。

ここで学んだのは：

フロントエンド・バックエンド・外部認証は
「コード」ではなく「構造」で動いている

次にぶつかったのはSupabaseの401エラー。
ログイン成功後でもINSERTが拒否された。

原因はRLS（Row Level Security）。

データベースは「接続できるか」ではなく
**「誰がどの行を触れるか」**で制御されている。

ここで理解したのは：

認証は「入れるかどうか」
RLSは「何ができるか」

さらに、セッションが読み込まれているのにUIが切り替わらない問題もあった。
これは認証ではなく、React側の状態管理とレンダリング条件の問題だった。

今日の最大の気づきはこれ：

エラーは技術力不足ではなく、理解範囲の外側から来る

そしてそれを一つずつ潰せば、
今まで見えなかった「運用の世界」が見え始める。

今日は機能追加よりも価値のある一日だった。

🇺🇸 English (Developer Growth Essay)

Today wasn’t just another coding day.
It was the day I first hit the “real-world system wall.”

I only intended to add login to Shiori.
Instead, I learned that modern web systems don’t fail because of code —
they fail because of misunderstood architecture between services.

The first issue was Google login failing with
“This app’s request is invalid.”

The code was fine. Supabase config was correct.
The real problem? I created the wrong type of OAuth client in Google Cloud.

Without a Web Application client, there is no valid redirect URI.
Which means the authentication flow never completes.

Lesson learned:

Frontend, backend, and OAuth providers work as a system, not isolated code.

Next problem: Supabase returned 401 Unauthorized after login.
INSERT operations were blocked.

Cause: Row Level Security (RLS).

Authentication only proves who you are.
RLS decides what you are allowed to do.

That distinction was a turning point.

Then came a UI issue: session loaded, but the interface didn’t change.
That turned out to be a React state/render condition problem, not auth.

The biggest realization today:

Errors don’t come from lack of skill — they come from blind spots in understanding the system.

Solving them one by one didn’t just fix bugs.
It expanded my mental model of how production systems really work.

Today was worth more than building features.

🇰🇷 한국어 (개발 성장 기록 에세이)

오늘은 단순히 기능 하나를 추가한 날이 아니라,
처음으로 ‘운영 레벨의 벽’을 정면으로 맞은 날이었다.

Shiori에 로그인 기능만 붙이면 끝날 줄 알았다.
하지만 실제로는 코드 문제가 아니라
시스템 간 연결 구조를 이해해야만 해결되는 문제들이 계속 나타났다.

첫 번째 문제는 Google 로그인 시 뜬
“이 앱의 요청이 유효하지 않습니다” 오류였다.

코드는 맞았고 Supabase 설정도 맞았다.
문제는 Google Cloud Console에서 만든 OAuth Client 타입이 잘못된 것이었다.

Web application 타입이 아니면
Redirect URI 자체가 존재하지 않아 인증 흐름이 완성되지 않는다.

여기서 배운 점:

프론트, 백엔드, 외부 인증은 코드가 아니라 구조로 움직인다

다음 문제는 Supabase 401 에러.
로그인 성공 후에도 INSERT가 막혔다.

원인은 RLS(Row Level Security).

DB는 “연결되었는가”가 아니라
**“이 사용자가 이 행을 수정할 권한이 있는가”**를 기준으로 동작한다.

여기서 깨달은 것:

인증은 “누구인가”
RLS는 “무엇을 할 수 있는가”

그리고 세션이 로드되었는데 UI가 바뀌지 않는 문제도 있었다.
이건 인증이 아니라 React 상태 관리 조건 문제였다.

오늘 가장 크게 느낀 건 이거다:

에러는 실력 부족이 아니라 이해 범위 밖에서 온다

하지만 하나씩 해결해 나가면
지금까지 보이지 않던 “운영 시스템의 세계”가 보이기 시작한다.

오늘은 기능 추가보다 훨씬 가치 있는 날이었다.