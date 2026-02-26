2026-02-27

🇯🇵 日本語

今日の作業は単なる翻訳追加ではなく、Shiori をグローバル対応可能な構造へ進化させる作業だった。
UI 内に分散していた文字列を i18n システムへ統合し、コンポーネントは言語を意識しない設計へ変更した。

特に LocaleProvider を中心に状態を管理することで、言語変更時に全 UI が自然に再描画される構造を完成させた。
これは将来的な海外展開の基盤となる重要なアーキテクチャ変更である。

🇺🇸 English

Today’s work was not simply about adding translations but evolving Shiori into a global-ready architecture.

Text resources were separated from UI logic, and components became language-agnostic through the t() system.
The LocaleProvider now controls global language state, allowing seamless UI updates when the locale changes.

This marks the transition from a local project to a globally scalable platform.

🇰🇷 한국어

오늘 작업은 단순 번역 추가가 아니라 Shiori를 글로벌 플랫폼 구조로 확장하는 과정이었다.

UI에 흩어져 있던 문자열을 i18n 시스템으로 통합했고, 컴포넌트는 언어를 직접 알지 못하는 구조로 변경했다.
LocaleProvider를 중심으로 언어 상태를 관리하면서 언어 변경 시 전체 UI가 자연스럽게 재렌더링되는 구조를 완성했다.

이는 Shiori가 로컬 프로젝트에서 글로벌 플랫폼으로 넘어가는 첫 단계다.