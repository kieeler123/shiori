🇯🇵 日本語

Q. OAuth リダイレクトが本番ドメインに飛んでしまう原因は？

A. Supabase は Redirect URL を完全一致で検証します。ローカルが http で動作しているのに https で登録していたため一致せず、Site URL にフォールバックしました。

🇺🇸 English**

Q: Why did OAuth redirect to production instead of localhost?

A: Supabase strictly validates redirect URLs. Since localhost was registered as HTTPS while the app was running on HTTP, the match failed and Supabase fell back to the Site URL.

🇰🇷 한국어**

Q. OAuth 로그인 후 배포 주소로 이동한 원인은 무엇인가요?

A. Supabase는 Redirect URL을 완전 일치 방식으로 검증합니다. 로컬은 http로 실행되고 있었지만 https로 등록되어 있어 일치하지 않았고, 그 결과 Site URL로 fallback되었습니다.