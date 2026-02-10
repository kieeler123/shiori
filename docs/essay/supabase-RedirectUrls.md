2026-02-11

🇯🇵 日本語エッセイ

本日のデバッグは、単なる設定ミスではなく、OAuthフロー全体を理解する経験だった。

最初は redirectTo の設定や next パラメータの問題を疑った。しかし、実際の原因は Redirect URLs に https://localhost
 を登録していたことだった。ローカル環境は http で動作していたため、Supabase の厳格な完全一致チェックに失敗し、Site URL へフォールバックしていた。

この経験から、OAuth においてはプロトコル、ドメイン、ポートの完全一致が必要であることを実感した。また、navigate() がドメイン移動を起こさないことも確認できた。

設定の一文字違いが、大きな挙動の差を生むことを学んだ。

🇺🇸 English Essay

Today’s debugging session was not just about fixing a redirect issue; it was about understanding the full OAuth flow.

Initially, I suspected problems with redirectTo or the next parameter. However, the real cause was that Redirect URLs were registered as https://localhost, while the local app was running on http://localhost.

Supabase strictly validates redirect URLs with exact matching. Since the protocol did not match, it fell back to the Site URL (production domain).

This experience reinforced the importance of protocol consistency and strict matching in OAuth flows.

🇰🇷 한국어 에세이

오늘의 디버깅은 단순한 설정 오류를 고치는 과정이 아니라 OAuth 흐름을 완전히 이해하는 과정이었다.

처음에는 redirectTo나 next 값 문제를 의심했지만, 실제 원인은 Redirect URLs에 https://localhost를
 등록해둔 것이었다. 로컬은 http로 실행되고 있었기 때문에 Supabase의 엄격한 일치 검사에서 실패했고, 그 결과 Site URL(배포 주소)로 fallback이 발생했다.

이번 경험을 통해 OAuth에서는 프로토콜, 도메인, 포트까지 완전히 일치해야 한다는 점을 체감했다.