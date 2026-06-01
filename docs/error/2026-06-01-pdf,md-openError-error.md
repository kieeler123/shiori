# 日本語

## Shiori 添付ファイル機能 デバッグ記録

### 問題

● Shioriで添付したファイルを開く際に問題が発生した。

- Markdownファイルは正常に開く
- PDFファイルは文字化け、または空白ページになる
- 編集画面と詳細画面で挙動が異なる

---

### 原因調査

● 最初はPDF生成時のエンコード問題を疑った。

しかし調査の結果、

- 元のPDFは正常
- Chromeでも正常に表示される
- Shiori経由で開いた場合のみ問題が発生

することを確認した。

● その後ログを確認しながら、

- publicUrl
- signedUrl
- 添付ファイルAPI

の動作を比較した。

---

### 原因

● 詳細画面では

- /api/attachments/view

を利用していた。

- このAPIでは

-> ArrayBuffer

- を取得した後、

-> TextDecoder("utf-8")

- で強制的に文字列へ変換していた。

- その結果、

-> Markdownは正常だったが、

-> PDFや画像などのバイナリファイルは破損していた。

---

### デバッグ手順

1. PDFとMarkdownで挙動を比較
2. publicUrlとsignedUrlを比較
3. コンソールログを追加
4. MIME Typeを確認
5. 添付ファイルAPIを調査
6. PDFがTextDecoderで処理されていることを発見

---

### 解決方法

- ファイルタイプごとに処理を分離した。

● Markdown / Text

- API経由で表示

● PDF / Image

- signedUrl経由で表示

● またAPI側では

- Content-Type

を保持し、

- 不要なTextDecoder処理を除去した。

---

### 結果

- Markdown正常表示
- PDF正常表示
- 画像正常表示
- 詳細画面と編集画面の動作統一

添付ファイル機能を安定して利用できる状態になった。

# English

## Shiori Attachment System Debugging Log

### Problem

● An issue occurred when opening attached files in Shiori.

- Markdown files opened correctly
- PDF files appeared corrupted or blank
- Different behavior was observed between the edit page and the detail page

---

### Investigation

● At first, I suspected an encoding issue during PDF generation.

● However, after testing, I confirmed that:

- The original PDF files were valid
- PDF files opened correctly in Chrome
- The problem only occurred when files were opened through Shiori

● I then compared:

- publicUrl
- signedUrl
- attachment API behavior

---

### Root Cause

● The detail page used:

- /api/attachments/view

● The API fetched the file as an ArrayBuffer and then converted it into text using:

- TextDecoder("utf-8")

● This worked for Markdown files but corrupted binary files such as PDFs and images.

---

### Debugging Process

1. Compared Markdown and PDF behavior
2. Compared publicUrl and signedUrl
3. Added console logging
4. Verified MIME types
5. Investigated attachment API behavior
6. Identified TextDecoder as the root cause

---

### Solution

- Different file types were handled separately.

● Markdown / Text

- Open through API

● PDF / Images

- Open through signedUrl

● The API was also updated to preserve the original Content-Type and avoid unnecessary text conversion.

---

### Result

- Markdown files open correctly
- PDF files open correctly
- Image files open correctly
- Consistent behavior across pages

The attachment system is now working reliably.

# 한국어

## Shiori 첨부파일 기능 디버깅 기록

### 문제

● Shiori에서 첨부파일을 열 때 문제가 발생했다.

- Markdown 파일은 정상적으로 열림
- PDF 파일은 깨지거나 빈 화면으로 표시됨
- 수정페이지와 상세페이지의 동작이 서로 달랐음

---

### 원인 조사

- 처음에는 PDF 생성 과정의 인코딩 문제를 의심했다.

● 하지만 확인 결과

- 원본 PDF는 정상
- Chrome에서 직접 열면 정상
- Shiori를 통해 열 때만 문제 발생

한다는 것을 확인했다.

● 이후

- publicUrl
- signedUrl
- 첨부파일 API

의 동작을 비교하며 원인을 추적했다.

---

### 원인

● 상세페이지에서는

- /api/attachments/view

API를 사용하고 있었다.

- 이 API는 파일을 ArrayBuffer로 읽은 뒤

-> TextDecoder("utf-8")

-> 로 강제로 문자열로 변환하고 있었다.

- 이 때문에 Markdown 파일은 정상 동작했지만,

- PDF나 이미지 같은 바이너리 파일은 손상되었다.

---

### 디버깅 과정

1. Markdown과 PDF의 동작 차이 비교
2. publicUrl과 signedUrl 비교
3. 콘솔 로그 추가
4. MIME Type 확인
5. 첨부파일 API 분석
6. TextDecoder 처리 부분 발견

---

### 해결 방법

- 파일 종류에 따라 처리 방식을 분리했다.

● Markdown / Text

- API를 통해 표시

● PDF / Image

- signedUrl을 통해 표시

● 또한 API에서는

- Content-Type

을 유지하고,

- 불필요한 TextDecoder 처리도 제거했다.

---

### 결과

- Markdown 정상 표시
- PDF 정상 표시
- 이미지 정상 표시
- 상세페이지와 수정페이지 동작 통일

첨부파일 기능을 안정적으로 사용할 수 있게 되었다.
