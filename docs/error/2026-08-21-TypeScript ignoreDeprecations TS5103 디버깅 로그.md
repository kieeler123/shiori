# TypeScript `ignoreDeprecations` TS5103 디버깅 로그

# 日本語

## TypeScript TS5103: Invalid value for `--ignoreDeprecations`

### 問題

- Vercel でプロジェクトをビルドした際、TypeScript の設定ファイルに関するエラーが発生した。
- `tsconfig.app.json` と `tsconfig.node.json` の `ignoreDeprecations` 設定で `TS5103` エラーが表示された。

```text
tsconfig.app.json(7,27): error TS5103: Invalid value for '--ignoreDeprecations'.
tsconfig.node.json(13,27): error TS5103: Invalid value for '--ignoreDeprecations'.
Error: Command "npm run build" exited with 1
```

### 状況

- Vite + React + TypeScript プロジェクトを GitHub に push し、Vercel でデプロイしていた。
- ローカルでは設定ファイルを修正していたが、Vercel のビルド環境では TypeScript 設定エラーが発生した。
- 期待していた動作は `npm run build` が正常終了し、Vercel のデプロイが成功することだった。

### 調査

#### 確認①

`tsconfig.app.json` と `tsconfig.node.json` の TypeScript 設定を確認した。

```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0"
  }
}
```

- `ignoreDeprecations` に `"6.0"` が設定されていることを確認した。
- 現在使用している TypeScript のバージョンや設定との互換性によって、この値が無効になる可能性があると判断した。

#### 確認②

不要になった `tsconfig.app.json` と `tsconfig.node.json` を削除し、ローカルで再度ビルドを実行した。

```bash
npm run build
```

- ファイル削除直後は VS Code 上に赤いエラー表示が残っていた。
- しかし `npm run build` を実行するとビルドが正常終了し、エラー表示も消えた。
- TypeScript Server やエディタ側に以前の設定情報が一時的に残っていた可能性がある。

### 原因

```json
"ignoreDeprecations": "6.0"
```

- `ignoreDeprecations` は TypeScript の deprecated 設定に関する警告を一時的に抑制するための設定である。
- TypeScript のバージョンと指定値が一致しない場合、`TS5103` が発生する可能性がある。
- また、ローカルで変更した内容と GitHub に実際に push された内容が一致していない場合、Vercel が以前の設定を使ってビルドするように見えることがある。

### 修正

不要になった TypeScript 設定ファイルを削除し、プロジェクトを再ビルドした。

```bash
npm run build
```

必要に応じて、今後 `TS5103` が再発した場合は以下の設定を削除する。

```json
"ignoreDeprecations": "6.0"
```

- 現時点ではビルドが正常に通るため、設定を無理に変更しない。
- TypeScript のバージョン変更後に同じエラーが発生した場合は `ignoreDeprecations` を最初に確認する。
- Vercel のエラー発生時には GitHub に最新の commit が push されているかも確認する。

### 学んだこと

- `ignoreDeprecations` は恒久的な解決策ではなく、deprecated 設定の移行期間で使用する一時的な設定として考える必要がある。
- VS Code のエラー表示と実際の `npm run build` の結果が一致しない場合があるため、最終的には実際のビルド結果を確認する。
- Vercel のビルドエラーでは、ローカル環境だけでなく GitHub に push された実際のコードと設定を確認することが重要である。

### 一行まとめ

- TypeScript の `ignoreDeprecations` 設定で TS5103 発生 → TypeScript 設定と GitHub の反映状態を確認 → 不要な設定ファイルを整理して再ビルドし解決

---

# English

## TypeScript TS5103: Invalid value for `--ignoreDeprecations`

### Problem

- A TypeScript configuration error occurred while Vercel was building the project.
- The `ignoreDeprecations` setting in `tsconfig.app.json` and `tsconfig.node.json` caused a `TS5103` error.

```text
tsconfig.app.json(7,27): error TS5103: Invalid value for '--ignoreDeprecations'.
tsconfig.node.json(13,27): error TS5103: Invalid value for '--ignoreDeprecations'.
Error: Command "npm run build" exited with 1
```

### Situation

- I was deploying a Vite + React + TypeScript project to Vercel through GitHub.
- The configuration files had been modified locally, but the Vercel build environment still produced a TypeScript configuration error.
- The expected behavior was for `npm run build` to finish successfully and for the Vercel deployment to complete.

### Investigation

#### Check #1

I checked the TypeScript settings inside `tsconfig.app.json` and `tsconfig.node.json`.

```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0"
  }
}
```

- I confirmed that `ignoreDeprecations` was set to `"6.0"`.
- I suspected that this value could become invalid depending on the installed TypeScript version and its supported configuration values.

#### Check #2

I removed the unnecessary `tsconfig.app.json` and `tsconfig.node.json` files and ran the local build again.

```bash
npm run build
```

- Red error indicators were still visible in VS Code immediately after deleting the files.
- After running `npm run build`, the build completed successfully and the error indicators disappeared.
- This suggested that the TypeScript Server or the editor may have temporarily retained information from the previous configuration.

### Cause

```json
"ignoreDeprecations": "6.0"
```

- `ignoreDeprecations` is used to temporarily suppress warnings related to deprecated TypeScript configuration options.
- If the specified value is not supported by the currently installed TypeScript version, a `TS5103` error can occur.
- In addition, when local changes and the files actually pushed to GitHub are different, Vercel may appear to be building with an older configuration.

### Fix

I removed the unnecessary TypeScript configuration files and rebuilt the project.

```bash
npm run build
```

