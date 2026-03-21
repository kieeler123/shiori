2026-03-21

🇯🇵 日本語（エラー処理プロセス）
📌 問題

新規作成画面でテキストを入力すると、入力内容が一瞬表示された後すぐに消える問題が発生した。
その結果、新規投稿が正常に作成できなかった。

📌 確認とログの追加

まず、入力イベントが正常に動作しているかを確認するため、onChangeにログを追加した。

onChange={(e) => {
console.log("typing:", e.target.value);
setContent(e.target.value);
}}

ログが正常に出力されることを確認し、入力イベント自体には問題がないと判断した。

📌 原因特定のための追加ログ

次に、stateがどこかで上書きされている可能性を疑い、useEffect内部にログを追加した。

useEffect(() => {
console.log("RESET EFFECT");
setContent(initialContent);
}, [...dependencies]);

その結果、入力のたびにuseEffectが再実行され、stateが初期値に戻されていることを確認した。

📌 原因

useEffectが依存配列の変更によって頻繁に実行され、
ユーザーの入力内容を初期値で上書きしていた。

📌 修正
useEffectを削除
または
依存配列を制限し、不要な再実行を防止
📌 結果

入力内容が正常に保持されるようになり、新規投稿機能も正常に動作するようになった。

💡 Tip
問題は「イベント → state → effect」の流れで分解すると特定しやすい。

🇺🇸 English (Error Handling Process)
📌 Problem

When typing in the input field on the new post page, the text briefly appeared and then disappeared.
As a result, new posts could not be created properly.

📌 Investigation & Logging

First, I added a log inside the onChange handler to verify whether the input event was working correctly.

onChange={(e) => {
console.log("typing:", e.target.value);
setContent(e.target.value);
}}

The log confirmed that input events were functioning as expected.

📌 Additional Logging for Root Cause

Next, I suspected that the state was being overwritten somewhere, so I added a log inside useEffect.

useEffect(() => {
console.log("RESET EFFECT");
setContent(initialContent);
}, [...dependencies]);

This revealed that useEffect was being triggered repeatedly, resetting the state after each input.

📌 Root Cause

The useEffect was executing frequently due to dependency changes,
and it continuously overwrote the user input with the initial value.

📌 Fix
Removed the useEffect, or
Restricted its dependencies to prevent unnecessary re-execution
📌 Result

The input value was preserved correctly, and the new post creation feature worked as expected.

💡 Tip
Break debugging into: Event → State → Effect → Result.

🇰🇷 한국어 (에러 처리 과정)
📌 문제

새 글 작성 화면에서 입력을 하면 텍스트가 잠깐 보였다가 사라지는 문제가 발생했다.
이로 인해 새 글 작성이 정상적으로 이루어지지 않았다.

📌 확인 및 로그 추가

먼저 입력 이벤트가 정상 동작하는지 확인하기 위해 onChange에 로그를 추가했다.

onChange={(e) => {
console.log("typing:", e.target.value);
setContent(e.target.value);
}}

로그가 정상적으로 찍히는 것을 확인하고, 입력 이벤트에는 문제가 없음을 확인했다.

📌 원인 파악을 위한 추가 로그

이후 state가 다른 곳에서 덮어써지는 것을 의심하고, useEffect 내부에 로그를 추가했다.

useEffect(() => {
console.log("RESET EFFECT");
setContent(initialContent);
}, [...dependencies]);

그 결과, 입력할 때마다 useEffect가 실행되며 state가 초기값으로 되돌아가는 것을 확인했다.

📌 원인

useEffect가 의존성 변화로 인해 반복 실행되면서,
사용자 입력값을 초기값으로 계속 덮어쓰고 있었다.

📌 해결
useEffect 제거
또는
의존성 배열을 제한하여 불필요한 재실행 방지
📌 결과

입력값이 정상적으로 유지되었고, 새 글 작성 기능이 정상 동작하게 되었다.

💡 팁
디버깅은
👉 이벤트 → 상태 → effect 흐름으로 나누면 빠르게 해결됩니다.
