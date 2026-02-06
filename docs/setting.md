docs/
  architecture/
    auth-system.md
    data-flow.md
    design-decision-log.md
    design-philosophy.md
    overall-architecturi.md
    permission.md
    support-system-flow.md
    system-structure.md
    tag-design.md
  briefing/
    auth-error.md
    login-briefing.md
    pre-development-breifing.md
    search-filter-breifing.md
    tag-breifing.md
    trash-system-bug.md
  dev-log/
    2026-01-28.md
    2026-01-29.md
    2026-02-01.md
    2026-02-03.md
    2026-02-05.md
    2026-02-07.md
  errors/
    auth-missing-error.md
    error-handling.md
    login-error.md
    pre-development.md
    tag-system.md
  setting.md

src/

  app/
    layout/
      Layout.tsx
      RequireAuthOutlet.tsx
      SupportLayout.tsx
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
      account/
        components/
          DangerZone.tsx
          PasswordSection.tsx
          ProfileSection.tsx
        hooks/
          useAccountActions.ts
          useAccountProfile.ts
        AccountProfileProvider.tsx
          
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
        account/
          AccountDeletePage.tsx
          AccountEditPage.tsx
          AccountPage.tsx
          
        account/
          AccountPage.tsx

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
          SupportDetailPage.tsx    # 문의 상세
          SupportEditPage.tsx
          SupportFaqPage.tsx
          SupportListPage.tsx
          SupportNewPage.tsx       # 문의하기
          SupportTrashPage.tsx     # 문의 휴지통(soft delete)

      repo/                        # Shiori 전역 공용 repo(데이터 접근 레이어)
        commentsRepo.ts
        shioriRepo.ts              # logs/notes 관련
        supportFaqRepo.ts
        supportRepo.ts             # ✅ support: tickets(문의)
        supportTrashRepo.ts
        trashRepo.ts               # logs 휴지통(또는 공용 휴지통 정책이면 유지)

      type/
        account.ts
        comment.ts
        common.ts
        index.ts
        log.ts
        support.ts

      utils/                       # Shiori 전역 공용 유틸
        isUuid.ts
        recentSearch.ts
        searchIndex.ts
        storage.ts
        tagRank.ts
        tags.ts
        textParser.ts
  
  lib/
    auth.ts
    authActions.ts
    authRedirect.ts
    avatarStarage.ts
    supabaseClient.ts

  index.css
  main.tsx