If `TS5103` occurs again in the future, I can remove the following temporary setting.

```json
"ignoreDeprecations": "6.0"
```

- Since the build currently succeeds, there is no need to modify the working configuration unnecessarily.
- If the same error appears after a TypeScript version change, `ignoreDeprecations` should be one of the first settings to check.
- When a Vercel build fails, I should also verify that the latest commit was actually pushed to GitHub.

### Lessons Learned

- `ignoreDeprecations` should be treated as a temporary migration setting rather than a permanent solution.
- VS Code diagnostics and the actual result of `npm run build` may not always match, so the real build result should be checked.
- For Vercel build errors, it is important to verify not only the local environment but also the exact code and configuration that were pushed to GitHub.

### One-line Summary

- TS5103 occurred because of the TypeScript `ignoreDeprecations` setting → checked TypeScript configuration and GitHub synchronization → cleaned up unnecessary configuration files and rebuilt successfully

---

# 한국어

## TypeScript TS5103: Invalid value for `--ignoreDeprecations`

### 문제

- Vercel에서 프로젝트를 빌드하는 과정에서 TypeScript 설정 파일 관련 에러가 발생했다.
- `tsconfig.app.json`과 `tsconfig.node.json`의 `ignoreDeprecations` 설정에서 `TS5103` 에러가 출력되었다.

```text
tsconfig.app.json(7,27): error TS5103: Invalid value for '--ignoreDeprecations'.
tsconfig.node.json(13,27): error TS5103: Invalid value for '--ignoreDeprecations'.
Error: Command "npm run build" exited with 1
```

### 상황

- Vite + React + TypeScript 프로젝트를 GitHub에 push한 뒤 Vercel을 통해 배포하고 있었다.
- 로컬에서는 설정 파일을 수정한 상태였지만 Vercel 빌드 환경에서는 TypeScript 설정 에러가 발생했다.
- 기대한 동작은 `npm run build`가 정상적으로 완료되고 Vercel 배포까지 성공하는 것이었다.

### 디버깅 순서

1. Vercel에서 출력된 에러 메시지를 확인했다.
2. 에러가 발생한 `tsconfig.app.json`, `tsconfig.node.json`의 위치를 확인했다.
3. `ignoreDeprecations`에 설정된 값을 확인했다.
4. TypeScript 버전과 설정값의 호환성 문제를 의심했다.
5. 불필요한 설정 파일을 제거하고 `npm run build`를 다시 실행했다.
6. 빌드가 정상적으로 완료되는 것을 확인했다.

### 조사 과정

#### 확인 ①

`tsconfig.app.json`과 `tsconfig.node.json`에 들어 있는 TypeScript 설정을 확인했다.

```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0"
  }
}
```

- `ignoreDeprecations` 값이 `"6.0"`으로 설정되어 있는 것을 확인했다.
- 설치된 TypeScript 버전과 지원되는 설정값에 따라 해당 값이 유효하지 않을 수 있다고 판단했다.

#### 확인 ②

더 이상 필요하지 않은 `tsconfig.app.json`과 `tsconfig.node.json`을 제거하고 로컬에서 다시 빌드했다.

```bash
npm run build
```

- 파일을 삭제한 직후에는 VS Code에 빨간 에러 표시가 남아 있었다.
- 하지만 `npm run build`를 실행한 뒤에는 빌드가 정상적으로 완료됐고 에러 표시도 사라졌다.
- TypeScript Server 또는 에디터가 이전 설정 정보를 일시적으로 캐시하고 있었을 가능성이 있다.

### 원인

```json
"ignoreDeprecations": "6.0"
```

- `ignoreDeprecations`는 deprecated된 TypeScript 설정과 관련된 경고를 일정 기간 무시하기 위한 임시 설정이다.
- 현재 사용하는 TypeScript 버전에서 해당 값을 지원하지 않으면 `TS5103` 에러가 발생할 수 있다.
- 또한 로컬에서 수정한 내용과 GitHub에 실제로 push된 파일이 다르면 Vercel이 이전 설정을 기준으로 빌드하는 것처럼 보일 수 있다.

### 해결

불필요해진 TypeScript 설정 파일을 제거한 뒤 프로젝트를 다시 빌드했다.

```bash
npm run build
```

향후 `TS5103`이 다시 발생한다면 다음 임시 설정을 삭제할 수 있다.

```json
"ignoreDeprecations": "6.0"
```

- 현재는 빌드가 정상적으로 되므로 동작하는 설정을 불필요하게 변경하지 않는다.
- TypeScript 버전을 변경한 뒤 동일한 에러가 발생하면 `ignoreDeprecations`를 우선적으로 확인한다.
- Vercel에서 빌드 에러가 발생하면 최신 commit이 GitHub에 실제로 push되었는지도 함께 확인한다.

### 배운 점

- `ignoreDeprecations`는 영구적인 해결책이 아니라 deprecated 설정을 정리하기 전 사용하는 임시적인 마이그레이션 설정으로 이해해야 한다.
- VS Code에 표시되는 에러와 실제 `npm run build` 결과가 항상 일치하는 것은 아니므로 최종적으로 실제 빌드 결과를 확인해야 한다.
- Vercel 빌드 에러를 디버깅할 때는 로컬 환경뿐 아니라 GitHub에 실제 반영된 코드와 설정까지 확인하는 습관이 중요하다.

### 한 줄 요약

- TypeScript `ignoreDeprecations` 설정으로 TS5103 발생 → TypeScript 설정과 GitHub 반영 상태 확인 → 불필요한 설정 파일을 정리하고 다시 빌드하여 해결