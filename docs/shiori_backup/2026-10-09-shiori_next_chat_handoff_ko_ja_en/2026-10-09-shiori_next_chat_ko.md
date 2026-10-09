# Shiori 개발 이어하기 --- 새 채팅용 인수인계 프롬프트

> 아래의 **새 채팅에 붙여 넣을 메시지** 전체를 복사해서 새로운 ChatGPT
> 대화의 첫 메시지로 보내세요. 실제 파일 내용이 필요할 때는 관련 코드만
> 추가로 붙여 넣으면 됩니다.

------------------------------------------------------------------------

## 새 채팅에 붙여 넣을 메시지

나는 Windows 환경에서 개인 웹 앱 **Shiori**를 개발하고 있다. 이전
채팅에서 Fastify 기반 CRUD와 휴지통 API 이전을 진행했고, 이제 **기존
기능을 유지하면서 클라이언트·서버를 완전히 분리하고 Windows 로컬
저장소를 주 저장소로 전환하는 작업**을 단계적으로 이어가고 싶다.

### 1. 프로젝트 환경

-   프로젝트 경로: `H:\shiori`
-   프런트엔드: React 19, Vite 7, TypeScript
-   백엔드: Fastify, TypeScript --- `H:\shiori\apps\api`
-   현재 인증: Supabase Auth (JWT Bearer)
-   현재 주 데이터베이스: Supabase PostgreSQL
-   프런트엔드 배포: Vercel
-   로컬 개발: Vite `http://localhost:5173`, Fastify
    `http://127.0.0.1:3001`
-   장기 목표: React는 API만 호출하고, Fastify가 DB와 파일 저장을
    관리하며, Windows 로컬 PostgreSQL 및 로컬 파일 저장소를 주 저장소로
    사용한다.
-   기존 UI, 인증, 데이터, 기능은 가능한 한 유지한다.

### 2. 현재 코드 구조

-   `src/lib/supabaseClient.ts`: 기존 Supabase 클라이언트
-   `src/lib/apiClient.ts`: 인증 토큰을 실어 보내는 `apiGet`, `apiPost`,
    `apiPatch` 등의 API 호출
-   `src/features/shiori/repo/shioriRepo.ts`: 목록·상세·작성·수정 기능
-   글 휴지통 관련 repo: soft delete, 목록, 복구, 영구 삭제
-   `src/features/attachments/lib/deleteAttachment.ts`: 저장 방식에 따라
    첨부파일 삭제
-   `src/features/attachments/local/localAttachmentStore.ts`: 브라우저
    File System Access API를 이용한 로컬 첨부파일 저장·조회·삭제
-   `apps/api/src/modules/shiori/routes.ts`, `controller.ts`,
    `service.ts`, `repository.ts`, `createSchema.ts`: Fastify API
-   `apps/api/src/middleware/requireAuth.ts`: Supabase JWT 검증

### 3. 이전 채팅에서 구현·검증한 기능

-   `GET /api/logs`: 글 목록, 정렬, 페이지네이션 --- HTTP 200 확인
-   `GET /api/logs/:id`: 글 상세 조회 및 404 처리 구현
-   `POST /api/logs`: 실제 글 생성 --- HTTP 201 확인
-   `PATCH /api/logs/:id`: 실제 글 수정 --- HTTP 200 확인
-   `DELETE /api/logs/:id`: 휴지통으로 이동(soft delete) --- HTTP 204
    확인
-   `GET /api/logs/trash`: 휴지통 목록 --- HTTP 200 확인
-   `DELETE /api/logs/:id/permanent`: 첨부파일 없는 글의 영구 삭제 ---
    HTTP 204 확인
-   로컬 첨부파일이 있는 글은 **휴지통으로 이동할 때 파일이 유지**되고,
    **휴지통에서 완전 삭제할 때 Windows 폴더의 파일이 삭제**되는 것을
    실제로 확인했다.
-   주의: 첨부파일이 있는 글의 완전 삭제는 아직 기존
    React·Supabase/브라우저 파일 접근 경로를 사용한다. 전체 파일 삭제
    책임이 Fastify로 이전된 것은 아니다.

### 4. 중요한 기술적 맥락

-   현재 Fastify repository는 사용자 JWT를 Supabase 클라이언트에
    전달하여 RLS를 유지한다.
