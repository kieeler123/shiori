2026-02-12

🧭 SHIORI – Trash Page 기준서 (고정 스펙 v1)

이건 v1 완성 기준이다.
이 이상은 하지 않는다.

1️⃣ 기능 체크리스트 (Functional Layer)
✅ 데이터 조건

로그인한 사용자 데이터만 조회

deleted_at IS NOT NULL

최신 삭제순 정렬 (deleted_at DESC)

✅ 표시 항목

각 아이템에 반드시 포함:

 제목 (title)

 내용 1줄 미리보기 (trim + slice)

 삭제 날짜 (YYYY-MM-DD)

 복구 버튼

 완전삭제 버튼

✅ 동작

 복구 → deleted_at = null

 완전삭제 → DB hard delete

 완전삭제 시 confirm 모달

 동작 후 자동 목록 리프레시

 빈 상태 UI 처리

✅ 예외 처리

 로딩 상태 표시

 에러 발생 시 메시지 표시

 버튼 중복 클릭 방지 (disabled)

2️⃣ 레이아웃 체크리스트 (Structural Layer)
📌 기본 구조
Page Container
 ├─ Page Title
 ├─ Description (선택)
 └─ Trash List
      ├─ Trash Card
      ├─ Trash Card
      └─ ...

✅ 카드 구성

카드 내부 구조 고정:

[ Title ]
[ Preview 1줄 ]

[ 삭제날짜 ]      [복구] [완전삭제]


버튼은 오른쪽 정렬

날짜는 왼쪽 하단

✅ 정렬 기준

1열 고정 (데스크탑도 1열)

가운데 정렬

max-width 유지 (logs와 동일)

3️⃣ 디자인 체크리스트 (Visual Layer)

Shiori 전체 통일 규칙 기반

🎨 색상 규칙

카드 배경 → logs 카드와 동일

border → 동일

hover → 동일

버튼 규칙:

복구 → neutral / accent 계열

완전삭제 → danger 계열 (red tone)

hover 시 opacity 변화

📐 간격 규칙

카드 padding: logs와 동일

카드 간격: 16px or 20px 고정

버튼 간격: 8px

✍ 타이포 규칙

Title → semibold

Preview → muted text

삭제날짜 → small text + muted

4️⃣ 절대 하지 말 것 (v1 금지 목록)

❌ 검색 기능

❌ 필터

❌ 페이지네이션

❌ 디테일 페이지

❌ 태그 표시

❌ 애니메이션 추가

❌ UI 커스터마이징

이건 나중 단계.

🎯 완료 기준 (Definition of Done)

Trash 페이지는 아래 조건 만족하면 끝:

✔ 기능 정상 동작
✔ 레이아웃 logs와 통일
✔ 디자인 일관성 유지
✔ 코드 구조 분리됨 (trashRepo 존재)

그 이상은 욕심.

🧠 왜 이 기준이 중요한가

너가 겪은 혼란은 이거야:

“만들면서 방향이 계속 바뀜”

이 체크리스트는
네가 흔들릴 때 돌아올 기준점이다.