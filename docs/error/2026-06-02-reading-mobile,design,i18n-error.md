# 🇯🇵 日本語

## エラー対応記録

### 問題 1: モバイルでPDFがダウンロードされる

- 症状
  Android ChromeでPDFを開くとダウンロード確認画面が表示される
  ブラウザ内でPDFが表示されない

- 原因調査

最初は以下を疑った。

Chromeの設定
AndroidのPDFビューアー設定
PDFファイル自体の問題

しかしPCでは正常に表示されていたため、ブラウザ設定のみが原因ではないと判断した。

- デバッグ手順
  モバイルとPCの挙動比較
  Signed URLの直接アクセス確認
  レスポンスヘッダー確認
  PDFオープン処理の調査
- 原因

Supabase Signed URLを直接開いていたため、モバイルブラウザがダウンロード対象として扱っていた。

window.open(data.signedUrl);

- 解決方法

PDF.jsベースの専用ビューアーを実装した。

Signed URL
↓
API Proxy
↓
PDF.js Viewer
↓
Browser Rendering

- 結果
  ダウンロード画面解消
  ブラウザ内表示実現

### 問題 2: PDFを開くと外部アプリ選択画面が表示される

- 症状
  PDF表示時にアプリ選択画面が表示される
- 原因調査

ブラウザがPDFファイルを直接処理せず、外部アプリへ委譲している可能性を調査した。

- 原因

PDFファイルそのものを開いていたため。

- 解決方法

PDFファイルを開くのではなく、HTMLページ内でPDF.jsを使って描画する構成へ変更。

- 結果
  外部アプリ選択画面解消
  完全なブラウザ内表示実現
  問題 3: PDF.jsレンダリング失敗
  症状

PDFビューアー画面は表示されるがPDF内容が表示されない。

- デバッグ手順

ブラウザコンソールを確認。

The API version "5.4.296" does not match the Worker version "6.0.227"

- 原因

react-pdfとpdfjs-distのバージョン不一致。

# API Version

5.4.296

# Worker Version

6.0.227

- 解決方法

Worker設定を修正。

pdfjs.GlobalWorkerOptions.workerSrc =
`//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

さらにパッケージバージョンを統一。

- 結果

PDFレンダリング成功。

### 問題 4: Gitファイル名大小文字問題

- 症状
  Cannot find module

エラー発生。

- デバッグ手順
  GitHub上のファイル名確認
  ローカルファイル名確認
  Importパス確認
- 原因

WindowsとGitの大文字・小文字認識差異。

AccountTrashRepo.ts
accountTrashRepo.ts

- 解決方法

Git強制リネーム。

git mv -f

- 結果

ビルド成功。

# 🇺🇸 English

## Error Handling Log

### Issue 1: PDF Downloads Instead of Opening on Mobile

- Symptoms
  Android Chrome displayed a download prompt.
  PDF was not rendered inside the browser.
  Investigation

I- nitially suspected:

Chrome settings
Android PDF viewer configuration
Corrupted PDF files

Since PDFs worked correctly on desktop browsers, browser settings alone were ruled out.

- ebugging Process
  Compared desktop and mobile behavior.
  Tested direct Signed URL access.
  Checked response headers.
  Investigated PDF opening logic.
  Root Cause

Supabase Signed URLs were opened directly.

window.open(data.signedUrl);

Mobile browsers treated the file as a downloadable resource.

- Solution

Implemented a PDF.js-based viewer.

Signed URL
↓
API Proxy
↓
PDF.js Viewer
↓
Browser Rendering
Result
Download prompts removed.
Browser-based rendering achieved.

### Issue 2: External App Selection Dialog Appeared

- Symptoms

Users were prompted to choose an external application.

Investigation

Determined that the browser was delegating PDF handling to external applications.

- Root Cause

The application was opening the PDF file directly.

- Solution

Implemented PDF rendering inside an HTML page using PDF.js.

- Result
  No external app prompts.
  Fully browser-based PDF viewing.
  Issue 3: PDF.js Rendering Failure
  Symptoms

The viewer page loaded but PDF content was not displayed.

- Debugging Process

Examined browser console logs.

The API version "5.4.296" does not match the Worker version "6.0.227"
Root Cause

Version mismatch between react-pdf and pdfjs-dist.

# API Version

5.4.296

# Worker Version

6.0.227
Solution

Updated Worker configuration.

pdfjs.GlobalWorkerOptions.workerSrc =
`//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

