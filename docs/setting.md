Shiori/
│
├─ docs/
│ ├─ architecture/
│ │ ├─ theme/
│ │ ├─ design-archive.md
│ │ ├─ auth-system.md
│ │ ├─ data-flow.md
│ │ ├─ design-decision-log.md
│ │ ├─ design-guide.md
│ │ ├─ design-philosophy.md
│ │ ├─ overall-architecture.md
│ │ ├─ permission.md
│ │ ├─ support-system-flow.md
│ │ ├─ system-structure.md
│ │ ├─ tag-design.md
│ │ ├─ v1-checklist.md
│ │ └─ v1-design-checklist.md
│ │
│ ├─ dev-log/
│ │ ├─ 2026-01-28.md
│ │ ├─ 2026-01-29.md
│ │ ├─ 2026-02-01.md
│ │ ├─ 2026-02-03.md
│ │ ├─ 2026-02-05.md
│ │ ├─ 2026-02-07.md
│ │ ├─ 2026-02-09.md
│ │ ├─ 2026-02-11.md
│ │ ├─ 2026-02-13.md
│ │ ├─ 2026-02-18.md
│ │ ├─ 2026-02-20.md
│ │ ├─ 2026-02-22.md
│ │ └─ 2026-02-25.md
│ │
│ ├─ essay/
│ │ ├─ account_delete_relogin.md
│ │ ├─ auth-missing-error.md
│ │ ├─ data-logic-essay.md
│ │ ├─ design-error.md
│ │ ├─ error-handling.md
│ │ ├─ login-error.md
│ │ ├─ mobile-layout_search-highlighting.md
│ │ ├─ pre-development.md
│ │ ├─ state-dom-error.md
│ │ ├─ supabase-RedirectUrls.md
│ │ ├─ tag-system.md
│ │ └─ setting.md
│ │
│ ├─ internal/
│ │ └─ design-system/
│ │ ├─ color.md
│ │ └─ layout.md
│ │
│ ├─ features/
│ │ └─ trash.md
│ │
│ └─ interview/
│ ├─ auth-error.md
│ ├─ login-briefing.md
│ ├─ pre-development-breifing.md
│ ├─ search-filter-breifing.md
│ ├─ tag-breifing.md
│ └─ trash-system-bug.md
│
└─ src/
│
├─ app/
│ ├─ layout/
│ │ ├─ AccountLayout.tsx
│ │ ├─ AdminOnlyOutlet.tsx
│ │ ├─ AppShell.tsx
│ │ ├─ EditorShell.tsx
│ │ ├─ FormField.tsx
│ │ ├─ getEmptyMessage.tsx
│ │ ├─ GuestOnlyOutlet.tsx
│ │ ├─ Layout.tsx
│ │ ├─ PageHeaderRow.tsx
│ │ ├─ PageSection.tsx
│ │ ├─ RequireAuthOutlet.tsx
│ │ ├─ SupportLayout.tsx
│ │ ├─ toast.ts
│ │ └─ ToastProvider.tsx
│ │
│ ├─ routes/
│ │ ├─ ProtextedRoute.tsx
│ │ └─ PublicOnlyRoute.tsx
│ │
│ ├─ App.tsx
│ └─ Header.tsx
│
├─ features/
│ │
│ ├─ attachments/
│ │ ├─ components/
│ │ │ └─ LocalAttachmentDirectoryTest.tsx
│ │ │
│ │ ├─ lib/
│ │ │ ├─ attachmentResolver.ts
│ │ │ ├─ attachmentStorageType.ts
│ │ │ ├─attachmentUrl.ts
│ │ │ ├─ deleteAttachment.ts
│ │ │ ├─ getAttachmentViewerPath.ts
│ │ │ ├─ markdownAssetImporter.ts
│ │ │ └─ uploadAttachment.ts
│ │ │
│ │ └─ local/
│ │ ├─ localAttachmentStore.ts
│ │ ├─ localAttachmentRecovery.ts
│ │ ├─ localDirectory.ts
│ │ └─ localDirectoryDb.ts
│ │
│ ├─ auth/
│ │ ├─ AuthButton.tsx
│ │ ├─ AuthCallback.tsx
│ │ ├─ AuthPanel.tsx
│ │ ├─ SessionProvider.tsx
│ │ ├─ useAuth.ts
│ │ └─ useSession.ts
│ │
│ └─ shiori/
│ │
│ ├─ account/
│ │ ├─ components/
│ │ │ ├─ DangerZone.tsx
│ │ │ ├─ PasswordSection.tsx
│ │ │ └─ ProfileSection.tsx
│ │ │
│ │ ├─ hooks/
│ │ │ ├─ useAccountActions.ts
│ │ │ └─ useAccountProfile.ts
│ │ │
│ │ └─ AccountProfileProvider.tsx
│ │
│ ├─ components/
│ │ ├─ search/
│ │ │ ├─ SearchContext.tsx
│ │ │ └─ HeaderSearchBar.tsx
│ │ │
│ │ ├─ LogEditor.tsx
│ │ ├─ LogMetaInline.tsx
│ │ ├─ RouteProblem.tsx
│ │ ├─ ShioriTagChip.tsx
│ │ └─ TagSuggestions.tsx
│ │
│ ├─ domain/
│ │ └─ LogValidator.tsx
│ │
│ ├─ hooks/
│ │ ├─ useNoteSearch.ts
│ │ └─ useTagAutocomplete.ts
│ │
│ ├─ pages/
│ │ ├─ account/
│ │ │ ├─ AccountDeletePage.tsx
│ │ │ ├─ AccountEditPage.tsx
│ │ │ └─ AccountOverviewPage.tsx
│ │ │
│ │ ├─ admin/
│ │ │ ├─ AdminHomePage.tsx
│ │ │ ├─ AdminLogsPage.tsx
│ │ │ └─ AdminAiLabPage.tsx
│ │ │
│ │ ├─ auths/
│ │ │ └─ AuthPage.tsx
│ │ │
│ │ ├─ dev/
│ │ │ └─ ImportExportPage.tsx
│ │ │
│ │ ├─ logs/
│ │ │ ├─ EditLogPage.tsx
│ │ │ ├─ LogDetailPage.tsx
│ │ │ ├─ LogsPage.tsx
│ │ │ ├─ NewLogPage.tsx
│ │ │ └─ TrashPage.tsx
│ │ │
│ │ └─ support/
│ │ ├─ MyTicketsPage.tsx
│ │ ├─ SupportDetailPage.tsx
│ │ ├─ SupportEditPage.tsx
│ │ ├─ SupportFaqPage.tsx
│ │ ├─ SupportListPage.tsx
│ │ ├─ SupportNewPage.tsx
│ │ └─ SupportTrashPage.tsx
│ │
│ ├─ repo/
│ │ ├─ AccountTrashRepo.ts
│ │ ├─ commentsRepo.ts
│ │ ├─ shioriRepo.ts
│ │ ├─ supportFaqRepo.ts
│ │ ├─ supportRepo.ts
│ │ ├─ supportTrashRepo.ts
│ │ └─ trashRepo.ts
│ │
│ ├─ tools/
│ │ └─ importExport.ts
│ │
│ ├─ type/
│ │ ├─ account.ts
│ │ ├─ comment.ts
│ │ ├─ common.ts
│ │ ├─ index.ts
│ │ ├─ log.ts
│ │ └─ support.ts
│ │
│ └─ utils/
│ ├─ isUuid.ts
│ ├─ previewOneLine.ts
│ ├─ recentSearch.ts
│ ├─ searchIndex.ts
│ ├─ storage.ts
│ ├─ tagRank.ts
│ ├─ tags.ts
│ ├─ textParser.ts
│ └─ useAutoRestoreAccount.ts
│
├─ lib/
│ ├─ auth.ts
│ ├─ authActions.ts
│ ├─ authRedirect.ts
│ ├─ avatarStorage.ts
│ ├─ supabaseClient.ts
│ └─ theme.ts
│
├─ shared/
│ ├─ theme/
│ │ ├─ themes/
│ │ │ ├─ brownArchiveTheme.ts
│ │ │ ├─ darkGrayTheme.ts
│ │ │ ├─ index.ts
│ │ │ ├─ navyTheme.ts
│ │ │ ├─ plumNightTheme.ts
│ │ │ ├─ pureDarkTheme.ts
│ │ │ ├─ sageMistTheme.ts
│ │ │ ├─ tealGlassTheme.ts
│ │ │ └─ whitePaperTheme.ts
│ │ │
│ │ ├─ applyTheme.ts
│ │ ├─ buttonStyle.ts
│ │ ├─ editor.ts
│ │ ├─ menuStyles.ts
│ │ ├─ theme.css
│ │ ├─ theme.preset.ts
│ │ ├─ theme.storage.ts
│ │ ├─ theme.types.ts
│ │ ├─ ThemeProvider.tsx
│ │ ├─ ThemeSelectCompact.tsx
│ │ ├─ tokens.ts
│ │ └─ useTheme.ts
│ │
│ ├─ ui/
│ │ ├─ feedback/
│ │ │ ├─ EmptyState.tsx
│ │ │ └─ LoadingText.tsx
│ │ │
│ │ ├─ patterns/
│ │ │ ├─ AvatarButton.tsx
│ │ │ ├─ DropdownMenuPanel.tsx
│ │ │ ├─ DropdownPortal.tsx
│ │ │ ├─ EmptyState.tsx
│ │ │ ├─ index.ts
│ │ │ ├─ ListItemButton.tsx
│ │ │ ├─ PageContainer.tsx
│ │ │ ├─ StickyBar.tsx
│ │ │ ├─ SurfaceCard.tsx
│ │ │ └─ UserChipButtontsx
│ │ │
│ │ ├─ primitives/
│ │ │ ├─ Button.tsx
│ │ │ ├─ Card.tsx
│ │ │ ├─ Divider.tsx
│ │ │ ├─ IconButton.tsx
│ │ │ ├─ index.ts
│ │ │ ├─ input.tsx
│ │ │ ├─ SearchInput.tsx
│ │ │ ├─ TabButton.tsx
│ │ │ ├─ TagChip.tsx
│ │ │ └─ Textarea.tsx
│ │ │
│ │ └─ styles/
│ │ ├─ buttonStyle.ts
│ │ ├─ index.ts
│ │ ├─ menuStyles.ts
│ │ └─ textStyles.ts
│ │
│ ├─ utils/
│ │ ├─ cn.ts
│ │ └─ inAppBrowser.ts
│ │
│ ├─ ThemeSwitcher.tsx
│ └─ ThemeToggle.tsx
│
├─ utils/
│ ├─ highlight.tsx
│ └─ searchSnippet.ts
│
├─ types/
│ └─ file-system-access.d.ts
│
├─ index.css
└─ main.tsx
