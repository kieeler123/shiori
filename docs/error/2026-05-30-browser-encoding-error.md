# 日本語

## エラー対応記録

### 発生した問題

Shiori の添付ファイル機能で Markdown ファイルを開くと、日本語や韓国語が文字化けして表示される問題が発生した。

VS Code やダウンロードしたファイルでは正常に表示されるが、Supabase Storage の Public URL 経由で開いた場合のみ文字化けが発生した。

---

### 原因

最初は Markdown Viewer 拡張機能の問題やフォントの問題を疑った。

しかし調査を進めた結果、ファイル自体は正常な UTF-8 で保存されており、Supabase Storage の Public URL 経由で取得した際の文字コード解釈に問題があることが分かった。

Public URL 経由のレスポンスでは UTF-8 が正しく扱われず、結果として文字化けが発生していた。

---

### デバッグ手順

1. VS Code とブラウザで表示を比較
2. Markdown Viewer の影響を確認
3. Network タブで Response と Header を確認
4. Content-Type を調査
5. Storage から直接ダウンロードしてファイル内容を確認
6. Vercel Runtime Logs を確認
7. Invalid URL エラーを修正
8. Serverless Function のレスポンス内容を検証
9. Uint8Array 出力問題を発見
10. UTF-8 デコード処理を実装

---

### 解決方法

Vercel Serverless Function を作成し、Supabase Public URL を直接開かずにプロキシ経由で取得するように変更した。

取得した ArrayBuffer を TextDecoder("utf-8") でデコードし、UTF-8 として再レスポンスすることで文字化けを解消した。

結果として Markdown ファイルを正常に表示できるようになった。

---

### 学んだこと

- 文字化けの原因はファイルそのものとは限らない
- Response Header と Content-Type の確認は重要
- Vercel Logs は問題調査に非常に有効
- UTF-8 と文字コード処理の理解が重要
- 仮説を立てて一つずつ検証することが大切

# English

## Error Resolution Record

### Issue

Markdown files uploaded to the Shiori attachment feature were displayed with corrupted Korean and Japanese characters.

The files appeared correctly in VS Code and when downloaded directly, but became corrupted when opened through Supabase Storage Public URLs.

---

### Root Cause

Initially, I suspected a Markdown Viewer extension issue or a font-related problem.

However, after investigation, I confirmed that the files themselves were stored correctly in UTF-8 format.

The actual issue was related to how content retrieved through Supabase Storage Public URLs was interpreted and rendered, leading to character encoding problems.

---

### Debugging Process

1. Compared file rendering in VS Code and browsers
2. Verified whether Markdown Viewer was responsible
3. Inspected Network Response and Headers
4. Analyzed Content-Type values
5. Downloaded files directly from Storage for comparison
6. Checked Vercel Runtime Logs
7. Fixed an Invalid URL error
8. Verified Serverless Function responses
9. Identified Uint8Array output issues
10. Implemented UTF-8 decoding logic

---

### Solution

I implemented a Vercel Serverless Function that acts as a proxy instead of opening Supabase Public URLs directly.

The file content was retrieved as an ArrayBuffer, decoded using TextDecoder("utf-8"), and returned with proper UTF-8 handling.

As a result, Markdown files are now rendered correctly without character corruption.

---

### Lessons Learned

- Character encoding issues are not always caused by file corruption
- Response headers and Content-Type should always be verified
- Vercel Runtime Logs are extremely useful for debugging
- Understanding UTF-8 encoding is important
- Systematic hypothesis-driven debugging is highly effective

# 한국어

## 에러 해결 기록

### 문제 현상

Shiori 첨부파일 기능에서 Markdown 파일을 열었을 때 한글과 일본어가 깨져서 표시되는 문제가 발생했다.

VS Code에서 열거나 Storage에서 다운로드한 파일은 정상적으로 보였지만, Supabase Storage Public URL을 통해 열 경우에만 글자가 깨졌다.

---

### 원인

처음에는 Markdown Viewer 확장프로그램 문제 또는 폰트 문제를 의심했다.

하지만 조사 결과 파일 자체는 UTF-8 형식으로 정상 저장되어 있었고, 실제 문제는 Supabase Storage Public URL을 통해 가져온 내용을 브라우저가 처리하는 과정에서 발생한 인코딩 문제였다.

즉, 파일 손상이 아니라 응답 처리 과정의 문자 인코딩 문제가 원인이었다.

---

### 디버깅 과정

1. VS Code와 브라우저 표시 결과 비교
2. Markdown Viewer 영향 여부 확인
3. Network 탭에서 Response 및 Header 분석
4. Content-Type 확인
5. Storage에서 직접 다운로드하여 원본 검증
6. Vercel Runtime Logs 분석
7. Invalid URL 오류 수정
8. Serverless Function 응답 확인
9. Uint8Array 출력 문제 발견
10. UTF-8 디코딩 처리 구현

---

### 해결 방법

Supabase Public URL을 직접 열지 않고 Vercel Serverless Function을 통해 파일을 가져오도록 변경하였다.

가져온 ArrayBuffer를 TextDecoder("utf-8")로 디코딩한 후 UTF-8 문자열로 다시 응답하도록 구현하였다.

그 결과 Markdown 파일의 한글과 일본어가 정상적으로 표시되도록 수정할 수 있었다.

---

### 배운 점

- 문자 깨짐 문제는 파일 자체의 문제일 수도 있지만 응답 처리 과정의 문제일 수도 있다.
- Response Header와 Content-Type 분석이 중요하다.
- Vercel Runtime Logs는 원인 추적에 매우 유용하다.
- UTF-8 및 문자 인코딩에 대한 이해가 중요하다.
- 가설을 세우고 하나씩 검증하는 방식이 효과적이다.
