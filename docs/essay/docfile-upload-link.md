2026-04-01

🇯🇵 日本語

今日は添付ファイルとリンク機能を中心に、Shioriのコア構造を大きく進めた一日だった。
単純なアップロード機能ではなく、content内にトークンとして埋め込み、それをレンダラーで再構築する設計を採用したことで、柔軟性と拡張性を両立する形になった。

特に印象的だったのは、attachmentsやlinksが編集時に消える問題だった。これは状態管理と初期値同期の重要性を改めて理解するきっかけになった。また、validateContentBlocksを導入することで、保存前にデータの整合性を保証できるようになり、後から崩れるリスクを防ぐ構造になった。

さらに、YouTubeリンクのpreview問題を通じて、すべてのサイトを同じ方法で扱うことは現実的ではないと理解した。将来的にはサーバー処理が必要になるが、現段階ではfallbackで十分と判断したのも重要な意思決定だった。

全体として、機能の完成度だけでなく、構造設計とエラー処理まで含めて一段レベルが上がったと感じる。

🇺🇸 English

Today was a significant step forward in building the core structure of Shiori, focusing on attachments and link handling.

Instead of implementing simple uploads, I designed a token-based system where content stores references like [[attach:id]], and the renderer reconstructs them dynamically. This approach provides both flexibility and scalability.

One of the key challenges was fixing the issue where attachments and links disappeared during editing. This highlighted the importance of proper state initialization and synchronization. By introducing validateContentBlocks, I ensured data consistency before saving, preventing broken states.

Another important realization came from YouTube preview failures. It became clear that not all platforms can be handled uniformly, and special handling or fallback strategies are necessary. I decided that full API integration can wait until later, focusing on stability for now.

Overall, today was not just about adding features, but about improving architecture, reliability, and long-term scalability.

🇰🇷 한국어

오늘은 첨부파일과 링크 기능을 중심으로 Shiori의 핵심 구조를 크게 발전시킨 하루였다.

단순한 업로드 기능이 아니라, content 안에 토큰([[attach:id]]) 형태로 저장하고, 렌더러에서 이를 다시 구성하는 구조를 만들면서 확장성과 유연성을 동시에 확보할 수 있었다.

특히 수정 페이지에서 attachments와 links가 사라지는 문제를 해결하면서, 상태 초기화와 동기화의 중요성을 다시 한 번 체감하게 되었다. 또한 validateContentBlocks를 통해 저장 전에 데이터 정합성을 검증하도록 만든 것은, 이후 문제를 미리 차단하는 중요한 구조였다.

YouTube 링크 preview 문제를 겪으면서, 모든 사이트를 동일하게 처리하는 것은 현실적으로 어렵다는 것도 깨달았다. 결국 일부 플랫폼은 별도 처리해야 하며, 지금 단계에서는 fallback 전략이 더 합리적인 선택이라는 판단을 내렸다.

전체적으로 오늘은 단순 기능 구현을 넘어서, 구조 설계와 안정성, 확장성을 한 단계 끌어올린 날이었다.