📘 2026-02-15
Theme System拡張中に発生したデザインエラー記録
🇯🇵 日本語（面接・将来振り返り用）
概要

今回の作業は単なる色追加ではなく、
Shioriのテーマシステムを構造的に再設計する作業でした。

CSSトークンとTypeScriptプリセットを統合し、
Header・Menu・Loginボタンまで完全にテーマ化することが目的でした。

1️⃣ SageMistのmenu色が適用されなかった問題
問題

SageMistテーマに切り替えても
menu背景色が変わらない。

原因

CSSには --menu-bg が定義されていた

しかし、TypeScriptのテーマトークンに含まれていなかった

CSS版とTS版でトークン契約が一致していなかった

つまり、

テーマ定義が部分的に分断されていた。

解決

全テーマにmenu関連トークンを統一追加

CSS変数とTSトークンキーを1対1で整合

共通契約として管理

2️⃣ ブラウン・新テーマでメニューが見づらい問題
問題

背景が透けすぎて可読性が低下。

原因

menuのopacityが低すぎた（0.72〜0.78）

ダーク系とライト系で同じ透過率を使用していた

解決

ダーク系：0.88〜0.92

ライト系：0.82〜0.9

overlay-blurを明示的トークン化

3️⃣ ログインボタンのテーマ未対応
問題

ログインボタンがテーマに応じて変化しない。

原因

header専用ボタントークンが未定義

btn-primaryしか存在していなかった

解決

以下を全テーマに追加：

--btn-nav-bg
--btn-nav-fg
--btn-nav-border
--btn-nav-hover-bg
--btn-nav-hover-border

学んだこと

テーマは色ではなく「契約」である。

CSSとTSを併用する場合、完全同期が必須。

感覚ではなく数値範囲で設計する。

🇺🇸 English (Technical Documentation Version)
Overview

This task was not about adding colors.
It was a structural redesign of the Shiori theme system.

Goal:

Unify CSS tokens and TypeScript presets

Fully theme Header, Menu, and Login button

Establish consistent design contracts

Issue 1: SageMist Menu Color Not Applied
Problem

Menu background did not update when switching to SageMist.

Root Cause

--menu-bg existed in CSS

Missing from TypeScript token preset

CSS and TS theme contracts were inconsistent

Solution

Added missing menu tokens to all presets

Synchronized CSS variables and TS keys

Enforced 1:1 token mapping

Issue 2: Menu Transparency Problem
Problem

Menu readability was poor in Brown and new themes.

Root Cause

Opacity too low (0.72–0.78)

Same transparency used for dark and light themes

Solution

Dark themes: 0.88–0.92

Light themes: 0.82–0.90

Explicit overlay tokenization

Issue 3: Login Button Not Themed
Problem

Login button ignored theme changes.

Root Cause

No dedicated header button tokens

Only primary button tokens defined

Solution

Added navigation button tokens:

--btn-nav-bg
--btn-nav-fg
--btn-nav-border
--btn-nav-hover-bg
--btn-nav-hover-border

Lessons Learned

A theme is a contract, not a color.

CSS and TS systems must stay synchronized.

Visual design must be range-based, not intuition-based.

🇰🇷 한국어 (개인 기록 + 설계 정리용)
개요

이번 작업은 색을 추가하는 것이 아니라
Shiori의 테마 시스템을 구조적으로 재정비하는 작업이었다.

목표는 다음과 같았다:

CSS 토큰과 TS 프리셋 통합

Header / Menu / Login 버튼까지 완전 테마화

일관된 토큰 계약 정의

1️⃣ SageMist 메뉴 색상 미적용 문제
원인

CSS에는 --menu-bg 존재

TS 테마 토큰에는 없음

두 시스템 간 계약 불일치

해결

모든 테마에 동일한 menu 토큰 추가

CSS와 TS 키 1:1 동기화

2️⃣ 메뉴 가독성 문제
원인

opacity 과도한 투명도

라이트/다크 동일 기준 사용

해결

다크 0.88~0.92

라이트 0.82~0.9

overlay 토큰 분리

3️⃣ 로그인 버튼 미테마 문제
원인

header 전용 버튼 토큰 없음

해결

공통 계약 정의:

--btn-nav-bg
--btn-nav-fg
--btn-nav-border
--btn-nav-hover-bg
--btn-nav-hover-border

최종 정리

이번 작업은 단순 디자인 수정이 아니라
“테마 시스템 설계 정비 작업”이었다.

테마는 색상이 아니라 구조이며,
구조는 계약 기반으로 관리되어야 한다.