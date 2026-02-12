🎨 SHIORI 디자인 통일 규칙 v1

목적: 기능이 늘어나도 UI가 무너지지 않게 한다.

1️⃣ 전체 디자인 철학
키워드

은은함

과하지 않음

네이비 기반

정돈된 느낌

기능 중심

Shiori는 유튜브처럼 화려한 서비스가 아니라
기록 기반 도구다.

2️⃣ 레이아웃 규칙
📦 Page Container

max-width 고정 (예: 720px or 800px)

가운데 정렬

좌우 padding 동일

mx-auto max-w-3xl px-4


이 규칙은 모든 페이지 동일.

📐 카드 규칙 (Logs / Trash / Support 공통)
기본 카드

rounded-2xl

border

border-zinc-800/60

bg-zinc-900/50

padding 16~20px

절대 카드마다 스타일 다르게 하지 않는다.

3️⃣ 버튼 규칙

버튼은 3종만 존재한다.

🟢 Primary (주 기능)

생성 / 저장 / 제출

accent 계열

⚪ Secondary (보조)

복구

취소

뒤로가기

neutral tone

🔴 Danger

완전삭제

계정삭제

red 계열 고정

버튼 공통 규칙

rounded-xl

padding 통일

hover 시 opacity 또는 밝기 변화

font-weight medium

4️⃣ 타이포그래피 규칙
Title

text-lg ~ text-xl

font-semibold

Body

text-sm ~ text-base

Muted

text-zinc-400

날짜 / 보조 설명

5️⃣ 간격 규칙

절대 제멋대로 margin 쓰지 않는다.

카드 간격

space-y-4 고정

버튼 간격

gap-2

섹션 간격

mt-6 or mt-8

6️⃣ 색상 제한

Shiori는 색을 남발하지 않는다.

허용 색상:

zinc 계열 (기본)

accent 1개

red (danger 전용)

초록, 파랑, 노랑 다 쓰기 시작하면 망한다.

7️⃣ 아이콘 규칙 (선택)

아이콘 쓰면:

lucide 통일

크기 16px or 18px

텍스트 옆에만

아이콘 남발 금지.

8️⃣ 상태 UI 규칙
로딩

중앙 정렬

text-sm

muted

빈 상태

아이콘 + 텍스트

과한 일러스트 금지

9️⃣ 절대 하지 말 것

❌ 페이지마다 배경색 다르게

❌ 버튼 스타일 페이지별로 다르게

❌ 카드 radius 다르게

❌ hover 효과 제각각

❌ 그림자 남발

🔟 디자인 결정 원칙

새로운 UI 추가할 때:

기존 카드 구조 재사용 가능한가?

기존 버튼 스타일로 해결 가능한가?

색상 새로 추가해야 하는가? → 대부분 필요 없다.

🎯 Shiori 디자인 슬로건

"기능은 늘어나도, 감정은 흔들리지 않는다."

🎨 Shiori 기본 색상 철학

Base = Navy
Dark는 별도 모드

Navy 베이스 예시 감각

배경: #0f172a ~ #111827 느낌

카드: 약간 밝은 navy

border: 은은한 회청색

텍스트: off-white

🚫 지금 하면 안 되는 것

다크인지 네이비인지 애매한 상태로 계속 수정

페이지마다 색 미묘하게 다르게 쓰기

accent 여러 개 쓰기