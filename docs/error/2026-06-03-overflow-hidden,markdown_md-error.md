# PDF Viewer 잘림 문제 디버깅 기록

## 日本語

### 問題の現象

- Shiori の PDF Viewer で PDF の一部が切れて表示された。
- デスクトップとモバイルの両方で発生した。
- PDF ファイル自体は正常に生成されていた。

### 最初に考えた原因

- Markdown から PDF への変換処理
- PDF 生成ライブラリの問題
- PDF ファイルの破損

### デバッグの過程

1. PDF の元ファイルを確認した。
2. PDF 自体は正常に表示されることを確認した。
3. Shiori の PDF Viewer でのみ問題が発生することを確認した。
4. PDF レンダリングコンポーネントを調査した。
5. `overflow-hidden` の設定を発見した。
6. PDF ページ幅の計算方法を確認した。
7. `window.innerWidth` を基準に計算していることを確認した。
8. 実際のコンテナ幅との不一致の可能性を確認した。

### 実際の原因

- PDF 自体には問題がなかった。
- PDF Viewer の CSS 設定とレイアウト計算が原因だった。
- `overflow-hidden` によって一部が切り取られていた。
- ページ幅計算がコンテナサイズを正しく反映していなかった。

### 解決方法

- `overflow-hidden` を削除
- `overflow-x-auto` を適用
- PDF ページを中央配置
- コンテナ基準の幅計算を検討

### 結果

- PDF の切れ問題が解決した。
- デスクトップとモバイルの両方で正常に表示された。

### 学んだこと

- PDF の問題が必ずしも PDF 生成処理にあるとは限らない。
- レンダリング層とレイアウトも確認する必要がある。
- `overflow-hidden` は UI バグの原因になりやすい。

---

## English

### Problem

- Part of the PDF content was clipped in the Shiori PDF Viewer.
- The issue occurred on both desktop and mobile devices.
- The original PDF file was generated correctly.

### Initial Assumptions

- Markdown-to-PDF conversion issue
- PDF generation library issue
- Corrupted PDF file

### Debugging Process

1. Checked the original PDF file.
2. Confirmed that the PDF itself rendered correctly.
3. Verified that the issue only occurred in the Shiori PDF Viewer.
4. Investigated the PDF rendering component.
5. Found the `overflow-hidden` setting.
6. Reviewed the page width calculation logic.
7. Confirmed that width was calculated using `window.innerWidth`.
8. Identified a possible mismatch between container width and PDF width.

### Root Cause

- The PDF file itself was not the problem.
- The issue was caused by the PDF Viewer layout and CSS configuration.
- `overflow-hidden` clipped part of the rendered content.
- The width calculation did not accurately reflect the actual container size.

### Solution

- Removed `overflow-hidden`
- Applied `overflow-x-auto`
- Centered the PDF page
- Reviewed container-based width calculation

### Result

- The clipping issue was resolved.
- The PDF displayed correctly on both desktop and mobile devices.

### Lessons Learned

- PDF-related issues are not always caused by PDF generation.
- Rendering layers and layout calculations should also be investigated.
- `overflow-hidden` can easily cause UI rendering bugs.

---

## 한국어

### 문제 현상

- Shiori PDF Viewer에서 PDF 일부 내용이 잘려 보였다.
- 데스크톱과 모바일에서 동일하게 발생했다.
- PDF 원본 파일은 정상적으로 생성되었다.

### 처음 예상한 원인

- Markdown → PDF 변환 과정의 문제
- PDF 생성 라이브러리 문제
- PDF 파일 자체 손상

### 디버깅 과정

1. PDF 원본 파일을 직접 확인했다.
2. PDF 자체는 정상적으로 표시되는 것을 확인했다.
3. Shiori PDF Viewer에서만 문제가 발생하는 것을 확인했다.
4. PDF 렌더링 컴포넌트를 조사했다.
5. `overflow-hidden` 설정을 발견했다.
6. PDF 페이지 너비 계산 방식을 확인했다.
7. `window.innerWidth` 기준으로 폭을 계산하고 있음을 확인했다.
8. 실제 컨테이너 너비와 PDF 너비가 일치하지 않을 가능성을 확인했다.

### 실제 원인

- PDF 자체의 문제가 아니었다.
- PDF Viewer의 CSS 설정과 레이아웃 계산 방식이 원인이었다.
- `overflow-hidden`으로 인해 일부 영역이 잘렸다.
- 페이지 너비 계산이 실제 컨테이너 크기를 반영하지 못했다.

### 해결 방법

- `overflow-hidden` 제거
- `overflow-x-auto` 적용
- PDF 페이지를 중앙 정렬
- 컨테이너 기준 너비 계산 방식 검토

### 결과

- PDF 잘림 현상이 해결되었다.
- 데스크톱과 모바일 모두 정상적으로 표시되었다.

### 배운 점

- PDF 문제라고 해서 반드시 PDF 생성 과정이 원인은 아니다.
- 렌더링 계층과 레이아웃도 반드시 확인해야 한다.
- `overflow-hidden`은 UI 버그의 주요 원인이 될 수 있다.