Aligned package versions.

- Result

Successful PDF rendering.

### Issue 4: Git Filename Casing Problem

- Symptoms
  Cannot find module

errors occurred during build.

- Debugging Process
  Checked GitHub filenames.
  Compared local filenames.
  Verified import paths.
  Root Cause

Filename casing differences between Windows and Git.

AccountTrashRepo.ts
accountTrashRepo.ts
Solution

Forced Git rename.

git mv -f

- Result

Build completed successfully.

# 🇰🇷 한국어

## 에러 처리 기록

### 문제 1: 모바일에서 PDF가 다운로드됨

- 증상
  Android Chrome에서 PDF를 열면 다운로드 확인창이 표시됨
  브라우저 내부에서 PDF가 표시되지 않음
- 원인 조사

처음에는 다음을 의심했다.

Chrome 설정 문제
Android PDF 뷰어 앱 문제
PDF 파일 자체 문제

하지만 PC에서는 정상 동작했기 때문에 브라우저 설정만의 문제는 아니라고 판단했다.

- 디버깅 과정
  PC와 모바일 동작 비교
  Signed URL 직접 접근 테스트
  응답 헤더 확인
  PDF 열기 로직 분석
- 원인

Supabase Signed URL을 직접 열고 있었다.

window.open(data.signedUrl);

모바일 브라우저가 이를 다운로드 대상 파일로 인식하였다.

- 해결 방법

PDF.js 기반 전용 PDF 뷰어를 구현하였다.

Signed URL
↓
API Proxy
↓
PDF.js Viewer
↓
Browser Rendering

- 결과
  다운로드 화면 제거
  브라우저 내부 PDF 렌더링 성공
  문제 2: 외부 앱 선택창 표시
  증상

PDF를 열 때 외부 앱 선택창이 표시됨.

- 디버깅 과정

브라우저가 PDF를 직접 렌더링하지 않고 외부 앱으로 넘기는지 확인하였다.

- 원인

PDF 파일 자체를 직접 열고 있었음.

- 해결 방법

PDF.js를 사용하여 HTML 페이지 내부에서 PDF를 렌더링하도록 변경하였다.

- 결과
  외부 앱 선택창 제거
  브라우저 내 PDF 표시 구현
  문제 3: PDF.js 렌더링 실패
  증상

PDF 뷰어 페이지는 열리지만 PDF 내용이 표시되지 않음.

- 디버깅 과정

브라우저 콘솔 로그를 확인하였다.

The API version "5.4.296" does not match the Worker version "6.0.227"

- 원인

react-pdf와 pdfjs-dist의 버전이 일치하지 않았다.

# API Version

5.4.296

# Worker Version

6.0.227

- 해결 방법

Worker 설정을 수정하였다.

pdfjs.GlobalWorkerOptions.workerSrc =
`//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

또한 패키지 버전을 정합성 있게 맞추었다.

- 결과

PDF 렌더링 성공.

### 문제 4: Git 파일명 대소문자 충돌

- 증상
  Cannot find module

빌드 에러 발생.

- 디버깅 과정
  GitHub 파일명 확인
  로컬 파일명 확인
  Import 경로 확인
- 원인

Windows와 Git의 파일명 대소문자 처리 방식 차이.

AccountTrashRepo.ts
accountTrashRepo.ts

- 해결 방법

Git 강제 리네임 수행.

git mv -f

- 결과

빌드 정상 완료.
