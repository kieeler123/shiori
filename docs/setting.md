src/
  lib/
    auth.ts
    supabaseClient.ts

  app/
    layout/
      Layout.tsx
      toast.ts
      ToastProvider.tsx

    ui/
      btn.ts

    App.tsx
    Header.tsx

  features/
    auth/                         # 앱 전체 인증(Shiori뿐 아니라 전체 공용)
      AuthBar.tsx
      AuthButton.tsx
      AuthCallback.tsx
      AuthPanel.tsx
      SessionProvider.tsx
      useAuth.ts
      useSession.ts

    shiori/                        # Shiori 서비스 도메인 (공용 레이어 + 도메인별 전용)
      components/                  # Shiori 전역 공용 UI (도메인 독립)
        LogEditor.tsx
        RouteProblem.tsx
        SearchBar.tsx
        TagChip.tsx
        TagSuggestions.tsx

      hooks/                       # Shiori 전역 공용 hooks
        useNoteSearch.ts
        useTagAutocomplete.ts

      pages/                       # ✅ 라우팅 전용(껍데기). 도메인 늘어나면 폴더만 추가
        auth/
          AuthPage.tsx

        logs/
          EditLogPage.tsx
          LogDetailPage.tsx
          LogsPage.tsx
          NewLogPage.tsx
          TrashPage.tsx            # logs 휴지통 페이지(도메인 전용)

        support/                   # ✅ feedbacks → support 로 통일
          AdminSupportPage.tsx     # (옵션) 관리자: 답변/FAQ관리
          MyTicketsPage.tsx        # 내가 한 질문 모아보기
          FaqPage.tsx              # 도움말/FAQ
          SupportDetailPage.tsx    # 문의 상세
          SupportEditPage.tsx
          SupportFaqPage.tsx
          SupportListPage.tsx
          SupportNewPage.tsx       # 문의하기
          SupportTrashPage.tsx     # 문의 휴지통(soft delete)

      repo/                        # Shiori 전역 공용 repo(데이터 접근 레이어)
        commentsRepo.ts
        faqRepo.ts                 # ✅ support: FAQ
        shioriRepo.ts              # logs/notes 관련
        supportFaqRepo.ts
        supportRepo.ts             # ✅ support: tickets(문의)
        supportTrashRepo.ts
        trashRepo.ts               # logs 휴지통(또는 공용 휴지통 정책이면 유지)
      support/
        components/
          FaqItem.tsx
          FaqList.tsx
          FaqSearch.tsx
          TicketActions.tsx
          TicketDetail.tsx
          TicketForm.tsx
          TicketList.tsx

        hooks/
          useFaqSearch.ts
          useTicketList.ts
        utils/
          faqSuggest.ts

      utils/                       # Shiori 전역 공용 유틸
        isUuid.ts
        recentSearch.ts
        searchIndex.ts
        storage.ts
        tagRank.ts
        tags.ts
        textParser.ts

      types.ts                     # Shiori 전역에서 공유할 타입(공용만)

  index.css
  main.tsx
