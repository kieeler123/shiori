# Shiori Development Log --- October 9, 2026

## Questions and Answers

### Q1. What was today's objective?

**A.** Incrementally move article CRUD from React/Supabase to Fastify
APIs without disrupting the existing UI and data.

**Tip:** Preserve working behavior while migrating one endpoint at a
time.

### Q2. Which CRUD operations were verified?

**A.** Create (`POST /api/logs`, 201), list (`GET /api/logs`, 200),
update (`PATCH /api/logs/:id`, 200), and move to trash
(`DELETE /api/logs/:id`, 204). A detail-read endpoint was also
implemented.

**Tip:** Verify both the HTTP response and the visible/recorded result.

### Q3. How does trash work?

**A.** Ordinary deletion is a soft delete. The trash listing endpoint
returned 200, and permanent deletion returned 204 for an entry without
attachments.

**Tip:** Treat moving to trash and permanent deletion as distinct
operations.

### Q4. When are local attachments deleted?

**A.** In the observed test, the file stayed on disk when the entry
moved to trash and disappeared when the entry was permanently deleted
from trash.

**Tip:** Keep attachments intact for as long as the entry can be
restored.

### Q5. Where are local attachments stored?

**A.** In a user-selected folder accessed through the browser File
System Access API, under paths like `attachments/YYYY/MM/DD/UUID.ext`.
Deletion uses `removeEntry()`.

**Tip:** Browser folder access does not automatically grant Fastify
access to that folder.

### Q6. Can Shiori prevent deletion through Windows Explorer?

**A.** Not reliably with the current architecture. Missing-file checks,
relinking, and versioned backups are more practical. Server-owned
storage and OS permissions are longer-term options.

**Tip:** Design both prevention and recovery mechanisms.

### Q7. What caused the TypeScript error?

**A.** `validateContentBlocks()` expected `ReferenceItem[]`, but some
update inputs were typed `unknown[]`. Zod validation of reference
objects and their `id` fields was considered.

**Tip:** Validate external input rather than relying on unchecked type
assertions.

### Q8. Are client and server fully separated now?

**A.** No. Some frontend features still call Supabase directly, and
Fastify currently uses Supabase PostgreSQL.

**Tip:** Aim for a frontend that knows API contracts, not database
internals.

### Q9. Is local PostgreSQL the primary datastore?

**A.** Not yet. Local attachment storage exists, but the main database
has not been migrated to Windows PostgreSQL.

**Tip:** Prepare backups, permissions, and integrity checks before
migration.

### Q10. What comes next?

**A.** Save a Git checkpoint, remove remaining direct database calls,
strengthen attachment deletion and recovery, and then prepare local
PostgreSQL migration.

**Tip:** Migrate, test, and stabilize one feature at a time.
