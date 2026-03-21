2026-03-21

🇯🇵 일본어 (日本語)

今日の作業は単なる機能実装ではなく、状態管理とUIの流れを深く理解する過程だった。
最初は新規投稿ができない問題をDBやAPIの問題だと考えていたが、実際の原因はフロントエンドの状態管理にあった。

特に、useEffectを使って初期値を同期しようとしていたコードが、意図とは異なりユーザーの入力値を継続的に初期化してしまっていた。その結果、入力したテキストが一瞬表示された後に消える現象が発生していた。

この問題はコード自体が複雑だったわけではないが、状態の変化が複数のコンポーネントに分散していたため、原因の特定が難しかった。
最終的にonChangeにログを追加して入力イベントが正常に動作していることを確認し、その後useEffectがstateを上書きしていることを突き止め、解決することができた。

今回の経験から、以下の重要な学びを得た。

stateの初期化と同期は明確に区別する必要がある
useEffectは強力だが、誤用するとバグの原因になる
入力関連のバグは多くの場合stateの流れに起因する
問題はUI・state・APIに分けて考えると解決しやすい

この経験は、今後より複雑な状態管理の問題を解決する際の重要な指針になると考えている。

💡 Tip
Reactでは「stateの流れ」を言語化できると、一気にレベルが上がります。

🇺🇸 영어 (English)

Today’s work was not just about implementing a feature, but about gaining a deeper understanding of state management and UI flow.
At first, I suspected that the issue preventing new posts from being created was related to the database or API. However, the actual root cause was in the frontend state management.

In particular, a useEffect that was intended to synchronize initial values was unintentionally resetting the user’s input continuously. As a result, text entered in the input field would briefly appear and then disappear.

The complexity of the problem did not come from the code itself, but from the fact that state changes were distributed across multiple components, making it difficult to identify the root cause.
Eventually, I added logs to the onChange handler to confirm that input events were working correctly, and then discovered that useEffect was overwriting the state.

Through this experience, I learned several important lessons:

State initialization and synchronization must be clearly distinguished
useEffect is powerful but can easily introduce bugs if misused
Input-related bugs are often caused by state flow issues
Breaking problems down into UI, state, and API layers helps in faster debugging

This experience will serve as an important foundation for solving more complex state management issues in the future.

💡 Tip
If you can clearly explain the flow of state, your debugging skills improve dramatically.

🇰🇷 한국어

오늘 작업은 단순한 기능 구현이 아니라 상태 관리와 UI 흐름을 깊이 이해하는 과정이었다.
처음에는 새 글 작성이 되지 않는 문제를 DB나 API 문제로 의심했지만, 실제 원인은 프론트엔드 상태 관리에 있었다.

특히 useEffect를 통해 초기값을 동기화하려던 코드가 의도와 달리 사용자의 입력값을 계속 초기화시키고 있었다. 이로 인해 입력한 텍스트가 잠깐 보였다가 사라지는 현상이 발생했다.

이 문제는 코드 자체가 복잡해서가 아니라, 상태 변화가 여러 컴포넌트에 분산되어 있어 원인을 찾기 어려웠던 점이 더 컸다.
결국 onChange 로그를 통해 입력 이벤트가 정상적으로 동작하는 것을 확인하고, 이후 useEffect가 state를 덮어쓰고 있다는 사실을 발견하면서 문제를 해결할 수 있었다.

이번 경험을 통해 다음과 같은 중요한 교훈을 얻었다.

상태 초기화와 동기화는 명확히 구분해야 한다
useEffect는 강력하지만 잘못 사용하면 버그의 원인이 된다
입력 관련 버그는 대부분 state 흐름 문제다
문제를 UI, 상태, API로 나눠서 보면 더 빠르게 해결할 수 있다

이 경험은 앞으로 더 복잡한 상태 관리 문제를 해결하는 데 중요한 기준이 될 것이다.

💡 팁
문제를 설명할 때 “상태 흐름”을 말할 수 있으면 실력이 확 올라갑니다.
