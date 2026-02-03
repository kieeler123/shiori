2026-02-03

🇯🇵 エラー解決記録エッセイ

今回の開発では、機能追加よりも「運用構造への移行」によって多くのエラーが発生した。
これは単なるバグではなく、「設計レベルが一段上がった証拠」でもあった。

最初の問題は、ログイン後もセッションが null になる現象だった。
コンソールにはエラーは出ていなかったが、getSession → ready=true → logged out のログが繰り返し表示されていた。
原因は、認証フローそのものではなく、SessionProvider が App全体を包んでいなかったことだった。
構造変更時に provider の位置が外れ、認証コンテキストが共有されていなかった。
Provider を最上位に戻すことで解決した。

次の問題は Supabase への 400 エラーだった。
クエリは正しく見えたが、comment_count や is_deleted などのカラムが存在しないというエラーだった。
これは「コードの問題」ではなく、「DB設計が機能拡張に追いついていない」ことが原因だった。
この段階で、テーブルを直接参照する構造から、画面専用のVIEWを作る設計に切り替えた。
実務でも使われる設計に移行したことでエラーは解消された。

削除処理でも問題があった。
従来の .delete() 方式では復元が不可能で、運用リスクが高かった。
そこで is_deleted フラグを導入し、Soft Delete へ変更した。
これにより「ゴミ箱機能」が実装可能になり、誤削除リスクを減らす構造に進化した。

今回のエラーはすべて「機能の未完成」ではなく、
“個人アプリ → 運用サービス” への構造進化の副作用だった。
エラーを潰すたびに、アプリはより本番に近い形へと進化している。

🇺🇸 Error Resolution Essay

During this stage of development, errors occurred not because features were broken, but because the system structure evolved toward an operational service model.

The first issue was that the session kept returning null after login.
No red errors appeared, but logs repeatedly showed getSession → ready=true → logged out.
The cause was not authentication itself but that the SessionProvider was no longer wrapping the entire app after structural refactoring.
The auth context was not shared properly. Restoring the provider hierarchy fixed the issue.

The next major issue was a 400 error from Supabase.
The query looked correct, but columns like comment_count and is_deleted were reported as missing.
This wasn’t a frontend bug — it was a database schema mismatch caused by feature expansion.
The solution was to move from directly querying tables to using a screen-dedicated database VIEW, which is a real-world production practice.

Deletion logic also revealed a design weakness.
Hard deletes using .delete() made data recovery impossible, posing operational risk.
Switching to a Soft Delete model using is_deleted allowed recovery and enabled the Trash feature.

All errors encountered were side effects of transitioning from a “personal project” architecture to a “service-ready” architecture.
Each resolved error pushed the application closer to production-level robustness.

🇰🇷 에러 해결 에세이

이번 개발 단계에서 발생한 에러들은 단순한 버그가 아니라,
개인용 프로젝트에서 운영 가능한 서비스 구조로 올라가는 과정에서 나타난 구조적 충돌이었다.

첫 번째 문제는 로그인 후 세션이 계속 null 로 나오는 현상이었다.
콘솔에는 오류가 없었지만, getSession → ready=true → logged out 로그가 반복되었다.
원인은 인증 로직이 아니라, SessionProvider가 App 전체를 감싸지 못한 구조 변경 때문이었다.
Provider 위치를 최상단으로 복구하면서 해결되었다.

두 번째 문제는 Supabase 400 에러였다.
쿼리는 정상처럼 보였지만 comment_count, is_deleted 컬럼이 없다는 오류였다.
이는 코드 문제가 아니라 DB 설계가 기능 확장을 따라오지 못한 상황이었다.
이 단계에서 테이블 직접 조회 방식에서 벗어나,
화면 전용 VIEW를 만들어 사용하는 실무형 구조로 전환했다. 이후 오류는 사라졌다.

삭제 로직에서도 문제가 드러났다.
기존 .delete() 방식은 복구가 불가능해 운영 리스크가 컸다.
is_deleted 플래그를 사용하는 Soft Delete 방식으로 변경하면서
휴지통 기능이 가능해졌고, 실수 복구가 가능한 구조가 되었다.

이번 에러들은 “기능 미완성”이 아니라
구조가 한 단계 성장하면서 생긴 자연스러운 충돌이었다.
에러를 해결할 때마다 앱은 더 실전 서비스에 가까워지고 있다.