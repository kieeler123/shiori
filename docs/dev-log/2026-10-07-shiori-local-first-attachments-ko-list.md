# Shiori Local-first Attachment Storage

## 오늘 한 작업 --- 리스트 형식

1.  **신규 첨부파일을 Local-first 방식으로 전환**
    -   신규 파일은 Supabase Storage 대신 로컬 디스크에 저장.
    -   Supabase는 인증, DB, 메타데이터 관리에 계속 사용.
    -   기존 Supabase 첨부파일은 그대로 호환.
2.  **File System Access API 적용**
    -   사용자가 직접 로컬 저장 폴더를 선택하도록 구현.
    -   `FileSystemDirectoryHandle`을 IndexedDB에 저장.
3.  **상대경로 기반 파일 관리**
    -   DB에는 절대경로를 저장하지 않음.
    -   `attachments/YYYY/MM/DD/<UUID>.<extension>` 형태의 상대경로만
        저장.
4.  **Local / Supabase 호환 구조 구축**
    -   `storageType: "local" | "supabase"` 도입.
    -   기존 데이터는 `storageType ?? "supabase"`로 하위호환.
5.  **공통 Attachment Resolver 구축**
    -   Supabase → Signed URL.
    -   Local → Blob URL.
    -   UI가 저장소 종류를 직접 판단하지 않도록 분리.
6.  **Blob URL 생명주기 관리**
    -   `URL.createObjectURL()`로 Local 파일 표시.
    -   사용 종료 후 `URL.revokeObjectURL()`로 해제.
7.  **휴지통 정책 유지**
    -   일반 로그 삭제 시 첨부파일 유지.
    -   휴지통 복원 시 기존 파일 그대로 사용.
    -   휴지통 영구삭제 시 실제 파일 삭제.
8.  **Local 삭제의 멱등성 확보**
    -   `NotFoundError`는 이미 삭제된 상태로 보고 성공 처리.
9.  **편집 Transaction 구현**
    -   편집 중 새로 생성된 첨부파일 추적.
    -   저장 성공 시 사용 중인 파일 유지.
    -   저장 전에 제거한 신규 파일은 실제 삭제.
    -   취소 시 해당 편집에서 생성된 신규 파일만 rollback.
10. **IndexedDB v2 Migration**
    -   `shiori-local-storage` DB를 version 1 → 2로 변경.
    -   기존 `handles` store 유지.
    -   `pending-attachments` store 추가.
11. **Persistent Pending Journal 구축**
    -   Local 파일 생성 직후 Pending Record 기록.
    -   정상 저장, 취소, 삭제 성공 후 Pending 해제.
12. **F5/강제종료 대응**
    -   메모리 상태만으로 해결하지 않고 IndexedDB에서 미완료
        attachment를 추적.
13. **Crash Recovery 구현**
    -   Pending attachment를 `shiori_items.attachments`와 대조.
    -   DB 참조 있음 → 파일 유지 + Pending 해제.
    -   DB 참조 없음 → Local 파일 삭제 + Pending 해제.
    -   DB 조회 실패 → 삭제하지 않고 Pending 유지.
14. **휴지통 데이터도 정상 참조로 포함**
    -   `is_deleted = true`인 로그도 복원 가능하므로 attachment 참조로
        인정.
15. **Grace Period 도입**
    -   최근 생성된 Pending 파일은 편집 중일 수 있으므로 즉시
        Recovery하지 않음.
16. **Local 권한 상태 점검**
    -   Directory Handle이 있어도 권한이 `prompt`일 수 있음을 확인.
    -   `queryPermission()`과 `requestPermission()` 역할을 분리.
17. **Recovery Fail-safe 설계**
    -   DB 오류, 권한 부족, 삭제 실패 시 안전하게 파일과 Pending을 보존.
    -   이미 파일이 없는 경우는 cleanup 성공으로 처리.
18. **자동 Recovery 구조 설계**
    -   `App.tsx`에서 무조건 실행하지 않음.
    -   인증 완료 후 `RequireAuthOutlet` 안에서 background recovery
        실행.
19. **중복 실행 대응 방향 정리**
    -   React `useRef`에만 의존하지 않고 service 레벨에서 실행 중
        Promise를 공유하는 dedupe 구조 설계.

### 핵심

**오늘 작업의 핵심은 Supabase 파일을 단순히 로컬로 옮긴 것이 아니라,
첨부파일 생성부터 저장·취소·휴지통·영구삭제·F5·강제종료·복구까지 하나의
안전한 생명주기로 설계한 것이다.**
