2026-02-27

🇯🇵 日本語

Q. 多言語対応はどのように設計しましたか？
A. LocaleProvider を中心としたグローバル状態管理を採用し、コンポーネントは t(key) のみ使用する構造にしました。

Q. なぜハードコードを除去しましたか？
A. テーマと多言語の拡張性を維持するためです。

🇺🇸 English

Q. How did you implement internationalization?
A. I introduced a global LocaleProvider and made components language-agnostic using a translation function.

Q. Why remove hardcoded values?
A. To ensure scalability and maintain consistent theming across locales.

🇰🇷 한국어

Q. 다국어 구조를 어떻게 설계했나요?
A. LocaleProvider 기반 전역 상태 관리와 t(key) 구조로 컴포넌트를 언어 독립적으로 만들었습니다.

Q. 하드코딩을 제거한 이유는?
A. 테마 및 다국어 확장성을 유지하기 위해서입니다.