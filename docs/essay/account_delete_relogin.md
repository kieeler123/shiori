2026-02-20

🇯🇵 日本語（エッセイ）

今日は本来、ヘッダーとメインページのUI改善を行う予定だった。しかし、会員退会後の再ログイン時に削除データが復元されない問題を発見し、調査を進めるうちにデータベース構造と認証ポリシーまで確認することになった。

最初はUIの問題だと思っていたが、SQL上ではデータが存在しているにもかかわらず画面に表示されないことを確認し、問題がUIではなくRLS（Row Level Security）およびView条件にある可能性に気づいた。

特に、is_deleted状態とprofilesテーブルの削除状態が連動していることで、ユーザーが復元された後でもデータ取得条件により表示されないケースが発生していた。

この過程で、Soft Delete と Hard Delete の役割を整理し、アカウント復元は自動ではなく手動操作として設計する方針を決定した。

結果として、機能追加よりも「システムがどの層で制御されているか」を深く理解できた一日だった。

🇺🇸 English (Essay)

Today I originally planned to improve the header and main page UI. However, while testing account deletion and re-login behavior, I discovered that deleted data could not be restored correctly after logging back in.

At first, I assumed this was a UI issue. But after confirming that the data still existed in SQL results, I realized the problem was related to database logic and Row Level Security policies rather than the frontend.

The investigation revealed that the interaction between is_deleted flags and profile deletion status prevented restored data from being returned by queries and views.

Through this process, I clarified the separation between soft delete and hard delete strategies and decided that account restoration should remain a manual action instead of an automatic process.

Although the original goal was UI improvement, the day ultimately deepened my understanding of authentication flow, database visibility rules, and system architecture layers.

🇰🇷 한국어 (에세이)

오늘은 원래 헤더와 메인 페이지 디자인을 수정하려고 했다. 그러나 회원 탈퇴 후 재로그인 시 삭제된 데이터가 복구되지 않는 문제를 발견하면서 작업 방향이 크게 바뀌었다.

처음에는 UI 문제라고 생각했지만, SQL에서는 데이터가 정상적으로 존재하는 것을 확인하면서 화면 출력 문제가 아니라 데이터 접근 정책(RLS)과 View 조건 문제라는 것을 알게 되었다.

특히 is_deleted 상태와 profiles 테이블의 삭제 상태가 함께 작동하면서, 계정이 복구되었음에도 조회 조건에 의해 데이터가 보이지 않는 구조가 발생하고 있었다.

이 과정을 통해 Soft Delete와 Hard Delete의 역할을 다시 정리했고, 계정 복구는 자동이 아니라 사용자의 수동 선택으로 유지하는 방향이 더 적절하다고 판단했다.

결과적으로 UI 수정 작업에서 시작했지만, 인증 구조와 데이터 접근 구조를 깊이 이해하게 된 하루였다.