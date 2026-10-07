# Shiori의 첨부파일 시스템을 Local-first 구조로 전환하며

오늘은 Shiori의 첨부파일 저장 구조를 기존 Supabase Storage 중심 방식에서
Local-first 방식으로 전환했다. 처음에는 클라우드 저장공간 사용량을
줄이기 위해 신규 첨부파일을 로컬 디스크에 저장하면 될 것처럼 보였다.
하지만 실제 구현을 진행하면서 Local-first는 단순한 저장 위치 변경이
아니라 파일의 전체 생명주기를 다시 설계해야 하는 작업이라는 점이
분명해졌다.

브라우저는 보안상 사용자의 로컬 디스크에 임의로 접근할 수 없다. 따라서
File System Access API를 이용해 사용자가 직접 저장 폴더를 선택하도록
만들었다. 선택된 `FileSystemDirectoryHandle`은 IndexedDB에 저장해
새로고침 이후에도 다시 사용할 수 있도록 했고, Supabase DB에는 특정
드라이브에 종속되는 절대경로 대신 `attachments/YYYY/MM/DD/...` 형태의
상대경로만 저장하도록 했다.

기존 데이터와의 호환성도 중요했다. 이미 Supabase Storage에 저장된
첨부파일을 모두 다시 옮기는 대신 Local과 Supabase를 동시에 지원하는
구조를 선택했다. 새 첨부파일에는 `storageType: "local"`을 기록하고, 기존
데이터처럼 `storageType`이 없는 경우에는 Supabase 파일로 해석한다. 공통
Resolver를 통해 Supabase 파일은 Signed URL, Local 파일은 Blob URL로
제공하여 UI가 실제 저장 위치를 직접 판단하지 않도록 했다.

파일 저장보다 더 어려운 부분은 삭제와 편집 Transaction이었다. 로그를
일반 삭제했을 때는 휴지통에서 복원할 수 있어야 하므로 실제 첨부파일을
삭제해서는 안 된다. 따라서 일반 삭제에서는 파일을 유지하고, 휴지통에서
영구삭제할 때만 물리 파일을 삭제하도록 했다. 편집 중 새로 첨부한 파일은
별도로 추적해 저장하면 유지하고, 취소하면 삭제하며, 저장 전에 제거한
파일은 DB commit 이후 정리하도록 했다.

그러나 React의 메모리 상태만으로는 F5와 브라우저 강제종료를 처리할 수
없었다. 파일은 디스크에 생성됐지만 `createdAttachmentsRef` 같은 메모리
정보가 사라지면 어떤 파일이 정상 저장된 것인지 판단할 수 없기 때문이다.
이를 해결하기 위해 IndexedDB를 version 2로 올리고 `pending-attachments`
store를 추가해 Persistent Pending Journal을 구축했다.

Local 파일이 생성되면 즉시 Pending Record를 남기고, 정상 저장이나 취소가
완료되면 해당 record를 제거한다. 덕분에 브라우저가 갑자기 종료되더라도
다음 실행에서 처리되지 않은 attachment를 다시 발견할 수 있게 됐다.

Recovery 과정에서는 데이터 안전성을 최우선으로 했다. Pending Record가
존재한다고 해서 파일을 바로 삭제하면 안 된다. DB 저장은 성공했지만
Pending Record를 제거하기 직전에 브라우저가 종료됐을 수도 있기 때문이다.
따라서 Recovery는 먼저 Supabase의 `shiori_items.attachments`를 확인하고,
DB에서 실제로 참조 중인 파일이라면 정상 파일로 판단해 유지한다. DB에
참조가 없는 경우에만 고아파일로 판단해 삭제한다.

휴지통의 로그도 정상 참조로 포함했다. Shiori에서는 휴지통의 로그를 다시
복원할 수 있으므로 `is_deleted = true`라는 이유만으로 attachment를
고아파일로 판단해서는 안 된다. DB 조회가 실패하거나 Local 폴더 권한이
없는 경우에도 파일을 삭제하지 않고 Pending 상태를 유지해 나중에 다시
시도하도록 했다.

테스트 과정에서는 이미 삭제된 파일 때문에 `NotFoundError`가 발생하는
상황도 확인했다. 이 경우 실제 목표인 "파일이 없는 상태"는 이미 달성된
것이므로 실패가 아니라 성공으로 처리하도록 삭제 함수를 멱등적으로
개선했다. 또한 최근 생성된 Pending 파일을 잘못 정리하지 않도록 Grace
Period를 두었다.

마지막으로 자동 Recovery는 앱이 시작되자마자 무조건 실행하는 대신 인증
상태가 확정된 이후 실행하도록 설계했다. `RequireAuthOutlet` 내부에서
`LocalAttachmentRecoveryRunner`를 실행해 로그인된 사용자에 대해서만
background recovery가 동작하도록 구성했다. Recovery가 실패하더라도 앱
화면 진입을 막지 않도록 분리한 것도 중요한 설계 결정이었다.

오늘 작업의 핵심은 파일을 어디에 저장할 것인가를 결정한 것이 아니다.
파일이 생성된 순간부터 저장, 취소, 휴지통, 영구삭제, F5, 강제종료,
복구를 거쳐 최종적으로 사라질 때까지 어떻게 안전하게 책임질 것인가를
설계한 것이다. Shiori의 Local-first 구조는 이제 단순한 로컬 저장 기능이
아니라 첨부파일의 전체 생명주기를 관리하는 아키텍처로 발전했다.
