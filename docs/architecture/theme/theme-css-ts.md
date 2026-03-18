theme.css를 따로 두는 이유는 공통 규칙과 공통 토큰을 한곳에 모으기 위해서라고 보면 된다.
그리고 navyTheme.ts, pureDarkTheme.ts 같은 파일은 각 테마별 값 세트를 관리하려는 목적에 더 가깝다.

즉 역할을 나누면 이렇다.

역할 분리
1. theme.css

공통 베이스

여기에 들어가는 것:

--text-1, --border-soft 같은 토큰 이름 체계

.t1, .t2, .header-shell, .container-main 같은 공통 유틸 클래스

테마와 상관없이 재사용하는 공통 스타일 규칙

기본값 또는 fallback 값

즉,
“어떤 이름의 토큰을 쓸 건지”,
**“공통 컴포넌트가 그 토큰을 어떻게 소비할 건지”**를 정해두는 곳이다.

2. navyTheme.ts, pureDarkTheme.ts 등

테마별 실제 값

여기에 들어가는 것:

navy일 때 --bg-elev-1은 뭐냐

whitePaper일 때 --item-bg는 뭐냐

plumNight일 때 --ring은 뭐냐

즉,
같은 토큰 이름에 대해 테마마다 다른 값만 바꿔 끼우는 역할이다.

왜 굳이 나누냐

안 나누면 나중에 이런 문제가 생긴다.

공통 규칙과 테마 값이 한 파일에 뒤섞임

어느 게 “구조”이고 어느 게 “색상 데이터”인지 헷갈림

테마 하나 추가할 때마다 CSS 파일이 너무 길어짐

컴포넌트 수정 시 theme 파일까지 건드려야 하는 경우가 생김

그래서 보통은 이렇게 생각하면 편하다.

theme.css = 설계도

navyTheme.ts = navy 색상 세트

pureDarkTheme.ts = pureDark 색상 세트

네가 지금 적어준 CSS 기준으로 보면

지금 theme.css 안에 사실 두 가지가 같이 들어가 있다.

A. 공통으로 둬야 하는 것

이건 theme.css에 남겨두는 게 맞다.

예:

.t1 { color: var(--text-1); }
.t2 { color: var(--text-2); }

.header-shell { ... }
.container-main { ... }
.menu-item { ... }
.line-clamp-1 { ... }
.clamp-2 { ... }

이건 색상값 자체보다
토큰을 사용하는 방식 또는 공통 레이아웃/유틸이라서 theme.css에 두는 게 맞다.

B. 테마별 값 묶음

이건 실제로는 분리 대상이다.

예:

:root[data-theme="navy"] { ... }
:root[data-theme="pureDark"] { ... }
:root[data-theme="brownArchive"] { ... }

이 부분은 많아질수록 길어지니까,

지금처럼 CSS 한 파일에 둬도 작동은 하지만

관리성 면에서는 테마별 파일 분리가 더 좋다

그럼 theme.css를 왜 남기냐

테마별 파일을 따로 만든다고 해도
공통 규칙은 여전히 필요하다.

예를 들면 네 RecentLogsSection에서 이런 식으로 쓸 수 있잖아.

<h2 className="text-base font-semibold t2">{title}</h2>

혹은

<div className="rounded-xl border px-4 py-3 recent-log-item">

그리고 CSS에서

.recent-log-item {
  background: var(--item-bg);
  border-color: var(--item-border);
  color: var(--text-2);
}

.recent-log-item:hover {
  background: var(--item-hover-bg);
  border-color: var(--item-hover-border);
  box-shadow: var(--item-hover-shadow);
}

이런 공통 소비 규칙은 여전히 theme.css가 맡아야 한다.

즉,
테마 값은 바뀌어도 그 값을 쓰는 규칙은 공통이기 때문이다.