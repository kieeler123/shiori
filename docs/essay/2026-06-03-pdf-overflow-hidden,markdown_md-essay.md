# 오늘의 회고

## 日本語

今日は Shiori の PDF Viewer で発生していた表示切れ問題を分析した。最初は PDF 生成の問題だと思っていたが、実際には PDF Viewer のレンダリング方式と CSS 設定が主な原因の一つだった。特に `overflow-hidden` とページ幅の計算方法が影響していた。

また、Markdown 標準記法の重要性を改めて確認した。これまでは `●` 記号をよく使用していたが、PDF 変換時に予期しない問題が発生する可能性があることが分かった。今後は Markdown 標準記法を優先して使用する予定である。

---

## English

Today I analyzed a clipping issue in the Shiori PDF Viewer. At first, I thought the problem was related to PDF generation, but it turned out that the rendering behavior of the PDF Viewer and certain CSS settings were major contributing factors. In particular, `overflow-hidden` and page width calculations played an important role.

I also reaffirmed the importance of using standard Markdown syntax. Until now, I often used the `●` symbol for lists, but I learned that it can cause unexpected issues during PDF conversion. Going forward, I plan to prioritize standard Markdown formatting.

---

## 한국어

오늘은 Shiori의 PDF Viewer에서 발생하는 잘림 문제를 분석했다. 처음에는 PDF 생성 과정의 문제라고 생각했지만, 실제로는 PDF Viewer의 렌더링 방식과 CSS 설정이 주요 원인 중 하나였다. 특히 `overflow-hidden` 설정과 페이지 너비 계산 방식이 영향을 주고 있었다.

또한 Markdown 표준 문법의 중요성을 다시 확인했다. 지금까지는 `●` 기호를 자주 사용했지만, PDF 변환 과정에서 예상치 못한 문제가 발생할 수 있다는 점을 알게 되었다. 앞으로는 Markdown 표준 문법을 우선적으로 사용할 계획이다.
