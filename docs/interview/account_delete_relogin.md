🇯🇵 日本語

Q1. 今日どんな問題を解決しましたか？
A. 退会後に再ログインした際、削除済みデータが復元されない問題を調査しました。

Q2. 原因は何でしたか？
A. データ自体は存在していましたが、RLSポリシーとViewの条件により取得できていませんでした。

Q3. どのように確認しましたか？
A. SQLエディタで直接データを確認し、UIではなくDBアクセス制御の問題であると切り分けました。

Q4. 設計上の判断は？
A. アカウント復元は自動化せず、ユーザーによる手動復元方式を採用しました。

Q5. 学んだことは？
A. フロント問題に見えても、実際は認証・DB層の設計問題である場合が多いことです。

🇺🇸 English

Q1. What problem did you work on today?
A. I investigated why deleted data was not restored after account deletion and re-login.

Q2. What was the root cause?
A. The data existed in the database, but RLS policies and view filters prevented it from being returned.

Q3. How did you debug it?
A. I verified the data directly through SQL queries and isolated the issue from the UI layer.

Q4. What design decision did you make?
A. I decided to keep account restoration manual instead of automatic.

Q5. What did you learn?
A. Issues that appear to be frontend problems are often caused by backend access control or data visibility rules.

🇰🇷 한국어

Q1. 오늘 어떤 문제를 해결했나요?
A. 회원 탈퇴 후 재로그인 시 삭제 데이터가 복구되지 않는 문제를 분석했습니다.

Q2. 원인은 무엇이었나요?
A. 데이터는 존재했지만 RLS 정책과 View 조건 때문에 조회되지 않았습니다.

Q3. 어떻게 확인했나요?
A. SQL에서 직접 데이터를 조회해 UI 문제가 아님을 분리했습니다.

Q4. 어떤 설계 결정을 내렸나요?
A. 계정 복구는 자동이 아닌 수동 방식으로 유지하기로 했습니다.

Q5. 배운 점은 무엇인가요?
A. 프론트 문제처럼 보여도 실제 원인은 인증이나 DB 접근 구조일 수 있다는 점입니다.