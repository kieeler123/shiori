2026-03-21

🇯🇵 일본어 (日本語)
❓ Q1. 新規作成ができない問題をどのように解決しましたか？

👉 A.
入力値が保存されない原因は、useEffectによってstateが初期値で繰り返し上書きされていたことでした。
このeffectを削除するか、実行条件を制限することで解決しました。

❓ Q2. 問題の原因はどのように特定しましたか？

👉 A.
まずonChangeにconsole.logを追加し、入力イベントが正常に発火していることを確認しました。
その後、useEffect内にログを入れて、stateが再び初期化されている流れを発見しました。

❓ Q3. useEffectを使う際の注意点は何ですか？

👉 A.
依存配列にオブジェクトや配列を含めると、想定以上に頻繁に実行される可能性があります。
また、stateを設定するロジックを入れると、繰り返し初期化が発生するため注意が必要です。

❓ Q4. 今回の経験から学んだことは何ですか？

👉 A.
stateの初期化と同期を明確に区別する必要があると学びました。
また、問題はUI・state・APIに分けて分析することで、より早く解決できることを実感しました。

💡 Tip
面接では「問題 → 原因 → 解決 → 学び」の流れで答えると伝わりやすいです。

🇺🇸 영어 (English)
❓ Q1. How did you solve the issue where new posts could not be created?

👉 A.
The issue was caused by a useEffect that continuously overwrote the state with initial values.
I resolved it by removing the effect or limiting its execution conditions.

❓ Q2. How did you identify the root cause?

👉 A.
First, I added console.log to the onChange handler to confirm that input events were working correctly.
Then, I added logs inside useEffect and discovered that the state was being reset repeatedly.

❓ Q3. What should you be careful about when using useEffect?

👉 A.
Including objects or arrays in the dependency array can cause unintended frequent executions.
Also, setting state inside useEffect can lead to repeated state resets if not carefully controlled.

❓ Q4. What did you learn from this experience?

👉 A.
I learned the importance of clearly distinguishing between state initialization and synchronization.
Additionally, breaking down problems into UI, state, and API layers helps in faster debugging.

💡 Tip
Structure your answers as: Problem → Cause → Solution → Lesson.

🇰🇷 한국어
❓ Q1. 새 글 작성이 되지 않는 문제를 어떻게 해결했나요?

👉 A.
입력값이 저장되지 않는 원인은 useEffect가 state를 초기값으로 계속 덮어쓰고 있었기 때문입니다.
해당 effect를 제거하거나 실행 조건을 제한하여 문제를 해결했습니다.

❓ Q2. 문제의 원인을 어떻게 파악했나요?

👉 A.
onChange에 console.log를 추가하여 입력 이벤트가 정상적으로 동작하는지 확인했습니다.
이후 useEffect 내부에 로그를 추가해 state가 다시 초기화되는 흐름을 발견했습니다.

❓ Q3. useEffect 사용 시 주의할 점은 무엇인가요?

👉 A.
의존성 배열에 객체나 배열을 포함하면 예상보다 자주 실행될 수 있습니다.
또한 state를 설정하는 로직은 반복적인 초기화를 유발할 수 있어 주의해야 합니다.

❓ Q4. 이번 경험에서 배운 점은 무엇인가요?

👉 A.
상태 초기화와 동기화를 명확히 구분해야 한다는 점을 배웠습니다.
또한 문제를 UI, 상태, API로 나눠 접근하면 더 빠르게 해결할 수 있습니다.

💡 팁
면접 답변은 “문제 → 원인 → 해결 → 배운 점” 구조로 말하면 가장 깔끔합니다.
