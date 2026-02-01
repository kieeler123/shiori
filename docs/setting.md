src/
  lib/
    supabaseClient.ts
  app/               (또는 src/App.tsx)
    App.tsx
  pages/
    LogsPage.tsx
  features/
    auth/
      useSession.ts
      AuthPanel.tsx
    shiori/
      types.ts
      components/
        LogEditor.tsx
        TagChip.tsx
        TagSuggestions.tsx
        SearchBar.tsx
        NoteList.tsx        (선택)
        NoteCard.tsx        (선택)
      hooks/
        useNoteSearch.ts
      repo/
        shioriRepo.ts
        commentsRepo.ts
      utils/
        storage.ts
        searchIndex.ts
        tags.ts             (태그 유틸 있으면)