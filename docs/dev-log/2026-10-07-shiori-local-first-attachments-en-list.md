# Shiori Local-first Attachment Storage

## Work Completed Today --- List Format

1.  Migrated new attachments from Supabase Storage to a **Local-first
    architecture**.
2.  Kept Supabase for authentication, database operations, metadata, and
    legacy cloud attachment compatibility.
3.  Added the **File System Access API** so users can explicitly select
    a local storage directory.
4.  Persisted the selected `FileSystemDirectoryHandle` in IndexedDB.
5.  Stored only relative paths such as
    `attachments/YYYY/MM/DD/<UUID>.<extension>`.
6.  Added `storageType: "local" | "supabase"` with backward
    compatibility through `storageType ?? "supabase"`.
7.  Built a common attachment resolver: Signed URLs for Supabase and
    Blob URLs for Local files.
8.  Added Blob URL lifecycle management with `URL.revokeObjectURL()`.
9.  Preserved attachment files when logs are moved to Trash.
10. Physically deleted files only when logs are permanently deleted.
11. Made deletion idempotent by treating `NotFoundError` as an
    already-completed deletion.
12. Added editor transaction semantics for Save, Cancel, and attachment
    removal.
13. Upgraded the IndexedDB database from version 1 to version 2.
14. Added the `pending-attachments` object store.
15. Implemented a persistent Pending Journal for newly created Local
    attachments.
16. Cleared Pending Records after successful commits, rollbacks, or
    completed deletions.
17. Added protection for refreshes and unexpected browser termination.
18. Implemented Crash Recovery by comparing Pending Records with
    `shiori_items.attachments`.
19. Preserved files that are still referenced by database rows,
    including logs in Trash.
20. Deleted only confirmed unreferenced Local files.
21. Kept files and Pending Records when database verification or
    filesystem access fails.
22. Added a grace period to protect recently created Pending
    attachments.
23. Investigated File System Access permission states such as `granted`
    and `prompt`.
24. Designed automatic Recovery to run after authentication inside
    `RequireAuthOutlet`.
25. Kept Recovery non-blocking so maintenance failures do not prevent
    the app from rendering.

### Key Point

**The main achievement was not simply saving files locally. It was
designing the complete attachment lifecycle: creation, commit, rollback,
Trash, permanent deletion, refresh, crashes, and recovery.**
