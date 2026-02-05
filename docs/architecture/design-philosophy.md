2026-02-05

🧠 Shiori Design Philosophy
🇯🇵 日本語
🎯 このドキュメントの目的

この文書は機能記録ではなく、
Shiori プロジェクトの構造設計における「判断基準」 を記録するものである。

機能は増えるが、設計思想は一貫している必要がある。

🧱 基本設計思想
1. ドメイン分離を優先する

Shioriでは以下を独立したドメインとして扱う：

Logs（学習ログ）

Support（顧客センター）

Trash（削除管理）

理由：

機能ではなく「役割」が異なる

将来、独立サービスとして切り出せる構造にするため

2. 機能より「構造」を優先する

短期的な実装スピードより
長期的な拡張耐性 を優先する。

そのため：

Repoレイヤー分離

Viewベースの読み取り構造

Soft Delete戦略

Route Guard設計

を採用している。

3. 削除は消去ではなく「状態遷移」

Shioriでは削除 = データ消去ではない。

active → deleted → restored / hard deleted


これは以下の理由による：

誤削除対策

監査ログ思想

サービス信頼性

4. URLは入力値であり、信頼しない

Route param は常に検証対象。

UUIDガード導入

不正URLでもクラッシュさせない

5. UI構造もアーキテクチャの一部

メニュー構造・ページ分離も設計対象。

理由：

システムが拡張するとUIが破綻する

情報設計もアーキテクチャの一部

🔄 この文書を更新するタイミング

以下の変化があったときのみ更新：

ドメイン追加

データ管理方式変更

認証・権限設計変更

大規模リファクタ

🇺🇸 English
Purpose

This document records structural decision principles, not features.

Features change.
Architecture philosophy must stay consistent.

Core Principles

1. Domain separation over feature grouping

Logs / Support / Trash are separate domains.

2. Structure over speed

Long-term scalability > short-term implementation speed.

3. Deletion = state transition

Not removal, but lifecycle management.

4. URLs are inputs, not trustable

Route guards required.

5. UI structure is also architecture

Navigation design affects system scalability.

Update only when

Domain added

Data model strategy changes

Auth/RLS model changes

Major refactor

🇰🇷 한국어
문서 목적

이 문서는 기능 기록이 아니라
Shiori의 구조 설계 판단 기준을 기록하는 문서다.

핵심 설계 철학
1. 기능이 아니라 도메인 기준으로 나눈다

Logs

Support

Trash

역할이 다르면 구조도 분리한다.

2. 속도보다 구조 우선

단기 구현 속도보다
장기 확장 가능성을 우선한다.

3. 삭제는 제거가 아니라 상태 변화

삭제 = lifecycle 이동

4. URL은 신뢰하지 않는다

Route param은 항상 검증 대상

5. UI 구조도 아키텍처다

메뉴 설계도 시스템 설계의 일부

이 문서를 수정해야 하는 시점

도메인 추가

데이터 구조 변경

인증/권한 구조 변경

대규모 리팩토링

🔥 이 문서가 생기면 좋은 점

이제 너는:

“왜 이렇게 만들었어요?”

질문에 대해
코드가 아니라 설계 사상으로 답하는 개발자가 됨.

이게 포트폴리오 레벨을 확 끌어올리는 차이야.