-   조회는 `shiori_items_v` 뷰, 저장·수정은 `shiori_items` 기본 테이블을
    사용한다.
-   `shiori_items_v`에는 숨김·삭제·내용 길이 등의 필터가 있어 저장 성공
    후에도 글이 뷰에 보이지 않을 수 있다.
-   `validateContentBlocks()`는 `ReferenceItem[]`를 기대한다. 과거
    업데이트 입력의 `unknown[]`와 충돌했으므로 Zod 입력 검증과 타입
    정합성에 주의한다.
-   로컬 첨부파일 경로는 대체로 `attachments/YYYY/MM/DD/UUID.ext`이다.
-   브라우저 File System Access API로 연결된 폴더는 Fastify 서버가
    자동으로 접근할 수 있는 폴더와 같지 않다.
-   Windows 탐색기에서 사용자가 파일을 직접 삭제하는 것을 현재 방식으로
    완전히 막을 수 없다. 파일 누락 감지와 백업·복구 전략이 필요하다.
-   프런트엔드에는 아직 Supabase 직접 DB 호출이 남아 있다. 특히 파일명
    중복 조회, 첨부파일 참조 확인, 일부 휴지통/첨부파일 기능을 점검해야
    한다.
-   **중요한 미완료 지점:** `shioriRepo.ts`의 `dbCreate()` 비로컬 분기에
    기존 Supabase 저장 로직 대신
    `throw new Error("Supabase 직접 저장 로직이 아직 복원되지 않았습니다.")`가
    남아 있을 가능성이 있다. 현재 파일을 먼저 확인하고 운영 배포 전에
    해결해야 한다.
-   `dbGet()` 역시 Fastify API만 사용하도록 작성된 버전이 있으므로,
    로컬/운영 환경에서 API 주소가 유효한지 점검해야 한다.
-   Windows 로컬 PostgreSQL로 주 데이터베이스를 이전한 것은 **아직
    아니다**.

### 5. 앞으로의 우선순위

1.  현재 코드를 Git에 백업하고, 기능별 API/프런트엔드 직접 Supabase 접근
    현황을 점검한다.
2.  운영 환경에서 동작하지 않을 수 있는 `dbCreate()`와 API base URL
    분기를 안전하게 정리한다.
3.  프런트엔드가 Supabase DB를 직접 호출하는 부분을 Fastify API로 하나씩
    이전한다.
4.  휴지통 복구, 영구 삭제, 공유 첨부파일 참조 검사, 로컬 파일 누락 감지
    및 실패 복구를 보완한다.
5.  인증·RLS·API 계약을 유지하며 Windows 로컬 PostgreSQL 이전 계획을
    세운다.
6.  서버 관리형 로컬 파일 저장과 백업 체계를 설계한다.
7.  운영 배포 구조를 정리해 클라이언트가 서버 내부 구현을 모르는 상태로
    만든다.

### 6. 답변 방식 요청

-   **한국어로** 설명해 줘.
-   지금 작동하는 기능을 불필요하게 다시 만들지 말고, 기존 코드와
    데이터의 안전성을 우선해 줘.
-   한 번에 대규모 리팩터링하지 말고 **한 단계씩 구현 → 실행 → 확인**
    순서로 진행해 줘.
-   변경할 파일의 정확한 경로, 수정할 코드, 예상 HTTP 응답, 검증 방법,
    롤백 방법을 제시해 줘.
-   코드를 보지 못한 부분은 추측해서 전체 파일을 덮어쓰지 말고, 먼저
    해당 파일 내용을 요청해 줘.
-   실제 검증된 것과 아직 계획 단계인 것을 분명하게 구분해 줘.
-   기존 Supabase Auth, 사용자별 접근 권한, 데이터, 첨부파일을 훼손하지
    않도록 주의해 줘.

**우선 첫 번째 작업으로, 현재 코드에서 아직 Fastify로 이전되지 않은
Supabase 직접 호출을 어떻게 조사하고 안전하게 우선순위를 정할지 제안해
줘. 필요한 파일을 한 번에 하나씩 요청해 줘.**

------------------------------------------------------------------------

**활용 팁:** 새 채팅에 붙여 넣은 뒤에는 `shioriRepo.ts`, `apiClient.ts`,
휴지통 repo 중 현재 작업에 필요한 파일 하나부터 보여주면 된다. `.env`의
키나 JWT는 공유하지 않는다.
