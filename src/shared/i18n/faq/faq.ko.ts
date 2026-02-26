import type { FAQItem } from "./faq.types";

export const faq_ko: FAQItem[] = [
  {
    id: "account-delete",
    question: "회원 탈퇴 후 데이터는 어떻게 되나요?",
    answer:
      "탈퇴 시 계정은 비활성화되며 일정 기간 동안 복구가 가능합니다. 이후 데이터는 영구 삭제될 수 있습니다.",
  },
  {
    id: "login-error",
    question: "로그인이 되지 않아요.",
    answer:
      "인앱 브라우저에서는 로그인이 차단될 수 있습니다. Chrome 또는 Safari에서 다시 시도해주세요.",
  },
  {
    id: "edit-post",
    question: "작성한 문의를 수정할 수 있나요?",
    answer: "문의 상세 페이지에서 수정 버튼을 통해 내용 변경이 가능합니다.",
  },
];
