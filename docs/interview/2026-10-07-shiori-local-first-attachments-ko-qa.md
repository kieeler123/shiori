# Shiori Local-first Attachment Storage

## 질문·답변 형식

### Q1. 왜 Local-first로 변경했는가?

**A.** 첨부파일 증가에 따른 Supabase Storage 사용량 부담을 줄이면서
Supabase의 인증과 DB 기능은 그대로 활용하기 위해서다.

### Q2. 브라우저에서 임의의 로컬 경로에 바로 저장할 수 있는가?

**A.** 불가능하다. File System Access API를 통해 사용자가 직접 선택하고
권한을 허용한 폴더만 접근할 수 있다.

### Q3. 왜 `FileSystemDirectoryHandle`을 IndexedDB에 저장했는가?

**A.** 새로고침 이후에도 선택한 폴더를 기억하기 위해서다. 다만 Handle의
존재와 현재 접근 권한은 별도로 판단해야 한다.

### Q4. 기존 Supabase 첨부파일은 어떻게 했는가?

**A.** 그대로 유지했다. `storageType`이 없는 기존 데이터는
`attachment.storageType ?? "supabase"`로 처리한다.

### Q5. Local 파일은 어떻게 표시하는가?

**A.** File System Access API로 `File`을 읽고 `URL.createObjectURL()`로
Blob URL을 만든다. 사용이 끝나면 `URL.revokeObjectURL()`로 해제한다.

### Q6. 로그를 삭제하면 첨부파일도 바로 삭제되는가?

**A.** 아니다. 일반 삭제는 휴지통 이동이므로 파일을 유지하고, 휴지통에서
영구삭제할 때만 실제 파일을 삭제한다.

### Q7. 편집 중 첨부한 파일을 취소하면 어떻게 되는가?

**A.** 해당 편집 세션에서 새로 만든 파일만 삭제한다. 기존 첨부파일은
건드리지 않는다.

### Q8. 왜 Pending Journal이 필요한가?

**A.** React state와 `useRef`는 F5나 브라우저 강제종료 시 사라지기
때문이다. IndexedDB에 Pending 상태를 영속화해야 다음 실행에서 복구할 수
있다.

### Q9. Pending이면 무조건 고아파일인가?

**A.** 아니다. DB 저장 성공 후 Pending 제거 직전에 브라우저가 종료됐을
수도 있다. Pending은 삭제 대상이 아니라 상태 확인 대상이다.

### Q10. Recovery는 정상 파일과 고아파일을 어떻게 구분하는가?

**A.** `shiori_items.attachments`를 확인한다. DB에서 참조 중이면
유지하고, 참조가 없을 때만 Local 파일을 삭제한다.

### Q11. DB 조회가 실패하면 어떻게 하는가?

**A.** 파일을 삭제하지 않는다. "확인할 수 없음"과 "참조가 없음"을 같은
상태로 취급하지 않는다.

### Q12. 왜 휴지통 로그도 참조 검사에 포함하는가?

**A.** 휴지통 로그는 복원될 수 있으므로 여전히 attachment를 정상적으로
소유하고 있기 때문이다.

### Q13. 왜 `NotFoundError`를 성공으로 처리하는가?

**A.** 파일이 이미 없다면 삭제의 최종 목표가 이미 달성됐기 때문이다.
이로써 삭제와 Recovery가 멱등적으로 동작한다.

### Q14. 왜 Grace Period가 필요한가?

**A.** 방금 생성되어 아직 편집 중인 Pending 파일을 Recovery가 고아파일로
오판하는 것을 방지하기 위해서다.

### Q15. 자동 Recovery를 왜 `App.tsx`에서 바로 실행하지 않는가?

**A.** 인증 복원 전에 DB 확인이 실행되는 것을 피하기 위해서다. 인증이
확정된 `RequireAuthOutlet` 안에서 background 작업으로 실행하는 편이
안전하다.

### 결론

**Recovery의 가장 중요한 원칙은 애매하면 삭제하지 않고 보존한 뒤 나중에
다시 확인하는 것이다.**
