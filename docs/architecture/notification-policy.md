2026-02-26

🇯🇵 Notification Policy（通知ポリシー）
目的

Shioriでは、ユーザー体験（UX）を維持しながら重要な操作を安全に行うため、通知を種類別に分離する。

Toast：一般的なフィードバック通知

Alert / Confirm：重要または取り消し困難な操作

このポリシーにより：

操作フローを不必要に中断しない

重大な操作ではユーザー確認を必須にする

基本原則
1. 通常通知は Toast を使用する

以下の場合は Toast を使用する：

保存成功 / 失敗

ネットワークエラー

権限不足

入力不足の案内

操作完了通知

ルール

ユーザー操作を止めない

短く明確なメッセージ

自動消滅可能な内容のみ

2. 重要操作は Confirm を使用

以下は確認を要求する：

削除（ゴミ箱移動）

アカウント削除

完全削除（Hard Delete）

復元不可能な操作

セキュリティ関連操作

3. Alert は最小限に使用

Alertは強い割り込みのため限定使用：

セキュリティ通知

必ず認識させる必要がある案内

Undo（取り消し）戦略

可能な場合：

削除後に Undo Toast を提供する

「元に戻す」ボタンを表示

実装レイヤー
Transport Layer

toast.ts

通知送信のみ担当

Policy Layer

notify.ts

toast / confirm / alert の選択を管理

メッセージ例

成功：

保存しました

登録しました

復元しました

失敗：

失敗しました。しばらくしてから再試行してください。

確認：

削除しますか？（ゴミ箱へ移動）

完全削除しますか？この操作は元に戻せません。

🇺🇸 Notification Policy
Purpose

Shiori separates notification types to maintain smooth UX while ensuring safe execution of critical actions.

Toast: general feedback notifications

Alert / Confirm: important or irreversible actions

This policy ensures:

Minimal interruption to user flow

Mandatory confirmation for critical operations

Core Principles
1. Use Toast for normal feedback

Use toast for:

Save success/failure

Network errors

Permission issues

Form validation hints

Completion messages

Rules

Do not block user interaction

Keep messages short and clear

Only auto-dismissible information

2. Use Confirm for important actions

Require confirmation for:

Delete (move to trash)

Account deletion

Hard delete

Irreversible operations

Security-related actions

3. Use Alert sparingly

Alert should only be used when user awareness is mandatory:

Security notices

Critical system messages

Undo Strategy

Whenever possible:

Provide undo via toast action after deletion

Allow quick recovery without blocking flow

Implementation Layers
Transport Layer

toast.ts

Responsible only for dispatching notifications

Policy Layer

notify.ts

Decides between toast / confirm / alert

Message Examples

Success:

Saved successfully

Created successfully

Restored successfully

Failure:

Failed. Please try again later.

Confirm:

Delete this item? (Move to trash)

Permanently delete? This action cannot be undone.

🇰🇷 Notification Policy (알림 정책)
목적

Shiori는 사용자 경험을 유지하면서 중요한 작업을 안전하게 수행하기 위해 알림을 유형별로 분리한다.

Toast: 일반 피드백 알림

Alert / Confirm: 중요하거나 되돌릴 수 없는 작업

이를 통해:

사용자 흐름을 끊지 않고

중요한 작업에서는 명확한 확인을 요구한다.

기본 원칙
1. 일반 알림은 Toast 사용

사용 예:

저장 성공/실패

네트워크 오류

권한 부족

입력 안내

작업 완료 메시지

규칙:

흐름을 방해하지 않는다

메시지는 짧고 명확하게

자동으로 사라져도 되는 정보만

2. 중요한 작업은 Confirm 사용

삭제(휴지통 이동)

계정 삭제

영구 삭제

복구 불가 작업

보안 관련 작업

3. Alert는 최소 사용

보안 안내

반드시 인지해야 하는 공지

Undo 전략

가능한 경우:

삭제 후 되돌리기(Undo) toast 제공

빠른 복구 UX 제공

구현 구조
Transport Layer

toast.ts

알림 전달만 담당

Policy Layer

notify.ts

toast / confirm / alert 선택 담당

메시지 예시

성공:

저장했어

등록했어

복구했어

실패:

실패했어. 잠시 후 다시 시도해줘.

확인:

삭제할까요? (휴지통 이동)

영구 삭제할까요? 되돌릴 수 없어요.